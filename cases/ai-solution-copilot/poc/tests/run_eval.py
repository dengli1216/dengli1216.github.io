#!/usr/bin/env python3
"""Dify preflight and bounded smoke runner; never prints API keys or full inputs."""
import argparse
import hashlib
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CASES_PATH = Path(__file__).with_name("smoke-cases.json")
GOLDEN_PATH = Path(__file__).with_name("golden-set.json")
REPORTS = ROOT / "reports"
SNAPSHOT = ROOT / "dify" / "ai-solution-copilot-02-analysis-report.dify.yml"
EXPECTED_INPUTS = {"intake_artifact_json", "report_language"}
EXPECTED_APP_NAME = "AI Solution Copilot 02｜分析与报告"


def utc_now():
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def key_env_name():
    return "DIFY_APP_API_KEY" if os.environ.get("DIFY_APP_API_KEY") else ("DIFY_API_KEY" if os.environ.get("DIFY_API_KEY") else None)


def api_root():
    raw = os.environ.get("DIFY_BASE_URL", "").strip().rstrip("/")
    parsed = urllib.parse.urlsplit(raw)
    if not raw:
        return None, "DIFY_BASE_URL is not set"
    if parsed.scheme not in {"http", "https"} or not parsed.netloc or parsed.query or parsed.fragment:
        return None, "DIFY_BASE_URL is not a valid HTTP(S) API address"
    if any(segment in parsed.path.lower() for segment in ("console", "workflow")):
        return None, "DIFY_BASE_URL appears to be a Console or Workflow editor URL, not an API address"
    return raw if parsed.path.rstrip("/").endswith("/v1") else raw + "/v1", None


def request_json(url, api_key, method="GET", payload=None, timeout=30):
    data = None if payload is None else json.dumps(payload, ensure_ascii=False).encode("utf-8")
    headers = {"Authorization": "Bearer " + api_key, "Accept": "application/json"}
    if data is not None:
        headers["Content-Type"] = "application/json"
    request = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            return response.status, json.loads(response.read().decode("utf-8")), None
    except urllib.error.HTTPError as error:
        return error.code, None, {"category": "http_error", "http_status": error.code}
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError):
        return None, None, {"category": "network_or_invalid_json"}


def snapshot_fingerprint():
    return hashlib.sha256(SNAPSHOT.read_bytes()).hexdigest() if SNAPSHOT.exists() else None


def form_variables(forms):
    """Handle Dify's direct and control-type-wrapped user_input_form entries."""
    variables = set()
    if not isinstance(forms, list):
        return variables
    for item in forms:
        if not isinstance(item, dict):
            continue
        if isinstance(item.get("variable"), str):
            variables.add(item["variable"])
            continue
        for config in item.values():
            if isinstance(config, dict) and isinstance(config.get("variable"), str):
                variables.add(config["variable"])
    return variables


def preflight():
    key_name = key_env_name()
    base, base_error = api_root()
    result = {
        "checked_at": utc_now(), "ok": False, "api_key_configured": bool(key_name),
        "api_key_env": key_name, "base_url_valid": base_error is None,
        "app_interface_accessible": False, "workflow_snapshot_sha256": snapshot_fingerprint(),
        "published_app_identifier": None, "published_workflow_version": None,
        "published_app_name": None, "published_app_name_matches_snapshot": None,
        "correspondence_evidence": "Dify public /parameters endpoint authenticated by the configured app API key",
        "expected_inputs": sorted(EXPECTED_INPUTS), "actual_inputs": [], "failures": []
    }
    if not SNAPSHOT.exists(): result["failures"].append("workflow snapshot is missing")
    if not key_name: result["failures"].append("DIFY_APP_API_KEY and DIFY_API_KEY are both unset")
    if base_error: result["failures"].append(base_error)
    if result["failures"]: return result
    status, payload, error = request_json(base + "/parameters", os.environ[key_name])
    if error or status != 200:
        result["failures"].append("Dify application parameters endpoint is not accessible")
        result["parameters_http_status"] = status
        return result
    forms = payload.get("user_input_form", []) if isinstance(payload, dict) else []
    actual = form_variables(forms)
    result["actual_inputs"] = sorted(actual)
    result["app_interface_accessible"] = True
    result["parameters_http_status"] = status
    info_status, info_payload, info_error = request_json(base + "/info", os.environ[key_name])
    result["info_http_status"] = info_status
    if not info_error and isinstance(info_payload, dict):
        name = info_payload.get("name")
        result["published_app_name"] = name if isinstance(name, str) else None
        result["published_app_name_matches_snapshot"] = result["published_app_name"] == EXPECTED_APP_NAME
    missing = sorted(EXPECTED_INPUTS - actual)
    extra = sorted(actual - EXPECTED_INPUTS)
    result["interface_match"] = not missing
    result["interface_missing_inputs"] = missing
    result["interface_extra_inputs"] = extra
    if missing: result["failures"].append("published application inputs do not match the required Workflow contract")
    result["ok"] = not result["failures"]
    return result


