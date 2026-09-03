# AI Solution Copilot — POC 证据报告

## 业务目标与 Workflow 机制

事实：该 POC 接收 `intake_artifact_json` 与 `report_language`，按 `INTAKE → DISCOVERY → OPPORTUNITY_ASSESSMENT → SOLUTION_DESIGN → POC_DESIGN → ASSURANCE → FINAL_REPORT` 逐阶段处理。LLM 生成候选 Artifact，规则/代码节点校验结构、阶段、Lineage、Gate 和 evidenceRefs，最终保留人工复核，不自动对客发布。

推断：该机制适合展示“证据约束下的方案分析草稿生成与安全降级”这一工程模式；不能据此推出业务价值或最终使用者。

待确认：目标用户、真实业务流程、价值衡量和生产数据边界仍是 blocker。

## 本轮验证范围

事实：12 条脱敏 Synthetic Golden Set 全量运行；其中 4 条关键分支各额外运行 2 次，共 20 次真实 Dify API 调用。用例覆盖 Intake 阻断、合法 wrapper、无效 schema、evidenceRefs 异常、外层格式异常、中文/英文正常主链及人审暂停。

事实：20/20 调用获得 Run ID；预期状态/契约合规 20/20；稳定分支断言 52/52；关键用例三次一致 4/4。

事实：延迟平均 45.928s，P50 0.071s，P95 441.837s；统计来源为 `eval-summary.json` 的 Dify 工作流耗时口径。

## 覆盖维度

| 维度 | 用例 | 业务意义 |
| --- | --- | --- |
| 正常主链与人审边界 | GS-10、GS-11 | 验证完整阶段 Gate 后暂停人工复核，不自动批准 |
| 信息缺失/安全阻断 | GS-01、GS-02、GS-03、GS-12 | 缺少关键输入时保留阻断问题，不继续生成报告 |
| 无效 Artifact / 标准化失败 | GS-04、GS-08、GS-09 | 输入不合规时安全失败，避免伪造下游结果 |
| evidenceRefs 边界 | GS-05、GS-06、GS-07 | 拒绝 null、Markdown 和未登记引用 |

## 延迟审计

事实：报告指标使用 Dify `workflow_runs.elapsed_time`；两条 paused 正常主链使用已完成节点耗时合计（分别 477.310s、439.970s），快速阻断/失败约 0.040–0.142s。因此 P50 0.071s 由多数本地标准化/快速安全失败样本形成，P95 441.837s 由两条包含多阶段 LLM 的长主链形成。

限制：paused 记录自身的 run elapsed 为 0，故使用节点耗时合计；该口径与 API 客户端往返耗时不同。`run_eval.py` 已改为线性插值百分位，并优先使用核验后的工作流耗时字段；本轮未重新调用 Dify。该分布不能解释为性能优势，整体性能结论仍待进一步诊断。

## 已验证 / 未验证

已验证：输入契约、分支路由、安全失败、evidenceRefs 接受/拒绝、阶段 Gate 链、人审暂停和 Run ID 可追溯性。

未验证：业务正确性、引用真实性、人工批准/退回完成、真实客户数据、目标用户价值、SLA、成本、ROI、客户效果和生产可用性。

生产试点前需补充：经审批的真实脱敏样本、人工复核记录、模型/插件版本锁定、端到端观测、延迟分层基线、成本采集、权限与数据保留审计，以及独立业务质量评审。

## 证据分类

- 事实：见 `eval-summary.json`、`EVAL_REPORT.md`、`smoke-summary.json` 及真实 Run ID。
- 推断：Workflow 机制可作为方案分析 POC 的展示模式；不等同于业务效果。
- 待确认：用户、价值、生产数据和试点质量标准。
