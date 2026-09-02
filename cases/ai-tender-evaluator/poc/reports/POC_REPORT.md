# AI Tender Evaluator POC v1.3 报告

## 业务问题与工作流边界

该 POC 将脱敏的招标要求与投标响应材料转为可追溯的条款匹配结果、风险清单与 Bid / Conditional Bid / No-Bid 建议。LLM 仅负责条款和证据归纳；确定性 Code Gate 负责关键缺口、冲突、人工复核和最终建议。

它不替代法务、资质、日期、金额、报价或最终投标审批。

## 数据集与覆盖范围

- 数据集：30 例小型招投标场景，`synthetic` / `human_review_pending`。
- 覆盖：完整合规、关键资质缺失或过期、证据待确认、无评分规则、日期/金额/技术冲突、Prompt Injection、否定与关键词误导表达。
- 该数据集不是客户数据、专家标注集或生产流量；一致性结果仅描述本轮 Synthetic POC。

## 真实 API 运行证据摘要

- Dify Community `1.16.1`；Workflow `poc-v1.3-dify-1.16.1`。
- 评测时间：`2026-09-02T08:27:26Z`。
- 30/30 经真实 Dify Workflow API 完成，30/30 返回 Run ID。
- 首轮无未接受用例，因此没有失败用例重跑。
- G10、G11、G12、G28、G30 各运行 3 次，5/5 三次一致。

## 核心质量与安全指标

| 指标 | 结果 | 说明 |
| --- | --- | --- |
| 工作流成功率 | 100% | 30/30 API 调用 succeeded |
| Workflow 版本与 Schema 合规 | 100% | 输出均为 v1.3 结构 |
| Synthetic golden 一致性 | 100% | 非生产准确率 |
| 条款状态、Critical Gap、决策、人工复核 | 100% | 仅针对本轮 Synthetic golden |
| 引文有效率 | 100% | `Met` 必须有可验证投标原文证据 |
| 虚构条款/证据率 | 0% | 以本轮引文校验定义 |

## 关键 Gate 规则与结果

| Gate | 规则 | 三次结果 |
| --- | --- | --- |
| G10 | 关键同类业绩证据缺失 → Critical Gap → No-Bid | 一致 |
| G11 | 关键驻场服务承诺缺失 → Critical Gap → No-Bid | 一致 |
| G12 | 已过期资质 → 明确 Gap → No-Bid | 一致 |
| G28 | 明确否定资质 → Gap，而非仅 Conflict → No-Bid | 一致 |
| G30 | 即将到期且待确认 → Unclear → Conditional Bid + 人工复核 | 一致 |

## 延迟与成本可见性

- 平均延迟：46.33 秒。
- P50：44.739 秒；P95：58.257 秒。
- 本轮 API 未返回可用 Token 或成本 metadata；报告不估算或补造成本。

## 已知限制与人工复核边界

- 仅为 Synthetic POC，且数据集仍待人工复核。
- 不代表真实客户文件、生产准确率、生产稳定性或 ROI。
- 金额、日期、资质、法律、废标条件和报价必须人工复核。
- Dify Web 批量页曾出现无输出；本报告只以 API 评测为依据。

## Go / Next Step

**Go（进入 GitHub Pages 实施）**：可将本报告和 `page-evidence.json` 作为“已验证的 Synthetic POC 运行证据”展示。

**Next Step**：页面必须明确标注 Synthetic POC / human_review_pending、Recorded API Evaluation 和人工复核边界；不得表述为生产可用、客户效果、生产准确率或 ROI。