def lookup(value, path):
    current = value
    for part in path.split("."):
        if not isinstance(current, dict) or part not in current: return None, False
        current = current[part]
    return current, True


def normalize_evidence_refs(value):
    """Accept only a native list or a valid JSON string that decodes to a list."""
    if isinstance(value, list):
        return value
    if isinstance(value, str):
        text = value.strip()
        if text.startswith("```"):
            raise ValueError("evidenceRefs must not be Markdown")
        try:
            decoded = json.loads(text)
        except json.JSONDecodeError as exc:
            raise ValueError("evidenceRefs string is not valid JSON") from exc
        if isinstance(decoded, list):
            return decoded
    raise ValueError("evidenceRefs must be an array or a JSON string array")


def assert_case(case, outputs):
    checks = []
    for rule in case["expected"]["assertions"]:
        path = rule.get("path")
        actual, exists = lookup(outputs, path) if path else (None, False)
        if rule["op"] == "present":
            passed = exists and actual not in (None, "", [], {})
        elif rule["op"] == "equals":
            passed = exists and actual == rule["value"]
        elif rule["op"] == "one_of":
            passed = exists and actual in rule["value"]
        elif rule["op"] == "contains":
            passed = exists and isinstance(actual, str) and rule["value"] in actual
        elif rule["op"] == "any_path_present":
            passed = any(lookup(outputs, candidate)[1] and lookup(outputs, candidate)[0] not in (None, "", [], {}) for candidate in rule["paths"])
        else:
            passed = False
        checks.append({"path": path or "|".join(rule["paths"]), "passed": passed})
    return checks, all(check["passed"] for check in checks)


def validate_artifact_evidence_refs(value):
    """Validate only actual artifact registries; never coerce null, Markdown, or broken JSON."""
    if not isinstance(value, (str, dict)):
        return "not_present", None
    try:
        artifact = json.loads(value) if isinstance(value, str) else value
    except json.JSONDecodeError:
        return "invalid_artifact_json", "artifact JSON is invalid"
    registry = artifact.get("evidenceRegistry") if isinstance(artifact, dict) else None
    if registry is None:
        return "not_present", None
    if not isinstance(registry, list):
        return "failed", "evidenceRegistry must be an array"
    for index, record in enumerate(registry):
        if not isinstance(record, dict):
            return "failed", f"evidenceRegistry[{index}] must be an object"
        try:
            normalize_evidence_refs(record.get("evidenceRefs", []))
        except ValueError as exc:
            return "failed", f"evidenceRegistry[{index}]: {exc}"
    return "passed", None


def materialize_inputs(case):
    """Keep Golden Set artifacts readable while sending only Dify's two inputs."""
    inputs = dict(case["inputs"])
    artifact = inputs.pop("intake", None)
    envelope = inputs.pop("intake_envelope", None)
    if artifact is not None:
        encoded = json.dumps(artifact, ensure_ascii=False, separators=(",", ":"))
        if envelope == "reusable":
            encoded = json.dumps({"reusable_intake_artifact_json": encoded}, ensure_ascii=False, separators=(",", ":"))
        inputs["intake_artifact_json"] = encoded
    return inputs


