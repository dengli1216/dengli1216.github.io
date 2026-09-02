# POC v1.3 API 评测结果

> 数据来自真实 Dify API 运行；黄金集为 synthetic / human_review_pending。

- expected_workflow_version: poc-v1.3-dify-1.16.1
- cases_run: 30
- api_completion_coverage: 1.0
- workflow_success_rate: 1.0
- workflow_version_compliance_rate: 1.0
- schema_compliance_rate: 1.0
- synthetic_golden_consistency_rate: 1.0
- requirement_status_accuracy: 1.0
- critical_gap_recall: 1.0
- decision_accuracy: 1.0
- manual_review_recall: 1.0
- citation_validity_rate: 1.0
- hallucinated_clause_or_evidence_rate: 0.0
- key_gate_three_run_coverage: 1.0
- key_gate_three_run_consistency_rate: 1.0
- accepted_case_rate: 1.0
- token_or_cost_metadata_available_runs: 0

- latency_seconds: {'average': 46.33, 'p50': 44.739, 'p95': 58.257}
- page_evidence_gate_passed: True

## 混淆矩阵
```json
{
  "Bid": {
    "Bid": 9,
    "Conditional Bid": 0,
    "No-Bid": 0
  },
  "Conditional Bid": {
    "Bid": 0,
    "Conditional Bid": 13,
    "No-Bid": 0
  },
  "No-Bid": {
    "Bid": 0,
    "Conditional Bid": 0,
    "No-Bid": 8
  }
}
```
