"""Minimal, evidence-first routing and ROI generation for the inspection POC."""
from pathlib import Path

from PIL import Image


# Normalized ratios apply uniformly to an instrument category, never to a sample value.
ROI_STRATEGIES = {
    "analog_gauge": {"reader_type": "analog_gauge_feasibility", "roi": (0.20, 0.08, 0.60, 0.68)},
    "digital_display": {"reader_type": "digital_ocr_feasibility", "roi": (0.22, 0.13, 0.56, 0.70)},
    "control_panel/state": {"reader_type": "state_vlm", "roi": (0.08, 0.05, 0.84, 0.85)},
    "ambiguous/unsupported": {"reader_type": "abstain", "roi": None},
}


def route_sample(sample: dict, manifest_item: dict) -> dict:
    category = manifest_item["category"]
    challenges = set(manifest_item.get("challenge", []))
    if "multi_target" in challenges:
        instrument_type = "ambiguous/unsupported"
        target = "multiple competing gauges; unique target unavailable"
        roi_requirement = "no crop; preserve ambiguity for human review"
    elif category == "analog_gauge":
        instrument_type = "analog_gauge"
        target = manifest_item.get("expectedMeasurement", "gauge dial")
        roi_requirement = "centered dial crop using analog gauge strategy"
    elif category == "digital_meter":
        instrument_type = "digital_display"
        target = manifest_item.get("expectedMeasurement", "digital display")
        roi_requirement = "centered display crop using digital display strategy"
    elif category == "control_panel_indicator":
        instrument_type = "control_panel/state"
        target = manifest_item.get("expectedMeasurement", "panel state")
        roi_requirement = "panel crop retaining indicators and labels"
    else:
        instrument_type = "ambiguous/unsupported"
        target = "unsupported visual target"
        roi_requirement = "no crop; require human review"
    strategy = ROI_STRATEGIES[instrument_type]
    return {
        "sample_id": sample["id"],
        "instrument_type": instrument_type,
        "target": target,
        "reader_type": strategy["reader_type"],
        "roi_requirement": roi_requirement,
        "roi_strategy": strategy["roi"],
    }


def write_roi(image_path: Path, route: dict, output_path: Path) -> dict:
    if route["roi_strategy"] is None:
        return {"status": "skipped", "reason": "ambiguous_or_unsupported_target", "path": None}
    with Image.open(image_path) as image:
        width, height = image.size
        x_ratio, y_ratio, w_ratio, h_ratio = route["roi_strategy"]
        left, top = round(width * x_ratio), round(height * y_ratio)
        right, bottom = round(width * (x_ratio + w_ratio)), round(height * (y_ratio + h_ratio))
        output_path.parent.mkdir(parents=True, exist_ok=True)
        image.crop((left, top, right, bottom)).save(output_path)
    return {
        "status": "generated",
        "path": str(output_path),
        "bbox_px": {"left": left, "top": top, "right": right, "bottom": bottom},
    }


def specialist_reader_status(route: dict) -> dict:
    reader_type = route["reader_type"]
    if reader_type == "state_vlm":
        return {"status": "delegated_to_vlm", "reason": "state recognition remains a semantic VLM task"}
    if reader_type == "abstain":
        return {"status": "not_applicable", "reason": "unique target is unavailable"}
    return {
        "status": "not_available",
        "reason": "no OCR or analog gauge reader dependency is installed; no reading is fabricated",
    }
