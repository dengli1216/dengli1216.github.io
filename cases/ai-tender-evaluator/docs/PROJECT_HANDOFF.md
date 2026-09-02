# AI Tender Evaluator：项目交接状态

> 用途：供 ChatGPT、Codex 或协作开发者快速恢复上下文。最后核验：2026-09-02（v1.3 API 全量验收）。

## 一句话状态

**完整 v1.3 API 验收完成，但仅为 Synthetic POC，不代表生产验收。** 招标条款抽取、逐条证据匹配和确定性 Bid Gate 已通过本机 Dify 真实 API 评测；不得据此宣称客户效果、生产准确率或真实 ROI。

## 已验证事实

- Dify：Community `1.16.1`，本机服务可用，模型 `qwen3.7-plus`。
- 最新工作流：`poc/dify/ai-tender-evaluator-v1.yml`，已导入并发布为 Dify v1.3。
- Dify 工作流页：`http://localhost/app/6f9b98f7-ebd3-4afb-9a97-c67fe64b6a3b/workflow`。
- v1.3 关键回归 5/5：G10/G11/G12/G28 → `No-Bid`；G30 → `Conditional Bid`。
- 页面尚未改造；页面当前样例不应称为 Live Dify Run。

## 真实评测结果

| 运行 | 状态 | 可用结论 |
| --- | --- | --- |
| 30 例 Web 批量（v1.2） | 已真实提交；21 有结构化输出，9 无输出 | 仅可作为问题定位基线，不是最终指标 |
| v1.3 关键 Gate 5 例 | 已真实运行，5/5 通过 | 可证明关键规则修复有效 |
| v1.3 完整 30 例 API | 已完成 | 30/30 有真实 Run ID，全部验收断言通过 |

旧 v1.2 Web 批量基线仅覆盖 21 条可见输出，保留用于问题定位；v1.3 API 结果才是当前评测事实：覆盖率、工作流成功率、版本/Schema 合规、决策、条款状态、Critical Gap、人工复核、引文有效率均为 `30/30`，关键 Gate 五例三次一致均为 `5/5`。

真实 API 性能：平均 `46.33s`、P50 `44.739s`、P95 `58.257s`；30/30 返回 Run ID。API 未返回可用 Token/成本 metadata。

## 已修复规则

- 待确认/待补充：`Gap` 安全降级为 `Unclear`，必须进入人工复核。
- 未提供有效证据：不得判为 `Met`。
- 同类业绩、驻场承诺、资质/认证/许可证等纳入确定性关键条款规则。
- 已过期资质、明确“尚未取得/无法提供”等内容转为 `Gap`；关键条款触发 `No-Bid`。
- LLM 不拥有最终投标决策权；最终决策由 Code Gate 计算。

## 当前阻塞与边界

1. Dify Web 批量页的 9 条“无输出内容”仍未定位；它不影响已完成的 API 验收，但不应再作为评测来源。
2. 黄金集是 `synthetic` / `human_review_pending`，不是专家标注集；不可展示为生产准确率或真实 ROI。
3. 金额、日期、资质、法律、废标条件、报价必须人工复核；不自动授予最终 Bid/No-Bid 审批权。

## 下一步（固定顺序）

1. 人工复核并修订黄金集文本瑕疵，发布新的数据集版本；不得回写本轮结果。
2. 如需复测，执行 `python3 cases/ai-tender-evaluator/poc/tests/run_eval.py --full`；脚本会保留首轮失败重跑证据并仅追加五个关键 Gate 的两次运行。
3. 页面展示已完成；后续仅在获得明确授权后，基于新的真实运行证据或人工复核后的数据集更新页面。

## 给 ChatGPT / Codex 的执行提示词

```text
你正在维护 AI Tender Evaluator 生产级 POC。先阅读 PROJECT_HANDOFF.md、poc/reports/eval-summary.md、poc/reports/failure-analysis.md、poc/dify/ai-tender-evaluator-v1.yml、poc/tests/golden/golden_cases.jsonl 和 poc/tests/run_eval.py。

严格以本地文件与真实 Dify 运行作为事实来源，不得把网页样例、黄金标签或静态 JSON 当成运行结果。当前 Dify 为 1.16.1，v1.3 已发布；完整 30 例 v1.3 API 评测与关键 Gate 5/5 已完成。不得读取或打印密钥。

当前 API 验收已完成。后续只应基于新增的真实失败、人工标注数据或明确的页面实施授权继续修改；不得为了提高指标改写既有黄金标签。

关键业务约束：LLM 只做条款/证据归纳；Code Gate 决定最终 Bid/Conditional Bid/No-Bid；无投标原文证据不得 Met；资质、日期、金额、法律、报价必须人工复核；不得虚构准确率、Run ID、ROI 或测试通过。
```

## 当前阶段结论

**完整 v1.3 API 验收完成，但仅为 Synthetic POC，不代表生产验收。** 阶段 2C 已基于既有真实 API 评测产物生成脱敏 `page-evidence.json`；本轮未修改 GitHub Pages。当前允许进入页面实施，但页面必须保留数据范围与人工复核边界。

## 阶段2C完成（POC 报告与页面证据包）

- 本轮未调用 Dify、未运行新测试、未采集真实客户数据，也未修改 GitHub Pages。
- `poc/reports/POC_REPORT.md` 与 `poc/reports/page-evidence.json` 仅由已验证的 30 例真实 API 结果派生；页面证据包已脱敏，不包含完整招标/投标文本、原始响应或密钥。
- 当前允许进入 GitHub Pages 实施。页面必须将该结果标注为 **Synthetic POC / human_review_pending / 已验证 API 运行**，并保留人工复核边界。
- 页面禁止使用以下表述：生产准确率、生产可用、真实客户效果、客户 ROI、真实 Token/成本、自动最终投标授权；也不得将 100% synthetic golden consistency 解释为生产准确率。

## 阶段3页面展示完成

- 已将 `cases/ai-tender-evaluator/index.html` 重构为静态证据展示页：决策驾驶舱、评审闭环、脱敏条款—响应矩阵、POC Scorecard、运行证据与边界。
- 已将实际 Dify v1.3 Workflow 设计截图作为页面资产展示，用于说明输入校验、LLM 归纳、结构校验、Code Gate 与报告输出的职责链。
- 页面唯一运行事实来源为 `poc/reports/page-evidence.json`；通过相对路径静态读取，不调用 Dify，不包含客户数据、Run ID、原始响应或密钥。
- 页面可表述为“Recorded Dify API Run”“Synthetic POC / human_review_pending”“与 Synthetic Golden Set 的一致性”。
- 页面不得表述为生产准确率、生产可用、已上线、真实客户效果、真实 ROI、真实 Token/成本或自动最终投标授权。

## 不应提供给外部模型的文件

- Dify `.env`、任何 API Key、浏览器会话、数据库转储、Docker 密码。
- 未脱敏招标文件、投标文件、客户资料、运行日志。
