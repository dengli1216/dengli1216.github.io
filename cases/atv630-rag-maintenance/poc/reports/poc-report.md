# AI 设备运维知识助手 POC 报告

## 结论

**POC_PARTIALLY_VALIDATED**。已完成范围、知识 metadata、工作流设计、40 条私有 Golden Set 与离线合同校验；Dify Workflow App 已创建，App API 参数端点已通过认证。但官方知识语料尚未导入、Workflow 尚未完成或发布，故没有真实检索、引用、时延或安全 Gate 指标。

## 目标与范围

面向 Schneider Electric Altivar Process ATV630 的故障码、异常症状、诊断、检查 SOP 与安全注意事项，构建“有证据才回答”的 RAG 辅助决策闭环。不包含预测性维护、IoT、自动控制、备件预测或多厂商诊断。

## 知识与架构

知识来源索引见 `../knowledge/corpus-manifest.json`：优先采用 Schneider 官方 EAV64318、EAV64324、EAV64301 与 EAV64334。原始 PDF 不进入公开仓库。计划使用 Dify 原生 Knowledge；Hybrid Retrieval、Metadata Filtering 与 Rerank 需以本地实际版本为准。

工作流为 Query Parser → Completeness Gate → Scope Gate → Knowledge Retrieval → Evidence Validation → Safety Gate → Answer Generation → Citation Validation → Structured Output。无证据不得自由回答；检索/模型失败分别返回 `RETRIEVAL_ERROR` / `MODEL_ERROR`。

## 测试与已验证事实

- 私有 Golden Set 共 40 条，覆盖正常诊断、精准故障码、模糊查询、信息不足、知识缺失、跨品牌、版本冲突、安全与系统异常。
- `python3 poc/tests/run_eval.py --offline` 已通过：编号 G01–G40、分类计数与非空查询合同正确。
- Dify App 的 `/v1/parameters` 已认证通过，且返回 `query`、`manufacturer`、`model` 三个输入；尚未执行真实 Workflow Run。API 成功率、Schema、Hit@K、引用有效性、诊断正确性、拒答、安全升级、P50/P95 与 Token 均为未验证。

## 生产化建议

先完成 Dify Provider/Knowledge 预检，再以 40 条私有 Golden Set 进行真实回归。仅在关键 Gate 达标后，使用经授权的脱敏工单开展影子验证，并补齐权限、版本审计、监控、人工复核和现场安全 SOP。
