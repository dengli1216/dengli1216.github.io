window.translations = {
  zh: {
    brand: '应用案例作品集', 'nav.cases': '案例', 'nav.approach': '定位', 'nav.github': '代码仓库 ↗',
    'hero.eyebrow': '面向真实业务场景的 AI 解决方案与应用案例', 'hero.title': 'AI 应用\n案例作品集', 'hero.lead': '从业务需求出发，设计并验证可落地的 AI 解决方案。', 'hero.copy': '聚焦需求分析、工作流设计、RAG / Agent 应用、POC 验证与业务价值评估，展示 AI 能力如何转化为可体验、可验证、可实施的业务应用。', 'hero.cases': '查看案例 ↓', 'hero.approach': '作品集定位',
    'categories.eyebrow': '能力地图', 'categories.title': '四类可落地的 AI 方向。', 'cases.eyebrow': '精选案例', 'cases.title': '从技术能力到业务价值。', 'cases.copy': '每个案例均从场景、体验、技术实现与商业价值四个维度组织。', 'approach.eyebrow': '作品集定位', 'approach.title': '从业务需求，到 AI 解决方案落地', 'approach.copy': '聚焦真实业务场景，将需求分析、AI 能力设计、工作流、POC 验证与业务价值评估串联成完整解决方案，并探索全流程落地应用。', 'cat.1.title': '行业解决方案', 'cat.1.copy': '围绕保险、教育、销售与售前等真实业务，设计可验证的 AI 应用原型。', 'cat.1.tags': '保险 · 教育 · 销售', 'cat.2.title': 'RAG 知识库', 'cat.2.copy': '覆盖文档上传、内容切分、检索问答、引用溯源及知识库界面的完整体验设计。', 'cat.2.tags': '知识库问答界面', 'cat.3.title': 'AI 智能体工作流', 'cat.3.copy': '展示任务拆解、工具调用、流程编排、状态流转与执行链路可视化。', 'cat.3.tags': '智能体工作流可视化', 'cat.4.title': 'AI 视觉交互', 'cat.4.copy': 'MediaPipe、摄像头、Canvas 与 WebGL 驱动的手势、姿态及无接触交互原型。', 'cat.4.tags': '手势导购 · 工业产品交互', 'approach.1': '业务理解：识别值得 AI 介入的核心问题、业务目标与关键约束', 'approach.2': '方案设计：将模型能力嵌入真实业务流程，设计人机协作、系统边界与输入输出链路', 'approach.3': 'POC 验证：通过工作流、测试数据与关键指标验证技术及业务可行性', 'approach.4': '应用落地：围绕 RAG、Agent、API 与业务系统集成，设计可实现的技术架构、调用链路与工程方案', 'approach.5': '价值评估：从效率、质量、风险、成本与 ROI 判断方案的投入价值', footer: 'AI 应用案例作品集', backTop: '返回顶部 ↑', 'card.view': '在线体验', 'card.detail': '查看详情', 'status.live': '已上线', 'status.progress': '开发中'
  },
  en: {
    brand: 'CASE PORTFOLIO', 'nav.cases': 'Cases', 'nav.approach': 'Approach', 'nav.github': 'GitHub ↗',
    'hero.eyebrow': 'BUSINESS-FIRST AI SOLUTIONS & CASES', 'hero.title': 'AI Application Case Portfolio', 'hero.lead': 'Designing and validating practical AI solutions from real business needs.', 'hero.copy': 'Focused on discovery, workflow design, RAG and agent applications, POC validation, and business-value assessment—turning AI capabilities into testable applications.', 'hero.cases': 'Explore cases ↓', 'hero.approach': 'Portfolio approach',
    'categories.eyebrow': 'CAPABILITY MAP', 'categories.title': 'Four practical AI directions.', 'cases.eyebrow': 'SELECTED WORK', 'cases.title': 'From capability to business value.', 'cases.copy': 'Each case connects the scenario, experience, implementation, and business value.', 'approach.eyebrow': 'PORTFOLIO APPROACH', 'approach.title': 'From business needs to practical AI solutions', 'approach.copy': 'Connecting discovery, AI capability design, workflows, POC validation, and business-value assessment into complete, implementable solutions.', 'cat.1.title': 'Industry Solutions', 'cat.1.copy': 'Designing testable AI prototypes for real insurance, education, sales, and presales workflows.', 'cat.1.tags': 'Insurance · Education · Sales', 'cat.2.title': 'RAG Knowledge Base', 'cat.2.copy': 'End-to-end experience design for document intake, retrieval, cited answers, and knowledge interfaces.', 'cat.2.tags': 'Knowledge-answer UI', 'cat.3.title': 'AI Agent Workflows', 'cat.3.copy': 'Visualizing task decomposition, tool calls, orchestration, state changes, and execution paths.', 'cat.3.tags': 'Agent workflow visualization', 'cat.4.title': 'AI Visual Interaction', 'cat.4.copy': 'Gesture, pose, and touch-free interaction prototypes powered by MediaPipe, cameras, Canvas, and WebGL.', 'cat.4.tags': 'Gesture retail · Industrial product explorer', 'approach.1': 'Business understanding: identify the core problem, outcomes, and constraints where AI can help.', 'approach.2': 'Solution design: embed model capabilities in real workflows with clear human and system boundaries.', 'approach.3': 'POC validation: test technical and business feasibility with workflows, test data, and key metrics.', 'approach.4': 'Implementation: design practical architectures, integration paths, and engineering plans across RAG, agents, APIs, and business systems.', 'approach.5': 'Value assessment: evaluate efficiency, quality, risk, cost, and ROI.', footer: 'AI Application Case Portfolio', backTop: 'Back to top ↑', 'card.view': 'Live demo', 'card.detail': 'View details', 'status.live': 'Live', 'status.progress': 'In Progress'
  }
};

