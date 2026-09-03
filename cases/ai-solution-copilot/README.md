# AI Case Template

用于把一个 AI 解决方案 POC 收敛为可验证、可交接、可展示的案例。替换所有 `[占位]` 后使用；具体业务规则必须由本案例定义，不可从模板推定。

## 五阶段与 Gate

| 阶段 | 产物 | 进入下一阶段的 Gate |
| --- | --- | --- |
| 1. Challenge | `docs/CASE_BRIEF.md`、`docs/DECISION_CONTRACT.md` | 业务问题、风险、决策权与成功条件已确认 |
| 2. Workflow | `poc/dify/workflow.placeholder.yml` | 输入输出、降级与确定性规则边界可审阅 |
| 3. Test | `poc/tests/golden-set.template.json`、评测报告 | 所有声明的 Gate 通过，失败已分类并重跑 |
| 4. Evidence | `poc/reports/`、`docs/EVIDENCE_CONTRACT.md` | 可展示证据由已验证评测派生，边界完整 |
| 5. Pages | `page/PAGE_BRIEF.md`、案例页面 | 页面仅消费证据包，链接和展示声明已检查 |

未通过 Gate 不得进入下一阶段；阻塞、假设和变更必须写入 `docs/PROJECT_HANDOFF.md`。

## 最小命令占位

```bash
python3 poc/tests/run_eval.template.py --preflight
python3 poc/tests/run_eval.template.py --smoke
python3 poc/tests/run_eval.template.py --full
python3 poc/tests/run_eval.template.py --evidence
python3 scripts/page_check.py  # 按项目实际实现
```

这些命令是接口占位，不隐含任何平台、URL、密钥或生产能力。

## 复用 Codex 窗口

同一阶段内的调试、修复和复测可以复用同一窗口。跨阶段时，必须先阅读 `docs/PROJECT_HANDOFF.md`，再新开窗口，以固定事实源、决策与 Gate，减少上下文漂移。

## 来源与已吸收经验

本模板来自 `ai-tender-evaluator` 已验证 POC 的工程经验：决策合同、LLM/规则/人工分工、黄金集、关键 Gate 重复运行、失败重跑、派生证据包与页面边界。它不复制该案例的业务结论、业务规则、测试数据或指标。

## 入口

- [案例简报](docs/CASE_BRIEF.md)
- [决策合同](docs/DECISION_CONTRACT.md)
- [交接状态](docs/PROJECT_HANDOFF.md)
- [变更报告](docs/CHANGE_REPORT.md)
- [证据合同](docs/EVIDENCE_CONTRACT.md)
- [页面简报](page/PAGE_BRIEF.md)
