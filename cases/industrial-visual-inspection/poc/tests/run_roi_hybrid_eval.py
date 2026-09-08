#!/usr/bin/env python3
"""Evaluate reusable ROI routing plus Gemini semantic recognition against frozen Golden data."""
import argparse
import json
import os
import statistics
import sys
import time
from pathlib import Path

POC_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(POC_ROOT))

from adapters.gemini_vision_adapter import GeminiVisionAdapter
from adapters.hybrid_roi_adapter import HybridRoiAdapter
from roi_pipeline import route_sample
from run_eval import (DEFAULT_PROMPT_PATH, ENV_PATH, GOLDEN_PATH, RULES_PATH, SCHEMA_PATH,
                      cost_record, load_json, load_repo_environment, percentile, run_case)

MANIFEST_PATH = POC_ROOT / "data" / "golden" / "inspection-images.json"


def target_expected(sample: dict, route: dict) -> set[str]:
    if route["instrument_type"] == "ambiguous/unsupported":
        return {"ambiguous", "invalid"}
    if sample.get("metadata_rule_mismatch"):
        return {"mismatch", "ambiguous", "invalid"}
    return {"identified"}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output-dir", required=True)
    parser.add_argument("--prompt-path", default=str(DEFAULT_PROMPT_PATH))
    parser.add_argument("--timeout-seconds", type=int, default=90)
    args = parser.parse_args()
    prompt_path = Path(args.prompt_path).resolve()
    if not prompt_path.is_file():
        parser.error(f"prompt file not found: {prompt_path}")
    load_repo_environment()
    if os.environ.get("VISION_PROVIDER") != "gemini":
        print("VISION_PROVIDER=gemini is required", file=sys.stderr)
        return 2
    output_dir = Path(args.output_dir).resolve()
    golden = load_json(GOLDEN_PATH)
    manifest = load_json(MANIFEST_PATH)
    manifest_by_name = {item["filename"]: item for item in manifest["items"]}
    routes = {
        item["id"]: route_sample(item, manifest_by_name[Path(item["image_path"]).name])
        for item in golden["items"]
    }
    vlm = GeminiVisionAdapter(
        api_key=os.environ.get("GEMINI_API_KEY", ""),
        model=os.environ.get("VISION_MODEL", ""),
        endpoint=os.environ.get("GEMINI_ENDPOINT", ""),
        prompt_path=prompt_path,
        timeout_seconds=args.timeout_seconds,
    )
    adapter = HybridRoiAdapter(vlm, routes, output_dir / "roi")
    rules, schema = load_json(RULES_PATH), load_json(SCHEMA_PATH)
    rule_index = {rule["id"]: rule for rule in rules["rules"]}
    started_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    details = [run_case(adapter, item, rule_index, schema) for item in golden["items"]]
    for detail in details:
        route = routes[detail["sample_id"]]
        stages = detail.get("visual_observation", {}).get("model_raw", {})
        roi = stages.get("roi", {"status": "not_run"})
        reader = stages.get("specialist_reader", {"status": "not_run"})
        actual_target = detail.get("visual_observation", {}).get("target_status")
        detail["pipeline"] = {
            "route": route,
            "roi": roi,
            "reader": reader,
            "target_selection": {
                "expected_statuses": sorted(target_expected(next(item for item in golden["items"] if item["id"] == detail["sample_id"]), route)),
                "actual": actual_target,
                "passed": actual_target in target_expected(next(item for item in golden["items"] if item["id"] == detail["sample_id"]), route),
            },
        }
    total = len(details)
    executed = sum(detail["adapter_error"] is None for detail in details)
    schema_passed = sum(not detail["schema_errors"] for detail in details)
    critical = [detail for detail in details if detail["critical"]]
    critical_passed = sum(detail["passed"] for detail in critical)
    metrics = {
        "total": total,
        "attempted": total,
        "executed": executed,
        "api_success": {"passed": executed, "total": total},
        "schema": {"passed": schema_passed, "total": total},
        "reading": {"passed": sum(d["assertions"]["reading_or_state"]["passed"] for d in details), "total": total},
        "anomaly": {"passed": sum(d["assertions"]["anomaly"]["passed"] for d in details), "total": total},
        "review": {"passed": sum(d["assertions"]["review_required"]["passed"] for d in details), "total": total},
        "uncertainty": {"passed": sum(d["assertions"]["uncertainty"]["passed"] for d in details), "total": total},
        "target_selection": {"passed": sum(d["pipeline"]["target_selection"]["passed"] for d in details), "total": total},
        "critical_case_pass": {"passed": critical_passed, "total": len(critical)},
        "failure_count": sum(not detail["passed"] for detail in details),
        "latency_ms": {"p50": percentile([d["latency_ms"] for d in details], 0.5), "p95": percentile([d["latency_ms"] for d in details], 0.95)},
        "stages": {
            "roi_success": {"passed": sum(d["pipeline"]["roi"]["status"] in {"generated", "skipped"} for d in details), "total": total},
            "reader_success": {"passed": sum(d["pipeline"]["reader"]["status"] == "success" for d in details), "total": total},
            "vlm_success": {"passed": executed, "total": total},
            "rule_success": {"passed": schema_passed, "total": total},
        },
        "cost": cost_record(details),
    }
    output_dir.mkdir(parents=True, exist_ok=True)
    routing = [routes[item["id"]] for item in golden["items"]]
    (output_dir / "sample-routing.json").write_text(json.dumps(routing, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (output_dir / "evaluation-details.json").write_text(json.dumps({"generated_at": started_at, "adapter": {"model": vlm.model, "prompt_version": prompt_path.stem}, "samples": details}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    summary = {"generated_at": started_at, "pipeline": "ROI crop -> specialist reader feasibility -> Gemini semantic VLM -> existing Rule Engine", "adapter": {"provider": "gemini", "model": vlm.model, "prompt_version": prompt_path.stem}, "golden_set_version": golden["golden_set_version"], "rule_version": rules["version"], "metrics": metrics, "gate_passed": False, "limitations": ["Specialist OCR and analog gauge reading are unavailable in the current dependency set.", "ROI strategy is category-based and does not use Golden readings.", "Synthetic data results are POC evidence only."]}
    (output_dir / "evaluation-summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
