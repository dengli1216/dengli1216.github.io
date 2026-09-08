export const caseConfig = {
  mount: "#case",
  meta: {
    id: "replace-with-case-id",
    language: "zh-CN",
    title: "AI POC 案例标题"
  },
  hero: {
    eyebrow: "AI POC",
    title: "一句话说明解决什么问题",
    subtitle: "说明适合谁、核心价值和验证边界，控制在 1-2 句。",
    tags: ["业务标签", "技术标签", "验证标签"],
    validationStatus: "POC",
    heroVisual: {
      src: "assets/hero-placeholder.png",
      width: 1600,
      height: 1000,
      alt: "替换为真实 hero visual 描述。"
    },
    heroCaption: "说明素材来源和验证边界。"
  },
  businessValue: {
    title: "客户为什么值得做？",
    cards: [
      { title: "Business problem", detail: "当前业务问题和影响。" },
      { title: "Current approach", detail: "传统方案、人工流程或现有系统的限制。" },
      { title: "AI opportunity", detail: "AI 能创造的增量价值，不承诺未验证结果。" }
    ],
    targetScenario: "替换为目标场景。",
    suitableFor: ["适用条件 1", "适用条件 2"],
    notSuitableFor: ["不适用条件 1"]
  },
  solution: {
    title: "方案链路",
    flow: [
      { id: "input", label: "业务输入", detail: "文档、图片、日志、表格或用户请求。", type: "input" },
      { id: "ai", label: "AI 处理", detail: "模型、RAG、Agent、视觉或规则协同。", type: "ai" },
      { id: "decision", label: "业务判断", detail: "结构化输出、评分、分类、推荐或风险判断。", type: "decision" },
      { id: "human", label: "人工确认", detail: "关键结果进入人审、审批或复核。", type: "gate" },
      { id: "action", label: "业务动作", detail: "工单、报告、通知、系统写回或决策支持。", type: "action" }
    ],
    roles: [
      { label: "AI", detail: "负责提取、生成或推理" },
      { label: "规则 / 系统", detail: "负责约束、校验和业务归一化" },
      { label: "Human", detail: "负责高风险决策确认" }
    ]
  },
  evidence: {
    url: "evidence.example.json",
    title: "POC 验证结果",
    primaryMetrics: [
      { label: "Schema 合规", unit: "", description: "输出结构是否稳定", type: "schema_compliance", sourceKey: "final_regression.schema_compliance" },
      { label: "关键召回", unit: "", description: "关键样本是否覆盖", type: "critical_recall", sourceKey: "final_regression.critical_recall" },
      { label: "人工复核", unit: "", description: "高风险样本是否进入复核", type: "human_review", sourceKey: "final_regression.review_gate" }
    ],
    secondaryMetrics: [
      { label: "Latency P95", unit: "ms", description: "端到端延迟", type: "latency", sourceKey: "final_regression.latency_ms.p95" },
      { label: "Cost", unit: "", description: "如未测量则显示未验证", type: "cost", sourceKey: "final_regression.cost" }
    ],
    evidenceNote: "只展示可追溯到 POC report / golden set / eval output 的指标。",
    datasetSummary: "替换为数据集范围、样本量、是否 synthetic、是否真实生产数据。",
    evidenceSource: "evidence.example.json + report.example.md + golden set"
  },
  decisionBoundary: {
    title: "已验证与未验证",
    verifiedCapabilities: ["能力 1", "能力 2"],
    notProvenItems: ["未验证项 1", "未验证项 2"],
    decisionSummary: "说明是否建议进入下一阶段，以及不能外推的边界。"
  },
  productionPath: {
    title: "生产化路径",
    steps: [
      { title: "POC Gate", detail: "冻结评估集并复核 evidence。", gate: "达到核心验收指标。" },
      { title: "Pilot", detail: "进入真实业务小流量或影子运行。", gate: "错误类型可控。" },
      { title: "Integration", detail: "接入业务系统、监控和人工流程。", gate: "责任边界和回滚机制明确。" }
    ]
  },
  roleDeliverables: {
    title: "我的角色与产出",
    roleItems: ["Solution design", "POC workflow", "Evaluation design"],
    deliverables: ["Case brief", "Golden set", "Eval report", "Production roadmap"],
    reportLink: "report.example.md"
  },
  customSections: [
    {
      id: "roi",
      type: "roi",
      order: 40,
      kicker: "04 / ROI",
      title: "ROI / Business Case",
      description: "只有在能说明业务决策时保留。不要把估算写成实测收益。",
      data: {
        cards: [
          { title: "收益来源", detail: "效率、风险、质量或收入侧价值。" },
          { title: "成本来源", detail: "模型、基础设施、集成和运维。" },
          { title: "验证方式", detail: "真实现场需要补充哪些输入。" }
        ],
        formulas: [
          { label: "ROI", value: "（年度收益 - 年度成本）/ 年度成本" }
        ]
      }
    }
  ]
};
