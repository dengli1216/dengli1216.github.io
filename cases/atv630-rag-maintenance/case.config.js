export const caseConfig = {
  mount: "#case",
  meta: { id: "atv630-rag-maintenance", language: "zh-CN", title: "AI 设备运维知识助手" },
  hero: {
    eyebrow: "DIFY NATIVE RAG · POC VALIDATED",
    title: "AI设备运维知识助手",
    subtitle: "面向 Schneider Electric（施耐德电气） Altivar Process ATV630 变频器的可追溯故障辅助决策 RAG POC：有证据才回答，缺信息先补问，危险操作必须升级。38 条真实 API 与 2 条受控异常回归已通过。",
    tags: ["ATV630", "Dify 原生 RAG", "证据约束", "安全升级"], validationStatus: "POC",
    keyMetrics: [{ value: "40/40", label: "Golden Set 通过" }, { value: "100%", label: "Schema / 决策" }, { value: "18.672 s", label: "P95 延迟" }],
    valueChain: { input: "故障码、症状、设备上下文", ai: "范围判断、RAG检索、证据验证", output: "受控诊断建议或拒答", control: "安全 Gate 与人工升级" }
  },
  businessContext: {
    title: "现场排障需要可追溯的证据约束",
    businessContext: "一线运维人员需要在手册、历史工单与现场信息之间快速定位故障依据，同时避免跨厂商、跨型号或过期建议造成误操作。",
    businessGoal: "把知识定位、证据核验和安全边界前置，帮助工程师形成可复核的检查顺序。",
    targetUsers: ["现场运维工程师", "设备技术支持", "维修班组负责人"],
    pains: ["故障码与症状语言不一致，人工检索耗时", "通用模型可能混淆厂商/型号", "缺少信息或高风险操作不应生成确定性指令"]
  },
  processComparison: {
    title: "从翻找手册到证据约束的辅助闭环",
    before: { summary: "人工在多份资料间检索", steps: ["确认设备、型号与故障码", "搜索手册、FAQ 与旧工单", "凭经验组合检查步骤"], outcome: "引用来源和安全边界难以稳定复核。" },
    after: { summary: "规则负责底线，模型负责理解", steps: ["补齐型号/故障码等必要信息", "按厂商、型号、版本、可信度从公司维修知识库筛选检索", "验证证据后输出检查建议或无证据受控拒答"], outcome: "无证据、冲突和危险请求均有明确去向。" }
  },
  solution: {
    title: "Dify 原生 RAG 知识库受控工作流",
    description: "从问题识别、知识检索、证据校验到安全与异常 Gate，工作流确保 AI 只在有可靠依据时给出诊断建议。",
    workflowImage: {
      src: "assets/ATV630 RAG POC-whole-workflow.png",
      alt: "AI 设备运维知识助手的完整 Dify 工作流，包含知识检索、LLM、状态归一化与输出节点。",
      caption: "点击放大；移动端可左右滑动查看完整工作流"
    }
  },
  evidence: {
    url: "poc/reports/page-evidence.json", title: "真实 API 回归已完成", description: "38 条真实 Dify API 与 2 条受控异常回归通过",
    primaryMetrics: [
      { label: "Golden Set", unit: " 条", sourceKey: "test_design.golden_cases", description: "完整样本测试集已通过本地校验", status: "已验证" },
      { label: "API 成功率", sourceKey: "real_api.metrics.success_rate", description: "38 条真实 Dify Workflow API", status: "已验证" },
      { label: "引用有效性", sourceKey: "real_api.metrics.citation_validity", description: "答案仅输出实际召回元数据派生引用", status: "已验证" },
      { label: "P95 延迟", sourceKey: "real_api.metrics.p95_seconds", unit: " s", description: "真实 API 时延采集", status: "已验证" }
    ],
    goldenSet: { total: 40, coverage: ["正常诊断", "精准故障码", "补问", "知识缺失", "跨品牌隔离", "证据冲突", "安全升级", "受控失败"] },
    evidenceNote: "公开材料仅提供来源索引和脱敏覆盖摘要；完整 Golden Set、原始手册和 API 运行记录按发布规则保留在本地私有目录。",
    artifacts: [{ label: "公开证据摘要", href: "poc/reports/page-evidence.json" }, { label: "POC 报告", href: "poc/reports/poc-report.md" }, { label: "知识来源清单", href: "poc/knowledge/corpus-manifest.json" }]
  },
  roi: {
    type: "calculator",
    calculatorMode: "maintenance",
    currency: "¥",
    title: "设备运维知识助手 ROI 估算",
    description: "根据查询量、耗时、人力结构与覆盖率，快速估算知识查询环节可节省的工时与人力成本。",
    dataDisclaimer: "以上结果基于当前输入参数估算，用于 POC 商业价值测算，不代表实际生产收益。",
    scenarios: {
      conservative: { volume: 50, currentMinutes: 20, aiMinutes: 5, seniorRate: 35, seniorHourlyCost: 100, generalHourlyCost: 85, coverage: 45 },
      baseline: { volume: 100, currentMinutes: 25, aiMinutes: 7, seniorRate: 40, seniorHourlyCost: 150, generalHourlyCost: 95, coverage: 55 },
      optimistic: { volume: 200, currentMinutes: 30, aiMinutes: 10, seniorRate: 45, seniorHourlyCost: 200, generalHourlyCost: 105, coverage: 65 }
    }
  },
  riskControls: {
    title: "AI 的价值、风险边界与人工控制",
    aiDoes: ["基于检索到的官方设备资料给出有引用的辅助检查建议", "识别信息不足、设备不在范围与证据冲突", "将带电拆修、保护绕过等请求升级处理"],
    aiDoesNot: ["在检索失败时用预训练知识补写诊断、避免结果不严谨", "替代合格人员执行维修或安全判断", "引用其他厂商设备的诊断", "宣称已达成生产可用性"],
    humanReview: "涉及高压、带电拆修、保护绕过、设备损坏风险或现场条件不明时，必须由合格人员依照现场安全程序处理。",
    fallback: "无证据返回 ABSTAIN；检索/模型异常返回相应错误状态；不会退化为无引用的自由回答（确保输出有依据）。",
    security: "生产前需要补充角色的权限访问控制、知识版本审计、运行日志脱敏、人工复核与变更审批。",
    // summary: "当前结论：POC 已完成真实 API 回归；生产准入仍需现场影子验证、权限治理与审计。"
  },
  productionPath: { title: "从 POC 到生产化", steps: [
    { title: "Dify 预检", detail: "确认本地版本、Provider 与 Knowledge 检索能力。", gate: "Dify 可访问且模型/Embedding 可用" },
    { title: "真实 API 回归", detail: "运行 40 条私有 Golden Set，保留脱敏汇总。", gate: "核心 POC Gate 达标" },
    { title: "现场影子验证", detail: "使用经授权的脱敏工单", gate: "覆盖率、拒答与安全升级可接受" },
    { title: "生产准入", detail: "接入权限、审计、版本治理和现场 SOP。", gate: "责任边界、监控与回退验证完成" }
  ] },
  roleDeliverables: {
    title: "案例交付物",
    roleItems: ["需求痛点分析","AI 接入判断 & 解决方案设计", "设备知识库语料与元数据规范", "Dify 原生 RAG 工作流设计", "40条黄金测试样本集设计与回归测试", "poc设计 & 页面证据与生产化路径"],
    deliverables: ["解决方案报告", "基于生产数据的黄金样本集", "测试脚本 & 测试数据证据包", "POC报告", "可演示的Dify RAG 工作流", "ROI计算器"],
  }
};
