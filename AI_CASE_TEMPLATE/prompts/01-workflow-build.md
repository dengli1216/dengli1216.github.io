# 01 — Workflow Build

## 任务

基于决策合同设计可审阅的 POC 工作流与结构化输出。

## 事实源

- `docs/CASE_BRIEF.md`
- `docs/DECISION_CONTRACT.md`
- `poc/dify/workflow.placeholder.yml`

## 范围

- 实现输入校验、LLM 归纳、确定性规则 Gate、人工复核路由和结构化输出。
- 为节点、版本、输入限制和降级路径留下可追溯说明。

## 禁止项

- 不绑定真实密钥、生产 URL 或未授权外部服务。
- 不让 LLM 获得不可逆或高风险的最终授权。

## 验收

- 输出满足 `DECISION_CONTRACT.md`；缺证、冲突与错误均安全降级。
- 业务规则仅来自本案例已确认事实。

## 完成汇报

汇报工作流版本、节点职责、规则/Gate、未实现项与 Workflow Gate 结论。
