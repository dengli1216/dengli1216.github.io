const STATUS_LABELS = {
  POC: "POC",
  POC_GATE_PASSED: "POC Gate 已通过",
  CONTROLLED_LOOP_VALIDATED: "受控判断闭环已验证",
  REAL_SITE_VALIDATED: "真实现场试点已验证",
  PRODUCTION_VALIDATED: "生产环境已验证"
};

const NOT_MEASURED = "未验证";

export async function renderCasePage(config) {
  const evidence = await loadEvidence(config.evidence?.url);
  const root = document.querySelector(config.mount || "#case");
  if (!root) return;

  root.innerHTML = [
    renderHero(config.hero),
    renderBusinessValue(config.businessValue),
    renderSolution(config.solution),
    renderEvidence(config.evidence, evidence),
    renderCustomSections(config.customSections),
    renderDecisionBoundary(config.decisionBoundary, evidence),
    renderProductionPath(config.productionPath),
    renderRoleDeliverables(config.roleDeliverables)
  ].filter(Boolean).join("");
}

async function loadEvidence(url) {
  if (!url) return { data: null, error: true };
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Evidence failed: ${response.status}`);
    return { data: await response.json(), error: false };
  } catch {
    return { data: null, error: true };
  }
}

function renderHero(hero = {}) {
  const caption = hero.heroCaption ? `<figcaption>${escapeHtml(hero.heroCaption)}</figcaption>` : "";
  const tags = list(hero.tags, (tag) => `<span>${escapeHtml(tag)}</span>`);
  const status = STATUS_LABELS[hero.validationStatus] || hero.validationStatus || "POC";
  return `<section class="hero shell" aria-labelledby="page-title">
    <div class="hero-copy">
      <p class="eyebrow">${escapeHtml(hero.eyebrow || "")}</p>
      <h1 id="page-title">${escapeHtml(hero.title || "")}</h1>
      <p class="lead">${escapeHtml(hero.subtitle || "")}</p>
      <div class="hero-tags" aria-label="案例定位">${tags}</div>
      <p class="status-pill">${escapeHtml(status)}</p>
    </div>
    ${hero.heroVisual ? `<figure class="hero-visual"><img src="${escapeAttr(hero.heroVisual.src)}" width="${hero.heroVisual.width || 1600}" height="${hero.heroVisual.height || 1000}" alt="${escapeAttr(hero.heroVisual.alt || "")}">${caption}</figure>` : ""}
  </section>`;
}

function renderBusinessValue(value = {}) {
  const cards = list(value.cards, (card) => `<article><h3>${escapeHtml(card.title)}</h3><p>${escapeHtml(card.detail)}</p></article>`);
  const suitable = value.suitableFor?.length ? `<article><h3>适用场景</h3><ul>${list(value.suitableFor, (item) => `<li>${escapeHtml(item)}</li>`)}</ul></article>` : "";
  const notSuitable = value.notSuitableFor?.length ? `<article><h3>不适用 / 暂不建议</h3><ul>${list(value.notSuitableFor, (item) => `<li>${escapeHtml(item)}</li>`)}</ul></article>` : "";
  return `<section id="value" class="section shell" aria-labelledby="value-title">
    ${heading("01 / 商业价值", value.title, value.description, "value-title")}
    <div class="value-grid">${cards}</div>
    ${value.targetScenario ? `<p class="scope-note">适用场景：${escapeHtml(value.targetScenario)}</p>` : ""}
    ${suitable || notSuitable ? `<div class="fit-list">${suitable}${notSuitable}</div>` : ""}
  </section>`;
}

function renderSolution(solution = {}) {
  const nodes = solution.flow || [];
  return `<section id="solution" class="section solution" aria-labelledby="solution-title">
    <div class="shell">
      ${heading("02 / 解决方案", solution.title, solution.description, "solution-title", true)}
      <div class="solution-flow" style="--flow-count:${Math.max(nodes.length, 1)}" aria-label="方案链路">
        ${nodes.map((node, index) => `<article class="${escapeAttr(node.type || "")}"><span>${String(index + 1).padStart(2, "0")}</span><strong>${escapeHtml(node.label)}</strong><p>${escapeHtml(node.detail || "")}</p>${node.note ? `<small>${escapeHtml(node.note)}</small>` : ""}</article>`).join("")}
      </div>
      ${solution.roles?.length ? `<div class="role-strip">${list(solution.roles, (role) => `<p><strong>${escapeHtml(role.label)}：</strong>${escapeHtml(role.detail)}</p>`)}</div>` : ""}
    </div>
  </section>`;
}

function renderEvidence(evidenceConfig = {}, evidence) {
  const source = evidence.data;
  const primary = renderMetricCards(evidenceConfig.primaryMetrics, source);
  const secondary = renderMetricCards(evidenceConfig.secondaryMetrics, source);
  const loadError = evidence.error ? `<p class="load-error" role="alert">Evidence 暂未加载；通过本地 Web Server 或 GitHub Pages 访问可读取 JSON。</p>` : "";
  return `<section id="result" class="section result shell" aria-labelledby="result-title">
    ${heading("03 / POC 验证结果", evidenceConfig.title, evidenceConfig.description, "result-title")}
    <div class="primary-kpis">${primary}</div>
    ${secondary ? `<div class="secondary-kpis">${secondary}</div>` : ""}
    ${evidenceConfig.evidenceNote ? `<p class="result-note">${escapeHtml(evidenceConfig.evidenceNote)}</p>` : ""}
    ${evidenceConfig.datasetSummary ? `<p class="result-note">数据集：${escapeHtml(evidenceConfig.datasetSummary)}</p>` : ""}
    ${evidenceConfig.evidenceSource ? `<p class="result-note">Evidence source：${escapeHtml(evidenceConfig.evidenceSource)}</p>` : ""}
    ${loadError}
  </section>`;
}

function renderMetricCards(metrics = [], evidence) {
  return metrics.map((metric) => {
    const value = readSourceValue(evidence, metric.sourceKey);
    const display = isNotMeasured(value) ? NOT_MEASURED : `${value}${metric.unit || ""}`;
    return `<article class="kpi"><span>${escapeHtml(metric.label)}</span><strong>${escapeHtml(display)}</strong><p>${escapeHtml(metric.description || "")}</p></article>`;
  }).join("");
}

function renderDecisionBoundary(boundary = {}, evidence) {
  const verified = boundary.verifiedCapabilities || readSourceValue(evidence.data, "verified_capabilities") || [];
  const notProven = boundary.notProvenItems || readSourceValue(evidence.data, "not_proven") || [];
  return `<section class="section boundary" aria-labelledby="boundary-title">
    <div class="shell">
      ${heading("05 / 已验证与未验证", boundary.title, boundary.description, "boundary-title", true)}
      <div class="boundary-grid">
        <article><h3>已验证</h3><ul>${list(verified, (item) => `<li>${escapeHtml(item)}</li>`)}</ul></article>
        <article><h3>尚未验证 / 限制</h3><ul>${list(notProven, (item) => `<li>${escapeHtml(item)}</li>`)}</ul></article>
      </div>
      ${boundary.decisionSummary ? `<p class="decision-summary">${escapeHtml(boundary.decisionSummary)}</p>` : ""}
    </div>
  </section>`;
}

function renderProductionPath(path = {}) {
  return `<section id="roadmap" class="section shell" aria-labelledby="roadmap-title">
    ${heading("06 / 生产化路径", path.title, path.description, "roadmap-title")}
    <ol class="roadmap-list">${list(path.steps, (step, index) => `<li><span>${String(index + 1).padStart(2, "0")}</span><strong>${escapeHtml(step.title)}</strong><p>${escapeHtml(step.detail)}</p>${step.gate ? `<small>Gate：${escapeHtml(step.gate)}</small>` : ""}</li>`)}</ol>
  </section>`;
}

function renderRoleDeliverables(role = {}) {
  const links = [
    role.reportLink && `<a href="${escapeAttr(role.reportLink)}">查看最终 POC 报告</a>`,
    role.workflowLink && `<a href="${escapeAttr(role.workflowLink)}">查看 Workflow</a>`,
    role.repoLink && `<a href="${escapeAttr(role.repoLink)}">查看 Repo</a>`
  ].filter(Boolean).join("");
  return `<section class="section shell contribution" aria-labelledby="contribution-title">
    ${heading("07 / 我的角色与产出", role.title, role.description, "contribution-title")}
    <div class="contribution-grid">
      <article><h3>My Role</h3><ul>${list(role.roleItems, (item) => `<li>${escapeHtml(item)}</li>`)}</ul></article>
      <article><h3>Deliverables</h3><ul>${list(role.deliverables, (item) => `<li>${escapeHtml(item)}</li>`)}</ul></article>
    </div>
    ${links ? `<footer class="case-footer">${links}</footer>` : ""}
  </section>`;
}

function renderCustomSections(sections = []) {
  return sections
    .filter((section) => section && section.enabled !== false)
    .sort((a, b) => (a.order || 50) - (b.order || 50))
    .map((section) => {
      if (section.type === "roi") return renderRoiSection(section);
      if (section.type === "cards") return renderCardsSection(section);
      return "";
    })
    .join("");
}

function renderRoiSection(section) {
  const data = section.data || {};
  const content = `
    ${heading(section.kicker || "04 / 自定义模块", section.title, section.description, `${section.id}-title`)}
    <div class="roi-value-grid">${list(data.cards, (card) => `<article><h3>${escapeHtml(card.title)}</h3><p>${escapeHtml(card.detail)}</p></article>`)}</div>
    ${data.formulas?.length ? `<div class="roi-formula">${list(data.formulas, (formula) => `<p><strong>${escapeHtml(formula.label)}</strong> = ${escapeHtml(formula.value)}</p>`)}</div>` : ""}
  `;
  const layoutClass = section.fullBleed ? "section roi roi--full" : "section roi shell";
  const body = section.fullBleed ? `<div class="shell">${content}</div>` : content;
  return `<section id="${escapeAttr(section.id)}" class="${layoutClass}" aria-labelledby="${escapeAttr(section.id)}-title">${body}</section>`;
}

function renderCardsSection(section) {
  const data = section.data || {};
  return `<section id="${escapeAttr(section.id)}" class="section shell" aria-labelledby="${escapeAttr(section.id)}-title">
    ${heading(section.kicker || "04 / 自定义模块", section.title, section.description, `${section.id}-title`)}
    <div class="custom-card-grid">${list(data.cards, (card) => `<article><h3>${escapeHtml(card.title)}</h3><p>${escapeHtml(card.detail)}</p></article>`)}</div>
    ${data.note ? `<div class="custom-note"><p>${escapeHtml(data.note)}</p></div>` : ""}
  </section>`;
}

function heading(kicker, title, description, id, inverse = false) {
  return `<header class="section-heading${inverse ? " inverse" : ""}">
    <p class="section-kicker">${escapeHtml(kicker || "")}</p>
    <h2 id="${escapeAttr(id)}">${escapeHtml(title || "")}</h2>
    ${description ? `<p>${escapeHtml(description)}</p>` : ""}
  </header>`;
}

function readSourceValue(source, path) {
  if (!source || !path) return undefined;
  return path.split(".").reduce((value, key) => value && value[key] !== undefined ? value[key] : undefined, source);
}

function isNotMeasured(value) {
  return value === undefined || value === null || value === "" || value === "not_measured" || value === "not_available";
}

function list(items = [], render) {
  return (items || []).map(render).join("");
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  })[char]);
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, "&#96;");
}
