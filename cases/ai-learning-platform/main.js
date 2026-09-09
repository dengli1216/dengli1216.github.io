const media = {
  demoVideo: "assets/project-demo.mp4",
  heroScreenshot: "assets/screens/project-main.png",
  primary: {
    title: "错题讲解",
    src: "assets/screens/wrong-question.png",
    copy: "从真实错题数据出发，经 Snapshot、RAG 与 Qwen 返回针对性讲解。",
  },
  supporting: [
    {
      title: "AI 问答",
      src: "assets/screens/ai-chat.png",
      copy: "结合当前学生学习上下文完成连续问答。",
    },
    {
      title: "学习建议",
      src: "assets/screens/learning-suggestion.png",
      copy: "结合近期练习、错题与学习进度展示个性化复习建议。",
    },
  ],
  gallery: [
    { title: "Dashboard", src: "assets/screens/project-main.png" },
    { title: "错题本", src: "assets/screens/wrong-question-list.png" },
    { title: "Growth", src: "assets/screens/growth.png" },
    { title: "Learning Path", src: "assets/screens/learning-path.png" },
  ],
};
const flow = [
  ["学生提交错题", "学生请求进入学习系统"],
  ["身份校验", "JWT 权限校验"],
  ["学习快照", "Java Student Snapshot"],
  ["课程知识检索", "pgvector · 课程知识"],
  ["AI 编排", "LangGraph"],
  ["模型生成", "Qwen"],
  ["保存运行记录", "Run / Usage · PostgreSQL"],
  ["返回讲解", "解析 · 思路 · 知识点"],
];
const metric = (v, l) => `<div><b>${v}</b><span>${l}</span></div>`;
const check = (src, ok, no) => {
  const x = new Image();
  x.onload = () => ok(src);
  x.onerror = no;
  x.src = src;
};
const previewButton = (src, alt) =>
  `<button class="image-preview" type="button" data-lightbox-src="${src}" data-lightbox-alt="${alt}" aria-label="查看${alt}大图"><img src="${src}" alt="${alt}"><span>查看大图</span></button>`;
