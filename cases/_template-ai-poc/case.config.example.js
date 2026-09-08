// 复制此文件后，仅填写已有证据支持的内容；所有新增字段均为 optional，缺失时对应模块会自动隐藏。
export const caseConfig = {
  mount: "#case",
  meta: {
    id: "replace-with-case-id",
    language: "zh-CN",
    title: "AI POC 案例标题"
  },
  hero: {
    eyebrow: "AI POC 案例",
    title: "用一句话说明已验证的业务价值",
    subtitle: "说明目标用户、AI 改变的业务环节及当前 POC 边界，控制在一到两句。",
    tags: ["业务标签", "能力标签", "人工受控"],
    // 仅放 POC 实测或可明确追溯的指标；无数据时删除整个 keyMetrics。
    keyMetrics: [
      { value: "28 / 28", label: "可执行测试" },
      { value: "100%", label: "契约通过率" },
      { value: "6 × 3", label: "关键案例稳定性" }
    ],
    validationStatus: "POC_GATE_PASSED",
    // 右侧业务结果摘要；没有真实图片时，用这组业务链路补足 Hero 信息密度。
    valueChain: {
      input: "业务单据、图片、文档或工单",
      ai: "识别、检索、判断与分流",
      output: "风险等级、建议或异常结果",
      control: "人工复核、审计与安全降级"
    }
    // heroVisual: { src: "assets/hero.png", width: 1600, height: 1000, alt: "案例关键业务场景" }
  },

  // 01：业务背景 / 核心痛点。新字段；未配置时会兼容旧 businessValue。
  businessContext: {
    title: "为什么这个场景值得做？",
    businessContext: "用一句话说明当前流程、业务规模或决策背景。",
    pains: ["痛点一：人工处理耗时且标准不一致", "痛点二：高风险案例难以及时分流", "痛点三：现有系统缺少结构化判断输入"],
    targetUsers: ["一线业务人员", "审核人员", "运营负责人"],
    businessGoal: "在不替代业务决策的前提下，缩短初筛时间并提高问题发现的可追溯性。"
  },

  // 02：传统流程 vs AI 辅助流程。只强调业务变化，不重复描述模型能力。
  processComparison: {
    title: "AI 插入流程后，业务改变了什么？",
    before: {
      summary: "人工收集、判断与转交串行发生",
      steps: ["人工读取材料并整理信息", "凭经验完成初步判断", "高风险与普通案例混在同一队列"],
      outcome: "耗时集中在重复整理，关键案例的处理优先级不稳定。"
    },
    after: {
      summary: "AI 先结构化和分流，人工处理关键判断",
      steps: ["AI 提取信息并校验输出结构", "规则与阈值决定风险分流", "不确定和高风险案例进入人工复核"],
      outcome: "人工注意力转向需要专业判断的案例，且每一步可追溯。"
    }
  },

  // 03：AI 解决方案。steps 建议 3-6 步；每步可写 input / process / output / control，也兼容旧 flow 字段。
  solution: {
    title: "受控的 AI 业务辅助闭环",
    description: "AI 负责提取与建议，规则、人工审核和降级机制共同控制业务风险。",
    // 有真实 Dify 工作流时替换为 workflowImage: "assets/workflow.png"，并可配置 workflowAlt。
    workflowPlaceholder: "工作流图片占位 · 后续替换真实 Dify Workflow",
    steps: [
      { label: "业务输入", detail: "接收文档、图片、表单或用户请求。", control: "缺字段或超出范围直接返回。" },
      { label: "AI 提取与归纳", detail: "识别关键信息并生成结构化草稿。", control: "不得直接输出业务决策。" },
      { label: "规则校验与分流", detail: "检查约束和风险信号，生成建议队列。", control: "规则是业务分流的唯一来源。" },
      { label: "人工复核与动作", detail: "审核高风险或低置信案例并确认动作。", control: "人工可覆盖 AI 建议并保留审计记录。" }
    ],
    techStack: ["LLM", "RAG", "规则引擎", "API"],
    roles: [
      { label: "AI", detail: "提取、归纳和生成建议" },
      { label: "规则", detail: "校验边界并完成确定性分流" },
      { label: "人工", detail: "确认高风险业务判断" }
    ]
  },

  // 04：POC 验证与真实证据。不要把路由一致率、黄金集一致率写成“AI 准确率”。
  evidence: {
    url: "evidence.example.json",
    title: "POC 验证了受控闭环，而非生产准确率",
    primaryMetrics: [
      { label: "可执行测试", value: "28 / 28", description: "已发布 API 完成全部可执行回归", status: "已验证" },
      { label: "流程回归成功率", value: "100%", description: "流程可稳定完成端到端调用", status: "已验证" },
      { label: "输出契约 / Schema", value: "100%", description: "输出满足预定义结构约束", status: "已验证" },
      { label: "关键案例稳定性", value: "6 × 3", description: "关键样本重复运行无路由漂移", status: "已验证" }
    ],
    secondaryMetrics: [
      { label: "失败数", value: "0", description: "本轮可执行回归未出现失败", status: "已验证" },
      { label: "延迟 P95", unit: "ms", description: "端到端延迟；未测时显示未验证", sourceKey: "final_regression.latency_ms.p95", status: "限制条件" },
      { label: "单次成本", description: "仅在已测量时展示", sourceKey: "final_regression.cost", status: "未验证" }
    ],
    goldenSet: {
      total: 30,
      executable: 28,
      critical: 6,
      repeat: "6 × 3",
      coverage: ["正常低 / 中 / 高路由", "阈值附近边界", "缺字段 / 非法字段", "未知字段", "越界业务输入", "关键高风险组合", "模型异常 / 安全降级", "重复执行稳定性"]
    }
  },

  // 05：ROI 支持 summary | calculator | hidden。calculator 为可直接修改的示例测算，不代表真实客户收益。
  roi: {
    type: "calculator",
    currency: "¥",
    title: "用真实业务数据判断，是否值得上线",
    description: "POC 已验证流程可行性；以下参数应在小范围试点阶段替换为真实业务数据。",
    dataDisclaimer: "示例测算 / 非真实客户数据",
    cards: [
      { title: "人工时间", detail: "替换月业务量、单件时长与人工成本。" },
      { title: "风险与质量", detail: "结合关键业务占比，规划人工复核队列。" },
      { title: "成本与收益", detail: "将系统成本与实际节省结合，验证 ROI。" }
    ],
    scenarios: {
      conservative: { volume: 2000, minutes: 10, hourlyCost: 55, reduction: 22, highRiskRate: 8, systemCost: 8000 },
      baseline: { volume: 3000, minutes: 12, hourlyCost: 60, reduction: 40, highRiskRate: 10, systemCost: 12000 },
      optimistic: { volume: 4500, minutes: 12, hourlyCost: 65, reduction: 55, highRiskRate: 12, systemCost: 18000 }
    }
  },

  // 06：风险、能力边界与人工控制。缺失时兼容旧 decisionBoundary。
  riskControls: {
    title: "AI 提供辅助，不自动替代业务决策",
    aiDoes: ["从材料中提取结构化信息", "基于明确规则提供分流建议", "标出不确定性和需要复核的理由"],
    aiDoesNot: ["独立批准、拒绝或执行高风险业务决策", "将 POC 指标外推为生产准确率", "绕过人工复核、权限或审计流程"],
    humanReview: "高风险、低置信、规则冲突或影响客户权益的结果必须由具备权限的人员确认。",
    fallback: "Schema 不合规、依赖不可用或超过置信边界时，保留原始输入并转入人工队列。",
    security: "生产前需明确访问控制、最小权限、操作日志、数据保留和敏感信息处理规则。",
    summary: "当前 POC 的结论是“受控辅助流程可验证”，不是“已经生产可用”。"
  },

  // 07：POC → 小范围试点 → 生产化。步骤可按实际项目增减。
  productionPath: {
    title: "从 POC 到生产，需要逐阶段降低不确定性",
    steps: [
      { title: "当前 POC", detail: "在冻结测试集上验证流程、输出契约和关键案例稳定性。", gate: "证据链可复跑、可追溯" },
      { title: "真实数据验证", detail: "建立业务专家复核的数据集，验证误差类型和人工复核比例。", gate: "明确适用范围和阈值" },
      { title: "业务旁路 / 小范围试点", detail: "与现有流程并行运行，小范围验证 KPI、ROI 与 SLA。", gate: "异常可控且回退有效" },
      { title: "生产准入", detail: "完成系统集成、权限审计、监控告警和运营 SOP。", gate: "责任边界与长期指标达标" }
    ],
    verified: ["POC 工作流可运行", "输出契约和关键分流可回归验证"],
    nextValidation: ["真实数据泛化能力", "人工复核率、KPI 与 ROI"],
    gaps: ["权限与审计设计", "SLA、监控和故障演练", "生产系统集成与运营 SOP"]
  },

  // 30% 自定义扩展区：cards / walkthrough / architecture / metrics、inputOutput、media / video / screenshots。
  customSections: [
    {
      id: "walkthrough",
      type: "cards",
      order: 80,
      kicker: "案例走读",
      title: "一个关键案例如何被处理？",
      description: "只展示最能说明业务判断的一个例子。",
      data: {
        cards: [
          { title: "输入", detail: "案例材料与必要业务上下文进入流程。" },
          { title: "处理", detail: "AI 提取信息，规则检查风险信号与边界。" },
          { title: "输出", detail: "给出建议队列和证据，由人工完成最终确认。" }
        ]
      }
    }
  ],

  // 可选：案例贡献展示；对外案例不需要时删除整个 roleDeliverables。
  roleDeliverables: {
    title: "项目角色与交付物",
    roleItems: ["AI 解决方案设计", "POC 工作流设计", "评估与证据链设计", "生产化路径规划"],
    deliverables: ["案例方案", "测试集摘要", "评估报告", "风险边界说明", "小范围试点路线图"]
  }
};