def run_case(base, key, case):
    started = time.monotonic()
    attempts = 0
    while True:
        attempts += 1
        status, payload, error = request_json(base + "/workflows/run", key, "POST", {"inputs": materialize_inputs(case), "response_mode": "blocking", "user": "ai-solution-copilot-eval"}, 900)
        retryable = error and (error["category"] == "network_or_invalid_json" or error.get("http_status", 0) >= 500)
        if retryable and attempts == 1: continue
        break
    record = {"case_id": case["case_id"], "category": case["category"], "attempts": attempts, "latency_seconds": round(time.monotonic() - started, 3), "run_id": None, "result": "failed", "assertions": [], "error": error}
    if not payload:
        record["error"] = error or {"category": "empty_response", "http_status": status}
        return record
    data = payload.get("data", payload) if isinstance(payload, dict) else {}
    record["run_id"] = data.get("workflow_run_id") or payload.get("workflow_run_id") or data.get("id")
    outputs = data.get("outputs", {}) if isinstance(data, dict) else {}
    record["workflow_status"] = data.get("status") if isinstance(data, dict) else None
    record["total_tokens"] = data.get("total_tokens") if isinstance(data, dict) else None
    workflow_error = data.get("error") if isinstance(data, dict) else None
    record["error_summary"] = workflow_error[:500] if isinstance(workflow_error, str) else None
    record["human_review_status"] = (
        "not_started" if record["workflow_status"] == "failed"
        else "awaiting_action" if record["workflow_status"] == "paused"
        else None
    )
    assertion_context = dict(outputs) if isinstance(outputs, dict) else {}
    assertion_context["__workflow_status"] = record["workflow_status"]
    assertion_context["__workflow_error"] = workflow_error
    assertion_context["__human_review_status"] = record["human_review_status"]
    record["assertions"], passed = assert_case(case, assertion_context)
    artifact_results = [validate_artifact_evidence_refs(value) for name, value in assertion_context.items() if name.endswith("artifact_json")]
    failed_artifact = next((item for item in artifact_results if item[0] in {"failed", "invalid_artifact_json"}), None)
    record["evidence_refs_validation"] = failed_artifact[0] if failed_artifact else ("passed" if any(item[0] == "passed" for item in artifact_results) else "not_present")
    if failed_artifact:
        record["error"] = {"category": "evidence_refs_contract", "summary": failed_artifact[1]}
        passed = False
    record["result"] = "passed" if status and 200 <= status < 300 and passed else "failed"
    if record["result"] == "failed" and not record["error"]: record["error"] = {"category": "assertion_or_workflow_failure", "http_status": status}
    return record


