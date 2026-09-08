"""Compose ROI routing with a semantic VLM without changing business rules."""
from pathlib import Path

from adapters.base import VisionAdapter
from roi_pipeline import specialist_reader_status, write_roi


class HybridRoiAdapter(VisionAdapter):
    name = "hybrid-roi-gemini-adapter"
    version = "spike-v1"

    def __init__(self, vlm: VisionAdapter, routes: dict[str, dict], roi_dir: Path):
        self.vlm = vlm
        self.routes = routes
        self.roi_dir = roi_dir

    def inspect(self, image_path: Path, context: dict) -> dict:
        route = self.routes[context["case_id"]]
        roi = write_roi(image_path, route, self.roi_dir / f"{context['case_id']}.png")
        reader = specialist_reader_status(route)
        vlm_input = Path(roi["path"]) if roi["status"] == "generated" else image_path
        result = self.vlm.inspect(vlm_input, context)
        result["model_raw"] = {
            "pipeline": "roi_hybrid_spike_v1",
            "roi": {**roi, "input": str(vlm_input)},
            "specialist_reader": reader,
            "vlm": result["model_raw"],
        }
        return result
