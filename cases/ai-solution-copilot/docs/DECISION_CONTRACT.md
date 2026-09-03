# Decision Contract — AI Solution Copilot

## 输入

| 字段 | 约束 | 用途 |
| --- | --- | --- |
| `intake_artifact_json` | 必填 JSON 字符串。可为完整 Artifact，或以 `reusable_intake_artifact_json`、`intake_artifact_json`、`artifact_json` 包装。 | 进入 Intake 标准化与 Gate。 |
| `report_language` | 必填：`中文` 或 `English`。 | 报告语言。 |

## 输出与稳定断言

阶段 Artifact 以 `artifact`、`evidenceRegistry`、`stageOutput` 承载；阶段顺序为 `INTAKE → DISCOVERY → OPPORTUNITY_ASSESSMENT → SOLUTION_DESIGN → POC_DESIGN → ASSURANCE → FINAL_REPORT`。每条 `evidenceRefs` 必须为原生数组，或可解析为数组的合法 JSON 字符串；`null`、Markdown、损坏 JSON 和未登记 ID 均为失败。

| 分支 | 结构化输出 | 后续可断言字段 |
| --- | --- | --- |
| Intake 阻断 | `blocked_case_id`、`blocked_workflow_status`、`blocked_questions`、`blocked_intake_artifact_json` | `workflow_status`、阻断问题非空、无后续报告。 |
| Assurance 未通过 | `revision_case_id`、`revision_workflow_status`、`revision_findings`、`revision_assurance_artifact_json` | 非 `PASS` 状态、发现项、无最终报告。 |
| 人工批准 | `approved_case_id`、`approved_workflow_status`、`approved_report_markdown`、`approved_final_artifact_json`、`approved_assurance_artifact_json`、`approved_review_comment`、`approved_risk_level` | Assurance `PASS`、报告非空、审批字段存在。 |
| 人工退回/超时 | 对应 `rejected_*` 字段。 | 退回状态、意见/风险字段，不能视为对客批准。 |

## 职责与降级

- LLM：生成阶段候选 Artifact；不拥有最终授权，也不能绕过 Gate。
- 规则/代码：标准化输入、校验结构、阶段、Lineage、证据和各 Gate；失败即阻断或失败，不将自由文本视为合格。
- 人工：核验证据、假设、风险、方案与对客措辞；批准或退回须留痕。
- 输入无法标准化、阶段/证据/Gate 不合格：安全失败，保留错误证据后人工定位；Assurance 非 `PASS` 不生成最终报告。

不可断言的业务正确性、引用真实性、价值、成本、时延与客户效果须另设人工标准和真实证据。
