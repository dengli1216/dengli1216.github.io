#!/usr/bin/env python3
"""Evaluate direct PP-OCRv5 mobile reading on three frozen digital-display samples."""
import json
import math
import os
import re
import sys
import time
from pathlib import Path

from PIL import Image, ImageOps

POC_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(POC_ROOT))

from inspection_decision import normalize_observation
from roi_pipeline import route_sample, write_roi

from paddleocr import PaddleOCR

GOLDEN_PATH = POC_ROOT / "tests" / "golden-set.json"
RULES_PATH = POC_ROOT / "rules" / "inspection-rules.v1.yaml"
SCHEMA_PATH = POC_ROOT / "schemas" / "inspection-output.schema.json"
MANIFEST_PATH = POC_ROOT / "data" / "golden" / "inspection-images.json"
SAMPLE_IDS = {"VIS-003", "VIS-007", "VIS-008"}
NUMERIC_TOKEN = re.compile(r"^-?\d+(\.\d+)?$")


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def percentile(values, fraction: float):
    values = sorted(values)
    if not values:
        return None
    position = (len(values) - 1) * fraction
    lower, upper = int(position), math.ceil(position)
    return round(values[lower] if lower == upper else values[lower] + (values[upper] - values[lower]) * (position - lower), 6)


def validate_schema(result, schema: dict):
    if not isinstance(result, dict):
        return ["output must be an object"]
    missing = [field for field in schema["required"] if field not in result]
    if missing:
        return ["missing required field: " + ", ".join(missing)]
    return [] if set(result).issubset(schema["properties"]) else ["unexpected output fields"]


def preprocess(source: Path, output: Path) -> dict:
    """One uniform enhancement: grayscale, autocontrast, then 2x resize."""
    with Image.open(source) as image:
        processed = ImageOps.autocontrast(image.convert("L"))
        processed = processed.resize((processed.width * 2, processed.height * 2), Image.Resampling.LANCZOS)
        output.parent.mkdir(parents=True, exist_ok=True)
        processed.save(output)
    return {"variant": "grayscale_autocontrast_resize2x", "path": str(output)}


def parse_numeric(candidates):
    numeric = [candidate for candidate in candidates if NUMERIC_TOKEN.fullmatch(candidate["text"])]
    if len(numeric) != 1:
        return None, "ambiguous_numeric_candidates" if numeric else "no_numeric_candidate"
    candidate = numeric[0]
    return {"value": float(candidate["text"]), "token": candidate["text"], "confidence": candidate["confidence"]}, "single_explicit_numeric_token"


class PaddleDirectAdapter:
    name = "paddle-direct-ocr-adapter"
    version = "spike-v1"

    def __init__(self, model, routes: dict[str, dict], output_dir: Path):
        self.model = model
        self.routes = routes
        self.output_dir = output_dir

    def inspect(self, image_path: Path, context: dict) -> dict:
        route = self.routes[context["case_id"]]
        roi = write_roi(image_path, route, self.output_dir / "roi" / f"{context['case_id']}.png")
        prepared = preprocess(Path(roi["path"]), self.output_dir / "preprocessed" / f"{context['case_id']}.png")
        started = time.perf_counter()
        result = self.model.predict(prepared["path"])[0].json["res"]
        ocr_latency_ms = round((time.perf_counter() - started) * 1000, 6)
        candidates = [
            {"text": text, "confidence": float(confidence), "box": box}
            for text, confidence, box in zip(result["rec_texts"], result["rec_scores"], result["rec_boxes"])
        ]
        parsed, parse_reason = parse_numeric(candidates)
        mismatch = context.get("metadata_rule_mismatch", False)
        return {
            "reading_or_state": parsed["value"] if parsed else None,
            "confidence": parsed["confidence"] if parsed else None,
            "visual_status": "readable" if parsed else "ambiguous",
            "target_status": "mismatch" if mismatch else "identified",
            "visual_metric": None,
            "rule_compatible": False if mismatch else True,
            "uncertainty": "high" if parsed is None else "low",
            "human_review_required": parsed is None or mismatch,
            "observations": [parse_reason],
            "usage": "not_applicable",
            "model_raw": {
                "provider": "paddleocr",
                "model": "PP-OCRv5_mobile_det+PP-OCRv5_mobile_rec",
                "runtime": "cpu",
                "roi": roi,
                "preprocessing": prepared,
                "ocr_raw": candidates,
                "parsed": parsed,
                "parse_reason": parse_reason,
                "ocr_latency_ms": ocr_latency_ms,
            },
        }


def raw_value_match(actual, expected, tolerance: float) -> bool:
    return isinstance(actual, (int, float)) and not isinstance(actual, bool) and abs(actual - expected) <= tolerance


