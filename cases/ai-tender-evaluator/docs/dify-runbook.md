# Dify 运行手册

## 当前已验证事实（2026-09-02）

- 本机 Dify Community `1.16.1` 运行正常；模型为 OpenAI-compatible `qwen3.7-plus`。
- v1.3 DSL：`poc/dify/ai-tender-evaluator-v1.yml` 已实际导入、发布，应用地址：`http://localhost/app/6f9b98f7-ebd3-4afb-9a97-c67fe64b6a3b/workflow`。
- Workflow 以两次 LLM 生成结构化条款/证据，由 Code Gate 确定性处理关键条款、显式缺失、过期、待确认和最终 Bid Gate。
- 30 例黄金集已经通过发布 Web App 批量实际提交；21 条得到结构化输出、9 条无输出。v1.3 关键 Gate 用例 5/5 已通过。

## 当前唯一建议的运行方式

1. 在 Dify 当前应用的 **访问 API** 创建测试专用 API Key。
2. 仅在当前终端设置，不写入文件或仓库：

```bash
export DIFY_APP_API_KEY='本机测试专用密钥'
python3 cases/ai-tender-evaluator/poc/tests/run_eval.py --full
```

3. 仅当脚本真实完成后，更新 `poc/reports/`；保留经过脱敏的 Run ID、耗时、Token/成本和失败详情。

## 已知限制

- Web 批量页的“无输出内容”问题尚未定位；完整 v1.3 30 例指标未完成。
- `run_eval.py` 需要 API Key，且下一轮应核对脚本报告中的 workflow 版本标签是否与 v1.3 一致。
- 金额、日期、资质、法律、废标条件与报价必须进入人工复核；该 POC 不产生最终投标授权。
