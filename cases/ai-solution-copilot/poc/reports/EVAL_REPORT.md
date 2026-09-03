# Golden Set Evaluation Report — AI Solution Copilot

## 真实运行事实

- 使用已配置的应用 API Key 调用本地 Dify API；Key 未读取、打印或写入文件。
- 全量 12 条 Synthetic Golden Set 全部完成，12/12 的预期分支与稳定契约通过；关键 4 条额外各运行 2 次，共 20 次真实 Workflow 调用，20/20 均有 Run ID。
- 正常主链分别在 `4c63c390-1734-422d-9824-aa452318276a`（English）与 `0d4c1715-22ac-4d7b-a6fc-af2c9f1952f1`（中文）通过 FINAL_REPORT Gate 后暂停在 `human_review`；该暂停是人工复核边界，不是失败。

## 覆盖与结果

| 维度 | 用例 | 结果 |
| --- | --- | --- |
| Intake 阻断与 wrapper | GS-01、02、03、12 | 4/4 安全阻断输出及 evidenceRegistry 通过 |
| schema / 外层格式失败 | GS-04、08、09 | 3/3 在标准化阶段安全失败 |
| evidenceRefs 边界 | GS-05、06、07 | 3/3 拒绝 null、Markdown、未登记 ID |
| 正常主链与人审暂停 | GS-10、11 | 2/2 全部阶段 Gate 通过并暂停待人审 |

## 指标

- API 完成覆盖率、Run ID 覆盖率、预期状态/契约合规率：20/20（100%）。
- 分支/状态稳定断言：52/52（100%）；evidenceRefs 接受/拒绝契约：20/20（100%）。
- 关键用例三次一致：4/4（100%）。
- 延迟：平均 45.928 秒，P50 0.071 秒，P95 441.837 秒；暂停态以已完成节点耗时合计计量。
- Token metadata：20/20 可得；成本 metadata：0/20，未推断成本。

## 边界与结论

本结果仅验证脱敏合成数据下的结构、分支、evidenceRefs 与安全失败契约。所有样本均标记 `synthetic`、`human_review_pending`；未验证业务正确性、真实客户数据、人工批准完成、性能 SLA、成本、ROI、客户效果或生产可用性。

阶段 3 Gate：**pass**。满足阶段 4「证据包与 GitHub Pages」的前置条件。
