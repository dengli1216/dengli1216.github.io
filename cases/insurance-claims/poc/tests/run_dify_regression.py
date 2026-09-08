#!/usr/bin/env python3
"""Run published Dify workflow regression with simulated insurance golden cases."""
from __future__ import annotations
import argparse, json, os, statistics, time, urllib.error, urllib.request
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from run_eval import GOLDEN, REPORTS, WORKFLOW, input_for, read_json

def percentile(values, p):
    values = sorted(values); index = (len(values) - 1) * p; low = int(index); high = min(low + 1, len(values) - 1)
    return round(values[low] + (values[high] - values[low]) * (index - low), 3)

def invoke(base, key, case, suite):
    payload = json.dumps({"inputs":{"claim_json":input_for(case, suite),"report_language":"中文"},"response_mode":"blocking","user":"insurance-claims-poc-regression"}).encode()
    request = urllib.request.Request(base.rstrip("/") + "/workflows/run", data=payload, headers={"Authorization":"Bearer " + key, "Content-Type":"application/json"}, method="POST")
    started = time.perf_counter()
    try:
        with urllib.request.urlopen(request, timeout=120) as response:
            body = json.loads(response.read().decode()); status = response.status
    except urllib.error.HTTPError as error:
        return {"ok":False,"http_status":error.code,"error_code":"HTTP_ERROR","latency_ms":round((time.perf_counter()-started)*1000,3)}
    except Exception:
        return {"ok":False,"http_status":None,"error_code":"REQUEST_ERROR","latency_ms":round((time.perf_counter()-started)*1000,3)}
    data = body.get("data", body); return {"ok":status == 200 and data.get("status") == "succeeded","http_status":status,"run_id":body.get("workflow_run_id") or data.get("id"),"outputs":data.get("outputs") or {}, "latency_ms":round((time.perf_counter()-started)*1000,3),"usage":data.get("metadata",{}).get("usage")}

def normalize(run):
    outputs = run.get("outputs", {})
    if "invalid_status" in outputs:
        return {"status":outputs.get("invalid_status"),"route":outputs.get("invalid_route"),"humanReview":outputs.get("invalid_human_review_required"),"decision_id":outputs.get("invalid_decision_id"),"audit":outputs.get("invalid_audit_json")}
    analysis_key = next((key for key in outputs if key.endswith("_analysis_json")), None)
    if not analysis_key: return None
    try: analysis = json.loads(outputs[analysis_key])
    except (TypeError, json.JSONDecodeError): return None
    return {"status":"VALID","level":analysis.get("risk_level"),"score":analysis.get("risk_score"),"signals":analysis.get("fraud_signals"),"route":analysis.get("recommended_route"),"humanReview":analysis.get("human_review_required"),"decision_id":analysis.get("decision_id"),"audit":analysis.get("audit")}

def assess(case, suite, base, key):
    run = invoke(base, key, case, suite); actual = normalize(run); expected = case["expected"]; failures = []
    if not run["ok"] or not actual: failures.append("workflow")
    elif expected["status"] == "INVALID":
        failures += [field for field in ("status","route") if actual.get(field) != expected[field]]
        if actual.get("humanReview") is not True: failures.append("human_review_required")
    else:
        failures += [field for field in ("level","score","signals","route") if actual.get(field) != expected[field]]
        if actual.get("status") != "VALID": failures.append("status")
        if actual.get("humanReview") is not True: failures.append("human_review_required")
    return {"id":case["id"],"group":case["group"],"critical":bool(case.get("critical")),"accepted":not failures,"failures":failures,"actual":actual,"expected":expected,"run_id":run.get("run_id"),"http_status":run.get("http_status"),"latency_ms":run["latency_ms"],"usage_available":bool(run.get("usage")),"error_code":run.get("error_code")}

