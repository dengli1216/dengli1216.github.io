# Project Handoff — AI Solution Copilot

## 当前阶段

阶段 4B GitHub Pages 案例展示已完成；页面仅消费 `poc/reports/page-evidence.json`，未新增未经核验事实。

## 真实已知事实

- 原始 YAML 初始来源 SHA-256 为 `91668f50d5dea66c07d6f7b70d7e6ce4eda86fe3f1d54cd1840a3270519ae8d1`。为修复真实 Gate 失败，既有已发布应用与案例快照同步了最小 Stage 3–7 提示词补丁；当前快照 SHA-256 为 `b6450ef7f8f315d47a1fe5b9091db2401d533fc08ea84dbc8159775c142d979b`。
- 应用 `f406210a-04c1-4e1c-ae66-6a6b52c74674` 的 `/parameters`、`/info` 返回 HTTP 200，输入为 `intake_artifact_json`、`report_language`。
- 完整 Smoke 的真实 Run ID：阻断 `c790df20-7418-4c8b-b568-6dcba71da115`，安全失败 `1889d899-23e3-419d-a65c-9271d30ae0cb`，Happy Path `1740ec44-923e-4cd5-ac2e-47124cd667eb`；三条契约断言均通过。
- Golden Set 为 12 条脱敏合成样本，真实 API 共执行 20 次（含 4 个关键用例各 3 次）。20/20 有 Run ID，预期状态与契约合规 20/20，关键用例三次一致 4/4；详见 `poc/reports/eval-summary.json`。
- 两条正常主链分别以 `4c63c390-1734-422d-9824-aa452318276a` 与 `0d4c1715-22ac-4d7b-a6fc-af2c9f1952f1` 通过全部自动 Gate 后暂停在 `human_review`。

## 未验证项

- Golden Set 只覆盖合成脱敏样本的结构、分支和人工复核暂停态。
- 真实数据、业务正确性、人工审批完成、质量、稳定性、性能、成本、ROI、客户效果，以及目标用户/业务价值仍未验证。

## 下一阶段唯一目标

下一阶段唯一目标：进行用户批准后的站点发布/视觉复核；不得新增未经证据源支持的数字或结论。

## Dify 运行前置条件

1. `DIFY_APP_API_KEY` 已设置但不记录值；使用 API 地址 `http://localhost/v1`。
2. 已发布应用保持与当前案例快照一致，并可使用所需插件/模型。
3. 展示只能引用已保存的脱敏 Run ID 与结构化报告；不得将人工暂停态表述为人工批准或生产验证。
4. 页面实现前需保持 `page-evidence.json` 与 `POC_REPORT.md` 的字段、数字和边界一致；不生成或补充业务准确率、ROI、成本、客户效果。
5. 当前页面入口为 `cases/ai-solution-copilot/`；本轮未执行 GitHub Pages 发布。
