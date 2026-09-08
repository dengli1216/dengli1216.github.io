#!/usr/bin/env python3
"""Run one adapter against the stable 12-case industrial inspection Golden Set."""
import argparse
import hashlib
import json
import math
import os
import statistics
import sys
import time
from pathlib import Path

POC_ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = Path(__file__).resolve().parents[4]
ENV_PATH = REPO_ROOT / ".env"
sys.path.insert(0, str(POC_ROOT))
from adapters.base import VisionAdapterError
from adapters.fixture_offline_adapter import FixtureOfflineAdapter
from adapters.gemini_vision_adapter import GeminiVisionAdapter
from adapters.qwen_vision_adapter import QwenVisionAdapter
from inspection_decision import normalize_observation

GOLDEN_PATH = POC_ROOT / "tests" / "golden-set.json"
RULES_PATH = POC_ROOT / "rules" / "inspection-rules.v1.yaml"
OBSERVATIONS_PATH = POC_ROOT / "fixtures" / "fixture-observations.v1.json"
SCHEMA_PATH = POC_ROOT / "schemas" / "inspection-output.schema.json"
DEFAULT_PROMPT_PATH = POC_ROOT / "prompts" / "vision-recognition.v1.md"
ASSERTION_FIELDS = ("reading_or_state", "anomaly", "review_required", "recommended_action", "uncertainty")
EXPECTED_ENV_NAMES = {
    "qwen": ("VISION_PROVIDER", "VISION_MODEL", "VISION_ENDPOINT", "DASHSCOPE_API_KEY"),
    "gemini": ("VISION_PROVIDER", "VISION_MODEL", "GEMINI_ENDPOINT", "GEMINI_API_KEY"),
}


def load_repo_environment() -> bool:
    """Load the repository-level runtime configuration without overriding process env."""
    if not ENV_PATH.is_file():
        return False
    values = {}
    for line in ENV_PATH.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue
        name, value = stripped.split("=", 1)
        values[name.strip()] = value.strip().strip('"').strip("'")
    for name, value in values.items():
        os.environ.setdefault(name, value)
    return True


def provider_preflight(adapter_name: str) -> tuple[bool, str | None]:
    """Return only configuration state; never include environment values in errors."""
    load_repo_environment()
    expected = EXPECTED_ENV_NAMES.get(adapter_name)
    if expected is None:
        return False, "UNSUPPORTED_PROVIDER"
    missing = [name for name in expected if not os.environ.get(name)]
    if missing:
        return False, "VARIABLE_MISSING"
    if os.environ.get("VISION_PROVIDER") != adapter_name:
        return False, "VARIABLE_MISSING"
    return True, None


