"""Synthetic offline adapter used only to validate the POC pipeline contract."""
import json
from pathlib import Path
from adapters.base import VisionAdapter


class FixtureOfflineAdapter(VisionAdapter):
    name = "fixture-offline-adapter"
    version = "v1"

    def __init__(self, observations_path: Path):
        payload = json.loads(observations_path.read_text(encoding="utf-8"))
        self.observations = payload["observations"]

    def inspect(self, image_path: Path, context: dict) -> dict:
        """Return a visual observation; rules are evaluated outside the adapter."""
        case_id = context["case_id"]
        if not image_path.is_file():
            raise FileNotFoundError(f"input image not found: {image_path}")

        observation = self.observations[case_id]
        visual_status = "readable"
        if observation["kind"] == "unreadable":
            visual_status = "unreadable"
        elif observation["kind"] in {"ambiguous", "at_threshold"}:
            visual_status = "ambiguous"
        target_status = "mismatch" if context.get("metadata_rule_mismatch") else "identified"
        uncertainty = context.get("fixture_expected_uncertainty") or ("high" if target_status == "mismatch" or visual_status != "readable" else "low")
        return {
            "reading_or_state": observation.get("value"),
            "confidence": None,
            "visual_status": visual_status,
            "target_status": target_status,
            "visual_metric": None,
            "rule_compatible": False if target_status == "mismatch" else None,
            "uncertainty": uncertainty,
            "human_review_required": bool(not context.get("equipment_id") or not context.get("inspection_rule_id") or target_status != "identified" or visual_status != "readable" or observation.get("value") is None),
            "observations": [observation.get("reason", "fixture observation")],
            "observation_kind": observation["kind"],
            "uncertainty_action": observation.get("recommended_action"),
            "model_raw": {
                "adapter": self.name,
                "adapter_version": self.version,
                "fixture_case_id": case_id,
                "fixture_image": image_path.name,
                "fixture_observation": observation,
            },
            "usage": "not_available",
        }