function mediaRender() {
  document.querySelectorAll('[data-media="heroScreenshot"]').forEach((n) =>
    check(
      media.heroScreenshot,
      (p) =>
        (n.innerHTML = `<span class="product-frame-label">真实本地运行截图</span>${previewButton(p, "AI 智学平台真实本地运行截图")}`),
      () => {},
    ),
  );
}
function setupLightbox() {
  const style = document.createElement("style");
  style.textContent = `.evidence-stage{background:#f4f6f8;border:1px solid #e7ebef;border-radius:14px;box-shadow:0 8px 20px rgba(23,33,43,.3);padding:12px}.evidence-stage .image-preview{background:#fff}.product-frame{position:relative}.product-frame-label{position:absolute;z-index:1;top:22px;left:22px;padding:4px 8px;border:1px solid #e1e7ee;border-radius:999px;background:rgba(255,255,255,.94);font-size:11px;color:#536170}.image-preview{position:relative;display:block;width:100%;padding:0;border:0;border-radius:8px;overflow:hidden;cursor:zoom-in}.image-preview img{display:block;width:100%;height:100%;object-fit:cover}.image-preview span{position:absolute;right:10px;bottom:10px;padding:4px 8px;border-radius:5px;background:rgba(23,33,43,.72);color:#fff;font-size:12px;opacity:0;transform:translateY(3px);transition:opacity .2s,transform .2s}.image-preview:hover span,.image-preview:focus-visible span{opacity:1;transform:translateY(0)}.image-preview:focus-visible{outline:2px solid var(--blue);outline-offset:2px}.video-evidence-heading{display:flex;justify-content:space-between;align-items:end;margin:0 0 12px}.video-evidence-heading .kicker{margin-bottom:5px}.video-evidence-heading h3{margin:0;font-size:20px;letter-spacing:-.03em}.video-evidence-heading>span{font:12px 'DM Mono',monospace;color:var(--muted)}.evidence-disclosure{margin:0 0 42px;color:var(--muted);font-size:14px}.product-evidence{display:grid;gap:28px}.primary-evidence{display:grid;grid-template-columns:minmax(0,1.7fr) minmax(210px,.7fr);gap:28px;align-items:center}.primary-shot .image-preview{aspect-ratio:16/10}.primary-evidence-copy h3{font-size:25px;letter-spacing:-.04em;margin:0 0 9px}.primary-evidence-copy>p:not(.kicker){margin:0;color:var(--muted);font-size:14px}.primary-evidence-copy ul{list-style:none;padding:0;margin:18px 0 0;border-top:1px solid var(--line)}.primary-evidence-copy li{padding:7px 0;border-bottom:1px solid var(--line);font-size:13px}.primary-evidence-copy li:before{content:'✓';color:#188452;margin-right:8px}.supporting-evidence{display:grid;grid-template-columns:repeat(2,1fr);gap:20px}.screen-shot figcaption{display:grid;gap:3px;margin-top:10px}.screen-shot figcaption span{font-size:13px;color:var(--muted)}.platform-completeness{border-top:1px solid var(--line);padding-top:22px}.platform-gallery{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.platform-gallery figure{margin:0}.gallery-media{padding:7px}.gallery-media .image-preview{aspect-ratio:16/10}.platform-gallery figcaption{margin-top:6px;font-size:12px;color:var(--muted)}.evidence-lightbox{width:auto;max-width:none;height:auto;max-height:none;margin:auto;padding:0;border:0;background:transparent}.evidence-lightbox::backdrop{background:rgba(17,27,38,.72)}.evidence-lightbox-inner{position:relative;display:grid;place-items:center;width:90vw;height:90vh}.evidence-lightbox img{max-width:90vw;max-height:90vh;object-fit:contain;border-radius:8px;box-shadow:0 12px 42px rgba(0,0,0,.3)}.evidence-lightbox button{position:absolute;top:0;right:0;width:34px;height:34px;border:1px solid rgba(255,255,255,.5);border-radius:50%;background:rgba(17,27,38,.75);color:#fff;font-size:22px;line-height:1;cursor:pointer}@media(max-width:640px){.primary-evidence,.supporting-evidence{grid-template-columns:1fr}.platform-gallery{grid-template-columns:repeat(2,1fr)}.evidence-lightbox{width:100vw;height:100vh;margin:0}.evidence-lightbox-inner{width:100vw;height:100vh}.evidence-lightbox img{max-width:100vw;max-height:100vh;border-radius:0}.evidence-lightbox button{top:16px;right:16px}.image-preview span{opacity:1;transform:none;font-size:11px}.product-frame-label{top:20px;left:20px}}`;
  document.head.append(style);
  const dialog = document.createElement("dialog");
  dialog.className = "evidence-lightbox";
  dialog.innerHTML =
    '<div class="evidence-lightbox-inner"><img alt=""><button type="button" data-lightbox-close aria-label="关闭大图">×</button></div>';
  document.body.append(dialog);
  const image = dialog.querySelector("img");
  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;
    const trigger = event.target.closest("[data-lightbox-src]");
    if (trigger) {
      image.src = trigger.dataset.lightboxSrc;
      image.alt = trigger.dataset.lightboxAlt;
      dialog.showModal();
    }
    if (
      event.target === dialog ||
      event.target.closest("[data-lightbox-close]")
    )
      dialog.close();
  });
  dialog.addEventListener("cancel", () => dialog.close());
}
const demoScenes = [
  {
    id: "explain",
    label: "错题 AI 讲解",
    type: "video",
    src: media.demoVideo,
    poster: "assets/screens/project-demo-poster.jpg",
    copy: "从学生错题出发，由 Java 业务 API 传递学习上下文，再经 Python AI 服务返回针对性讲解。",
    proof: "真实 Java → Python → Qwen 请求已在本地运行链路验证。",
  },
  {
    id: "growth",
    label: "成长档案",
    src: "assets/screens/growth.png",
    copy: "学生成长轨迹 由 Java 业务 API 提供。",
    proof: "Next.js 学生端对接 Java 业务 API。",
  },
  {
    id: "path",
    label: "学习路径",
    src: "assets/screens/learning-path.png",
    copy: "学习路径与当前进度来自真实业务数据。",
    proof: "业务状态与 AI 服务保持明确边界。",
  },
  {
    id: "happy-test",
    label: "趣味练习",
    src: "assets/screens/happy-test.png",
    copy: "趣味练习由 Java 业务 API 提供，AI 服务不参与生成。",
    proof: "",
  },
  //  {
  //     id: "wrong",
  //     label: "错题本",
  //     src: "assets/screens/wrong-question-list.png",
  //     copy: "围绕真实错题数据完成复习与 AI 讲解入口。",
  //     proof: "JWT 身份与错题数据由 Java 业务系统管理。",
  //   },
  {
    id: "assistant",
    label: "AI 助手",
    src: "assets/screens/ai-chat.png",
    copy: "连续问答使用当前学生上下文提供帮助，学习建议结合近期练习、错题与学习进度。",
    proof: "真实模型调用通过 Java 服务进入 Python AI 服务。",
  },
];
function casePresentationRender() {
  const hero = document.querySelector(".hero-copy");
  hero.querySelector("h2").textContent =
    "从全栈业务系统，到可上线的 AI 应用闭环";
  hero.querySelector(".lead").textContent =
    "独立完成学生端、Java 业务后端与 Python AI 服务，并将真实身份、业务数据、RAG、模型、PostgreSQL、pgvector 与 Redis Worker 接入同一运行链路。";
  hero.querySelector(".hero-actions").innerHTML =
    '<a class="primary" href="#project-demo">查看真实演示</a><a class="secondary" href="#architecture">查看技术实现 ↓</a>';
  hero.insertAdjacentHTML(
    "beforeend",
    '<div class="hero-capabilities"><span>Next.js + Spring Boot</span><span>Python AI / LangGraph</span><span>RAG + pgvector</span><span>真实 API / Docker E2E</span></div>',
  );
  document.querySelector("nav").innerHTML =
    '<a href="#project-demo">真实演示</a><a href="#architecture">技术实现</a><a href="#verification">验证证据</a>';
  const demo = document.querySelector("#project-demo");
  demo.classList.add("demo-case-section");
  demo.innerHTML =
    '<header class="section-title"><p class="kicker">01 / 项目演示</p><h2>真实产品场景，而不是孤立的模型输出</h2></header><div class="demo-selector" role="tablist" aria-label="产品场景"></div><div class="demo-viewport" id="demo-viewport"></div><div class="demo-context"><p id="demo-copy"></p><small id="demo-proof"></small></div>';
  const selector = demo.querySelector(".demo-selector"),
    viewport = demo.querySelector("#demo-viewport"),
    copy = demo.querySelector("#demo-copy"),
    proof = demo.querySelector("#demo-proof");
  const showScene = (id) => {
    const scene = demoScenes.find((item) => item.id === id);
    selector.querySelectorAll("button").forEach((button) => {
      const selected = button.dataset.scene === id;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-selected", String(selected));
    });
    viewport.innerHTML =
      scene.type === "video"
        ? `<video controls playsinline poster="${scene.poster}"><source src="${scene.src}" type="video/mp4"></video>`
        : previewButton(scene.src, `${scene.label}真实产品截图`);
    copy.textContent = scene.copy;
    proof.textContent = scene.proof;
  };
  selector.innerHTML = demoScenes
    .map(
      (scene, index) =>
        `<button type="button" role="tab" data-scene="${scene.id}" aria-selected="${index === 0}">${scene.label}</button>`,
    )
    .join("");
  selector.addEventListener("click", (event) => {
    const button = event.target.closest("[data-scene]");
    if (button) showScene(button.dataset.scene);
  });
  showScene("explain");
  const transformation = document.querySelector(".transformation");
  transformation.innerHTML =
    '<div class="shell"><header class="section-title"><p class="kicker">02 / FULL-STACK AI DELIVERY</p><h2>此项目覆盖 AI 应用落地的完整技术链路</h2><p class="section-subtitle">不只调用模型，而是从产品界面、业务 API 到 AI 服务与运行基础设施完成真实集成。</p></header><ol class="delivery-chain"><li><b>产品体验</b><span>Next.js</span></li><li><b>业务系统</b><span>Spring Boot / JWT</span></li><li><b>AI 应用</b><span>FastAPI / LangGraph</span></li><li><b>知识增强</b><span>RAG / pgvector</span></li><li><b>运行基础设施</b><span>PostgreSQL / Redis</span></li><li><b>验证交付</b><span>Docker / E2E / Eval</span></li></ol><div class="delivery-proofs"><p><b>AI 全栈落地</b><span>从产品交互、业务 API 到 AI 服务和数据链路完成完整实现，而非停留在模型 Demo。</span></p><p><b>研发协作能力</b><span>理解前后端接口、鉴权、数据库、异步任务及服务边界，可参与真实架构和联调讨论。</span></p><p><b>AI 技术边界</b><span>区分业务事实、RAG 知识、模型能力和规则能力，并用权限、验证和评测控制风险。</span></p><p><b>POC → 真实系统</b><span>将真实 API、业务数据、模型、向量库和数据库接入同一验证闭环。</span></p></div></div>';
  document
    .querySelector("#architecture")
    .insertAdjacentHTML(
      "beforebegin",
      '<section class="section business-value"><div class="shell"><header class="section-title"><p class="kicker">03 / BUSINESS VALUE</p><h2>AI 的价值不是增加一个聊天入口，而是缩短“发现问题 → 获得帮助 → 继续学习”的路径</h2></header><div class="value-columns"><article><h3>学生价值</h3><ul><li>错题发生后快速获得针对性讲解</li><li>学习状态进入 AI 个性化上下文</li><li>建议与真实学习行为关联</li></ul></article><article><h3>教学价值</h3><ul><li>AI 辅助重复解释型答疑</li><li>教师仍掌握业务规则和教学控制权</li><li>后续可基于真实业务数据评估效果</li></ul></article><article><h3>平台价值</h3><ul><li>AI 服务独立接入现有 Java 系统</li><li>不推翻原核心业务架构</li><li>模型、RAG、AI Workflow 可独立升级</li></ul></article></div><div class="metric-recommendation"><b>验证指标</b><span>错题复习完成率 · AI 建议采纳率 · 重复答疑量 · 单次反馈耗时 · AI 请求成功率 · 单次模型成本</span><small>当前完成技术可行性与工程闭环验证；真实教学效果与 ROI 需上线后通过业务实验验证。</small></div></div></section>',
    );
  const setKicker = (selector, text) => {
    const element = document.querySelector(selector);
    if (element) element.textContent = text;
  };
  setKicker("#architecture .kicker", "04 / 技术架构");
  setKicker(".workflow .kicker", "05 / 真实请求流程");
  setKicker(".rag-quality .kicker", "06 / RAG Quality");
  setKicker("#verification .kicker", "07 / Production Engineering Evidence");
  setKicker(".gates .kicker", "08 / Verification Gates");
  setKicker(".boundaries .kicker", "09 / Verified Boundaries");
  setKicker(".final-cta .kicker", "10 / Case Conclusion");
}
function casePresentationStyles() {
  const style = document.createElement("style");
  style.textContent = `.hero-capabilities{display:flex;flex-wrap:wrap;gap:8px;margin-top:25px}.hero-capabilities span{padding:5px 9px;border:1px solid #d8e3f2;border-radius:999px;background:#f7faff;color:#315c93;font-size:12px}.demo-case-section{background:#f5f8fc;box-shadow:0 0 0 100vmax #f5f8fc;clip-path:inset(0 -100vmax)}.demo-selector{display:flex;gap:8px;overflow-x:auto;scroll-snap-type:x mandatory;margin:0 0 16px;padding-bottom:3px}.demo-selector button{flex:none;scroll-snap-align:start;padding:8px 12px;border:1px solid #d7e0eb;border-radius:7px;background:#fff;color:#596777;font:600 13px inherit;cursor:pointer}.demo-selector button.is-active{border-color:var(--blue);background:var(--blue);color:#fff}.demo-viewport{overflow:hidden;border:1px solid #dfe6ee;border-radius:14px;background:#eef2f6;box-shadow:0 8px 22px rgba(23,33,43,.06);aspect-ratio:16/10}.demo-viewport video,.demo-viewport .image-preview{display:block;width:100%;height:100%;object-fit:contain;background:#fff}.demo-viewport video{object-position:center}.demo-viewport .image-preview img{object-fit:contain;object-position:center}.demo-context{display:grid;grid-template-columns:1fr auto;gap:22px;align-items:start;margin-top:14px;color:var(--muted);font-size:14px}.demo-context p{margin:0}.demo-context small{max-width:380px;color:#315c93;font-size:12px;text-align:right}.section-subtitle{margin:15px 0 0;color:var(--muted);font-size:17px}.delivery-chain{display:grid;grid-template-columns:repeat(6,1fr);gap:0;list-style:none;padding:0;margin:0;border:1px solid var(--line);background:#fff}.delivery-chain li{text-align:center;position:relative;min-height:105px;padding:18px 14px;border-right:1px solid var(--line)}.delivery-chain li:not(:last-child):after{content:'→';position:absolute;right:-7px;top:43px;z-index:1;color:var(--blue);background:#fff}.delivery-chain b,.delivery-chain span{display:block}.delivery-chain b{font-size:14px}.delivery-chain span{margin-top:7px;color:var(--muted);font-size:12px}.delivery-proofs{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin-top:26px}.delivery-proofs p{margin:0;padding-top:14px;border-top:1px solid var(--line)}.delivery-proofs b,.delivery-proofs span{display:block}.delivery-proofs span{margin-top:6px;color:var(--muted);font-size:13px;line-height:1.6}.business-value{background:#fff;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}.value-columns{display:grid;grid-template-columns:repeat(3,1fr);gap:28px}.value-columns article{padding-top:16px;border-top:2px solid var(--blue)}.value-columns h3{margin:0;font-size:19px}.value-columns ul{margin:12px 0 0;padding-left:18px;color:var(--muted);font-size:14px}.value-columns li{margin:8px 0}.metric-recommendation{display:grid;gap:7px;margin-top:34px;padding:18px 20px;border:1px solid #d9e5f6;background:#f7faff}.metric-recommendation span{color:#315c93;font-size:14px}.metric-recommendation small{color:var(--muted);font-size:12px}@media(max-width:900px){.delivery-chain{grid-template-columns:repeat(3,1fr)}.delivery-chain li:nth-child(3){border-right:0}.delivery-proofs{grid-template-columns:repeat(2,1fr)}}@media(max-width:640px){.demo-context,.value-columns,.delivery-proofs{grid-template-columns:1fr}.demo-context small{text-align:left}.delivery-chain{grid-template-columns:1fr}.delivery-chain li{min-height:auto;border-right:0;border-bottom:1px solid var(--line)}.delivery-chain li:not(:last-child):after{content:'↓';right:auto;left:15px;top:auto;bottom:-12px}.delivery-chain li:last-child{border-bottom:0}.demo-viewport{aspect-ratio:4/3}.hero-capabilities{margin-top:20px}}`;
  document.head.append(style);
}
const evidence = [
  ["身份权限", "✓", 1],
  ["学习上下文", "✓", 2],
  ["知识来源", "3", 3],
  ["真实模型", "✓", 5],
  ["运行记录", "✓", 6],
];
function lightboxFixStyles() {
  const style = document.createElement("style");
  style.textContent = `.evidence-lightbox{max-width:92vw;max-height:88vh}.evidence-lightbox-inner{display:block;width:fit-content;height:fit-content;max-width:92vw;max-height:88vh}.evidence-lightbox img{display:block;max-width:92vw;max-height:88vh;object-fit:contain;object-position:center}@media(max-width:640px){.evidence-lightbox{width:auto;height:auto;max-width:100vw;max-height:100vh}.evidence-lightbox-inner{max-width:100vw;max-height:100vh}.evidence-lightbox img{max-width:100vw;max-height:100vh}}`;
  document.head.append(style);
}
function responsiveFixStyles() {
  const style = document.createElement("style");
  style.textContent =
    "@media (min-width:901px) and (max-width:1100px){.hero-layout{grid-template-columns:minmax(0,1fr) 390px;gap:32px}.hero h1{font-size:58px}.hero h2{font-size:30px}}";
  document.head.append(style);
}
function flowRender() {
  const l = document.querySelector("#workflow-steps");
  l.innerHTML = flow
    .map(
      (x, i) =>
        `<li class="workflow-node node-${i + 1}" data-step="${i}"><span class="workflow-number">${i + 1}</span><div><b>${x[0]}</b><small>${x[1]}</small></div><i class="workflow-check" aria-hidden="true">✓</i></li>`,
    )
    .join("");
  document.querySelector("#workflow-evidence").innerHTML = evidence
    .map((x, i) => `<li data-evidence="${i}"><span>${x[0]}</span><b>·</b></li>`)
    .join("");
}
const workflow = {
  timers: [],
  frame: 0,
  stage: 0,
  visible: true,
  reduced: matchMedia("(prefers-reduced-motion: reduce)").matches,
};
const clearWorkflow = () => {
  workflow.timers.forEach(clearTimeout);
  workflow.timers = [];
  cancelAnimationFrame(workflow.frame);
};
function anchor(a, b, box) {
  const r = a.getBoundingClientRect(),
    t = b.getBoundingClientRect(),
    dx = t.left - r.left,
    dy = t.top - r.top;
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0
      ? [r.right - box.left, r.top + r.height / 2 - box.top]
      : [r.left - box.left, r.top + r.height / 2 - box.top];
  }
  return dy > 0
    ? [r.left + r.width / 2 - box.left, r.bottom - box.top]
    : [r.left + r.width / 2 - box.left, r.top - box.top];
}
function drawWorkflowLinks() {
  const host = document.querySelector("#workflow-flow"),
    svg = document.querySelector("#workflow-links"),
    tracks = svg.querySelector(".workflow-link-tracks"),
    nodes = [...document.querySelectorAll(".workflow-node")],
    box = host.getBoundingClientRect();
  if (!box.width) return;
  svg.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`);
  svg.setAttribute("width", box.width);
  svg.setAttribute("height", box.height);
  tracks.replaceChildren(
    ...nodes.slice(0, -1).map((node, i) => {
      const next = nodes[i + 1],
        from = anchor(node, next, box),
        to = anchor(next, node, box),
        path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.dataset.link = i;
      path.setAttribute("d", `M ${from[0]} ${from[1]} L ${to[0]} ${to[1]}`);
      return path;
    }),
  );
}
function updateEvidence(stage, done = false) {
  document.querySelectorAll("#workflow-evidence li").forEach((item, i) => {
    const active = done || stage >= evidence[i][2];
    item.classList.toggle("is-verified", active);
    item.querySelector("b").textContent = active ? evidence[i][1] : "·";
  });
  const note = document.querySelector("#workflow-note");
  note.textContent = done ? "全链路验证通过" : "验证项会随着请求推进逐步更新。";
  note.classList.toggle("is-complete", done);
}
function animateDot(linkIndex) {
  const path = document.querySelector(`[data-link="${linkIndex}"]`),
    dot = document.querySelector(".workflow-link-dot");
  if (!path) return;
  document
    .querySelectorAll(".workflow-link-tracks path")
    .forEach((p, i) => p.classList.toggle("is-active", i === linkIndex));
  const length = path.getTotalLength(),
    start = performance.now(),
    duration = 400;
  dot.classList.add("is-moving");
  const move = (now) => {
    const point = path.getPointAtLength(
      length * Math.min(1, (now - start) / duration),
    );
    dot.setAttribute("cx", point.x);
    dot.setAttribute("cy", point.y);
    if (now - start < duration) workflow.frame = requestAnimationFrame(move);
    else dot.classList.remove("is-moving");
  };
  workflow.frame = requestAnimationFrame(move);
}
function setWorkflowStage(stage) {
  workflow.stage = stage;
  const nodes = [...document.querySelectorAll(".workflow-node")];
  nodes.forEach((node, i) => {
    node.classList.toggle("is-active", i === stage);
    node.classList.toggle("is-complete", i < stage);
  });
  updateEvidence(stage);
  if (stage > 0) animateDot(stage - 1);
}
function showWorkflowComplete() {
  workflow.stage = 8;
  document.querySelectorAll(".workflow-node").forEach((node) => {
    node.classList.remove("is-active");
    node.classList.add("is-complete");
  });
  document
    .querySelectorAll(".workflow-link-tracks path")
    .forEach((path) => path.classList.add("is-active"));
  updateEvidence(8, true);
}
function resetWorkflow() {
  document.querySelector("#workflow-flow").classList.add("is-resetting");
  workflow.timers.push(
    setTimeout(() => {
      document.querySelector("#workflow-flow").classList.remove("is-resetting");
      startWorkflow();
    }, 600),
  );
}
function startWorkflow() {
  clearWorkflow();
  document.querySelector("#workflow-flow").classList.remove("is-resetting");
  if (workflow.reduced) {
    showWorkflowComplete();
    return;
  }
  document
    .querySelectorAll(".workflow-node")
    .forEach((node) => node.classList.remove("is-active", "is-complete"));
  document
    .querySelectorAll(".workflow-link-tracks path")
    .forEach((path) => path.classList.remove("is-active"));
  updateEvidence(-1);
  const schedule = [500, 2500, 4500, 6500, 9000, 11500, 14000, 16500];
  schedule.forEach((at, stage) =>
    workflow.timers.push(setTimeout(() => setWorkflowStage(stage), at)),
  );
  workflow.timers.push(
    setTimeout(showWorkflowComplete, 18500),
    setTimeout(resetWorkflow, 22000),
  );
}
fetch("evidence/case-evidence.json")
  .then((r) => (r.ok ? r.json() : Promise.reject()))
  .then((d) => {
    document.querySelector("#hero-metrics").innerHTML = [
      metric(d.goldenSet, "已批准 Golden Set"),
      metric(`${d.recallAt5 * 100}%`, "Recall@5"),
      metric(`${d.coreE2E.passed}/${d.coreE2E.total}`, "核心业务 E2E"),
      metric(d.pythonTests, "Python Tests"),
    ].join("");
    document.querySelector("#rag-pipeline").innerHTML = [
      [d.documents, "真实授权课程文档"],
      [d.chunks, "知识切片"],
      ["Gemini Embedding", "1024D"],
      ["pgvector", "向量检索"],
      [d.goldenSet, "Approved Golden Set"],
    ]
      .map((x) => `<li><b>${x[0]}</b><span>${x[1]}</span></li>`)
      .join("");
    document.querySelector("#rag-metrics").innerHTML = [
      metric(`${d.recallAt5 * 100}%`, "Recall@5"),
      metric(`${d.sourceHitRate * 100}%`, "Source Hit"),
      metric(`${d.citationValidity * 100}%`, "Citation Validity"),
      metric(d.mrr.toFixed(3), "MRR"),
    ].join("");
    document.querySelector("#gate-numbers").innerHTML = [
      metric(d.pythonTests, "Python Tests"),
      metric(d.goldenSet, "RAG Evaluation"),
      metric(`${d.coreE2E.passed} / ${d.coreE2E.total}`, "Core E2E"),
    ].join("");
  })
  .catch(() =>
    document
      .querySelectorAll("#hero-metrics,#rag-metrics,#gate-numbers")
      .forEach((x) => (x.textContent = "验证汇总暂不可用。")),
  );
casePresentationStyles();
casePresentationRender();
mediaRender();
setupLightbox();
lightboxFixStyles();
responsiveFixStyles();
flowRender();
drawWorkflowLinks();
new ResizeObserver(drawWorkflowLinks).observe(
  document.querySelector("#workflow-flow"),
);
document.addEventListener("visibilitychange", () => {
  workflow.visible = !document.hidden;
  if (workflow.visible) startWorkflow();
  else clearWorkflow();
});
window.addEventListener("pagehide", clearWorkflow, { once: true });
document.querySelector("#replay-workflow").onclick = startWorkflow;
startWorkflow();