def print_preflight(adapter_name: str, timeout_seconds: int, prompt_path: Path) -> int:
    configured, _ = provider_preflight(adapter_name)
    api_reachable = False
    if configured:
        try:
            adapter, _ = build_adapter(adapter_name, timeout_seconds, prompt_path)
            golden = load_json(GOLDEN_PATH)
            item = golden["items"][0]
            image_path = (GOLDEN_PATH.parent / item["image_path"]).resolve()
            adapter.inspect(image_path, {
                "case_id": item["id"],
                "equipment_id": item["equipment_id"],
                "equipment_type": item["equipment_type"],
                "inspection_rule_id": item["inspection_rule_id"],
                "rule": None,
            })
            api_reachable = True
        except Exception:
            api_reachable = False
    print("EXPECTED_ENV_NAME=" + ",".join(EXPECTED_ENV_NAMES[adapter_name]))
    print("ENV_PRESENT=" + str(configured).lower())
    print("ENV_FILE_FOUND=" + str(ENV_PATH.is_file()).lower())
    print("API_PREFLIGHT=" + ("pass" if api_reachable else "fail"))
    return 0 if api_reachable else 2


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def validate_schema(result: object, schema: dict) -> list[str]:
    errors = []
    if not isinstance(result, dict):
        return ["output must be an object"]
    for key in schema["required"]:
        if key not in result:
            errors.append(f"missing required field: {key}")
    if errors:
        return errors
    if not isinstance(result["equipment_id"], str) or not result["equipment_id"]:
        errors.append("equipment_id must be a non-empty string")
    if not isinstance(result["inspection_rule_id"], str) or not result["inspection_rule_id"]:
        errors.append("inspection_rule_id must be a non-empty string")
    if not (result["reading_or_state"] is None or isinstance(result["reading_or_state"], (str, int, float))):
        errors.append("reading_or_state must be string, number, or null")
    if not (result["anomaly"] is None or type(result["anomaly"]) is bool):
        errors.append("anomaly must be boolean or null")
    if result["confidence"] is not None and (type(result["confidence"]) not in (int, float) or not 0 <= result["confidence"] <= 1):
        errors.append("confidence must be number from 0 to 1 or null")
    if result["uncertainty"] not in {"low", "medium", "high"}:
        errors.append("uncertainty must be low, medium, or high")
    if result["target_status"] not in {"identified", "ambiguous", "invalid", "mismatch"}:
        errors.append("target_status must be identified, ambiguous, invalid, or mismatch")
    if type(result["review_required"]) is not bool:
        errors.append("review_required must be boolean")
    if not isinstance(result["recommended_action"], str) or not result["recommended_action"]:
        errors.append("recommended_action must be a non-empty string")
    if not isinstance(result["model_raw"], dict):
        errors.append("model_raw must be an object")
    extra = set(result) - set(schema["properties"])
    if extra:
        errors.append("unexpected fields: " + ", ".join(sorted(extra)))
    return errors


def percentile(values: list[float], fraction: float) -> float | None:
    if not values:
        return None
    values = sorted(values)
    position = (len(values) - 1) * fraction
    lower, upper = int(position), math.ceil(position)
    value = values[lower] if lower == upper else values[lower] + (values[upper] - values[lower]) * (position - lower)
    return round(value, 6)