def write_reports(summary):
    REPORTS.mkdir(parents=True, exist_ok=True)
    (REPORTS / "smoke-summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = ["# Smoke Report — AI Solution Copilot", "", "## 真实运行事实", ""]
    preflight = summary["preflight"]
    lines.append(f"- Preflight：{'通过' if preflight['ok'] else '失败'}；Smoke：{'已执行' if summary['smoke_executed'] else '未执行'}。")
    lines.append(f"- API Key 配置状态：{'已设置' if preflight['api_key_configured'] else '未设置'}（不记录值）。")
    lines.append(f"- Workflow 快照 SHA-256：`{preflight['workflow_snapshot_sha256'] or 'unavailable'}`。")
    if preflight["app_interface_accessible"]:
        lines.append("- 已发布应用等价证据：已通过配置的应用 API Key 调用 `/parameters`；该公共端点未提供应用 ID 或 Workflow 版本。")
        lines.append(f"- 发布应用名称：`{preflight['published_app_name'] or 'unavailable'}`；与快照名称一致：`{preflight['published_app_name_matches_snapshot']}`。")
        actual = "、".join(f"`{name}`" for name in preflight["actual_inputs"]) or "无"
        missing = "、".join(f"`{name}`" for name in preflight.get("interface_missing_inputs", [])) or "无"
        lines.append(f"- 输入对比：快照要求 `intake_artifact_json`、`report_language`；已发布应用返回 {actual}；缺失 {missing}。")
    lines += ["", "## 失败原因", ""]
    lines += [f"- {item}" for item in preflight["failures"]] or ["- 无。"]
    lines += ["", "## Smoke 结果", ""]
    if summary["runs"]:
        lines.append("| Case | Run ID | 结果 | 延迟（秒） |")
        lines.append("| --- | --- | --- | --- |")
        lines += [f"| {run['case_id']} | {run['run_id'] or '无'} | {run['result']} | {run['latency_seconds']} |" for run in summary["runs"]]
    else: lines.append("未执行：Preflight 未通过，未发送 Workflow run 请求。")
    lines += ["", "## 未验证范围", "", "- 未验证完整节点主链、输出字段、模型/插件、人工复核或任何 LLM 语义质量。", "", "## 阶段 3 前置条件", "", "- 先令全部 Smoke 取得真实 API 返回并通过稳定字段断言；再执行全量 Golden Set。"]
    (REPORTS / "SMOKE_REPORT.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def percentile(values, fraction):
    if not values:
        return None
    values = sorted(values)
    position = (len(values) - 1) * fraction
    lower = int(position)
    upper = min(lower + 1, len(values) - 1)
    weight = position - lower
    return round(values[lower] + (values[upper] - values[lower]) * weight, 3)


def full_metrics(runs, repetitions):
    all_runs = runs + [item for group in repetitions.values() for item in group]
    completed = [run for run in all_runs if run.get("run_id")]
    contract = [run for run in all_runs if run.get("result") == "passed"]
    # Prefer a Dify-reported workflow elapsed value when a verifier enriches a
    # record; otherwise retain the runner's API round-trip measurement.
    latencies = [run.get("workflow_elapsed_seconds", run.get("latency_seconds")) for run in all_runs]
    latencies = [value for value in latencies if isinstance(value, (int, float))]
    evidence = [run for run in all_runs if run.get("evidence_refs_validation") in {"passed", "not_present"}]
    consistency = {}
    for case_id, group in repetitions.items():
        signatures = [(item.get("workflow_status"), tuple((check["path"], check["passed"]) for check in item.get("assertions", []))) for item in group]
        consistency[case_id] = {"runs": len(group), "consistent": len(group) == 3 and len(set(signatures)) == 1}
    return {
        "api_completion_coverage": round(len(completed) / len(all_runs), 4) if all_runs else 0,
        "run_id_coverage": round(len(completed) / len(all_runs), 4) if all_runs else 0,
        "workflow_success_rate": round(len(contract) / len(all_runs), 4) if all_runs else 0,
        "structure_contract_compliance_rate": round(len(contract) / len(all_runs), 4) if all_runs else 0,
        "branch_status_assertion_pass_rate": round(len(contract) / len(all_runs), 4) if all_runs else 0,
        "evidence_refs_validity_rate": round(len(evidence) / len(all_runs), 4) if all_runs else 0,
        "latency_seconds": {"average": round(sum(latencies) / len(latencies), 3) if latencies else None, "p50": percentile(latencies, .5), "p95": percentile(latencies, .95)},
        "token_or_cost_metadata_count": sum(1 for run in all_runs if run.get("total_tokens") is not None),
        "key_case_consistency": consistency,
    }


def write_full_reports(summary):
    REPORTS.mkdir(parents=True, exist_ok=True)
    (REPORTS / "eval-summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    metrics = summary["metrics"]
    lines = ["# Golden Set Evaluation Report — AI Solution Copilot", "", "## Boundary", "", "- Dataset is synthetic and `human_review_pending`; results prove structural contracts only, not business accuracy, customer value, ROI, or production readiness.", "", "## Real API Results", "", "| Case | Run ID | Result | Status | Latency (s) |", "| --- | --- | --- | --- | --- |"]
    for run in summary["runs"]:
        lines.append(f"| {run['case_id']} | {run.get('run_id') or 'missing'} | {run['result']} | {run.get('workflow_status') or 'unknown'} | {run['latency_seconds']} |")
    lines += ["", "## Metrics", ""]
    for key, value in metrics.items():
        lines.append(f"- {key}: `{json.dumps(value, ensure_ascii=False)}`")
    lines += ["", "## Decision", "", f"- Stage 3 gate: **{summary['gate_status']}**."]
    (REPORTS / "EVAL_REPORT.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    failures = [run for run in summary["runs"] if run["result"] != "passed"]
    notes = ["# Failure Analysis", "", "## Scope", "", "Only actual failed Golden Set records are listed. No Workflow change is justified without such evidence.", ""]
    if failures:
        for run in failures:
            notes += [f"## {run['case_id']}", "", f"- Run ID: `{run.get('run_id') or 'missing'}`", f"- Error: `{run.get('error_summary') or run.get('error')}`", "- Status: unresolved; stop before pages until a minimal root-cause fix is verified.", ""]
    else:
        notes += ["- No Golden Set failures occurred; no Phase 3 Workflow repair was made."]
    (REPORTS / "failure-analysis.md").write_text("\n".join(notes) + "\n", encoding="utf-8")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--preflight", action="store_true")
    parser.add_argument("--smoke", action="store_true")
    parser.add_argument("--full", action="store_true", help="run the Golden Set and its configured repeat cases")
    parser.add_argument("--case-id", help="run one named smoke case; use only to recover an interrupted/unasserted case")
    args = parser.parse_args()
    if sum(bool(flag) for flag in (args.preflight, args.smoke, args.full)) != 1:
        parser.error("choose exactly one mode")
    check = preflight()
    summary = {"generated_at": utc_now(), "workflow_snapshot_sha256": snapshot_fingerprint(), "preflight": check, "smoke_executed": False, "runs": [], "gate_status": "blocked"}
    if (args.smoke or args.full) and check["ok"]:
        dataset = json.loads((GOLDEN_PATH if args.full else CASES_PATH).read_text(encoding="utf-8"))
        cases = dataset["cases"]
        if args.case_id:
            cases = [case for case in cases if case.get("case_id") == args.case_id]
            if not cases:
                parser.error("--case-id does not match a defined smoke case")
        base, _ = api_root(); key = os.environ[key_env_name()]
        summary["smoke_executed"] = True
        for case in cases:
            if case.get("requires"):
                continue
            summary["runs"].append(run_case(base, key, case))
            # Persist completed cases so an interrupted long-running request never erases prior facts.
            summary["gate_status"] = "running"
            write_reports(summary)
        summary["gate_status"] = "pass" if summary["runs"] and all(run["result"] == "passed" for run in summary["runs"]) else "fail"
        if args.full and not args.case_id and summary["gate_status"] == "pass":
            repetitions = {}
            for case_id in dataset.get("repeat_case_ids", []):
                case = next(case for case in cases if case["case_id"] == case_id)
                repetitions[case_id] = [next(run for run in summary["runs"] if run["case_id"] == case_id)]
                for _ in range(2):
                    repetitions[case_id].append(run_case(base, key, case))
            summary["repetitions"] = repetitions
            summary["metrics"] = full_metrics(summary["runs"], repetitions)
            if not all(item["consistent"] for item in summary["metrics"]["key_case_consistency"].values()):
                summary["gate_status"] = "fail"
        elif args.full:
            summary["repetitions"] = {}
            summary["metrics"] = full_metrics(summary["runs"], {})
    if args.full:
        write_full_reports(summary)
    else:
        write_reports(summary)
    print(json.dumps({"ok": check["ok"], "full": args.full, "executed": summary["smoke_executed"], "gate_status": summary["gate_status"]}, ensure_ascii=False))
    return 0 if check["ok"] else 2


if __name__ == "__main__":
    raise SystemExit(main())
