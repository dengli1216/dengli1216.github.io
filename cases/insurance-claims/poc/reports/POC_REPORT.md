# AI 保险理赔智能助手｜POC Report

## VERIFIED

- 已发布 Dify workflow API：28 条 SIMULATED 黄金集运行，真实 Run ID 覆盖 28/28。
- 工作流成功率 100%；路由一致性 100%；6 条 Critical Cases 三次一致性 100%。
- API P50 25212.336 ms，P95 35484.897 ms；无 token/cost 数据时不估算成本。

## NOT PROVEN

- 真实欺诈识别准确率、真实保险数据效果、自动赔付、生产 SLA、真实 ROI。
- 主动注入 LLM 故障的线上分支覆盖；其合同已在本地确定性节点测试。

## Production Next Step

- 在获批只读 Sandbox 连接真实 Adapter，并以带 Ground Truth 的代表性数据进行受控验证。
