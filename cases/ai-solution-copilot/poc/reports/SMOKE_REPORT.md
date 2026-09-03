# Smoke Report — AI Solution Copilot

## 真实运行事实

- Preflight 通过：已配置应用 API Key、API 地址和应用接口均可用；已发布应用返回的输入为 `intake_artifact_json`、`report_language`，与快照契约一致。
- 三条 Smoke 均为真实 API 调用，3/3 通过稳定字段断言。

| Case | Run ID | 预期契约 | 实际状态 | 延迟（秒） |
| --- | --- | --- | --- | --- |
| SMK-INTAKE-BLOCKED-001 | `c790df20-7418-4c8b-b568-6dcba71da115` | Intake 阻断 | succeeded | 0.096 |
| SMK-INVALID-ARTIFACT-001 | `1889d899-23e3-419d-a65c-9271d30ae0cb` | 安全失败 | failed | 0.067 |
| SMK-HAPPY-PATH-001 | `1740ec44-923e-4cd5-ac2e-47124cd667eb` | 人审暂停 | paused | 112.758 |

## 未验证范围

- 只验证合成脱敏样本的结构、分支、安全失败及人审暂停；不验证真实数据、业务效果、人工批准、性能、成本或生产可用性。

## 阶段 3 前置条件

- Golden Set 继续使用同一发布应用与快照，维持 evidenceRefs 严格 Gate，并记录真实 Run ID 与契约断言。
