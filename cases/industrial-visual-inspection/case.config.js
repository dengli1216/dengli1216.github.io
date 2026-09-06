export const industrialVisualInspectionCase = {
  mount: "#case",
  meta: {
    id: "industrial-visual-inspection",
    language: "zh-CN",
    title: "AI 工业视觉巡检 POC"
  },
  hero: {
    eyebrow: "AI 工业视觉巡检 POC",
    title: "面向存量工业设备的低改造视觉巡检与异常处置",
    subtitle: "利用巡检图像识别设备状态，在无需改造 PLC 或设备本体的情况下，将人工巡检信息转化为结构化风险判断；不确定时自动进入人工复核。",
    tags: ["存量设备低改造", "AI 风险分流", "人工复核兜底"],
    validationStatus: "CONTROLLED_LOOP_VALIDATED",
    heroVisual: {
      src: "poc/data/golden/contact-sheet.jpg",
      width: 1600,
      height: 1000,
      alt: "工业视觉巡检 POC 的 12 张合成测试图拼图。"
    },
    heroCaption: "12 张合成测试图；用于 POC 验证，不代表真实生产数据。"
  },
  businessValue: {
    title: "为什么值得用 AI 改造巡检流程？",
    cards: [
      { title: "存量设备难数字化", detail: "部分老旧设备缺少可直接接入的数据接口，现场仍依赖人工巡检和抄录。" },
      { title: "传统改造成本高", detail: "更换仪表、增加传感器或改造 PLC 往往涉及硬件投入、停机和实施周期。" },
      { title: "视觉 AI 提供渐进式路径", detail: "先利用已有巡检图像完成状态结构化、风险分流和人工复核，再逐步接入相机、机器人和运维系统。" }
    ],
    targetScenario: "存量设备多、人工巡检重、设备改造成本高的工业现场。",
    suitableFor: ["已有巡检图片或可部署低成本采集设备", "需要先验证异常分流与人工复核闭环"],
    notSuitableFor: ["要求直接替代人工读表", "缺少专家复核 Golden Set 的生产准确率验收"]
  },
  solution: {
    title: "从巡检图像到异常处置，而不是只做“自动读表”",
    flow: [
      { id: "input", label: "图像 + 设备信息", detail: "巡检图片、设备类型、点位规则与期望阈值。", type: "input" },
      { id: "ai", label: "AI 视觉模型识别", detail: "识别目标、读数/状态、图像质量与不确定性。", type: "ai" },
      { id: "gate", label: "不确定性门控", detail: "低置信、遮挡、反光、目标不匹配时停止自动判断。", type: "gate" },
      { id: "decision", label: "规则引擎判断", detail: "把视觉观察与业务规则分离，输出异常与建议动作。", type: "decision" },
      { id: "human", label: "人工复核", detail: "高风险、不确定或异常样本进入人工确认。", type: "human" },
      { id: "action", label: "SOP / 工单", detail: "目标集成；当前 POC 仅模拟处置动作。", type: "action", note: "目标集成 / POC 模拟" }
    ],
    roles: [
      { label: "视觉模型", detail: "负责“看见什么”" },
      { label: "规则引擎", detail: "负责“业务怎么判断”" },
      { label: "人工复核", detail: "负责“高风险是否确认”" }
    ]
  },
  evidence: {
    url: "portfolio-evidence.json",
    title: "小样本先验证安全闭环，而不是追求漂亮准确率",
    primaryMetrics: [
      { label: "API 成功", value: null, unit: "", description: "完整 12 图调用成功", type: "stability", sourceKey: "final_regression.api_success" },
      { label: "Schema 合规", value: null, unit: "", description: "输出结构稳定", type: "schema_compliance", sourceKey: "final_regression.schema_compliance" },
      { label: "Unsafe Guess", value: null, unit: "", description: "不可靠读数不强行猜测", type: "safety", sourceKey: "final_regression.unsafe_guess_count" },
      { label: "人工复核 Gate", value: null, unit: "", description: "高风险样本进入复核", type: "human_review", sourceKey: "final_regression.review" }
    ],
    secondaryMetrics: [
      { label: "Reading", description: "读数/状态匹配", type: "reading_quality", sourceKey: "final_regression.reading" },
      { label: "Anomaly", description: "异常判断匹配", type: "decision_quality", sourceKey: "final_regression.anomaly" },
      { label: "Critical", description: "困难样本仍保留边界", type: "critical_recall", sourceKey: "final_regression.critical_pass" },
      { label: "P95", unit: "ms", description: "最终回归延迟", type: "latency", sourceKey: "final_regression.latency_ms.p95" }
    ],
    evidenceNote: "困难样本未通过时优先停止自动判断并转人工，而不是输出高置信度错误结论。",
    datasetSummary: "12 张 synthetic_generated POC 图；不能外推真实生产准确率。",
    evidenceSource: "portfolio-evidence.json + poc/reports/poc-final-report.md + Golden Set"
  },
  decisionBoundary: {
    title: "POC 已证明什么，尚未证明什么",
    description: "明确边界，是决定是否继续投入真实现场试点的重要依据。",
    verifiedCapabilities: ["多模态视觉语义理解", "结构化 Schema 输出", "规则引擎", "不确定性 / 主动停止判断", "人工复核门控", "视觉读数与业务异常分离"],
    notProvenItems: ["真实生产准确率", "真实现场泛化能力", "Direct OCR", "Analog Gauge 专用读数", "机器人接入", "真实 CMMS / EAM 集成"],
    decisionSummary: "当前结论是 CONTROLLED_LOOP_VALIDATED：可继续进入真实图片 Golden Set 与影子运行，不应作为生产自动判定能力宣传。"
  },
  productionPath: {
    title: "从 POC 到真实现场，只推进三步",
    steps: [
      { title: "真实现场试点", detail: "采集 50-100 张真实巡检图，建立专家复核 Golden Set。", gate: "专家标签冻结，覆盖低光、遮挡、反光和多目标样本。" },
      { title: "影子运行", detail: "先旁路现有人工巡检流程，持续验证错误、漏检和人工复核比例。", gate: "unsafe guess、critical recall、review rate 达到业务门槛。" },
      { title: "企业系统集成", detail: "根据验证结果再接入固定相机 / 巡检机器人，以及 CMMS / EAM / 工单系统。", gate: "完成告警责任边界、SOP 与人工确认流程。" }
    ]
  },
  roleDeliverables: {
    title: "我在这个 POC 中完成了什么",
    roleItems: ["AI 解决方案设计", "POC 架构设计", "POC Workflow 设计", "Golden Set 设计", "模型评估", "安全门控设计", "回归测试"],
    deliverables: ["POC Workflow", "12 图 Golden Set", "Evaluation Runner", "POC Metrics", "Architecture Decision", "Production Roadmap"],
    reportLink: "poc-report.html"
  },
  customSections: [
    {
      id: "roi",
      type: "roi",
      fullBleed: true,
      order: 40,
      kicker: "04 / ROI 测算框架",
      title: "如果进入真实现场，商业价值来自哪里？",
      description: "以下为 ROI 测算框架，不属于当前 POC 的实测收益。真实 ROI 需要结合现场巡检频次、人力成本、设备数量、停机损失和硬件方案计算。",
      data: {
        cards: [
          { title: "人工巡检效率", detail: "减少重复抄表、记录、整理时间。" },
          { title: "异常发现提前量", detail: "通过更高频巡检和自动分流降低漏检 / 延迟风险。" },
          { title: "设备改造成本", detail: "对部分存量资产可先使用外部视觉采集，避免一次性全面更换传感器 / PLC。" }
        ],
        formulas: [
          { label: "年度收益", value: "人工时间节省 + 风险损失降低 + 延缓 / 减少设备改造投入" },
          { label: "年度成本", value: "AI 推理 + 采集硬件 + 系统集成 + 运维" },
          { label: "ROI", value: "（年度收益 - 年度成本）/ 年度成本" }
        ]
      }
    }
  ],
  report: {
    title: "工业视觉巡检 POC 最终报告",
    subtitle: "以图像、设备信息、语义视觉模型、确定性规则与人工复核组成受控判断闭环。",
    businessProblem: "本报告验证的是安全分流闭环，不是生产级自动读表。范围限定为 12 张 synthetic_generated 测试图，覆盖 analog gauge、digital display、control panel/state、多目标、低光、反光、遮挡和规则不匹配。",
    scopeCards: [
      { title: "业务问题", detail: "工业巡检图像同时包含仪表读数、控制面板状态、设备标识、反光、低光、遮挡和多目标竞争。" },
      { title: "POC Scope", detail: "12 张合成测试图；目标是验证结构化视觉输出、Schema、规则引擎、不确定性与人工复核门控。" },
      { title: "Golden Set", detail: "Golden Set 已完成人工审查：confirmed=3、corrected=9、pending=0。" }
    ],
    architectureNote: "视觉模型负责 target identification、readability、visual observation、uncertainty；Rule Engine 负责 metric/rule compatibility、anomaly、review_required、recommended_action。",
    metricsDescription: "冻结的 POC 集；仅用于受控验证。",
    boundaryDescription: "HTML report 是可读展示层；原始 Markdown、JSON、Golden Set 和 runner 继续作为工程 evidence。",
    recommendation: "维持已验证的“图像 + 设备信息 -> 语义视觉模型 -> 确定性规则引擎 -> 人工复核”闭环，短期不接入未证明模块。",
    sourceReportLink: "poc/reports/poc-final-report.md",
    evidenceArtifacts: ["portfolio-evidence.json", "poc/reports/poc-final-report.md", "poc/tests/golden-set.json", "poc/tests/run_eval.py"],
    customSections: [
      {
        id: "report-roi",
        type: "roi",
        order: 40,
        kicker: "ROI / 商业测算",
        title: "ROI / 商业测算框架",
        description: "不是当前 POC 的实测收益；这些参数需在真实客户 discovery / site survey 阶段获取。",
        data: {
          cards: [
            { title: "现场输入", detail: "巡检点数量、每日巡检次数、单次人工巡检时长、人力成本。" },
            { title: "辅助比例", detail: "系统可辅助处理的步骤、人工复核比例和异常提前发现价值。" },
            { title: "年度成本", detail: "AI 推理、采集硬件、系统集成和运维成本。" }
          ],
          formulas: [
            { label: "年度收益", value: "人工时间节省 + 风险损失降低 + 延缓 / 减少设备改造投入" },
            { label: "年度成本", value: "AI 推理 + 采集硬件 + 系统集成 + 运维" },
            { label: "ROI", value: "（年度收益 - 年度成本）/ 年度成本" }
          ]
        }
      }
    ]
  }
};
