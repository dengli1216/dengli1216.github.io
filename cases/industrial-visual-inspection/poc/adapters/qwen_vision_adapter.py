"""DashScope OpenAI-compatible Qwen VL adapter; no provider SDK dependency."""
import base64
import json
import mimetypes
import socket
import urllib.error
import urllib.request
from pathlib import Path

from adapters.base import VisionAdapter, VisionAdapterError


class QwenVisionAdapter(VisionAdapter):
    name = "qwen-vision-adapter"
    version = "v1"

    def __init__(self, api_key: str, model: str, endpoint: str, prompt_path: Path, timeout_seconds: int = 60):
        if not api_key:
            raise VisionAdapterError("DASHSCOPE_API_KEY is required for the qwen adapter")
        if not model or not endpoint:
            raise VisionAdapterError("VISION_MODEL and VISION_ENDPOINT are required for the qwen adapter")
        self.api_key = api_key
        self.model = model
        self.endpoint = endpoint.rstrip("/")
        self.prompt = prompt_path.read_text(encoding="utf-8")
        self.prompt_version = prompt_path.stem
        self.timeout_seconds = timeout_seconds

    def inspect(self, image_path: Path, context: dict) -> dict:
        image_data_url = self._as_data_url(image_path)
        context_text = json.dumps({
            "equipment_id": context.get("equipment_id"),
            "equipment_type": context.get("equipment_type"),
            "inspection_rule_id": context.get("inspection_rule_id"),
            "inspection_rule_context": self._rule_context(context.get("rule")),
            "metadata_rule_mismatch": context.get("metadata_rule_mismatch", False),
        }, ensure_ascii=False)
        body = {
            "model": self.model,
            "temperature": 0,
            "messages": [
                {"role": "system", "content": self.prompt},
                {"role": "user", "content": [
                    {"type": "text", "text": context_text},
                    {"type": "image_url", "image_url": {"url": image_data_url}},
                ]},
            ],
        }
        response = self._request(body)
        content = self._content(response)
        observation = self._parse_observation(content)
        return {
            **observation,
            "model_raw": {"provider": "qwen", "model": self.model, "response": response},
            "usage": response.get("usage", "not_available"),
        }

    def _as_data_url(self, image_path: Path) -> str:
        if not image_path.is_file():
            raise VisionAdapterError(f"input image not found: {image_path}")
        mime, _ = mimetypes.guess_type(image_path.name)
        if mime not in {"image/jpeg", "image/png", "image/webp"}:
            raise VisionAdapterError(f"unsupported image for qwen adapter: {image_path.suffix or 'unknown type'}")
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

    @staticmethod
    def _content(response: dict) -> str:
        try:
            content = response["choices"][0]["message"]["content"]
        except (KeyError, IndexError, TypeError) as error:
            raise VisionAdapterError("malformed_provider_response: missing choices[0].message.content") from error
        if not isinstance(content, str):
            raise VisionAdapterError("malformed_provider_response: content is not a string")
        return content

    @staticmethod
    def _parse_observation(content: str) -> dict:
        value = content.strip()
        if value.startswith("```"):
            value = value.split("\n", 1)[1].rsplit("```", 1)[0].strip()
        try:
            result = json.loads(value)
        except json.JSONDecodeError as error:
            raise VisionAdapterError(f"parse_failure: {error}") from error
        required = {"reading_or_state", "confidence", "visual_status", "target_status", "visual_metric", "rule_compatible", "uncertainty", "human_review_required", "observations"}
        if not isinstance(result, dict) or not required.issubset(result):
            raise VisionAdapterError("malformed_response: required visual observation fields are missing")
        if result["visual_status"] not in {"readable", "ambiguous", "unreadable"}:
            raise VisionAdapterError("malformed_response: invalid visual_status")
        if result["target_status"] not in {"identified", "ambiguous", "invalid", "mismatch"}:
            raise VisionAdapterError("malformed_response: invalid target_status")
        if result["uncertainty"] not in {"low", "medium", "high"}:
            raise VisionAdapterError("malformed_response: invalid uncertainty")
        if result["confidence"] is not None and (type(result["confidence"]) not in (int, float) or not 0 <= result["confidence"] <= 1):
            raise VisionAdapterError("malformed_response: invalid confidence")
        if result["reading_or_state"] is not None and not isinstance(result["reading_or_state"], (str, int, float)):
            raise VisionAdapterError("malformed_response: invalid reading_or_state")
        if result["visual_metric"] is not None and not isinstance(result["visual_metric"], str):
            raise VisionAdapterError("malformed_response: invalid visual_metric")
        if result["rule_compatible"] is not None and type(result["rule_compatible"]) is not bool:
            raise VisionAdapterError("malformed_response: invalid rule_compatible")
        if type(result["human_review_required"]) is not bool:
            raise VisionAdapterError("malformed_response: invalid human_review_required")
        if not isinstance(result["observations"], list):
            raise VisionAdapterError("malformed_response: observations must be an array")
        return {key: result[key] for key in required}

    @staticmethod
    def _rule_context(rule: dict | None) -> dict | None:
        if not rule:
            return None
        return {key: rule[key] for key in ("id", "equipment_type", "metric", "unit")}
