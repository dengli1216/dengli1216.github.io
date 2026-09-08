# POC SOP v0.2 Historical Run Summary

> 此文件为 v0.2 历史快照。工业视觉巡检的当前执行状态见 `POC_V0.3_RUN_SUMMARY.md`。

## Routing

| Case | type | Profile | POC SOP |
|---|---|---|---|
| ai-tender-evaluator | poc | document-decision | allowed |
| ai-solution-copilot | poc | llm-workflow | allowed |
| industrial-visual-inspection | poc | vision-inspection | allowed |
| gesture-ai-product-explorer | demo | vision-interaction | blocked |

`gesture-ai-product-explorer` is a browser gesture/product exploration demo. Its camera capability is optional; when unavailable, the existing static 3D mouse/touch experience remains the fallback. It is not an inspection case and does not load POC SOP.

## Three-POC Reuse Check

| Dimension | document-decision | llm-workflow | vision-inspection |
|---|---|---|---|
| Core stages | S0-S7 apply | S0-S7 apply | S0-S7 apply |
| Profile-specific focus | evidence extraction, risk/decision traceability | orchestration, contracts, fallback paths | image/rule context, abnormality, human review |
| Case-specific assets | tender docs, Dify runs, output schema | Intake JSON, Dify workflow, branch evidence | static-image contract, rule context, synthetic/placeholder Golden Set |
| Current evaluation evidence | recorded synthetic Dify results | recorded synthetic Dify results | no model run; test design only |

## Non-unified Fields

- Input payload shape, evidence pointer type and output domain semantics.
- Quality metrics: document decision accuracy, workflow contract/branch assertions, and visual reading/anomaly metrics cannot share a value definition.
- Thresholds, latency baselines and human-review policies must remain profile/case-specific.
- Real image sources, annotations and model/runtime configuration have no current inspection baseline.

## Reuse Estimate

Core SOP structure is reusable across all three POCs: S0-S7 applies without a new core stage. Practical v0.2 reuse is estimated at **75%**: stage governance, type gate, evidence separation and Golden Set rules are shared; domain metrics and test assets remain Profile/Case Spec responsibilities. This is not over-abstraction because vision-specific fields stay in `vision-inspection`, and the interaction demo is excluded rather than force-fitted.

## Current Blocker And v0.3 Minimum

The inspection POC has no approved static image baseline, annotation/rule catalog, model runtime or execution evidence. v0.3 should add only: 12 approved static images mapped to the existing IDs, rule versions, one offline recognition adapter, and a recorded schema/critical-case evaluation. Do not add camera streaming, PLC/MES/CMMS or real work-order integration before that baseline exists.
