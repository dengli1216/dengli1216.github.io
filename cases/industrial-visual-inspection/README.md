# Industrial Visual Inspection

最小工业视觉巡检 POC 标准样本。目标是在不接入设备控制系统的前提下，验证静态设备或仪表图片到人工复核建议、处置建议的闭环定义。

v0.3 已提供 12 个 `synthetic_test_fixture` 静态图片、版本化规则、可替换 fixture adapter 与离线评测 evidence。它验证的是 pipeline/schema/critical-case gate，不是视觉模型准确率。

运行：

```bash
cd cases/industrial-visual-inspection
python3 poc/tests/run_eval.py
```

规则文件是 JSON-compatible YAML，因此由 Python 标准库读取，不依赖 PyYAML。替换 `poc/adapters/fixture_offline_adapter.py` 即可接入真实视觉模型；真实模型输出仍须符合 `poc/schemas/inspection-output.schema.json`。

v0.4 增加 Qwen VL adapter 与版本化 Prompt，但当前仓库没有获批真实图片，当前环境也没有 Qwen 配置，因此未发送真实请求。完成审批后，保持同一 ID 与 expected label，仅将 manifest 的 `image_path`、`data_source` 和 `approval_status` 更新为获批来源；私有图片放在已忽略的 `poc/fixtures/approved/`。

```bash
export VISION_PROVIDER=qwen
export VISION_MODEL='<approved-qwen-vl-model-id>'
export VISION_ENDPOINT='<approved-dashscope-compatible-endpoint>'
export DASHSCOPE_API_KEY='<key-not-stored-in-repository>'
python3 poc/tests/run_eval.py --adapter qwen --output-dir poc/reports/private/qwen-run
```

`poc/reports/private/` 被忽略，避免提交未审查原始模型响应或私有运行 evidence。
