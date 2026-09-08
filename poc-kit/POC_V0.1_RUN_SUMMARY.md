# POC SOP v0.1 Historical Run Summary

> 此文件为 v0.1 历史快照，路由结论已由 `POC_V0.2_RUN_SUMMARY.md` 替代。当前 `gesture-ai-product-explorer` 为 `demo/vision-interaction`，不加载 POC SOP。

## Scope

本次只建立标准资产与轻量案例元数据，不重构现有案例业务代码、不修改 Dify Workflow、不新增依赖。

## Actual Case Mapping

| Case | Directory | case.type | Profile | SOP Loading |
|---|---|---:|---|---|
| ai-tender-evaluator | `cases/ai-tender-evaluator` | `poc` | `document-decision` | allowed |
| ai-solution-copilot | `cases/ai-solution-copilot` | `poc` | `llm-workflow` | allowed |
| ai-visual-inspection | `cases/gesture-ai-product-explorer` | `poc` | `vision-inspection` | allowed, with mismatch noted |

## Low Cost Checks Run

- Parsed existing page evidence JSON for `ai-tender-evaluator`.
- Parsed existing page evidence JSON for `ai-solution-copilot`.
- Checked available arguments for both existing Dify evaluation scripts.
- Inspected visual case page and demo files; no golden set or evaluation report was found.
- Did not call Dify API and did not require API keys.

## Verified Metrics From Existing Evidence

| Case | Verified Evidence |
|---|---|
| ai-tender-evaluator | 30/30 recorded Dify API runs; schema compliance 100%; synthetic golden consistency 100%; decision accuracy 100%; manual review recall 100%; citation validity 100%; all limited to synthetic / human_review_pending data. |
| ai-solution-copilot | 20/20 recorded Dify API calls with Run ID; expected status and contract compliance 100%; branch assertions 52/52; evidenceRefs contract detection 20/20; key case three-run consistency 4/4; synthetic / human_review_pending only. |
| gesture-ai-product-explorer | Static interactive POC assets exist: `index.html`, `demo.html`, `main.js`, `style.css`; no accuracy, precision, recall, camera recognition quality, or user study result was found. |

## Cannot Be Unified In v0.1

- Document decision accuracy and LLM workflow contract stability are measurable from existing Dify evidence; vision interaction has no comparable evaluation artifact.
- `vision-inspection` Profile expects defect labels, precision/recall and false positive/negative metrics, while actual mapped case is gesture-driven product interaction.
- Latency and cost are not uniformly available; Solution has token metadata, Tender lacks token/cost metadata, visual case has no run metadata.
- Business value and ROI are not validated across any case.

## Reuse Estimate

Core SOP reusable coverage is about 70% for the two Dify POCs and about 45% for the visual interaction POC. Across the three mapped cases, v0.1 practical reuse is estimated at 60%-65%.

## v0.2 Recommendation

建议进入 v0.2，但先补齐视觉案例的最小 Golden Set、浏览器/摄像头降级检查、手势识别稳定性记录，并将 `vision-inspection` 拆分或扩展为 `vision-interaction` 与 `vision-inspection` 两类。
