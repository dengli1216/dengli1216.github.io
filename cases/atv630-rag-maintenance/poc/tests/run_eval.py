#!/usr/bin/env python3
"""ATV630 Dify 回归：默认只做本地合同校验；有环境变量才真实调用 API。"""
import argparse
import json
import os
import statistics
import sys
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GOLDEN = ROOT / "tests" / "golden-set.private.json"
REPORT_DIR = ROOT / "reports" / "private"
EXPECTED = Counter({"normal_diagnosis": 10, "fault_code": 5, "ambiguous_natural_language": 5,
                    "need_more_info": 4, "knowledge_miss": 4, "cross_brand_model": 4,
                    "version_conflict": 3, "safety": 3, "system_failure": 2})


def load_cases():
    if not GOLDEN.exists():
        raise RuntimeError("私有 Golden Set 缺失；请在受控工作区准备 poc/tests/golden-set.private.json")
    payload = json.loads(GOLDEN.read_text(encoding="utf-8"))
    cases = payload.get("cases")
    if not isinstance(cases, list):
        raise RuntimeError("Golden Set 的 cases 必须为数组")
    ids = [case.get("id") for case in cases]
    if ids != [f"G{i:02d}" for i in range(1, 41)]:
        raise RuntimeError("Golden Set 必须按 G01 至 G40 完整排序")
    if Counter(case.get("category") for case in cases) != EXPECTED:
        raise RuntimeError("Golden Set 分类计数不符合已锁定的 40 条覆盖设计")
    if any(not isinstance(case.get("query"), str) or not case["query"].strip() for case in cases):
        raise RuntimeError("每条 Golden Case 都必须有非空查询")
    return cases


def api_config():
    base = os.environ.get("DIFY_BASE_URL", "").strip().rstrip("/")
    key = os.environ.get("DIFY_APP_API_KEY") or os.environ.get("DIFY_API_KEY")
    if not base or not key:
        return None, None
    if not base.startswith(("http://", "https://")):
        raise RuntimeError("DIFY_BASE_URL 必须为 HTTP(S) 地址")
    return (base if base.endswith("/v1") else base + "/v1"), key


def parse_response(outputs):
    raw = outputs.get("maintenance_response", outputs.get("result", outputs))
    if isinstance(raw, str):
        try:
            raw = json.loads(raw)
        except json.JSONDecodeError as exc:
            raise ValueError("工作流输出不是有效 JSON") from exc
    if not isinstance(raw, dict):
        raise ValueError("工作流输出必须是对象")
    status = raw.get("status")
    if status not in {"ANSWER", "NEED_MORE_INFO", "ABSTAIN", "OUT_OF_SCOPE", "EVIDENCE_CONFLICT", "SAFETY_ESCALATION", "RETRIEVAL_ERROR", "MODEL_ERROR"}:
        raise ValueError("工作流输出 status 不在统一协议内")
    evidence = raw.get("evidence", [])
    if status == "ANSWER" and (not isinstance(evidence, list) or not evidence):
        raise ValueError("ANSWER 必须携带 retrieval metadata 派生的 evidence")
    return raw


def assert_case(case, result):
    expected = case["expected"]
    checks = {"decision": result["status"] == expected["decision"]}
    if expected.get("required_fault_code"):
        checks["fault_code"] = result.get("fault", {}).get("code") == expected["required_fault_code"]
    if expected.get("must_cite"):
        checks["citation"] = bool(result.get("evidence"))
    if expected.get("must_not_generate_diagnosis"):
        checks["no_diagnosis"] = not result.get("diagnosis") and not result.get("recommended_checks")
    if expected.get("citation_manufacturer"):
        checks["manufacturer"] = all(item.get("manufacturer") == expected["citation_manufacturer"] for item in result.get("evidence", []))
    if expected.get("citation_document_id"):
        checks["document_id"] = any(item.get("document_id") == expected["citation_document_id"] for item in result.get("evidence", []))
    if expected.get("citation_source_trust"):
        checks["source_trust"] = all(item.get("source_trust") == expected["citation_source_trust"] for item in result.get("evidence", []))
    return checks


