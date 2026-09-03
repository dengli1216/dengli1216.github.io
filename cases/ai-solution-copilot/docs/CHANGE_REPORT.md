# Change Report — 2026-09-03 / Phase 2 Contract Fix

## 根因证据

- `SMK-INVALID-ARTIFACT-001` 的 `{}` 在 Normalizer 抛出“必须为 App 01 输出或 wrapper”，未进入 Gate，故不能证明安全失败契约。
- 首个 Happy Path Run 的脱敏 Stage 3 原始输出中，`evidenceRefs` 是原生数组，但包含 Registry 未登记的 `CON-001`；Dify 日志确认失败发生在 `gate_opportunity`。后续修复验证还暴露了 Stage 4 的不支持 evidence type，以及 Stage 3 缺少字面值非 AI 选项。这些均为 Workflow LLM 节点输出未满足已有 Gate，不是执行器解析或 Run ID 漏取。

## 最小修复

- 在既有应用中原位修改并发布：Stage 3–7 增加完整 evidence ID、合法类型前缀、引用必须可解析的约束；Stage 3 增加 `DO_NOTHING` 加至少一项指定非 AI 方案的约束。未放宽 Gate，未重建或创建应用。
- 同步案例快照；当前 SHA-256：`b6450ef7f8f315d47a1fe5b9091db2401d533fc08ea84dbc8159775c142d979b`。
- 无效输入用例改为合法 `reusable_intake_artifact_json` wrapper，内部故意使用 `schemaVersion=0.0.0`；执行器增加错误原因、人工复核状态与 evidenceRefs 严格兼容校验（仅原生数组或合法 JSON 字符串数组）。

## 真实验收

- Preflight 通过；完整 Smoke 3/3 通过，详见 `poc/reports/smoke-summary.json` 与 `SMOKE_REPORT.md`。
- 未修改原始 AI Solution Copilot 文件、Dify 核心、模板、其他案例；未提交或推送。

## Phase 3 — Golden Set 真实回归

- 新增 12 条 `synthetic`、`human_review_pending` Golden Set 用例，覆盖正常主链、信息缺失、无效 artifact、安全阻断、人审暂停和 evidenceRefs 边界；未纳入业务语义或自由文本精确断言。
- `run_eval.py` 增加 `--full`、Golden Set 物化输入、失败用例 `--case-id` 重跑、重复一致性与 JSON/Markdown 报告能力；仅允许网络/服务瞬断重试一次。
- 真实 API 回归 12/12 通过，关键用例三次一致 4/4；无真实契约失败证据，故未改 Workflow（修复轮次 0）。详见 `poc/reports/eval-summary.json`、`EVAL_REPORT.md`、`failure-analysis.md`。

## Phase 4A — POC 证据包与展示数据

- 新增 `poc/reports/POC_REPORT.md` 与 `poc/reports/page-evidence.json`，页面事实源仅引用既有 Golden Set、真实 Run ID、契约断言和核验后的延迟指标。
- 延迟审计确认 P50 0.071s 来自快速阻断/失败样本，P95 441.837s 来自两条多阶段 LLM 主链；不作性能优势声明，并保留进一步诊断限制。
- 修正 `run_eval.py` 百分位计算为线性插值，并优先使用核验后的工作流耗时字段；未重新调用 Dify，未修改 Workflow、Golden Set 或页面。

## Phase 4A.1 — 证据一致性修复

- 以 `poc/reports/eval-summary.json` 为最高优先级，补齐 `POC_REPORT.md` 的平均延迟 `45.928s`，并核对 P50 `0.071s`、P95 `441.837s`、20/20 Run ID、52/52 断言及 4/4 关键用例一致性。
- 确认 `page-evidence.json`、`POC_REPORT.md` 与 `EVAL_REPORT.md` 的可展示数字一致；延迟分层/异常限制保持不变，未作性能优势表述。
- 明确写入阶段 4B 许可：`阶段 4A 证据一致性已通过；可进入阶段 4B GitHub Pages 实现。` 本次未发生新的 Dify 调用或测试。

## Phase 4B — GitHub Pages 案例展示

- 新增独立页面 `cases/ai-solution-copilot/index.html`、`style.css`、`main.js`，并在根目录 `main.js` 注册中英文首页入口。
- 页面包含业务问题与个人贡献、代表性结果、双层 Workflow 静态 SVG、真实回归证据、工程复盘、生产边界六个主区块；数字和 Run ID 动态来自 `poc/reports/page-evidence.json`。
- 页面为静态展示，不调用 Dify、不修改 Workflow/Golden Set/报告，不生成客户效果、ROI、成本或性能优势结论；本轮未发布 GitHub Pages。
