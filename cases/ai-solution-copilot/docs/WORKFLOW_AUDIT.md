# Workflow Audit — AI Solution Copilot 02｜分析与报告

## 审计依据

静态读取案例快照 `poc/dify/ai-solution-copilot-02-analysis-report.dify.yml`；当前 SHA-256 `b6450ef7f8f315d47a1fe5b9091db2401d533fc08ea84dbc8159775c142d979b`。该副本最初来自 SHA-256 `91668f50d5dea66c07d6f7b70d7e6ce4eda86fe3f1d54cd1840a3270519ae8d1` 的指定原始来源，阶段 2 仅同步了已发布应用的 Stage 3–7 证据引用提示词补丁。另以 Dify `/parameters`、`/info` 和 Console 可见图作对应性证据；公共 API 不提供完整图版本。

## 应用、输入与终端输出

- `kind: app`，`app.mode: workflow`，版本 `0.7.0`。
- 必填输入：`intake_artifact_json`（paragraph）和 `report_language`（`中文|English`）。Normalizer 接受顶层 `reusable_intake_artifact_json`、`intake_artifact_json` 或 `artifact_json` 包装。
- 终端：Intake 阻断为 `blocked_*`；Assurance 未通过为 `revision_*`；人工批准为 `approved_*`（报告、最终 Artifact、Assurance、意见、风险级别）；人工退回/超时为 `rejected_*`。

## 节点与主链

```text
start → normalize_intake_candidate → gate_intake → intake_branch
  BLOCKED → intake_blocked_end
  其他 → discovery_llm → gate_discovery → opportunity_llm → gate_opportunity
       → solution_llm → gate_solution → poc_llm → gate_poc
       → assurance_llm → gate_assurance → assurance_branch
         非 PASS → assurance_blocked_end
         PASS → report_llm → gate_report → human_review
           approve → approved_end；reject/timeout → rejected_end
```

共 22 节点、22 连线：开始 1、代码 8（Normalizer 与 7 个 Gate）、LLM 6、条件分支 2、人工输入 1、结束 4。无 HTTP 节点、知识库节点或 API_ID 路径。

## 依赖与复现风险

| 类别 | 静态发现 | 风险 |
| --- | --- | --- |
| LLM/插件 | 6 个 LLM 使用 `langgenius/openai_api_compatible` 与 `qwen3.7-plus`，`temperature: 0`。 | 插件、模型连接、凭据、配额或模型行为可阻断或改变结果。 |
| 代码 | JSON 标准化、Schema/阶段/Lineage/证据与各阶段 Gate。 | Code 运行时或 YAML 兼容性会影响复现。 |
| 人工 | 最终人工审批、退回或超时。 | 完整成功路径需要可操作的复核者。 |
| 输入数据 | 合规 Intake Artifact、引用和证据注册表。 | 缺失或不合规会在 Normalizer/Gate 阻断。 |

## 自动断言边界

可断言：接口字段、终端分支、状态枚举、必填结构、阶段/Lineage/证据约束、Assurance 放行和人工动作的终端字段。不可仅自动断言：语义质量、事实真实性、业务价值、模型稳定性、成本或客户效果。

## 阶段 2 输入与断言

用 JSON 字符串填写 `intake_artifact_json`，选择 `report_language`。先断言阻断分支和错误安全性；完整链仅断言稳定结构及 `ASSURANCE=PASS`/报告待人工复核，不断言 LLM 自由文本逐字一致。
