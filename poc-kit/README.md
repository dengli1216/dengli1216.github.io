# POC Kit v0.3

本目录沉淀跨案例 POC 标准资产，用于反向验证 Core SOP、Scenario Profile 与 Case Spec 的复用边界。

## 使用边界

- 只有 `CASE_META.yaml` 中 `case.type: poc` 的案例允许加载和执行 `POC_SOP.md`。
- `case.type` 支持：`poc`、`agent`、`rag`、`fullstack`、`demo`。
- 非 `poc` 案例不得自动应用 POC SOP；如需复用，只能人工迁移可用片段。
- Core SOP 只放跨案例稳定规则；行业指标、关键测试与验收侧重点放在 `profiles/`。
- Case Spec 只保存案例差异、证据路径与当前验证状态。

## 资产结构

- `POC_SOP.md`：S0-S7 通用流程。
- `CASE_SPEC.schema.yaml`：Case Spec 字段契约。
- `ACCEPTANCE.schema.yaml`：验收记录字段契约。
- `profiles/`：按场景拆分的测试重点与指标。
- `templates/`：新案例复制使用的最小模板。

## 当前反向验证状态

| 目标案例 | 实际目录 | Profile | 状态 |
|---|---|---|---|
| ai-tender-evaluator | `cases/ai-tender-evaluator` | `document-decision` | 已生成 Case Spec |
| ai-solution-copilot | `cases/ai-solution-copilot` | `llm-workflow` | 已生成 Case Spec |
| gesture-ai-product-explorer | `cases/gesture-ai-product-explorer` | `vision-interaction` | `demo`；不加载 POC SOP，摄像头不可用时保留静态 3D 演示 |
| industrial-visual-inspection | `cases/industrial-visual-inspection` | `vision-inspection` | `poc`；12 条 synthetic_test_fixture 已完成离线 pipeline/schema 评测；非真实模型证据 |

## CASE_META 机制

每个案例根目录必须声明：

```yaml
case:
  id: ai-tender-evaluator
  type: poc
  profile: document-decision
  sop: ../../poc-kit/POC_SOP.md
```

加载规则：

1. 读取案例根目录 `CASE_META.yaml`。
2. 若 `case.type != poc`，停止加载 POC SOP。
3. 若 `case.type == poc`，加载 `case.profile` 对应 Profile 与该案例的 `poc/case-spec.yaml`。
4. Profile 不覆盖 Case Spec 的事实证据，只补充场景维度的关键测试与验收关注点。

`vision-interaction` 仅用于 Demo 分类，不复用 `vision-inspection` 的巡检指标或 POC SOP。

## 低成本运行方式

本仓库无统一构建依赖。v0.1 快速验证采用静态证据校验：

```bash
python3 -m json.tool cases/ai-tender-evaluator/poc/reports/page-evidence.json >/dev/null
python3 -m json.tool cases/ai-solution-copilot/poc/reports/page-evidence.json >/dev/null
python3 -m json.tool cases/industrial-visual-inspection/poc/tests/golden-set.json >/dev/null
python3 cases/industrial-visual-inspection/poc/tests/run_eval.py
python3 cases/ai-tender-evaluator/poc/tests/run_eval.py --help
python3 cases/ai-solution-copilot/poc/tests/run_eval.py --help
```

真实 Dify API 重跑需要 `DIFY_BASE_URL` 与 `DIFY_APP_API_KEY` 或 `DIFY_API_KEY`，不作为默认低成本验证。