def write_reports(report):
    REPORTS.mkdir(parents=True, exist_ok=True)
    (REPORTS/"dify-eval-summary.json").write_text(json.dumps(report, ensure_ascii=False, indent=2)+"\n",encoding="utf-8")
    s = report["summary"]; failures = [item for item in report["runs"] if not item["accepted"]]
    lines = ["# Dify API Failure Analysis","","> 数据来自已发布的本地 Dify workflow API；输入均为 SIMULATED。",""]
    lines += [f"- {item['id']}: Expected={item['expected']} | Actual={item['actual']} | Root Cause=API regression mismatch | Fix / Accept=待分析" for item in failures] or ["- 无失败用例。"]
    (REPORTS/"dify-failure-analysis.md").write_text("\n".join(lines)+"\n",encoding="utf-8")
    evidence = {"evidence_status":"api_verified_simulated_poc","data_classification":"SIMULATED","workflow":{"path":"poc/dify/insurance_claims_workflow.yml","online_dify_run":True,"real_run_ids_recorded":s["run_id_coverage"],"workflow_version":"INS-FRAUD-RULESET/1.1.0"},"dataset":{"golden_cases_total":29,"executable_cases":s["cases_run"],"static_checks":1,"critical_cases":s["critical_cases"]},"core_metrics":{"workflow_success_rate":s["workflow_success_rate"],"schema_pass_rate":s["schema_pass_rate"],"routing_accuracy":s["routing_accuracy"],"critical_consistency_rate":s["critical_consistency_rate"],"safety_gate_pass_rate":None,"fallback_checks_passed":None,"failure_count":s["failure_count"],"p50_latency_ms":s["p50_latency_ms"],"p95_latency_ms":s["p95_latency_ms"]},"display_metrics":{"routing_accuracy":f"{s['routing_accuracy']:.0%}","critical_consistency":f"{s['critical_consistency_rate']:.0%}","safety_gate":"本地已验证"},"limitations":["SIMULATED API 回归不代表真实欺诈识别准确率、生产 SLA 或 ROI。","本次真实 API 回归不主动注入 LLM 故障；篡改拦截与两类降级由本地工作流代码合同测试验证。"]}
    (REPORTS/"page-evidence.json").write_text(json.dumps(evidence,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    report_md = ["# AI 保险理赔智能助手｜POC Report","","## VERIFIED","",f"- 已发布 Dify workflow API：{s['cases_run']} 条 SIMULATED 黄金集运行，真实 Run ID 覆盖 {s['run_id_coverage']}/{s['cases_run']}。",f"- 工作流成功率 {s['workflow_success_rate']:.0%}；路由一致性 {s['routing_accuracy']:.0%}；{s['critical_cases']} 条 Critical Cases 三次一致性 {s['critical_consistency_rate']:.0%}。",f"- API P50 {s['p50_latency_ms']} ms，P95 {s['p95_latency_ms']} ms；无 token/cost 数据时不估算成本。","","## NOT PROVEN","", "- 真实欺诈识别准确率、真实保险数据效果、自动赔付、生产 SLA、真实 ROI。", "- 主动注入 LLM 故障的线上分支覆盖；其合同已在本地确定性节点测试。","","## Production Next Step","", "- 在获批只读 Sandbox 连接真实 Adapter，并以带 Ground Truth 的代表性数据进行受控验证。"]
    (REPORTS/"POC_REPORT.md").write_text("\n".join(report_md)+"\n",encoding="utf-8")

def main():
    parser = argparse.ArgumentParser(); parser.add_argument("--base-url",default=os.environ.get("DIFY_BASE_URL","http://localhost/v1")); args = parser.parse_args()
    key = os.environ.get("DIFY_APP_API_KEY")
    if not key: raise SystemExit("DIFY_APP_API_KEY is required")
    suite = read_json(GOLDEN); executable = [case for case in suite["cases"] if not case.get("staticExpectation")]; runs = [assess(case,suite,args.base_url,key) for case in executable]
    critical = [case for case in suite["cases"] if case.get("critical")]; repeats = {case["id"]:[next(run for run in runs if run["id"]==case["id"])] + [assess(case,suite,args.base_url,key) for _ in range(2)] for case in critical}
    stable = [all(run["accepted"] for run in group) and len({json.dumps(run["actual"],sort_keys=True,ensure_ascii=False) for run in group})==1 for group in repeats.values()]
    latency = [run["latency_ms"] for run in runs]; valid = [run for run in runs if run["actual"]]
    s = {"cases_run":len(runs),"critical_cases":len(critical),"workflow_success_rate":sum(run["http_status"]==200 and run["actual"] is not None for run in runs)/len(runs),"schema_pass_rate":sum(run["actual"] is not None for run in runs)/len(runs),"routing_accuracy":sum(run["accepted"] for run in runs)/len(runs),"critical_consistency_rate":sum(stable)/len(stable),"run_id_coverage":sum(bool(run["run_id"]) for run in runs),"failure_count":sum(not run["accepted"] for run in runs),"p50_latency_ms":percentile(latency,.5),"p95_latency_ms":percentile(latency,.95),"token_or_cost_metadata_available_runs":sum(run["usage_available"] for run in runs)}
    report = {"generated_at":datetime.now(timezone.utc).isoformat(),"evaluation_scope":"PUBLISHED_DIFY_API_REGRESSION","data_classification":"SIMULATED","status":"PASS" if s["failure_count"]==0 and s["critical_consistency_rate"]==1 else "FAIL","summary":s,"runs":runs,"critical_repeats":repeats}
    write_reports(report); print(json.dumps({"status":report["status"],**s},ensure_ascii=False)); return 0 if report["status"]=="PASS" else 1
if __name__ == "__main__": raise SystemExit(main())