def image_hash(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def build_adapter(adapter_name: str, timeout_seconds: int, prompt_path: Path):
    if adapter_name == "fixture":
        return FixtureOfflineAdapter(OBSERVATIONS_PATH), {"provider": "fixture", "model": "not_applicable", "prompt_version": "not_applicable", "type": "fixture_mock_offline"}
    provider = os.environ.get("VISION_PROVIDER")
    if provider != adapter_name:
        raise VisionAdapterError(f"VISION_PROVIDER={adapter_name} is required for the {adapter_name} adapter")
    if adapter_name == "qwen":
        return QwenVisionAdapter(
            api_key=os.environ.get("DASHSCOPE_API_KEY", ""),
            model=os.environ.get("VISION_MODEL", ""),
            endpoint=os.environ.get("VISION_ENDPOINT", ""),
            prompt_path=prompt_path,
            timeout_seconds=timeout_seconds,
        ), {"provider": "qwen", "model": os.environ.get("VISION_MODEL"), "prompt_version": prompt_path.stem, "type": "real_vision_api"}
    if adapter_name == "gemini":
        return GeminiVisionAdapter(
            api_key=os.environ.get("GEMINI_API_KEY", ""),
            model=os.environ.get("VISION_MODEL", ""),
            endpoint=os.environ.get("GEMINI_ENDPOINT", ""),
            prompt_path=prompt_path,
            timeout_seconds=timeout_seconds,
        ), {"provider": "gemini", "model": os.environ.get("VISION_MODEL"), "prompt_version": prompt_path.stem, "type": "real_vision_api"}
    raise VisionAdapterError(f"unsupported adapter: {adapter_name}")


def run_case(adapter, item: dict, rule_index: dict, schema: dict) -> dict:
    image_path = (GOLDEN_PATH.parent / item["image_path"]).resolve()
    context = {
        "case_id": item["id"],
        "equipment_id": item["equipment_id"],
        "equipment_type": item["equipment_type"],
        "inspection_rule_id": item["inspection_rule_id"],
        "rule": rule_index.get(item["inspection_rule_id"]),
        "metadata_rule_mismatch": item.get("metadata_rule_mismatch", False),
        "mismatch_action": item.get("mismatch_action"),
        "fixture_expected_uncertainty": item.get("raw_visual_observation", {}).get("uncertainty"),
    }
    started = time.perf_counter()
    try:
        visual = adapter.inspect(image_path, context)
        output = normalize_observation(visual, context)
        adapter_error = None
    except Exception as error:
        visual, output = None, None
        adapter_error = f"{type(error).__name__}: {error}"
    latency_ms = round((time.perf_counter() - started) * 1000, 6)
    schema_errors = validate_schema(output, schema) if output is not None else [adapter_error]
    expected = {**item["expected"], "uncertainty": item.get("raw_visual_observation", {}).get("uncertainty")}
    assertions = {field: {"expected": expected[field], "actual": output.get(field) if output else None, "passed": bool(output is not None and output.get(field) == expected[field])} for field in ASSERTION_FIELDS}
    expected_visual_status = "unreadable" if item["critical_case"] == "unreadable" else "ambiguous" if item["critical_case"] == "ambiguous" else "readable"
    visual_assertion = {"expected": expected_visual_status, "actual": visual.get("visual_status") if visual else None, "passed": bool(visual and visual.get("visual_status") == expected_visual_status)}
    passed = output is not None and not schema_errors and all(check["passed"] for check in assertions.values()) and visual_assertion["passed"]
    failure_reason = adapter_error or ("schema_validation_failed: " + "; ".join(schema_errors) if schema_errors else None)
    if failure_reason is None and not passed:
        failure_reason = "assertion_failure"
    return {
        "sample_id": item["id"],
        "category": item["category"],
        "critical_case": item["critical_case"],
        "critical": item["critical"],
        "data_source": item["data_source"],
        "approval_status": item["approval_status"],
        "input_reference": str(image_path.relative_to(POC_ROOT)),
        "image_sha256": image_hash(image_path) if image_path.is_file() else None,
        "equipment_id": item["equipment_id"],
        "equipment_type": item["equipment_type"],
        "inspection_rule_id": item["inspection_rule_id"],
        "visual_observation": visual,
        "normalized_output": output,
        "expected": expected,
        "assertions": {**assertions, "visual_status": visual_assertion},
        "adapter_error": adapter_error,
        "failure_reason": failure_reason,
        "schema_errors": schema_errors,
        "usage": visual.get("usage", "not_available") if visual else "not_available",
        "latency_ms": latency_ms,
        "passed": passed,
    }


def cost_record(details: list[dict]) -> dict:
    usage = [detail["usage"] for detail in details]
    if not all(isinstance(item, dict) for item in usage):
        return {"requests": len(details), "input_usage": "not_available", "output_usage": "not_available", "estimated_api_cost": "not_available"}
    return {
        "requests": len(details),
        "input_usage": sum(item.get("prompt_tokens", 0) for item in usage),
        "output_usage": sum(item.get("completion_tokens", 0) for item in usage),
        "estimated_api_cost": "not_available",
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--adapter", choices=("fixture", "qwen", "gemini"), default="fixture")
    parser.add_argument("--preflight", action="store_true", help="check repository .env configuration without revealing values")
    parser.add_argument("--timeout-seconds", type=int, default=60)
    parser.add_argument("--output-dir", default=str(POC_ROOT / "reports"), help="directory for evaluation-summary.json and evaluation-details.json")
    parser.add_argument("--prompt-path", default=str(DEFAULT_PROMPT_PATH), help="prompt file for a real vision adapter")
    parser.add_argument("--sample-ids", help="comma-separated Golden Set IDs for a targeted run")
    args = parser.parse_args()
    prompt_path = Path(args.prompt_path).resolve()
    if not prompt_path.is_file():
        parser.error(f"prompt file not found: {prompt_path}")
    if args.preflight:
        return print_preflight(args.adapter, args.timeout_seconds, prompt_path)
    load_repo_environment()
    try:
        adapter, adapter_meta = build_adapter(args.adapter, args.timeout_seconds, prompt_path)
    except VisionAdapterError as error:
        print(json.dumps({"status": "blocked", "adapter": args.adapter, "reason": str(error), "evidence_written": False}, ensure_ascii=False), file=sys.stderr)
        return 2
    golden, rules, schema = load_json(GOLDEN_PATH), load_json(RULES_PATH), load_json(SCHEMA_PATH)
    rule_index = {rule["id"]: rule for rule in rules["rules"]}
    selected_ids = None
    items = golden["items"]
    if args.sample_ids:
        selected_ids = [sample_id.strip() for sample_id in args.sample_ids.split(",") if sample_id.strip()]
        known_ids = {item["id"] for item in items}
        unknown_ids = sorted(set(selected_ids) - known_ids)
        if unknown_ids:
            parser.error("unknown sample IDs: " + ", ".join(unknown_ids))
        items = [item for item in items if item["id"] in selected_ids]
    started_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    details = [run_case(adapter, item, rule_index, schema) for item in items]
    total = len(details)
    executed = sum(detail["adapter_error"] is None for detail in details)
    schema_passed = sum(not detail["schema_errors"] for detail in details)
    passed = [detail for detail in details if detail["passed"]]
    critical = [detail for detail in details if detail["critical"]]
    critical_failed_ids = [detail["sample_id"] for detail in critical if not detail["passed"]]
    latencies = [detail["latency_ms"] for detail in details]
    matches = {field: sum(detail["assertions"][field]["passed"] for detail in details) for field in ASSERTION_FIELDS}
    uncertainty_matches = matches["uncertainty"]
    gate_passed = total == len(items) and total > 0 and executed == total and schema_passed == total and not critical_failed_ids
    run_metadata = {
        "generated_at": started_at,
        "case_id": golden["case_id"],
        "case_spec_version": golden["case_spec_version"],
        "golden_set_version": golden["golden_set_version"],
        "rule_version": rules["version"],
        "adapter": {"name": adapter.name, "version": adapter.version, **adapter_meta},
        "evaluation_scope": "pipeline_validation" if args.adapter == "fixture" else "poc_targeted_regression" if selected_ids else "poc_regression",
        "model_accuracy": "not_evaluated" if args.adapter == "fixture" else "poc_baseline_only",
        "selected_sample_ids": selected_ids,
    }
    summary = {
        **run_metadata,
        "metrics": {
            "total": total,
            "attempted": total,
            "executed": executed,
            "api_success_rate": {"passed": executed, "total": total, "rate": executed / total if total else None},
            "schema_compliance": {"passed": schema_passed, "total": total, "rate": schema_passed / total if total else None, "on_successful_responses": schema_passed / executed if executed else None},
            "critical_case_pass": {"total": len(critical), "passed": len(critical) - len(critical_failed_ids), "failed": len(critical_failed_ids), "failed_ids": critical_failed_ids},
            "failure_count": total - len(passed),
            "poc_baseline": {
                "reading_or_state_match": {"passed": matches["reading_or_state"], "total": total},
                "anomaly_match": {"passed": matches["anomaly"], "total": total},
                "review_required_match": {"passed": matches["review_required"], "total": total},
                "uncertainty_match": {"passed": uncertainty_matches, "total": total},
                "latency_ms": {"average": round(statistics.mean(latencies), 6), "p50": percentile(latencies, 0.5), "p95": percentile(latencies, 0.95)},
            },
            "cost": cost_record(details),
        },
        "gates": {"schema_compliance_100_percent_on_successful_responses": schema_passed == executed, "critical_cases_reported": len(critical) > 0, "all_failures_traceable": all(detail["passed"] or detail["failure_reason"] for detail in details), "passed": gate_passed},
        "limitations": ["Twelve cases are a POC baseline and must not be extrapolated to production performance.", "Expected labels are not modified by model output.", "No silent fallback is used for adapter, HTTP, parsing, or unsupported-image failures."],
    }
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    (output_dir / "evaluation-details.json").write_text(json.dumps({**run_metadata, "samples": details}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (output_dir / "evaluation-summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0 if gate_passed else 1


if __name__ == "__main__":
    raise SystemExit(main())
