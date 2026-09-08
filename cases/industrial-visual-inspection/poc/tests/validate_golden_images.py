#!/usr/bin/env python3
"""Validate the static inspection-image Golden Set without calling a vision model."""
import json
from collections import Counter
from pathlib import Path

from PIL import Image

POC_ROOT = Path(__file__).resolve().parents[1]
GOLDEN_PATH = POC_ROOT / "data" / "golden" / "inspection-images.json"
CONTACT_SHEET = POC_ROOT / "data" / "golden" / "contact-sheet.jpg"
REQUIRED = {"imageId", "filename", "difficulty", "category", "expectedMeasurement", "expectedValue", "unit", "challenge", "sourceType", "needs_manual_label"}
REQUIRED_CHALLENGES = {"glare", "low_light", "oblique_angle", "multi_target", "clutter", "partial_occlusion"}


def main() -> int:
    golden = json.loads(GOLDEN_PATH.read_text(encoding="utf-8"))
    root = (GOLDEN_PATH.parent / golden["image_root"]).resolve()
    items = golden["items"]
    errors = []
    for item in items:
        missing = REQUIRED - set(item)
        if missing:
            errors.append(f"{item.get('imageId', 'unknown')}: missing fields {sorted(missing)}")
            continue
        if item["difficulty"] not in {"easy", "medium", "hard"}:
            errors.append(f"{item['imageId']}: invalid difficulty")
        if item["sourceType"] != "synthetic_generated":
            errors.append(f"{item['imageId']}: unexpected sourceType")
        image_path = root / item["filename"]
        try:
            with Image.open(image_path) as image:
                image.verify()
        except Exception as error:
            errors.append(f"{item['imageId']}: image loading failed: {error}")
    ids = [item["imageId"] for item in items]
    if len(items) != 12 or len(set(ids)) != 12:
        errors.append("Golden Set must contain 12 unique image IDs")
    difficulties = Counter(item["difficulty"] for item in items)
    if difficulties != Counter({"easy": 4, "medium": 4, "hard": 4}):
        errors.append(f"unexpected difficulty distribution: {dict(difficulties)}")
    categories = {item["category"] for item in items}
    if not {"analog_gauge", "digital_meter", "control_panel_indicator"}.issubset(categories):
        errors.append("missing required category")
    challenges = {challenge for item in items for challenge in item["challenge"]}
    if not REQUIRED_CHALLENGES.issubset(challenges):
        errors.append(f"missing challenge coverage: {sorted(REQUIRED_CHALLENGES - challenges)}")
    try:
        with Image.open(CONTACT_SHEET) as image:
            image.verify()
    except Exception as error:
        errors.append(f"contact sheet failed: {error}")
    summary = {
        "TOTAL_IMAGES": len(items),
        "VALID_IMAGES": len(items) - sum("image loading failed" in error for error in errors),
        "INVALID_IMAGES": sum("image loading failed" in error for error in errors),
        "EASY_MEDIUM_HARD": {level: difficulties.get(level, 0) for level in ("easy", "medium", "hard")},
        "CATEGORY_COVERAGE": sorted(categories),
        "CHALLENGE_COVERAGE": sorted(challenges),
        "TEST_RESULT": "pass" if not errors else "fail",
        "errors": errors,
    }
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0 if not errors else 1


if __name__ == "__main__":
    raise SystemExit(main())
