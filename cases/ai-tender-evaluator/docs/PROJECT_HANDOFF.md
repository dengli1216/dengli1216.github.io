# AI Tender Evaluator：项目交接状态

> 用途：供 ChatGPT、Codex 或协作开发者快速恢复上下文。最后核验：2026-09-02（v1.3 API 全量验收）。

## 一句话状态

**完整 v1.3 API 验收完成，但仅为 Synthetic POC，不代表生产验收。** 招标条款抽取、逐条证据匹配和确定性 Bid Gate 已通过本机 Dify 真实 API 评测；不得据此宣称客户效果、生产准确率或真实 ROI。

## 已验证事实

- Dify：Community `1.16.1`，本机服务可用，模型 `qwen3.7-plus`。
- 最新工作流：`poc/dify/ai-tender-evaluator-v1.yml`，已导入并发布为 Dify v1.3。
- Dify 工作流页：`http://localhost/app/6f9b98f7-ebd3-4afb-9a97-c67fe64b6a3b/workflow`。
- v1.3 关键回归 5/5：G10/G11/G12/G28 → `No-Bid`；G30 → `Conditional Bid`。
- 页面已按作品集定位重构；只展示 Recorded Dify API Run，不称为 Live Dify Run。

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

**完整 v1.3 API 验收完成，但仅为 Synthetic POC，不代表生产验收。** 当前案例页已重构为个人 AI 解决方案架构案例，本轮修改尚未提交或推送。

## 阶段2C完成（POC 报告与页面证据包）

- 本轮未调用 Dify、未运行新测试、未采集真实客户数据，也未修改 GitHub Pages。
- `poc/reports/POC_REPORT.md` 与 `poc/reports/page-evidence.json` 仅由已验证的 30 例真实 API 结果派生；页面证据包已脱敏，不包含完整招标/投标文本、原始响应或密钥。
- 当前允许进入 GitHub Pages 实施。页面必须将该结果标注为 **Synthetic POC / human_review_pending / 已验证 API 运行**，并保留人工复核边界。
- 页面禁止使用以下表述：生产准确率、生产可用、真实客户效果、客户 ROI、真实 Token/成本、自动最终投标授权；也不得将 100% synthetic golden consistency 解释为生产准确率。

## 阶段3个人解决方案架构案例（当前）

- 已将上一版页面冻结为 `preview-v2/` 独立预览；主页面继续迭代且未覆盖该版本。
- 页面控制为六段：个人贡献首屏、G10/G30 完整决策链、双层架构与架构决策、v1.2→v1.3 工程修复、四项验证证据、POC 边界与客户试点计划。
- 首屏明确个人贡献：业务建模、Dify 编排、Code Gate、Synthetic 黄金集、自动化评测、故障定位与修复。
- 核心架构表达为 LLM 归纳 → Code Gate 决策 → 人工复核；真实 Dify Workflow 截图增加五个编号标注和节点说明。
- 工程证据入口包含 Workflow YAML、黄金测试集、`run_eval.py`、POC 报告与 failure analysis。
- 页面只展示 30/30 Run、5/5 三次一致、Schema 30/30、P95 58.257s；真实客户指标仅作为下一阶段验证计划。
- 页面事实来源仍为 `poc/reports/page-evidence.json` 与既有报告；不调用 Dify，不新增运行数据。
- 已在 320、768、1024、1440px 浏览器验证：主页面与归档页可加载、六段结构完整、无全局横向溢出、控制台无错误或警告。
- 本轮未读取密钥、未提交、未推送。

## 阶段3A工作流演示视频（2026-09-04）

- 主页面在 Hero 后、正文首个决策区块前新增“30 秒看懂”工作流演示；既有内容未删除或改写。
- 视频衍生产物为 `assets/ai_tender_review.mp4`（H.264 + AAC + faststart）和 `assets/ai_tender_review-poster.jpg`；原始 `assets/ai_tender_review.mov` 已保留。
- 播放器使用原生控件、无自动播放、`preload="metadata"`、`playsinline` 与响应式宽度，避免首屏下载完整视频。
- 本轮未调用 Dify、未修改 Workflow、测试、报告、页面事实或其他案例；未读取密钥、未提交、未推送。

## 不应提供给外部模型的文件

- Dify `.env`、任何 API Key、浏览器会话、数据库转储、Docker 密码。
- 未脱敏招标文件、投标文件、客户资料、运行日志。
