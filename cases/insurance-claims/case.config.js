export const caseConfig = {
  mount: "#case",
  hero: { eyebrow: "SIMULATED · LOCAL DETERMINISTIC POC", title: "AI 保险理赔智能助手", subtitle: "将理赔案件按风险与欺诈信号分流，并为审核人员提供可追溯的风险证据与人工复核入口；不自动拒赔、赔付或认定欺诈。", tags: ["Claims triage", "Deterministic rules", "Human review"], validationStatus: "POC_GATE_PASSED" },
  businessValue: { title: "先把审核优先级稳定下来", description: "面向 HR、方案负责人和技术负责人展示一个受控的理赔审核辅助闭环。", cards: [
    { title: "人工初筛", detail: "保单、案件与历史信息需要人工拼接；高风险案件可能无法优先进入专业审核。" },
    { title: "信号分散", detail: "早期高额、短期重复、描述矛盾、金额与报价偏差等信号需要统一呈现。" },
    { title: "受控 AI", detail: "规则负责评分与路由；LLM 只解释既有证据，最终决定始终由人工承担。" }
  ], targetScenario: "SIMULATED 车险理赔 JSON 的初筛、风险分流与人工审核支持。", suitableFor: ["需要可追溯路由的审核团队", "可先在 Sandbox / 影子流程验证的场景"], notSuitableFor: ["自动赔付、自动拒赔或自动认定欺诈", "未经授权的真实客户或保单数据处理"] },
  solution: { title: "规则先行，LLM 只做解释", description: "每一段都有明确责任边界与失败去向。", flow: [
    { label: "SIMULATED Claim", detail: "严格 Schema 与数据分类校验", type: "input" }, { label: "Deterministic Rules", detail: "评分、信号、decision_id、审计", type: "decision" }, { label: "Risk Routing", detail: "LOW / MEDIUM / HIGH 队列", type: "decision" }, { label: "Constrained LLM", detail: "仅生成摘要与证据解释", type: "ai" }, { label: "Output Gate", detail: "越权或异常即回退", type: "gate" }, { label: "Human Review", detail: "最终审核与业务决定", type: "action" }
  ], roles: [{ label: "规则", detail: "生成不可被 LLM 改写的风险字段和路由。" }, { label: "LLM", detail: "解释已有证据，不拥有评分或理赔决策权。" }, { label: "人工", detail: "复核风险、证据与后续处理，承担最终责任。" }] },
  evidence: { url: "poc/reports/page-evidence.json", title: "本地 POC 证据", description: "所有数字由 page-evidence.json 加载；仅说明 SIMULATED 本地确定性测试结果。", primaryMetrics: [
    { label: "可执行黄金集", unit: " 条", description: "本地工作流回归", sourceKey: "dataset.executable_cases" }, { label: "路由一致性", unit: "", description: "与规则集黄金标签一致", sourceKey: "display_metrics.routing_accuracy" }, { label: "Critical 稳定性", unit: "", description: "6 条用例各重复 3 次", sourceKey: "display_metrics.critical_consistency" }, { label: "安全 Gate", unit: "", description: "越权与降级合同", sourceKey: "display_metrics.safety_gate" }
  ], secondaryMetrics: [
    { label: "P50 本地执行", unit: " ms", description: "仅规则节点执行时间", sourceKey: "core_metrics.p50_latency_ms" }, { label: "P95 本地执行", unit: " ms", description: "不含在线模型 / 网络", sourceKey: "core_metrics.p95_latency_ms" }, { label: "Fallback 检查", unit: " 项", description: "LLM 执行与输出拒绝两路径", sourceKey: "core_metrics.fallback_checks_passed" }, { label: "失败数", unit: "", description: "当前完整回归", sourceKey: "core_metrics.failure_count" }
  ], datasetSummary: "29 条 Golden Set 记录：28 条可执行、1 条 score=20 可达性静态检查、6 条 Critical Case；全部为 SIMULATED。", evidenceSource: "poc/reports/page-evidence.json（脱敏汇总）" },
  customSections: [{ id: "safety", type: "cards", order: 40, kicker: "04 / SAFETY DESIGN", title: "失败时保持可控", description: "不让自由文本覆盖确定性决策，也不向用户暴露 provider 错误细节。", data: { cards: [
    { title: "Deterministic decision", detail: "risk_score、risk_level、signals、route 与审计字段先由版本化规则固定。" }, { title: "LLM output gate", detail: "字段漂移、格式错误或取消人工复核会被拒绝。" }, { title: "Fallback + human", detail: "LLM 执行或输出失败均返回确定性结果，并保持 human_review_required=true。" }
  ], note: "Boundary：score=20 在现有离散规则点数组合中不可达；以 15 / 25、55 / 60 / 65 验证阈值两侧。" } }],
  decisionBoundary: { title: "已证明的是控制能力", verifiedCapabilities: ["SIMULATED 输入校验、确定性风险评分与 LOW / MEDIUM / HIGH 路由", "稳定 decision_id、规则版本与审计字段", "LLM 确定性字段篡改拦截", "LLM 执行错误与非合规输出的安全降级", "人工复核始终为必经边界"], notProvenItems: ["真实欺诈识别准确率或保险企业效果", "真实 Policy、Claims History、Fraud API 集成", "自动赔付、自动拒赔或生产 SLA", "真实成本与 ROI"], decisionSummary: "本地确定性 POC Gate 通过；进入工程 POC 前仍需获得合规数据范围、只读 Sandbox、运行审计与负责人准入。" },
  productionPath: { title: "从 POC 到生产", steps: [
    { title: "POC", detail: "冻结规则、黄金集和本地安全证据。", gate: "当前完成：仅 SIMULATED 本地验证。" }, { title: "Sandbox", detail: "接入获批只读 Policy / Claims History / Fraud Adapter。", gate: "端到端失败、超时、审计与人工队列可验证。" }, { title: "Controlled pilot", detail: "以带 Ground Truth 的代表性数据进行影子或小流量验证。", gate: "业务、合规与模型风险负责人共同评审。" }
  ] },
  roleDeliverables: { title: "案例交付物", roleItems: ["业务边界与 Decision Contract", "Dify Workflow 预检", "Golden Set 与本地回归", "证据包与案例页面"], deliverables: ["CASE_BRIEF", "Workflow Audit", "Golden Set", "Eval Summary", "POC Report"], reportLink: "poc/reports/POC_REPORT.md", workflowLink: "poc/dify/insurance_claims_workflow.yml", repoLink: "poc/tests/run_eval.py" }
};
