# 阶段3页面展示变更说明

## 修改模块

- 将案例页改为售前证据展示：业务价值、决策驾驶舱、Dify Workflow 架构、评审闭环、条款—响应矩阵、POC Scorecard、能力沉淀与运行边界。
- 新增已导入并发布的 v1.3 Dify Workflow 设计截图，说明输入校验、条款抽取、证据匹配与 JSON 修复、确定性 Gate、结构化报告的职责边界。
- 页面通过相对路径读取 `poc/reports/page-evidence.json`；不新增后端、不调用 Dify。
- 代表案例仅显示脱敏 case_id、决策、风险和证据摘要；不展示完整招标/投标文本、原始 API 响应或密钥。
- 更新了移动端栅格与横向可滚动矩阵，保证基本可读性。

## 数据来源

- 唯一运行事实来源：`poc/reports/page-evidence.json`。
- 支撑说明：`poc/reports/POC_REPORT.md`。
- 数据性质：`Synthetic POC / human_review_pending`；所有一致性指标均非生产准确率。

## 构建结果

- 原生 HTML / CSS / JavaScript，无构建步骤。
- 已完成 JSON 读取、JavaScript 语法、差异检查及本地静态 HTTP 资源加载验证。

## 已知限制

- 未展示真实客户数据、ROI、Token 或成本数据。
- 金额、日期、资质、法律、废标条件、报价与最终投标审批仍必须人工复核。
- 页面仅展示 Recorded Dify API Run 的静态证据，不提供实时运行能力。
