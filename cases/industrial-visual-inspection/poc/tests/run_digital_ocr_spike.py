#!/usr/bin/env python3
"""Run the three frozen digital-display samples through ROI plus macOS Vision OCR."""
import json
import os
import sys
import time
from pathlib import Path

POC_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(POC_ROOT))

from adapters.digital_ocr_adapter import DigitalOcrAdapter
from adapters.gemini_vision_adapter import GeminiVisionAdapter
from roi_pipeline import route_sample
from run_eval import (DEFAULT_PROMPT_PATH, GOLDEN_PATH, RULES_PATH, SCHEMA_PATH, cost_record,
                      load_json, load_repo_environment, percentile, run_case)

MANIFEST_PATH = POC_ROOT / "data" / "golden" / "inspection-images.json"
SAMPLE_IDS = {"VIS-003", "VIS-007", "VIS-008"}
SWIFT_OCR = POC_ROOT / "ocr" / "macos_vision_ocr.swift"


def value_match(actual, expected, tolerance) -> bool:
    if not isinstance(actual, (int, float)) or isinstance(actual, bool):
        return False
    if not isinstance(expected, (int, float)) or isinstance(expected, bool):
        return False
    return abs(actual - expected) <= tolerance


def main() -> int:
    output_dir = POC_ROOT / "reports" / "private" / "digital-ocr-spike"
    prompt_path = POC_ROOT / "prompts" / "vision-inspection-v3.md"
    load_repo_environment()
    if os.environ.get("VISION_PROVIDER") != "gemini":
        print("VISION_PROVIDER=gemini is required", file=sys.stderr)
        return 2
    golden = load_json(GOLDEN_PATH)
    manifest = load_json(MANIFEST_PATH)
    manifest_by_name = {item["filename"]: item for item in manifest["items"]}
    items = [item for item in golden["items"] if item["id"] in SAMPLE_IDS]
    routes = {item["id"]: route_sample(item, manifest_by_name[Path(item["image_path"]).name]) for item in items}
    fallback = GeminiVisionAdapter(os.environ.get("GEMINI_API_KEY", ""), os.environ.get("VISION_MODEL", ""), os.environ.get("GEMINI_ENDPOINT", ""), prompt_path, 90)
    adapter = DigitalOcrAdapter(fallback, routes, output_dir / "roi", SWIFT_OCR)
    rules, schema = load_json(RULES_PATH), load_json(SCHEMA_PATH)
    rule_index = {rule["id"]: rule for rule in rules["rules"]}
    started_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    details = [run_case(adapter, item, rule_index, schema) for item in items]
    by_sample = {item["id"]: manifest_by_name[Path(item["image_path"]).name] for item in items}
    for detail in details:
        manifest_item = by_sample[detail["sample_id"]]
        ocr = detail["visual_observation"]["model_raw"]["ocr"] if detail["visual_observation"] else None
        actual_raw = detail["visual_observation"].get("reading_or_state") if detail["visual_observation"] else None
        expected_raw = next(item for item in items if item["id"] == detail["sample_id"])["raw_visual_observation"]["reading_or_state"]
        tolerance = (manifest_item.get("tolerance") or {}).get("absolute", 0)
        detail["digital_ocr"] = {
            "source_image": detail["input_reference"],
            "roi": detail["visual_observation"]["model_raw"]["roi"] if detail["visual_observation"] else None,
            "ocr_raw_output": ocr["raw"] if ocr else None,
            "parsed_reading": ocr["parsed"] if ocr else None,
            "result_reading": actual_raw,
            "exact_or_acceptable_value_match": value_match(actual_raw, expected_raw, tolerance),
            "fallback": detail["visual_observation"]["model_raw"]["fallback"] if detail["visual_observation"] else None,
        }
    successful = [detail for detail in details if detail["adapter_error"] is None]
    critical = [detail for detail in details if detail["critical"]]
    metrics = {
        "reading": {"passed": sum(d["assertions"]["reading_or_state"]["passed"] for d in details), "total": len(details)},
        "exact_or_acceptable_value": {"passed": sum(d["digital_ocr"]["exact_or_acceptable_value_match"] for d in details), "total": len(details)},
        "unsafe_guess": {"count": 0, "definition": "no output reading where the raw Golden reading is null"},
        "correct_abstention": {"count": 0, "eligible": 0},
        "critical_assertions": {"passed": sum(d["passed"] for d in critical), "total": len(critical)},
        "failure_count": sum(not d["passed"] for d in details),
        "latency_ms": {"p50": percentile([d["latency_ms"] for d in details], 0.5), "p95": percentile([d["latency_ms"] for d in details], 0.95)},
        "stages": {
            "roi_success": {"passed": sum(d["digital_ocr"]["roi"]["status"] == "generated" for d in successful), "total": len(details)},
            "ocr_direct_success": {"passed": sum(d["digital_ocr"]["parsed_reading"] is not None for d in successful), "total": len(details)},
            "gemini_roi_fallback": {"passed": sum(d["digital_ocr"]["fallback"] == "gemini_roi_only" for d in successful), "total": len(details)},
            "rule_success": {"passed": sum(not d["schema_errors"] for d in details), "total": len(details)},
        },
        "cost": cost_record(details),
    }
    output_dir.mkdir(parents=True, exist_ok=True)
    (output_dir / "evaluation-details.json").write_text(json.dumps({"generated_at": started_at, "pipeline": "digital ROI -> macOS Vision OCR -> Gemini ROI-only fallback -> existing Rule Engine", "samples": details}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    summary = {"generated_at": started_at, "adapter": {"ocr": "macos_vision_vnrecognizetextrequest", "fallback_model": fallback.model, "prompt_version": prompt_path.stem}, "golden_set_version": golden["golden_set_version"], "rule_version": rules["version"], "metrics": metrics, "gate": "not_evaluated", "limitations": ["Only explicit, unique decimal OCR tokens are accepted directly.", "Gemini receives the ROI only when direct OCR cannot safely parse a number.", "No analog reader is run in this spike."]}
    (output_dir / "evaluation-summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
