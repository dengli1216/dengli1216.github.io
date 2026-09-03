# 03 — Evidence Pack

## 任务

从已验证评测产物生成脱敏、可展示的证据包。

## 事实源

- `docs/EVIDENCE_CONTRACT.md`
- `poc/reports/eval-summary.json`
- `poc/reports/POC_REPORT.md`
- `poc/reports/failure-analysis.md`

## 范围

- 校验必需字段、来源路径、版本、数据来源和评审状态。
- 仅在证据 Gate 通过时生成 `poc/reports/page-evidence.json`。

## 禁止项

- 不手工复制指标，不将黄金标签当作运行结果。
- 不放密钥、敏感原文、完整原始响应；不宣称生产效果。

## 验收

- 证据包能追溯至已验证运行；限制与失败状态可展示。
- 页面所需指标均由证据包提供。

## 完成汇报

汇报来源产物、证据 Gate、脱敏处理、限制和 Evidence Gate 结论。
