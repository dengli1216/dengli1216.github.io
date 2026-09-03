# Evidence Contract

页面、报告和对外陈述只能消费已验证的派生证据；不得手工复制指标、从样例推断指标，或以黄金标签替代运行结果。

## 必需产物

| 文件 | 必需字段 |
| --- | --- |
| `poc/reports/eval-summary.json` | `generated_at`、`workflow_version_expected`、`dataset.{size,provenance,review_status}`、`summary`、`runs`、`gate_status` |
| `poc/reports/POC_REPORT.md` | 业务边界、数据集状态、运行范围、质量/延迟结果、关键 Gate、限制、下一步 |
| `poc/reports/failure-analysis.md` | 评测版本、失败用例、失败分类、重跑记录、未解决项 |
| `poc/reports/page-evidence.json` | `evidence_status`、`generated_at`、`workflow_version`、`dataset`、`core_metrics`、`representative_cases`、`limitations`、`source_artifacts` |

## 生成与使用规则

1. `page-evidence.json` 仅可由通过 Gate 的 `eval-summary.json` 和相关报告生成，并记录来源路径/版本。
2. `representative_cases` 只保留展示所需的脱敏字段与可验证引用，不放密钥、原文敏感数据或完整原始响应。
3. 页面读取 `page-evidence.json`；数字、运行状态与限制不得人工写死或复制。
4. 若数据为 synthetic、review pending 或评测范围有限，页面必须同步展示该限制；不得推称生产准确率、ROI、客户效果或 Live Run。
