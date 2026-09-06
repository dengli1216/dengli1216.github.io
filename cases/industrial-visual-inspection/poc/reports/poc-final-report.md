# 工业视觉巡检 POC 最终报告

## Business problem

工业巡检图片中经常同时存在仪表读数、控制面板状态、设备标识、反光、低光、遮挡和多目标竞争。POC 目标不是直接替代人工，而是验证一条可控的 AI 辅助判断链路：先提取视觉观察，再结合设备 metadata 与巡检 rule 做业务归一化，最后把高风险、不确定或异常样本送入人工复核。

## POC scope

范围限定为 12 张 synthetic_generated 测试图，覆盖 analog gauge、digital display、control panel/state、多目标、低光、反光、遮挡、规则不匹配等场景。

已验证假设：结构化视觉输出、schema 约束、Rule Engine、uncertainty/abstention、人审门控可形成稳定最小闭环。

未验证假设：真实生产准确率、通用 OCR 读数能力、analog gauge 专用读数器、ROI Hybrid 默认路径。

## Architecture

最终冻结架构：

`image + metadata -> Gemini semantic VLM -> uncertainty / abstention -> existing Rule Engine -> human review`

设计要点：

- VLM 负责 target identification、readability、visual observation、uncertainty。
- Rule Engine 负责 metric/rule compatibility、anomaly、review_required、recommended_action。
- `reading/state` 与 `anomaly` 分离，避免直接由“看见数字”推出业务异常。
- 高 uncertainty、target mismatch、rule mismatch、reading=null 或 critical anomaly 进入 human review。

## Golden dataset

Golden Set 已经完成人工审查：confirmed=3，corrected=9，pending=0。修正依据来自图像直接复核，不以模型输出为准。

当前 Golden、rules、schema、Gemini v3 Prompt 和 runner 已冻结。最终回归未修改 Golden、manifest、business rules 或 Prompt。

## Model comparison: Qwen vs Gemini

| Run | Reading | Critical | Unsafe Guess | Correct Abstention | Uncertainty | Failures |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Qwen v3 targeted | 6/12 | 3/10 | 4 | 3 | 6/12 | 9 |
| Gemini 3.7 Flash targeted | 8/12 | 2/10 | 1 | 6 | 10/12 | 9 |

结论：Gemini 不是 critical pass 的绝对赢家，但在 uncertainty 与 abstention 上更稳定，因此作为最终 semantic VLM。Qwen 的主要短板是 unsafe guess 与 uncertainty 系统性不足。

## OCR/ROI experiments

| Experiment | Result | Decision |
| --- | --- | --- |
| ROI Hybrid spike | critical 2/10 -> 4/10，failures 9 -> 7，但 unsafe guess 1 -> 3，`VIS-011` 安全回归 | NOT_PROVEN |
| macOS Vision direct OCR | 0/3 | NOT_PROVEN |
| PP-OCRv5 mobile direct | 0/3，小数点不能稳定保留 | NOT_PROVEN |
| ROI + Gemini fallback | digital raw-value 2/3，但不是 direct OCR gate | future research only |
| analog reader | feasibility only | future production option |

结论：本 POC 不启用 direct OCR、ROI Hybrid 或 analog gauge reader 作为默认路径。ROI/OCR 可以作为后续专项路线，但不能替代当前安全基线。

## Final regression metrics

Evidence：`poc/reports/private/final-gemini-run/`

| Metric | Result |
| --- | ---: |
| API success | 12/12 |
| Schema compliance | 12/12 |
| Reading | 9/12 |
| Anomaly | 11/12 |
| Review | 12/12 |
| Uncertainty | 10/12 |
| Critical pass | 4/10 |
| Failures | 7 |
| Unsafe guess count | 0 |
| Correct abstention count | 6 |
| P50 latency | 6476.425979ms |
| P95 latency | 7558.766044ms |
| Prompt tokens | 20257 |
| Completion tokens | 2006 |
| Total tokens | 28315 |
| Cost | not_available |

失败样本：`VIS-002`, `VIS-006`, `VIS-007`, `VIS-008`, `VIS-009`, `VIS-011`, `VIS-012`。

## Verified capabilities

- API 调用与 adapter 兼容稳定，最终回归 12/12 成功。
- 输出 schema 100% 合规。
- Rule Engine 能稳定处理规则兼容性、异常判断与人审动作。
- Human review gate 稳定，最终回归 12/12 命中期望。
- Uncertainty/abstention 对高风险样本有效，unsafe guess 控制为 0。
- 能明确区分视觉读数、业务规则判断、target/rule mismatch 与图像质量边界。

## Limitations

- 数据集只有 12 张 synthetic 图，不能外推生产准确率。
- Critical pass 仍为 4/10，表明部分困难样本仍需人工或更专用视觉模块。
- Analog gauge 精读仍存在模型感知边界。
- Digital OCR 未通过 direct gate，不能作为 specialist reader。
- ROI Hybrid 增加 unsafe guess 风险，不能进入默认架构。
- 成本字段当前不可用，无法做真实 API 成本估算。

## Production architecture recommendation

生产化建议以当前已验证闭环为主线：

`image + metadata -> semantic VLM -> deterministic Rule Engine -> human review`

短期不接入未证明模块。若继续投入，应先扩大真实图像 Golden Set，并为 digital display 与 analog gauge 分别建立独立专项评估，而不是继续在同一 Prompt 中追求读数准确率。

## Next-step roadmap

1. S7 portfolio page：公开展示架构、指标、边界和 POC 结论，不展示 private raw logs。
2. Real-image Golden Set：采集真实巡检图，并保留人工复核记录。
3. Safety regression：围绕 unsafe guess、uncertainty、human review 建立固定回归集。
4. Digital reader专项：只有 direct OCR gate 达标后再接入 hybrid interface。
5. Analog gauge专项：先完成 ROI/needle/scale 标注，再验证 gauge CV 路线。

## Final gate

POC_VALIDATED。

判断依据：pipeline 稳定，schema 100%，review gate 稳定，unsafe guess 已控制，uncertainty 可用于风险分流；同时 direct OCR、ROI Hybrid、analog reader 和 production accuracy 的限制已经清晰界定。
