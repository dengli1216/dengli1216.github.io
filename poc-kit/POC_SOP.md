# POC SOP v0.2

## 原则

- Core SOP 只定义跨案例稳定规则，不包含行业专属判断。
- 所有结论必须绑定证据路径或标记为假设/待验证。
- POC 只证明最小闭环可行性，不替代生产级工程、合规审计或业务最终决策。
- 不得修改现有业务代码、测试逻辑或工作流来适配 SOP。

## 类型门禁

执行前必须读取案例根目录 `CASE_META.yaml`：

- `case.type: poc`：允许加载本 SOP。
- `case.type: agent|rag|fullstack|demo`：不得自动加载本 SOP。
- 缺失 `CASE_META.yaml` 或 `case.type`：视为未分类案例，停止 POC SOP 执行。

## S0 Case Definition

定义案例身份、目标用户、业务问题、输入输出、边界与 Profile。

最小产物：

- `CASE_META.yaml`
- `poc/case-spec.yaml`
- Profile 选择记录

## S1 Business Gate

确认 POC 是否有明确业务决策价值、可解释用户收益和停止条件。

通用检查：

- 是否有明确业务问题。
- 是否能判断 POC 成功/失败。
- 是否有不可自动化的人工责任边界。

## S2 Technical Preflight

确认现有资产能支撑最小闭环。

通用检查：

- 输入样例可定位。
- 输出格式可定位。
- 核心流程或 pipeline 可定位。
- 已知限制明确记录。

## S3 Workflow/Pipeline

描述从输入到输出的核心步骤，不要求统一技术栈。

通用要求：

- 步骤可顺序复现。
- 每步有输入、输出、失败处理或人工兜底。
- 不因 SOP 引入新依赖。

## S4 Golden Set

定义最小验证样例集。

通用要求：

- 样例来源可追溯。
- 样例必须声明为真实、脱敏、synthetic 或 placeholder；来源类型不得省略。
- 不把样例输出当作生产准确率。
- 缺少真实评测集时标记为 `pending` 或 `assumption`。

## S5 Evaluation

区分已验证指标、假设指标和待验证指标。

通用指标类别：

- workflow_completion
- output_schema_validity
- evidence_traceability
- manual_review_coverage
- profile_specific_quality

Profile 可增加场景指标，但阈值、实测值和验收结论只能来自该 Case Spec 的证据。

## S6 Evidence & Report

汇总证据路径、运行输出、报告、风险与人工复核项。

通用要求：

- 证据只引用路径和摘要，不复制大量重复文档。
- 报告必须说明 POC 边界。
- 未验证结果不得写成已达成。

## S7 Portfolio Presentation

面向作品集或售前展示，保留业务价值、流程、输出与边界。

通用要求：

- 页面展示不得夸大生产能力。
- Portfolio Evidence 应引用真实工件路径。
- Demo 文案与 Case Spec 的验证状态保持一致。