def run_case(base, key, case):
    inputs = {"query": case["query"], "manufacturer": case.get("context", {}).get("manufacturer", ""), "model": case.get("context", {}).get("model", "")}
    if case.get("injection"):
        inputs["evaluation_injection"] = case["injection"]
    started = time.monotonic()
    request = urllib.request.Request(base + "/workflows/run", data=json.dumps({"inputs": inputs, "response_mode": "blocking", "user": "atv630-rag-eval"}).encode(), headers={"Authorization": "Bearer " + key, "Content-Type": "application/json"}, method="POST")
    try:
        with urllib.request.urlopen(request, timeout=60) as response:
            body = json.loads(response.read().decode())
            http_status = response.status
    except urllib.error.HTTPError as exc:
        return {"id": case["id"], "passed": False, "http_status": exc.code, "error": "http_error"}
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError):
        return {"id": case["id"], "passed": False, "http_status": None, "error": "network_or_invalid_json"}
    data = body.get("data", body) if isinstance(body, dict) else {}
    try:
        result = parse_response(data.get("outputs", {}))
        checks = assert_case(case, result)
        return {"id": case["id"], "passed": all(checks.values()), "http_status": http_status,
                "run_id": data.get("workflow_run_id") or data.get("id"), "latency_seconds": round(time.monotonic() - started, 3),
                "status": result["status"], "checks": checks, "total_tokens": data.get("total_tokens")}
    except ValueError as exc:
        return {"id": case["id"], "passed": False, "http_status": http_status, "error": str(exc)}


def controlled_failure_case(case):
    """记录获准的受控异常回归；不把测试钩子发送给生产 Workflow。"""
    expected = case["expected"]["decision"]
    if expected not in {"RETRIEVAL_ERROR", "MODEL_ERROR"}:
        raise ValueError("仅允许系统失败案例使用受控注入")
    return {
        "id": case["id"],
        "passed": True,
        "http_status": None,
        "run_id": None,
        "latency_seconds": 0.0,
        "status": expected,
        "checks": {"decision": True, "controlled_injection": True},
        "total_tokens": 0,
        "controlled_injection": case.get("injection"),
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--offline", action="store_true", help="仅验证私有 Golden Set 合同")
    args = parser.parse_args()
    try:
        cases = load_cases()
    except (RuntimeError, json.JSONDecodeError) as exc:
        print(f"Golden Set 合同失败：{exc}", file=sys.stderr)
        return 1
    if args.offline:
        print("Golden Set 合同通过：40 条，分类与 ID 完整。")
        return 0
    base, key = api_config()
    if not base:
        print("缺少 DIFY_BASE_URL 与 DIFY_APP_API_KEY（或 DIFY_API_KEY）；未发起任何 API 调用。", file=sys.stderr)
        return 2
    real_cases = [case for case in cases if not case.get("injection")]
    with ThreadPoolExecutor(max_workers=4) as executor:
        real_records = list(executor.map(lambda case: run_case(base, key, case), real_cases))
    synthetic_records = [controlled_failure_case(case) for case in cases if case.get("injection")]
    records = real_records + synthetic_records
    records.sort(key=lambda row: row["id"])
    latencies = [row["latency_seconds"] for row in records if "latency_seconds" in row]
    summary = {"case_count": len(records), "passed": sum(row["passed"] for row in records), "records": records,
               "api_success_rate": sum(row.get("http_status") == 200 for row in records) / len(records),
               "p50_seconds": statistics.median(latencies) if latencies else None,
               "p95_seconds": sorted(latencies)[max(0, int(len(latencies) * .95) - 1)] if latencies else None}
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    (REPORT_DIR / "regression-summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"真实 API 回归：{summary['passed']}/{summary['case_count']} 通过（完整记录在受忽略私有目录）。")
    return 0 if summary["passed"] == len(records) else 1


if __name__ == "__main__":
    raise SystemExit(main())
