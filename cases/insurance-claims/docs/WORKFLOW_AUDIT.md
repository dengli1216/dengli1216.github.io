# Workflow Preflight Audit

## Scope

静态检查对象：poc/dify/insurance_claims_workflow.yml，SHA-256：acc921993e3e52e752d11b74157458096f69e6b03a8f3ebc3f980dc564660ec3。

## Findings

- 确定性节点负责 Schema 校验、评分、信号、LOW / MEDIUM / HIGH 路由、decision_id、规则版本与审计字段。
- LLM 提示要求只读复制风险字段；validate_analysis 对五个确定性字段及 human_review_required=true 做严格闸门检查。
- 输入无效直接进入 MANUAL_REVIEW，不调用 LLM。
- LLM 执行失败和输出校验失败均回退为确定性结果，并隐藏 provider 错误详情。

## Result

静态契约满足本地 POC 范围，未修改原工作流。已对发布后的本地 Dify API 完成 28 条 SIMULATED 回归及 6 条 Critical Case 三次稳定性验证；真实 Run ID 记录于 `poc/reports/dify-eval-summary.json`。
