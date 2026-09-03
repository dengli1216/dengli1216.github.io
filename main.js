const data = {
  zh: [
    [
      "AI 招投标方案评审助手",
      "行业解决方案",
      "将冗长招标文件转为结构化要求、响应风险与可执行补强建议。",
      ["招投标评审", "Dify 工作流", "结构化输出"],
      "cases/ai-tender-evaluator/",
      "已上线",
    ],
    [
      "AI 需求解决方案分析助手",
      "AI 解决方案工作流",
      "以证据契约、阶段 Gate 与人工复核，将 Intake 转为可审计的方案分析候选。",
      ["Dify Workflow", "Decision Contract", "POC 证据"],
      "cases/ai-solution-copilot/",
      "已上线",
    ],
    [
      "手势互动导购",
      "AI 视觉交互",
      "将手势识别转化为无接触商品浏览与互动导购体验。",
      ["MediaPipe", "摄像头", "Canvas"],
      "cases/hand-gesture-store/",
      "开发中",
    ],
    [
      "MediaPipe 魔法球",
      "AI 视觉交互",
      "用实时手势与动态视觉，验证互动大屏和品牌活动的参与体验。",
      ["MediaPipe", "JavaScript", "Canvas"],
      "cases/mediapipe-magic-ball/",
      "开发中",
    ],
    [
      "RAG 知识库界面",
      "RAG 知识库",
      "让企业知识检索、答案引用与内容溯源变得清晰可用。",
      ["RAG", "界面原型", "引用溯源"],
      "cases/rag-knowledge-ui/",
      "开发中",
    ],
    [
      "AI 智能体工作流",
      "AI 智能体工作流",
      "将复杂任务的分解、执行状态与工具链路可视化。",
      ["AI 智能体", "工作流", "状态界面"],
      "cases/ai-agent-workflow/",
      "开发中",
    ],
  ],
  en: [
    [
      "Hand Gesture Store",
      "AI Visual Interaction",
      "Touch-free product browsing and interactive guidance.",
      ["MediaPipe", "Web Camera", "Canvas"],
      "cases/hand-gesture-store/",
      "Available",
    ],
    [
      "MediaPipe Magic Ball",
      "AI Visual Interaction",
      "Live gesture-driven visuals for interactive displays.",
      ["MediaPipe", "JavaScript", "Canvas"],
      "cases/mediapipe-magic-ball/",
      "Available",
    ],
    [
      "RAG Knowledge UI",
      "RAG Knowledge Base",
      "Knowledge retrieval with citations and traceability.",
      ["RAG", "UX Prototype", "Citations"],
      "cases/rag-knowledge-ui/",
      "Available",
    ],
    [
      "AI Agent Workflow",
      "AI Agent Workflow",
      "Visualize task state and tool execution paths.",
      ["AI Agent", "Workflow", "State UI"],
      "cases/ai-agent-workflow/",
      "Available",
    ],
    [
      "AI Tender Proposal Evaluator",
      "Industry Solutions",
      "Turn tender documents into structured requirements, risks, and action items.",
      ["Tender Review", "Dify Workflow", "Structured Output"],
      "cases/ai-tender-evaluator/",
      "Available",
    ],
    [
      "AI Solution Copilot",
      "AI Solution Workflow",
      "Turn Intake into auditable solution-analysis candidates with gates and human review.",
      ["Dify Workflow", "Decision Contract", "POC Evidence"],
      "cases/ai-solution-copilot/",
      "Synthetic POC",
    ],
  ],
};
const grid = document.querySelector("#case-grid");
function render() {
  const l = window.portfolioLanguage ? window.portfolioLanguage() : "zh";
  if (grid)
    grid.innerHTML = data[l]
      .map(
        ([t, c, v, tags, p, s]) =>
          `<article class="case-card"><div class="case-top"><span class="case-category">${c}</span><span class="status available">${s}</span></div><h3>${t}</h3><p>${v}</p><div class="tags">${tags.map((x) => `<span class="tag">${x}</span>`).join("")}</div><div class="case-actions"><a href="${p}">${l === "zh" ? "在线体验" : "Live Demo"} →</a><a href="${p}">${l === "zh" ? "查看详情" : "Details"} →</a></div></article>`,
      )
      .join("");
}
render();
window.addEventListener("portfolio-language-changed", render);
const y = document.querySelector("#year");
if (y) y.textContent = new Date().getFullYear();
