# Case Brief — AI Solution Copilot

## 定位

这是一个可验证、可展示的 Dify Workflow POC，不是生产系统。Workflow “AI Solution Copilot 02｜分析与报告”接收 Intake JSON，依次生成 Discovery、机会评估、解决方案、POC、Assurance 与报告候选，并在最终输出前保留人工复核。

## 业务问题与决策

- 目标用户：**待确认（blocker）**。YAML 只显示人工复核角色为“顾问”，不能可靠推出最终使用者、组织角色或使用频率。
- 业务问题：将符合约束的 Intake Artifact 转换为逐阶段、带证据注册表和前序链路的分析与报告候选。
- 核心决策：只有 Intake 不阻断、阶段 Gate 均通过且 Assurance 为 `PASS` 时，才生成报告并交人工批准或退回；Workflow 不自动对客发布。

## POC 范围与非目标

- 范围：案例快照的原样导入/已发布应用的真实接口验证；输入 `intake_artifact_json` 与 `report_language`；验证阻断、主链、Assurance、报告和人工复核分支。
- 非目标：不改造 App 01，不建设生产接口，不声明准确率、ROI、客户效果、生产可用性或自动批准。

## 事实、假设与待确认

| 类型 | 内容 | 状态 |
| --- | --- | --- |
| 事实 | Workflow 曾在本地 Dify 导入并运行成功。 | 用户提供 |
| 事实 | 当前快照与原始 YAML SHA-256 一致；静态图含 22 节点、22 连线和两项必填输入。 | 已复核 |
| 事实 | 已发布应用 API 的 `/parameters`、`/info` 可访问，且两项输入与快照一致。 | 阶段 2 Preflight |
| 假设 | 提供的脱敏合成 Intake 足以覆盖阻断和主链最小行为。 | 待阶段 2 验证 |
| 待确认 | 目标用户、业务价值衡量、真实使用流程和生产数据边界。 | blocker |
| 待确认 | 完整主链所需模型/插件配置、可复现的合规 Intake 样本及人工复核参与者。 | blocker |