const cases = [
  { href: 'cases/ai-tender-evaluator/', live: true, zh: ['AI 招投标方案评审助手', '行业解决方案', '将冗长招标文件转为结构化要求、响应风险与可执行补强建议。', ['招投标评审', 'Dify 工作流', '结构化输出']], en: ['AI Tender Proposal Evaluator', 'Industry Solutions', 'Turn tender documents into structured requirements, risks, and action items.', ['Tender Review', 'Dify Workflow', 'Structured Output']] },
  { href: 'cases/ai-solution-copilot/', live: true, zh: ['AI 需求解决方案分析助手', 'AI 解决方案工作流', '以证据契约、阶段 Gate 与人工复核，将 Intake 转为可审计的方案分析候选。', ['Dify Workflow', 'Decision Contract', 'POC 证据']], en: ['AI Solution Copilot', 'AI Solution Workflow', 'Turn Intake into auditable solution-analysis candidates with gates and human review.', ['Dify Workflow', 'Decision Contract', 'POC Evidence']] },
  { href: 'cases/gesture-ai-product-explorer/', demoHref: 'cases/gesture-ai-product-explorer/demo.html', live: true, visual: true, zh: ['AI 手势工业产品交互', 'AI 手势工业产品交互', '基于视觉 AI 和手势识别，实现工业产品 3D 拆解、旋转、缩放和价值展示的交互式售前原型。', ['Vision AI', 'MediaPipe', 'Three.js']], en: ['Gesture AI Industrial Product Explorer', 'AI Visual Interaction', 'A visual-AI prototype for exploring industrial products through 3D explode, rotation, zoom, and value stories.', ['Vision AI', 'MediaPipe', 'Three.js']] },
  { href: 'cases/rag-knowledge-ui/', zh: ['RAG 知识库界面', 'RAG 知识库', '让企业知识检索、答案引用与内容溯源变得清晰可用。', ['RAG', '界面原型', '引用溯源']], en: ['RAG Knowledge UI', 'RAG Knowledge Base', 'Knowledge retrieval with citations and traceability.', ['RAG', 'UX Prototype', 'Citations']] },
  { href: 'cases/ai-agent-workflow/', zh: ['AI 智能体工作流', 'AI 智能体工作流', '将复杂任务的分解、执行状态与工具链路可视化。', ['AI 智能体', '工作流', '状态界面']], en: ['AI Agent Workflow', 'AI Agent Workflow', 'Visualize task state and tool execution paths.', ['AI Agent', 'Workflow', 'State UI']] },
  { href: 'cases/hand-gesture-store/', visual: true, zh: ['手势互动导购', 'AI 视觉交互', '将手势识别转化为无接触商品浏览与互动导购体验。', ['MediaPipe', '摄像头', 'Canvas']], en: ['Hand Gesture Store', 'AI Visual Interaction', 'Touch-free product browsing and interactive guidance.', ['MediaPipe', 'Web Camera', 'Canvas']] },
];
const grid = document.querySelector('#case-grid');
function renderCases() {
  const lang = window.portfolioLanguage();
  grid.innerHTML = cases.map((item) => {
    const [title, category, summary, tags] = item[lang];
    const status = item.live ? window.t('status.live') : window.t('status.progress');
    const action = item.demoHref
      ? `<a class="case-view-hint" href="${item.demoHref}" aria-label="${title}：${window.t('card.view')}">${window.t('card.view')} →</a>`
      : `<span class="case-view-hint">${window.t(item.visual ? 'card.view' : 'card.detail')} →</span>`;
    return `<article class="case-card" data-case-link="${item.href}" tabindex="0" role="link" aria-label="${title}"><div class="case-top"><span class="case-category">${category}</span><span class="status ${item.live ? 'available' : 'in-progress'}">${status}</span></div><h3>${title}</h3><p>${summary}</p><div class="tags">${tags.map((tag) => `<span class="tag">${tag}</span>`).join('')}</div><div class="case-actions">${action}</div></article>`;
  }).join('');
  document.querySelectorAll('[data-case-link]').forEach((card) => {
    const open = () => { location.href = new URL(card.dataset.caseLink, location.href).pathname + '?lang=' + lang; };
    card.addEventListener('click', (event) => { if (!event.target.closest('a, button')) open(); });
    card.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); } });
  });
}
renderCases();
window.addEventListener('portfolio-language-changed', renderCases);
const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();
