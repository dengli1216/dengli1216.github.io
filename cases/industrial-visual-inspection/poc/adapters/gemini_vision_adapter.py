"""Gemini OpenAI-compatible vision adapter; no provider SDK dependency."""
import base64
import json
import mimetypes
import socket
import urllib.error
import urllib.request
from pathlib import Path

from adapters.base import VisionAdapter, VisionAdapterError
from adapters.qwen_vision_adapter import QwenVisionAdapter


class GeminiVisionAdapter(VisionAdapter):
    name = "gemini-vision-adapter"
    version = "v1"

    def __init__(self, api_key: str, model: str, endpoint: str, prompt_path: Path, timeout_seconds: int = 60):
        if not api_key:
            raise VisionAdapterError("GEMINI_API_KEY is required for the gemini adapter")
        if not model or not endpoint:
            raise VisionAdapterError("VISION_MODEL and GEMINI_ENDPOINT are required for the gemini adapter")
        self.api_key = api_key
        self.model = model
        self.endpoint = endpoint.rstrip("/")
        self.prompt = prompt_path.read_text(encoding="utf-8")
        self.timeout_seconds = timeout_seconds

    def inspect(self, image_path: Path, context: dict) -> dict:
        body = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": self.prompt},
                {"role": "user", "content": [
                    {"type": "text", "text": json.dumps({
                        "equipment_id": context.get("equipment_id"),
                        "equipment_type": context.get("equipment_type"),
                        "inspection_rule_id": context.get("inspection_rule_id"),
                        "inspection_rule_context": QwenVisionAdapter._rule_context(context.get("rule")),
                        "metadata_rule_mismatch": context.get("metadata_rule_mismatch", False),
                    }, ensure_ascii=False)},
                    {"type": "image_url", "image_url": {"url": self._as_data_url(image_path)}},
                ]},
            ],
        }
        response = self._request(body)
        observation = QwenVisionAdapter._parse_observation(QwenVisionAdapter._content(response))
        return {
            **observation,
            "model_raw": {"provider": "gemini", "model": self.model, "response": response},
            "usage": response.get("usage", "not_available"),
        }

    @staticmethod
    def _as_data_url(image_path: Path) -> str:
        if not image_path.is_file():
            raise VisionAdapterError(f"input image not found: {image_path}")
        mime, _ = mimetypes.guess_type(image_path.name)
        if mime not in {"image/jpeg", "image/png", "image/webp"}:
            raise VisionAdapterError(f"unsupported image for gemini adapter: {image_path.suffix or 'unknown type'}")
        encoded = base64.b64encode(image_path.read_bytes()).decode("ascii")
        return f"data:{mime};base64,{encoded}"

    def _request(self, body: dict) -> dict:
        request = urllib.request.Request(
            self.endpoint,
            data=json.dumps(body).encode("utf-8"),
            headers={"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(request, timeout=self.timeout_seconds) as response:
                return json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as error:
            detail = error.read().decode("utf-8", "replace")[:500]
            raise VisionAdapterError(f"http_{error.code}: {detail}") from error
        except (urllib.error.URLError, socket.timeout, TimeoutError) as error:
            raise VisionAdapterError(f"timeout_or_network_error: {error}") from error
        except json.JSONDecodeError as error:
            raise VisionAdapterError(f"malformed_provider_response: {error}") from error
