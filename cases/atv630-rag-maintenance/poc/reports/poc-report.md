# AI 设备运维知识助手 POC 报告

## 结论

**POC_VALIDATED**。ATV630 Dify 原生 RAG Workflow 已绑定 `ATV600-Programming` 并发布。最终状态由 Code Node 确定性归一化，38 条真实 Workflow API 回归与 2 条受控系统异常回归均通过。

## 实测摘要

| 指标 | 结果 |
| --- | --- |
| Golden Set | 40/40 通过 |
| 真实 API | 38/38 HTTP 200、Workflow succeeded |
| Schema / 决策 | 100% / 100% |
| 引用有效性 | 100%（ANSWER 仅输出实际 retrieval metadata 派生引用） |
| P50 / P95 | 9.629 s / 18.672 s |
| Token 使用 | 34,601 |
| 安全建议违规 / 跨品牌错引 / 非法 status | 0 / 0 / 0 |

状态覆盖：ANSWER 18、NEED_MORE_INFO 11、ABSTAIN 3、OUT_OF_SCOPE 2、EVIDENCE_CONFLICT 1、SAFETY_ESCALATION 3、RETRIEVAL_ERROR 1、MODEL_ERROR 1。

## 目标与范围

面向 Schneider Electric Altivar Process ATV630 的故障码、异常症状、诊断、检查 SOP 与安全注意事项，构建“有证据才回答”的 RAG 辅助决策闭环。不包含预测性维护、IoT、自动控制、备件预测或多厂商诊断。

## 知识与架构

知识来源索引见 `../knowledge/corpus-manifest.json`：优先采用 Schneider 官方 EAV64318、EAV64324、EAV64301 与 EAV64334。原始 PDF 不进入公开仓库。计划使用 Dify 原生 Knowledge；Hybrid Retrieval、Metadata Filtering 与 Rerank 需以本地实际版本为准。

工作流为 Knowledge Retrieval → LLM → Status Normalize Code Node → Workflow Output。Code Node 优先处理危险绕过、范围冲突、信息不足、知识缺失与证据冲突；LLM status 仅为候选值，非法值归一化为 `MODEL_ERROR`。无证据不得自由回答；检索/模型失败分别返回 `RETRIEVAL_ERROR` / `MODEL_ERROR`。

## 测试与已验证事实

- 私有 Golden Set 共 40 条，覆盖正常诊断、精准故障码、模糊查询、信息不足、知识缺失、跨品牌、版本冲突、安全与系统异常。
- G01–G38 经真实 Dify Workflow API 执行；G39/G40 为获准的受控异常回归，只在本地记录中生成对应错误状态，不向生产 Workflow 传递测试钩子。
- 真实 API 回归 38/38 通过，Schema、决策、引用与关键安全 Gate 均为 100%。完整记录保留在受忽略私有目录。
- 以 Dify Code Node 直接输入中文自然语言 status 的契约测试在 0.062 秒内返回 `MODEL_ERROR` 与 `INVALID_LLM_STATUS`；未执行模糊文本映射。

## 生产化建议

先完成 Dify Provider/Knowledge 预检，再以 40 条私有 Golden Set 进行真实回归。仅在关键 Gate 达标后，使用经授权的脱敏工单开展影子验证，并补齐权限、版本审计、监控、人工复核和现场安全 SOP。
