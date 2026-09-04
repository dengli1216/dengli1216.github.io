const previews = {
  'rag-knowledge-ui': { icon: '⌕', zh: ['RAG 知识库界面', '将企业知识检索、问答与引用溯源组织为可理解、可核验的工作界面。', ['资料接入', '检索问答', '引用溯源']], en: ['RAG Knowledge UI', 'A clear, verifiable workspace for enterprise retrieval, answers, and citations.', ['Source intake', 'Retrieval & answer', 'Citation trace']] },
  'ai-agent-workflow': { icon: '↳', zh: ['AI 智能体工作流', '让多步骤任务的规划、工具调用与执行状态变得可观察、可解释、可管理。', ['任务编排', '工具连接', '运行观测']], en: ['AI Agent Workflow', 'Make multi-step planning, tool calls, and execution states observable and manageable.', ['Task orchestration', 'Tool connections', 'Run observability']] },
  'hand-gesture-store': { icon: '⌁', zh: ['手势互动导购', '用自然手势替代触摸操作，构建无接触商品探索体验。', ['手势识别', '商品流程', '现场数据']], en: ['Hand Gesture Store', 'A touch-free product exploration experience driven by natural gestures.', ['Gesture detection', 'Product flow', 'Field signals']] },
  'mediapipe-magic-ball': { icon: '◉', zh: ['MediaPipe 魔法球', '将实时手势、粒子视觉与品牌互动结合，打造沉浸式数字装置原型。', ['追踪映射', '粒子交互', '活动模式']], en: ['MediaPipe Magic Ball', 'A gesture-driven visual prototype for immersive brand interaction.', ['Tracking map', 'Particle interaction', 'Event mode']] }
};

function renderPreview() {
  const config = previews[document.documentElement.dataset.case];
  const lang = window.portfolioLanguage();
  const [title, summary, modules] = config[lang];
  const status = lang === 'zh' ? '原型 / 开发中' : 'Prototype / In Development';
  const eyebrow = lang === 'zh' ? '效果预览' : 'EFFECT PREVIEW';
  const description = lang === 'zh' ? '这是开发中的轻量功能预览，不代表正式上线产品。' : 'This is a lightweight work-in-progress preview, not a production release.';
  const workflow = lang === 'zh' ? '预览工作流' : 'Preview workflow';
  const back = lang === 'zh' ? '← 返回首页' : '← Back to home';
  document.title = `${title} | AI Case Portfolio`;
  document.body.innerHTML = `<header class="site-header container"><a class="brand" href="../../?lang=${lang}"><span class="brand-mark">AI</span><span>CASE PORTFOLIO</span></a><nav><a class="back-link" href="../../?lang=${lang}">${back}</a><button id="language-toggle" class="language-switch" type="button">${lang === 'zh' ? 'EN' : '中文'}</button></nav></header><main><section class="container case-hero"><p class="eyebrow">${eyebrow}</p><div class="preview-status">${status}</div><h1>${title}</h1><p class="case-value">${summary}</p><p class="preview-note">${description}</p></section><section class="container case-layout"><div class="prototype"><div class="prototype-ui"><div><div class="prototype-icon">${config.icon}</div><h2>${workflow}</h2><p>${modules.join(' → ')}</p></div></div></div><aside class="case-info"><section><h2>${lang === 'zh' ? '状态' : 'STATUS'}</h2><p>${status}</p></section><section><h2>${lang === 'zh' ? '体验范围' : 'PREVIEW SCOPE'}</h2><p>${lang === 'zh' ? '交互流程与核心模块展示' : 'Interaction flow and core modules'}</p></section></aside></section><section class="container roadmap"><p class="eyebrow">${workflow}</p><h2>${lang === 'zh' ? '核心功能模块' : 'Core modules'}</h2><div class="roadmap-grid">${modules.map((module, index) => `<article><span>0${index + 1}</span><h3>${module}</h3><p>${lang === 'zh' ? '开发中功能预览' : 'In-development feature preview'}</p></article>`).join('')}</div></section></main>`;
  document.querySelector('#language-toggle').onclick = () => {
    const next = lang === 'zh' ? 'en' : 'zh';
    localStorage.setItem('lang', next);
    location.search = `?lang=${next}`;
  };
}
window.addEventListener('DOMContentLoaded', renderPreview);