def main() -> int:
    output_dir = POC_ROOT / "reports" / "private" / "digital-ocr-challenge"
    os.environ.setdefault("PADDLE_PDX_MODEL_SOURCE", "BOS")
    os.environ.setdefault("PADDLE_PDX_CACHE_HOME", str(output_dir / "paddlex-cache"))
    golden = load_json(GOLDEN_PATH)
    manifest = load_json(MANIFEST_PATH)
    items = [item for item in golden["items"] if item["id"] in SAMPLE_IDS]
    manifest_by_name = {item["filename"]: item for item in manifest["items"]}
    manifest_by_sample = {item["id"]: manifest_by_name[Path(item["image_path"]).name] for item in items}
    routes = {item["id"]: route_sample(item, manifest_by_sample[item["id"]]) for item in items}
    model = PaddleOCR(
        text_detection_model_name="PP-OCRv5_mobile_det",
        text_recognition_model_name="PP-OCRv5_mobile_rec",
        use_doc_orientation_classify=False,
        use_doc_unwarping=False,
        use_textline_orientation=False,
        device="cpu",
    )
    adapter = PaddleDirectAdapter(model, routes, output_dir)
    rules, schema = load_json(RULES_PATH), load_json(SCHEMA_PATH)
    rule_index = {rule["id"]: rule for rule in rules["rules"]}
    details = []
    for item in items:
        image_path = (GOLDEN_PATH.parent / item["image_path"]).resolve()
        context = {
            "case_id": item["id"], "equipment_id": item["equipment_id"], "equipment_type": item["equipment_type"],
            "inspection_rule_id": item["inspection_rule_id"], "rule": rule_index.get(item["inspection_rule_id"]),
            "metadata_rule_mismatch": item.get("metadata_rule_mismatch", False), "mismatch_action": item.get("mismatch_action"),
        }
        started = time.perf_counter()
        try:
            visual = adapter.inspect(image_path, context)
            output = normalize_observation(visual, context)
            error = None
        except Exception as exc:
            visual, output, error = None, None, f"{type(exc).__name__}: {exc}"
        latency_ms = round((time.perf_counter() - started) * 1000, 6)
        schema_errors = validate_schema(output, schema) if output else [error]
        expected = {**item["expected"], "uncertainty": item["raw_visual_observation"]["uncertainty"]}
        assertions = {field: output is not None and output.get(field) == expected[field] for field in ("reading_or_state", "anomaly", "review_required", "uncertainty")}
        manifest_item = manifest_by_sample[item["id"]]
        parsed = visual["model_raw"]["parsed"] if visual else None
        raw_expected = item["raw_visual_observation"]["reading_or_state"]
        tolerance = (manifest_item.get("tolerance") or {}).get("absolute", 0)
        details.append({
            "sample_id": item["id"], "source_image": str(image_path.relative_to(POC_ROOT)), "route": routes[item["id"]],
            "visual_observation": visual, "normalized_output": output, "expected": expected,
            "ocr_raw_text": visual["model_raw"]["ocr_raw"] if visual else None, "parsed_reading": parsed,
            "exact_or_acceptable_value_match": raw_value_match(parsed["value"], raw_expected, tolerance) if parsed else False,
            "decimal_preserved": bool(parsed and "." in parsed["token"] and raw_value_match(parsed["value"], raw_expected, tolerance)),
            "assertions": assertions, "schema_errors": schema_errors, "adapter_error": error, "latency_ms": latency_ms,
        })
    metrics = {
        "direct_reading": {"passed": sum(d["exact_or_acceptable_value_match"] for d in details), "total": len(details)},
        "decimal_preservation": {"passed": sum(d["decimal_preserved"] for d in details), "total": len(details)},
        "unsafe_guess": {"count": 0, "definition": "no sample has a null raw expected reading"},
        "schema": {"passed": sum(not d["schema_errors"] for d in details), "total": len(details)},
        "latency_ms": {"p50": percentile([d["latency_ms"] for d in details], 0.5), "p95": percentile([d["latency_ms"] for d in details], 0.95)},
        "failed_ids": [d["sample_id"] for d in details if not d["exact_or_acceptable_value_match"]],
    }
    output_dir.mkdir(parents=True, exist_ok=True)
    (output_dir / "evaluation-details.json").write_text(json.dumps({"pipeline": "ROI -> uniform preprocessing -> PP-OCRv5 mobile direct -> existing Rule Engine", "samples": details}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (output_dir / "evaluation-summary.json").write_text(json.dumps({"runtime": "macOS arm64 CPU", "model": "PP-OCRv5_mobile_det+PP-OCRv5_mobile_rec", "metrics": metrics, "gate": "not_evaluated"}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"metrics": metrics}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
