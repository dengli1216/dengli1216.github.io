"""Digital ROI OCR with an explicit semantic-VLM fallback for unresolved text."""
import json
import re
import subprocess
import time
from pathlib import Path

from adapters.base import VisionAdapter, VisionAdapterError
from roi_pipeline import write_roi

DECIMAL_TOKEN = re.compile(r"(?<![\d.])(\d+\.\d+)(?![\d.])")


class DigitalOcrAdapter(VisionAdapter):
    name = "digital-roi-ocr-adapter"
    version = "spike-v1"

    def __init__(self, fallback_vlm: VisionAdapter, routes: dict[str, dict], roi_dir: Path, swift_script: Path):
        self.fallback_vlm = fallback_vlm
        self.routes = routes
        self.roi_dir = roi_dir
        self.swift_script = swift_script

    def inspect(self, image_path: Path, context: dict) -> dict:
        route = self.routes[context["case_id"]]
        roi = write_roi(image_path, route, self.roi_dir / f"{context['case_id']}.png")
        if roi["status"] != "generated":
            raise VisionAdapterError("digital OCR requires a generated ROI")
        started = time.perf_counter()
        raw = self._ocr(Path(roi["path"]))
        ocr_latency_ms = round((time.perf_counter() - started) * 1000, 6)
        parsed = self._parse_decimal(raw)
        if parsed is not None:
            result = {
                "reading_or_state": parsed["value"],
                "confidence": parsed["confidence"],
                "visual_status": "readable",
                "target_status": "mismatch" if context.get("metadata_rule_mismatch") else "identified",
                "visual_metric": None,
                "rule_compatible": False if context.get("metadata_rule_mismatch") else True,
                "uncertainty": "low",
                "human_review_required": bool(context.get("metadata_rule_mismatch")),
                "observations": ["numeric value directly parsed from OCR text"],
                "usage": "not_applicable",
                "model_raw": {"provider": "macos_vision_ocr", "source": "direct"},
            }
            fallback = "not_needed"
        else:
            result = self.fallback_vlm.inspect(Path(roi["path"]), context)
            fallback = "gemini_roi_only"
        result["model_raw"] = {
            "pipeline": "digital_roi_ocr_spike_v1",
            "roi": {**roi, "input": roi["path"]},
            "ocr": {"raw": raw, "parsed": parsed, "latency_ms": ocr_latency_ms},
            "fallback": fallback,
            "result_source": result["model_raw"],
        }
        return result

    def _ocr(self, roi_path: Path) -> list[dict]:
        completed = subprocess.run(
            ["swift", str(self.swift_script), str(roi_path)],
            check=False,
            capture_output=True,
            text=True,
            timeout=30,
        )
        if completed.returncode != 0:
            raise VisionAdapterError(f"macos_vision_ocr_failed: {completed.stderr.strip()[:300]}")
        try:
            result = json.loads(completed.stdout)
        except json.JSONDecodeError as error:
            raise VisionAdapterError(f"macos_vision_ocr_malformed: {error}") from error
        if not isinstance(result, list):
            raise VisionAdapterError("macos_vision_ocr_malformed: expected candidate list")
        return result

    @staticmethod
    def _parse_decimal(candidates: list[dict]) -> dict | None:
        matches = []
        for candidate in candidates:
            text = candidate.get("text")
            confidence = candidate.get("confidence")
            if not isinstance(text, str) or not isinstance(confidence, (int, float)):
                continue
            for token in DECIMAL_TOKEN.findall(text):
                matches.append({"value": float(token), "confidence": float(confidence), "token": token})
        return matches[0] if len(matches) == 1 else None
