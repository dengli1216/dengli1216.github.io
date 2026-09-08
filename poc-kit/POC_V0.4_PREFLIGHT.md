# POC SOP v0.4 Preflight

## Reusable

- The 12 stable Golden Set IDs, rule version `v1`, output Schema, adapter interface, single Runner and evidence format are reusable.
- Runner supports `--adapter fixture|qwen`; visual recognition and rule normalization are separated.

## Missing / Blocked

- No approved real or real-source industrial static images are present for any of the 12 IDs. Existing images remain `synthetic_test_fixture` and are explicitly not approved for a real-model baseline.
- `DASHSCOPE_API_KEY`, `VISION_PROVIDER`, `VISION_MODEL` and `VISION_ENDPOINT` are not configured in this environment.

## Result

No Qwen request was sent and no real-model evidence was generated. The Qwen adapter, versioned prompt, environment configuration contract and private-path protection are ready for a future approved-image run.
