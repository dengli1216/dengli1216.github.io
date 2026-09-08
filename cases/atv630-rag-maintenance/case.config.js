export const caseConfig = {
  mount: "#case",
  meta: { id: "atv630-rag-maintenance", language: "zh-CN", title: "AI 设备运维知识助手" },
  hero: {
    eyebrow: "DIFY NATIVE RAG · POC IN PREPARATION",
    title: "AI 设备运维知识助手",
    subtitle: "面向 Schneider Electric Altivar Process ATV630 的可追溯故障辅助决策 RAG POC：有证据才回答，缺信息先补问，危险操作必须升级。当前工作流/API 实测等待本地 Dify 凭据。",
    tags: ["ATV630", "Dify 原生 RAG", "证据约束", "安全升级"], validationStatus: "POC",
    keyMetrics: [{ value: "40", label: "已锁定 Golden Set" }, { value: "8", label: "统一决策状态" }, { value: "0", label: "已声明的虚构 API 指标" }],
    valueChain: { input: "故障码、症状、设备上下文", ai: "范围判断、检索、证据验证", output: "受控诊断建议或拒答", control: "安全 Gate 与人工升级" }
  },
  businessContext: {
    title: "现场排障需要可追溯的辅助，而不是自由问答",
    businessContext: "一线运维人员需要在手册、历史工单与现场信息之间快速定位故障依据，同时避免跨厂商、跨型号或过期建议造成误操作。",
    businessGoal: "把知识定位、证据核验和安全边界前置，帮助工程师形成可复核的检查顺序。",
    targetUsers: ["现场运维工程师", "设备技术支持", "维修班组负责人"],
    pains: ["故障码与症状语言不一致，人工检索耗时", "通用模型可能混淆厂商/型号", "缺少信息或高风险操作不应生成确定性指令"]
  },
  processComparison: {
    title: "从翻找手册到证据约束的辅助闭环",
    before: { summary: "人工在多份资料间检索", steps: ["确认设备、型号与故障码", "搜索手册、FAQ 与旧工单", "凭经验组合检查步骤"], outcome: "引用来源和安全边界难以稳定复核。" },
    after: { summary: "规则负责底线，模型负责理解", steps: ["补齐型号/故障码等必要信息", "按厂商、型号、版本、可信度筛选检索", "验证证据后输出检查建议或受控拒答"], outcome: "无证据、冲突和危险请求均有明确去向。" }
  },
  solution: {
    title: "Dify 原生 RAG 优先的受控工作流",
    description: "不新增独立向量库或 RAG 服务；导入前需根据本地 Dify 版本确认 Hybrid Retrieval、Metadata Filter 与 Rerank 的实际可用性。",
    workflowPlaceholder: "工作流设计已冻结；待连接本地 Dify 后导入、发布并留存真实运行证据。",
    steps: [
      { label: "Query Parser", detail: "提取厂商、型号、故障码与症状。", control: "无关字段不作为结论依据。" },
      { label: "Completeness Gate", detail: "检查型号、故障码/症状等关键上下文。", control: "不足即 NEED_MORE_INFO。", type: "gate" },
      { label: "Scope Gate", detail: "仅接受 Schneider Electric ATV630。", control: "跨品牌/型号冲突受控返回。", type: "gate" },
      { label: "Knowledge Retrieval", detail: "以官方资料优先，按 metadata 过滤。", control: "不允许无检索结果转自由回答。" },
      { label: "Evidence + Safety Gate", detail: "检测无证据、冲突与危险绕过请求。", control: "进入 ABSTAIN、EVIDENCE_CONFLICT 或 SAFETY_ESCALATION。", type: "gate" },
      { label: "Structured Output", detail: "从 retrieval metadata 生成可追溯引用。", control: "Citation Validation 失败不得输出 ANSWER。" }
    ],
    techStack: ["Dify Workflow", "Dify Knowledge", "Hybrid Retrieval（待预检）", "Metadata Filter（待预检）", "Rerank（待预检）"],
    roles: [{ label: "LLM", detail: "理解查询、组织限定答案。" }, { label: "规则", detail: "控制范围、证据、冲突与安全底线。" }, { label: "人工", detail: "复核现场危险操作与最终维修决定。" }]
  },
  evidence: {
    url: "poc/reports/page-evidence.json", title: "已完成测试设计；真实 API 结果尚未生成", description: "页面不把设计目标写成测试结论。指标卡会在真实 Dify 回归后由 page-evidence.json 更新。",
    primaryMetrics: [
      { label: "Golden Set", unit: " 条", sourceKey: "test_design.golden_cases", description: "私有完整集已通过本地合同校验", status: "已验证" },
      { label: "API 成功率", sourceKey: "real_api.metrics.success_rate", description: "等待真实 Dify Workflow API 回归", status: "未验证" },
      { label: "引用有效性", sourceKey: "real_api.metrics.citation_validity", description: "等待真实 retrieval metadata 验证", status: "未验证" },
      { label: "P95 延迟", sourceKey: "real_api.metrics.p95_seconds", unit: " s", description: "等待真实 API 时延采集", status: "未验证" }
    ],
    goldenSet: { total: 40, coverage: ["正常诊断", "精准故障码", "补问", "知识缺失", "跨品牌隔离", "证据冲突", "安全升级", "受控失败"] },
    evidenceNote: "公开材料仅提供来源索引和脱敏覆盖摘要；完整 Golden Set、原始手册和 API 运行记录按发布规则保留在本地私有目录。",
    artifacts: [{ label: "公开证据摘要", href: "poc/reports/page-evidence.json" }, { label: "POC 报告", href: "poc/reports/poc-report.md" }, { label: "知识来源清单", href: "poc/knowledge/corpus-manifest.json" }]
  },
  roi: { type: "summary", title: "以业务基线验证价值，不虚构 ROI", description: "试点阶段可记录故障资料定位耗时、一次排障闭环时长、新人独立处理比例、人工复核比例与错误操作拦截数，再评估商业价值。", dataDisclaimer: "无真实企业基线，不展示金额 ROI。", cards: [{ title: "效率", detail: "比较人工检索与受控证据定位时间。" }, { title: "一致性", detail: "比较 SOP 覆盖与人工复核差异。" }, { title: "安全", detail: "记录高风险请求的正确升级率。" }] },
  riskControls: {
    title: "AI 的价值也在于知道何时不能回答",
    aiDoes: ["基于检索到的官方资料给出有引用的辅助检查建议", "识别信息不足、设备不在范围与证据冲突", "将带电拆修、保护绕过等请求升级处理"],
    aiDoesNot: ["在检索失败时用预训练知识补写诊断", "替代合格人员执行维修或安全判断", "支持 ABB 或其他厂商设备的诊断", "宣称已达成生产可用性、SLA 或 ROI"],
    humanReview: "涉及高压、带电拆修、保护绕过、设备损坏风险或现场条件不明时，必须由合格人员依照现场安全程序处理。",
    fallback: "无证据返回 ABSTAIN；检索/模型异常返回相应错误状态；不会退化为无引用的自由回答。",
    security: "生产前需要补充基于角色的访问控制、知识版本审计、运行日志脱敏、人工复核与变更审批。",
    summary: "当前结论：POC 设计与本地合同测试已完成；真实 Dify Knowledge、Workflow 发布和 API Gate 尚未验证。"
  },
  productionPath: { title: "从 POC 到受控试点", steps: [
    { title: "Dify 预检", detail: "确认本地版本、Provider 与 Knowledge 检索能力。", gate: "Dify 可访问且模型/Embedding 可用" },
    { title: "真实 API 回归", detail: "运行 40 条私有 Golden Set，保留脱敏汇总。", gate: "核心 POC Gate 达标" },
    { title: "现场影子验证", detail: "使用经授权的脱敏工单，由专家复核。", gate: "覆盖率、拒答与安全升级可接受" },
    { title: "生产准入", detail: "接入权限、审计、版本治理和现场 SOP。", gate: "责任边界、监控与回退验证完成" }
  ] },
  roleDeliverables: { title: "案例交付物", roleItems: ["知识语料与 metadata 规范", "Dify 原生 RAG 工作流设计", "40 条 Golden Set 与回归工具", "页面证据与生产化路径"], deliverables: ["Case Spec", "Corpus Manifest", "Golden Set Summary", "Regression Runner", "POC Report"], reportLink: "poc/reports/poc-report.md", workflowLink: "poc/dify/atv630-maintenance-assistant.review-required.yml", repoLink: "poc/tests/run_eval.py" }
};
