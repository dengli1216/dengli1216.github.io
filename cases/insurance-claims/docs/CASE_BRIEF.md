# AI 保险理赔智能助手｜Case Brief

## Business Problem

车险理赔初筛依赖人工整合保单、案件和历史信息；高风险案件可能不能被优先送达专业审核。案例只处理理赔分流与欺诈风险信号情报，不形成赔付、拒赔或欺诈成立结论。

## Current Workflow

SIMULATED Claim JSON → 严格输入校验 → 版本化确定性规则评分 → LOW / MEDIUM / HIGH 路由 → 受约束 LLM 摘要 → 输出闸门 → 人工复核。

## POC Hypothesis

在合成数据上，确定性规则可稳定产生可追溯风险路由；LLM 仅解释既有证据，越权或不可用时安全降级。

## What We Validate

- 输入合同、规则评分、路由、稳定 decision_id 与审计包；
- LLM 不得更改确定性字段；
- 非法输入、LLM 执行错误及越权输出进入人工复核或安全降级；
- 全部案例为 SIMULATED。

## What We Do NOT Validate

真实欺诈识别准确率、真实保险数据效果、Policy / Claims History / Fraud API、自动赔付、生产 SLA 或 ROI。

## Success Metrics

本地黄金集的路由一致性、Schema 通过率、确定性字段三次一致性、Critical Case 通过率、人工复核与安全闸门违规数。

## Human Review Boundary

human_review_required 始终为 true。风险等级是审核优先级，不是自动理赔决定。

## Data Boundary

仅接受 data_classification=SIMULATED 的 JSON；任何真实客户、保单或理赔数据均不在范围内。

## Go / Redesign / Stop Gate

- Go：本地确定性与安全 Gate 全部通过，可进入受控 staging 验证；
- Redesign：评分、路由或安全契约出现不可接受失败；
- Stop：无法取得合规数据范围或业务方不接受人工最终控制。
