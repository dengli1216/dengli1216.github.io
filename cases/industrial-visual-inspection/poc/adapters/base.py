"""Common adapter contract for replaceable vision providers."""
from abc import ABC, abstractmethod
from pathlib import Path


class VisionAdapterError(RuntimeError):
    code = "adapter_error"


class VisionAdapter(ABC):
    name: str
    version: str

    @abstractmethod
    def inspect(self, image_path: Path, context: dict) -> dict:
        """Return a visual observation, without applying inspection business rules."""
