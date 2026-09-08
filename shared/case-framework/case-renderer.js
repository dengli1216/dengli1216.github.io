const STATUS_LABELS = {
  POC: "POC",
  POC_GATE_PASSED: "POC Gate 已通过",
  CONTROLLED_LOOP_VALIDATED: "受控判断闭环已验证",
  REAL_SITE_VALIDATED: "真实现场试点已验证",
  PRODUCTION_VALIDATED: "生产环境已验证"
};

const NOT_MEASURED = "未验证";

export async function renderCasePage(config = {}) {
  const evidence = await loadEvidence(config.evidence?.url);
  const root = document.querySelector(config.mount || "#case");
  if (!root) return;

  root.innerHTML = [
    renderHero(config.hero),
    renderBusinessContext(config.businessContext, config.businessValue),
    renderProcessComparison(config.processComparison),
    renderSolution(config.solution),
    renderEvidence(config.evidence, evidence),
    renderRoi(config.roi),
    renderRiskControls(config.riskControls, config.decisionBoundary, evidence),
    renderProductionPath(config.productionPath),
    renderCustomSections(config.customSections),
    renderRoleDeliverables(config.roleDeliverables)
  ].filter(Boolean).join("");

  bindWorkflowPreview(root);
  bindRoiCalculators(root);
}

async function loadEvidence(url) {
  if (!url) return { data: null, error: false };
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Evidence failed: ${response.status}`);
    return { data: await response.json(), error: false };
  } catch {
    return { data: null, error: true };
  }
}

function renderHero(hero = {}) {
  if (!hasContent(hero, ["title", "subtitle", "tags", "heroVisual", "keyMetrics"])) return "";
  const caption = hero.heroCaption ? `<figcaption>${escapeHtml(hero.heroCaption)}</figcaption>` : "";
  const tags = list(hero.tags, (tag) => `<span>${escapeHtml(tag)}</span>`);
  const metrics = list(hero.keyMetrics, (metric) => `<article><strong>${escapeHtml(metric.value)}</strong><span>${escapeHtml(metric.label)}</span></article>`);
  const status = STATUS_LABELS[hero.validationStatus] || hero.validationStatus || "POC";
  return `<section class="hero shell" aria-labelledby="page-title">
    <div class="hero-copy">
      ${hero.eyebrow ? `<p class="eyebrow">${escapeHtml(hero.eyebrow)}</p>` : ""}
      <h1 id="page-title">${escapeHtml(hero.title || "AI POC 案例")}</h1>
      ${hero.subtitle ? `<p class="lead">${escapeHtml(hero.subtitle)}</p>` : ""}
      ${tags ? `<div class="hero-tags" aria-label="案例能力标签">${tags}</div>` : ""}
      ${metrics ? `<div class="hero-metrics" aria-label="核心 POC 指标">${metrics}</div>` : ""}
      <p class="status-pill">${escapeHtml(status)}</p>
    </div>
    ${renderHeroAside(hero, caption)}
  </section>`;
}

function renderHeroAside(hero, caption) {
  if (hero.heroVisual) return `<figure class="hero-visual"><img src="${escapeAttr(hero.heroVisual.src)}" width="${hero.heroVisual.width || 1600}" height="${hero.heroVisual.height || 1000}" alt="${escapeAttr(hero.heroVisual.alt || "")}">${caption}</figure>`;
  const chain = hero.valueChain || hero.businessSummary;
  if (!hasContent(chain, ["input", "ai", "output", "control"])) return "";
  const steps = [
    { label: "业务输入", detail: chain.input },
    { label: "AI 处理", detail: chain.ai },
    { label: "业务结果", detail: chain.output },
    { label: "人工控制", detail: chain.control }
  ].filter((item) => item.detail);
  return `<aside class="hero-value-chain" aria-label="业务结果摘要"><p>业务结果摘要</p><ol>${list(steps, (item) => `<li><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.detail)}</strong></li>`)}</ol></aside>`;
}

function renderBusinessContext(context = {}, legacy = {}) {
  const hasNewContext = hasContent(context, ["businessContext", "pains", "targetUsers", "businessGoal"]);
  if (!hasNewContext && !hasContent(legacy, ["cards", "targetScenario", "suitableFor", "notSuitableFor"])) return "";
  if (!hasNewContext) return renderLegacyBusinessValue(legacy);

  const cards = [
    context.businessContext && { title: "业务背景", detail: context.businessContext },
    context.businessGoal && { title: "业务目标", detail: context.businessGoal },
    context.targetUsers && { title: "目标用户", detail: arrayOrText(context.targetUsers) }
  ].filter(Boolean);
  const pains = context.pains?.length ? `<div class="pain-list"><h3>核心痛点</h3><ul>${list(context.pains, (pain) => `<li>${escapeHtml(pain)}</li>`)}</ul></div>` : "";
  return `<section id="value" class="section shell" aria-labelledby="value-title">
    ${heading("01 / 业务背景与核心痛点", context.title || "为什么这个场景值得做？", context.description, "value-title")}
    <div class="business-layout"><div class="business-summary">${cards.length ? `<div class="value-grid">${list(cards, (card) => `<article><h3>${escapeHtml(card.title)}</h3><p>${escapeHtml(card.detail)}</p></article>`)}</div>` : ""}</div>${pains}</div>
  </section>`;
}

function renderLegacyBusinessValue(value = {}) {
  const cards = list(value.cards, (card) => `<article><h3>${escapeHtml(card.title)}</h3><p>${escapeHtml(card.detail)}</p></article>`);
  const suitable = value.suitableFor?.length ? `<article><h3>适用场景</h3><ul>${list(value.suitableFor, (item) => `<li>${escapeHtml(item)}</li>`)}</ul></article>` : "";
  const notSuitable = value.notSuitableFor?.length ? `<article><h3>不适用 / 暂不建议</h3><ul>${list(value.notSuitableFor, (item) => `<li>${escapeHtml(item)}</li>`)}</ul></article>` : "";
  return `<section id="value" class="section shell" aria-labelledby="value-title">
    ${heading("01 / 商业价值", value.title, value.description, "value-title")}
    ${cards ? `<div class="value-grid">${cards}</div>` : ""}
    ${value.targetScenario ? `<p class="scope-note">适用场景：${escapeHtml(value.targetScenario)}</p>` : ""}
    ${suitable || notSuitable ? `<div class="fit-list">${suitable}${notSuitable}</div>` : ""}
  </section>`;
}

function renderProcessComparison(comparison = {}) {
  if (!hasContent(comparison, ["before", "after"])) return "";
  return `<section id="process" class="section process shell" aria-labelledby="process-title">
    ${heading("02 / 新旧流程对比", comparison.title || "AI 插入流程后，业务改变了什么？", comparison.description, "process-title")}
    <div class="process-grid">${renderProcessColumn("传统流程", comparison.before, "before")}${renderProcessColumn("AI 辅助流程", comparison.after, "after")}</div>
  </section>`;
}

function renderProcessColumn(label, data = {}, variant) {
  const steps = data.steps?.length ? `<ol>${list(data.steps, (step) => `<li>${escapeHtml(step)}</li>`)}</ol>` : "";
  const outcome = data.outcome ? `<p class="process-outcome"><strong>${variant === "after" ? "业务变化" : "当前问题"}：</strong>${escapeHtml(data.outcome)}</p>` : "";
  return `<article class="process-column process-column--${variant}"><p class="process-label">${label}</p>${data.summary ? `<h3>${escapeHtml(data.summary)}</h3>` : ""}${steps}${outcome}</article>`;
}

function renderSolution(solution = {}) {
  const steps = solution.steps || solution.flow || [];
  if (!hasContent(solution, ["title", "description", "steps", "flow", "workflowImage", "workflowPlaceholder", "techStack"])) return "";
  const image = normalizeWorkflowImage(solution.workflowImage || solution.workflowPreview, solution.workflowAlt);
  const flow = steps.length ? `<div class="solution-flow" style="--flow-count:${Math.max(steps.length, 1)}" aria-label="AI 解决方案流程">${steps.map((node, index) => renderSolutionStep(node, index)).join("")}</div>` : "";
  const stack = solution.techStack?.length ? `<div class="tech-stack" aria-label="技术栈">${list(solution.techStack, (item) => `<span>${escapeHtml(item)}</span>`)}</div>` : "";
  const roles = solution.roles?.length ? `<div class="role-strip">${list(solution.roles, (role) => `<p><strong>${escapeHtml(role.label)}：</strong>${escapeHtml(role.detail)}</p>`)}</div>` : "";
  const preview = image ? renderWorkflowPreview(image) : solution.workflowPlaceholder ? renderWorkflowPlaceholder(solution.workflowPlaceholder) : "";
  const content = `${preview}${flow}${stack}${roles}`;
  return `<section id="solution" class="section solution" aria-labelledby="solution-title"><div class="shell">
    ${heading("03 / AI 解决方案", solution.title || "AI 如何进入业务流程", solution.description, "solution-title", true)}
    ${content}
  </div></section>`;
}

function renderSolutionStep(node = {}, index) {
  const detail = node.detail || node.process || node.output || node.input;
  const control = node.control || node.note;
  return `<article class="${escapeAttr(node.type || "")}"><span>${String(index + 1).padStart(2, "0")}</span><strong>${escapeHtml(node.label || "步骤")}</strong>${detail ? `<p>${escapeHtml(detail)}</p>` : ""}${control ? `<small>控制边界：${escapeHtml(control)}</small>` : ""}</article>`;
}

function renderWorkflowPreview(image = {}) {
  if (!image.src) return "";
  const caption = image.caption || "真实工作流 / POC 已验证流程";
  return `<figure class="workflow-preview"><button type="button" data-workflow-open data-src="${escapeAttr(image.src)}" data-alt="${escapeAttr(image.alt || "Dify 工作流图")}" aria-label="放大查看工作流图"><img src="${escapeAttr(image.src)}" alt="${escapeAttr(image.alt || "Dify 工作流图")}"><span>${escapeHtml(caption)}</span></button></figure>`;
}

function renderWorkflowPlaceholder(text) {
  return `<div class="workflow-placeholder" aria-label="工作流图片占位"><strong>真实工作流</strong><span>${escapeHtml(typeof text === "string" ? text : "工作流图片占位 · 后续替换真实 Dify Workflow")}</span></div>`;
}

function normalizeWorkflowImage(image, fallbackAlt) {
  if (!image) return null;
  return typeof image === "string" ? { src: image, alt: fallbackAlt } : image;
}

function renderEvidence(evidenceConfig = {}, evidence) {
  const hasEvidence = hasContent(evidenceConfig, ["title", "primaryMetrics", "secondaryMetrics", "datasetSummary", "goldenSet", "evidenceNote", "artifacts"]);
  if (!hasEvidence) return "";
  const source = evidence.data;
  const primary = renderMetricCards(evidenceConfig.primaryMetrics, source);
  const secondary = renderMetricCards(evidenceConfig.secondaryMetrics, source);
  const artifacts = renderArtifactLinks(evidenceConfig.artifacts || evidenceConfig.links);
  const goldenSet = renderGoldenSet(evidenceConfig.goldenSet);
  const conditions = evidenceConfig.conditions?.length ? `<p class="result-note"><strong>限制条件：</strong>${escapeHtml(evidenceConfig.conditions.join("；"))}</p>` : "";
  const loadError = evidence.error ? `<p class="load-error" role="alert">验证数据暂未加载；请通过本地 Web Server 或 GitHub Pages 访问 JSON。</p>` : "";
  const metrics = `${primary ? `<div class="primary-kpis">${primary}</div>` : ""}${secondary ? `<div class="secondary-kpis">${secondary}</div>` : ""}`;
  const details = `${goldenSet}${evidenceConfig.datasetSummary ? `<p class="result-note"><strong>测试集说明：</strong>${escapeHtml(evidenceConfig.datasetSummary)}</p>` : ""}${evidenceConfig.evidenceNote ? `<p class="result-note">${escapeHtml(evidenceConfig.evidenceNote)}</p>` : ""}${conditions}${artifacts}${loadError}`;
  const content = goldenSet ? `${metrics}${goldenSet}${loadError}` : `${metrics}${details}`;
  return `<section id="result" class="section result shell" aria-labelledby="result-title">
    ${heading("04 / POC 验证与真实证据", evidenceConfig.title || "POC 到底验证了什么？", evidenceConfig.description, "result-title")}
    ${content}
  </section>`;
}

function renderGoldenSet(goldenSet = {}) {
  if (!hasContent(goldenSet, ["total", "executable", "critical", "repeat", "coverage"])) return "";
  return `<section class="golden-set" aria-label="黄金测试集覆盖"><h3>黄金测试集覆盖</h3>${goldenSet.coverage?.length ? `<div class="coverage-tags">${list(goldenSet.coverage, (item) => `<span>${escapeHtml(item)}</span>`)}</div>` : ""}</section>`;
}

function renderMetricCards(metrics = [], evidence) {
  return (metrics || []).map((metric) => {
    const rawValue = metric.value ?? readSourceValue(evidence, metric.sourceKey);
    const display = isNotMeasured(rawValue) ? NOT_MEASURED : `${rawValue}${metric.unit || ""}`;
    const status = metric.status ? `<small class="metric-status metric-status--${escapeAttr(metric.status)}">${escapeHtml(metric.status)}</small>` : "";
    return `<article class="kpi"><span>${escapeHtml(metric.label)}</span><strong>${escapeHtml(display)}</strong><p>${escapeHtml(metric.description || "")}</p>${status}</article>`;
  }).join("");
}

function renderRoi(roi = {}) {
  if (!roi || roi.type === "hidden" || !hasContent(roi, ["summary", "cards", "calculator", "scenarios"])) return "";
  const isCalculator = roi.type === "calculator";
  const notice = roi.dataDisclaimer || (roi.isExample ? "示例测算 / 非真实客户数据" : "");
  const cards = roi.cards || roi.summary || [];
  const formula = roi.formula ? `<p class="roi-formula"><strong>${escapeHtml(roi.formula.label || "ROI")}</strong>${escapeHtml(roi.formula.value || roi.formula)}</p>` : "";
  const calculator = isCalculator ? renderRoiCalculator(roi) : "";
  const content = isCalculator ? `<div class="roi-layout"><div class="roi-copy">${heading("05 / ROI 与商业价值", roi.title || "用真实业务数据判断，是否值得上线", roi.description, "roi-title")}${notice ? `<p class="assumption-note">${escapeHtml(notice)}</p>` : ""}${cards.length ? `<div class="roi-value-grid">${list(cards, (card) => `<article><h3>${escapeHtml(card.title)}</h3><p>${escapeHtml(card.detail)}</p></article>`)}</div>` : ""}</div>${calculator}</div>` : `${heading("05 / ROI 与商业价值", roi.title || "商业价值如何验证？", roi.description, "roi-title")}${notice ? `<p class="assumption-note">${escapeHtml(notice)}</p>` : ""}${cards.length ? `<div class="roi-value-grid">${list(cards, (card) => `<article><h3>${escapeHtml(card.title)}</h3><p>${escapeHtml(card.detail)}</p></article>`)}</div>` : ""}${formula}`;
  return `<section id="roi" class="section roi roi--full" aria-labelledby="roi-title"><div class="shell">
    ${content}
  </div></section>`;
}

function renderRoiCalculator(roi = {}) {
  if (roi.calculatorMode === "maintenance") return renderMaintenanceRoiCalculator(roi);
  const scenarios = roi.scenarios || {};
  const activeKey = scenarios.baseline ? "baseline" : Object.keys(scenarios)[0];
  if (!activeKey) return "";
  const active = scenarios[activeKey] || {};
  const labels = { conservative: "保守", baseline: "基准", optimistic: "积极" };
  const fields = [
    ["volume", "月业务量", "", 100],
    ["minutes", "单次人工处理时间（分钟）", "", 1],
    ["hourlyCost", "人工小时成本（元）", "", 1],
    ["reduction", "AI 可减少人工时间比例（%）", "%", 1],
    ["highRiskRate", "关键 / 高风险业务占比（%）", "%", 1],
    ["systemCost", "每月系统成本（元）", "", 100]
  ];
  const buttons = Object.entries(scenarios).map(([key]) => `<button type="button" data-roi-scenario="${escapeAttr(key)}" class="${key === activeKey ? "is-active" : ""}" aria-pressed="${key === activeKey}">${escapeHtml(labels[key] || key)}</button>`).join("");
  const inputs = fields.map(([key, label, unit, step]) => `<label>${escapeHtml(label)}<span><input type="number" min="0" step="${step}" data-roi-input="${key}" value="${escapeAttr(active[key] ?? "")}" aria-label="${escapeAttr(label)}">${unit ? `<small>${unit}</small>` : ""}</span></label>`).join("");
  const currency = roi.currency || "¥";
  return `<div class="roi-calculator" data-roi-calculator data-roi-scenarios="${escapeAttr(JSON.stringify(scenarios))}" data-roi-currency="${escapeAttr(currency)}" aria-label="ROI 测算器"><div class="roi-scenarios" role="group" aria-label="测算方案">${buttons}</div><p class="roi-calculator-note">示例测算 / 非真实客户数据</p><div class="roi-inputs">${inputs}</div><div class="roi-results" aria-live="polite"><article><span>人工基线成本</span><strong data-roi-result="baseline">-</strong></article><article><span>AI 后人工成本</span><strong data-roi-result="afterAi">-</strong></article><article><span>月度节省</span><strong data-roi-result="saving">-</strong></article><article><span>净收益</span><strong data-roi-result="net">-</strong></article><article><span>ROI</span><strong data-roi-result="roi">-</strong></article><article><span>回收期</span><strong data-roi-result="payback">-</strong></article></div><p class="roi-review-queue" data-roi-review-queue></p></div>`;
}

function renderMaintenanceRoiCalculator(roi = {}) {
  const scenarios = roi.scenarios || {};
  const activeKey = scenarios.baseline ? "baseline" : Object.keys(scenarios)[0];
  if (!activeKey) return "";
  const active = scenarios[activeKey] || {};
  const labels = { conservative: "保守", baseline: "基准", optimistic: "积极" };
  const fields = [
    ["volume", "每月故障 / 技术查询次数", 1],
    ["currentMinutes", "当前平均单次查询时间（分钟）", 1],
    ["aiMinutes", "使用 AI 后预计查询时间（分钟）", 1],
    ["seniorRate", "高级工程师参与比例（%）", 1],
    ["seniorHourlyCost", "高级工程师人力成本（元 / 小时）", 1],
    ["generalHourlyCost", "普通工程师人力成本（元 / 小时）", 1],
    ["coverage", "AI 使用覆盖率（%）", 1]
  ];
  const buttons = Object.entries(scenarios).map(([key]) => `<button type="button" data-roi-scenario="${escapeAttr(key)}" class="${key === activeKey ? "is-active" : ""}" aria-pressed="${key === activeKey}">${escapeHtml(labels[key] || key)}</button>`).join("");
  const inputs = fields.map(([key, label, step]) => `<label>${escapeHtml(label)}<span><input type="number" min="0" step="${step}" data-roi-input="${key}" value="${escapeAttr(active[key] ?? "")}" aria-label="${escapeAttr(label)}">${key === "seniorRate" || key === "coverage" ? "<small>%</small>" : ""}</span></label>`).join("");
  return `<div class="roi-calculator roi-calculator--maintenance" data-roi-calculator data-roi-mode="maintenance" data-roi-scenarios="${escapeAttr(JSON.stringify(scenarios))}" data-roi-currency="${escapeAttr(roi.currency || "¥")}" aria-label="设备运维知识助手 ROI 估算工具">
    <div class="roi-scenarios" role="group" aria-label="ROI 估算方案">${buttons}</div>
    <p class="roi-calculator-note">${escapeHtml(roi.dataDisclaimer || "估算工具，不代表实际生产收益。")}</p>
    <div class="roi-inputs">${inputs}</div>
    <div class="roi-results" aria-live="polite"><article><span>每月预计节省工时</span><strong data-roi-result="hoursSaved">-</strong></article><article><span>每月预计人力成本节省</span><strong data-roi-result="monthlySaving">-</strong></article><article><span>年度预计节省</span><strong data-roi-result="annualSaving">-</strong></article><article><span>单次查询时间下降</span><strong data-roi-result="timeReduction">-</strong></article></div>
  </div>`;
}

function renderRiskControls(risk = {}, legacy = {}, evidence) {
  const hasNewRisk = hasContent(risk, ["aiDoes", "aiDoesNot", "humanReview", "fallback", "security"]);
  if (!hasNewRisk && !hasContent(legacy, ["verifiedCapabilities", "notProvenItems", "decisionSummary"])) return "";
  const verified = hasNewRisk ? risk.aiDoes || [] : legacy.verifiedCapabilities || readSourceValue(evidence.data, "verified_capabilities") || [];
  const limited = hasNewRisk ? risk.aiDoesNot || [] : legacy.notProvenItems || readSourceValue(evidence.data, "not_proven") || [];
  const controls = [risk.humanReview && { title: "人工审核点", detail: risk.humanReview }, risk.fallback && { title: "安全降级", detail: risk.fallback }, risk.security && { title: "权限与审计", detail: risk.security }].filter(Boolean);
  return `<section id="boundary" class="section boundary" aria-labelledby="boundary-title"><div class="shell">
    ${heading("06 / 风险、边界与人工控制", risk.title || legacy.title || "哪些能力受控，哪些尚未证明？", risk.description || legacy.description, "boundary-title", true)}
    <div class="boundary-grid"><article><h3>AI 已验证可做</h3><ul>${list(verified, (item) => `<li>${escapeHtml(item)}</li>`)}</ul></article><article><h3>AI 不做 / 尚未验证</h3><ul>${list(limited, (item) => `<li>${escapeHtml(item)}</li>`)}</ul></article></div>
    ${controls.length ? `<div class="control-grid">${list(controls, (item) => `<article><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.detail)}</p></article>`)}</div>` : ""}${(risk.summary || legacy.decisionSummary) ? `<p class="decision-summary">${escapeHtml(risk.summary || legacy.decisionSummary)}</p>` : ""}
  </div></section>`;
}

function renderProductionPath(path = {}) {
  if (!hasContent(path, ["title", "steps", "verified", "nextValidation", "gaps"])) return "";
  const readiness = [path.verified?.length && { title: "已验证", items: path.verified }, path.nextValidation?.length && { title: "下一阶段验证", items: path.nextValidation }, path.gaps?.length && { title: "生产前缺口", items: path.gaps }].filter(Boolean);
  return `<section id="roadmap" class="section shell" aria-labelledby="roadmap-title">
    ${heading("07 / POC 到生产化", path.title || "从 POC 到生产还差什么？", path.description, "roadmap-title")}${path.steps?.length ? `<ol class="roadmap-list">${list(path.steps, (step, index) => `<li><span>${String(index + 1).padStart(2, "0")}</span><strong>${escapeHtml(step.title)}</strong><p>${escapeHtml(step.detail || "")}</p>${step.gate ? `<small>验收条件：${escapeHtml(step.gate)}</small>` : ""}</li>`)}</ol>` : ""}${readiness.length ? `<div class="readiness-grid">${list(readiness, (group) => `<article><h3>${escapeHtml(group.title)}</h3><ul>${list(group.items, (item) => `<li>${escapeHtml(item)}</li>`)}</ul></article>`)}</div>` : ""}
  </section>`;
}

function renderRoleDeliverables(role = {}) {
  if (!hasContent(role, ["roleItems", "deliverables", "repoLink", "ctaLinks"])) return "";
  const links = role.ctaLinks?.length
    ? role.ctaLinks.map((link) => `<a class="case-footer__link${link.variant === "primary" ? " case-footer__link--primary" : ""}" href="${escapeAttr(link.href || "#")}">${escapeHtml(link.label || "查看详情")}</a>`).join("")
    : role.repoLink ? `<a href="${escapeAttr(role.repoLink)}">查看代码仓库</a>` : "";
  return `<section class="section shell contribution" aria-labelledby="contribution-title">${heading("项目角色与交付物", role.title || "项目角色与交付物", role.description, "contribution-title")}<div class="contribution-grid"><article><h3>负责内容</h3><ul>${list(role.roleItems, (item) => `<li>${escapeHtml(item)}</li>`)}</ul></article><article><h3>交付物</h3><ul>${list(role.deliverables, (item) => `<li>${escapeHtml(item)}</li>`)}</ul></article></div>${links ? `<footer class="case-footer">${links}</footer>` : ""}</section>`;
}

function renderCustomSections(sections = []) {
  return (sections || []).filter((section) => section && section.enabled !== false).sort((a, b) => (a.order || 50) - (b.order || 50)).map(renderCustomSection).join("");
}

function renderCustomSection(section) {
  if (section.type === "roi") return renderLegacyRoi(section);
  const data = section.data || {};
  const title = section.title || "补充信息";
  if (["media", "video", "screenshots"].includes(section.type)) return renderMediaSection(section, data, title);
  if (section.type === "inputOutput") return renderInputOutputSection(section, data, title);
  const cards = data.cards || data.items || [];
  if (!cards.length) return "";
  return `<section id="${escapeAttr(section.id)}" class="section shell" aria-labelledby="${escapeAttr(section.id)}-title">${heading(section.kicker || "补充信息", title, section.description, `${section.id}-title`)}<div class="custom-card-grid">${list(cards, (card) => `<article><h3>${escapeHtml(card.title)}</h3><p>${escapeHtml(card.detail)}</p></article>`)}</div>${data.note ? `<div class="custom-note"><p>${escapeHtml(data.note)}</p></div>` : ""}</section>`;
}

function renderLegacyRoi(section) {
  const data = section.data || {};
  if (!data.cards?.length && !data.formulas?.length) return "";
  const inner = `${heading(section.kicker || "ROI / 商业价值", section.title, section.description, `${section.id}-title`)}${data.cards?.length ? `<div class="roi-value-grid">${list(data.cards, (card) => `<article><h3>${escapeHtml(card.title)}</h3><p>${escapeHtml(card.detail)}</p></article>`)}</div>` : ""}${data.formulas?.length ? `<div class="roi-formula">${list(data.formulas, (formula) => `<p><strong>${escapeHtml(formula.label)}</strong> = ${escapeHtml(formula.value)}</p>`)}</div>` : ""}`;
  return `<section id="${escapeAttr(section.id)}" class="section roi roi--full" aria-labelledby="${escapeAttr(section.id)}-title"><div class="shell">${inner}</div></section>`;
}

function renderMediaSection(section, data, title) {
  const media = data.items || data.media || [];
  if (!media.length) return "";
  return `<section id="${escapeAttr(section.id)}" class="section shell" aria-labelledby="${escapeAttr(section.id)}-title">${heading(section.kicker || "补充材料", title, section.description, `${section.id}-title`)}<div class="media-grid">${list(media, (item) => `<figure><img src="${escapeAttr(item.src)}" alt="${escapeAttr(item.alt || item.title || "案例素材")}"><figcaption><strong>${escapeHtml(item.title || "")}</strong>${item.detail ? `<span>${escapeHtml(item.detail)}</span>` : ""}</figcaption></figure>`)}</div></section>`;
}

function renderInputOutputSection(section, data, title) {
  if (!data.input && !data.output) return "";
  return `<section id="${escapeAttr(section.id)}" class="section shell" aria-labelledby="${escapeAttr(section.id)}-title">${heading(section.kicker || "示例输入与输出", title, section.description, `${section.id}-title`)}<div class="io-grid"><article><h3>示例输入</h3><pre>${escapeHtml(data.input || "")}</pre></article><article><h3>示例输出</h3><pre>${escapeHtml(data.output || "")}</pre></article></div></section>`;
}

function renderArtifactLinks(artifacts = []) {
  if (!artifacts?.length) return "";
  return `<footer class="evidence-links">${list(artifacts, (item) => `<a href="${escapeAttr(item.href || item.url || "#")}"${item.newWindow ? " target=\"_blank\" rel=\"noreferrer\"" : ""}>${escapeHtml(item.label || "查看证明材料")}</a>`)}</footer>`;
}

function bindWorkflowPreview(root) {
  root.querySelectorAll("[data-workflow-open]").forEach((trigger) => trigger.addEventListener("click", () => {
    const dialog = document.createElement("dialog");
    dialog.className = "workflow-dialog";
    dialog.innerHTML = `<button type="button" aria-label="关闭工作流预览">关闭</button><img src="${trigger.dataset.src}" alt="${trigger.dataset.alt}">`;
    dialog.querySelector("button").addEventListener("click", () => dialog.close());
    dialog.addEventListener("close", () => dialog.remove());
    document.body.append(dialog);
    dialog.showModal();
  }));
}

function bindRoiCalculators(root) {
  root.querySelectorAll("[data-roi-calculator]").forEach((calculator) => {
    let scenarios = {};
    try { scenarios = JSON.parse(calculator.dataset.roiScenarios || "{}"); } catch { return; }
    const inputs = [...calculator.querySelectorAll("[data-roi-input]")];
    const currency = calculator.dataset.roiCurrency || "¥";
    const formatCurrency = (value) => `${currency}${Math.round(value).toLocaleString("zh-CN")}`;
    const read = () => Object.fromEntries(inputs.map((input) => [input.dataset.roiInput, Math.max(0, Number(input.value) || 0)]));
    const updateMaintenance = () => {
      const data = read();
      const coverage = Math.min(data.coverage, 100) / 100;
      const seniorRate = Math.min(data.seniorRate, 100) / 100;
      const blendedHourlyCost = data.seniorHourlyCost * seniorRate + data.generalHourlyCost * (1 - seniorRate);
      const minutesSaved = Math.max(0, data.currentMinutes - data.aiMinutes);
      const hoursSaved = data.volume * coverage * minutesSaved / 60;
      const monthlySaving = hoursSaved * blendedHourlyCost;
      const values = { hoursSaved: `${hoursSaved.toFixed(1)} 小时`, monthlySaving: formatCurrency(monthlySaving), annualSaving: formatCurrency(monthlySaving * 12), timeReduction: data.currentMinutes ? `${(minutesSaved / data.currentMinutes * 100).toFixed(0)}%` : "0%" };
      Object.entries(values).forEach(([key, value]) => { const output = calculator.querySelector(`[data-roi-result="${key}"]`); if (output) output.textContent = value; });
    };
    const updateDefault = () => {
      const data = read();
      const baseline = data.volume * data.minutes / 60 * data.hourlyCost;
      const saving = baseline * Math.min(data.reduction, 100) / 100;
      const afterAi = baseline - saving;
      const net = saving - data.systemCost;
      const roi = data.systemCost ? net / data.systemCost * 100 : 0;
      const payback = saving ? data.systemCost / saving : null;
      const values = { baseline: formatCurrency(baseline), afterAi: formatCurrency(afterAi), saving: formatCurrency(saving), net: formatCurrency(net), roi: `${roi.toFixed(0)}%`, payback: payback === null ? "未验证" : `${payback.toFixed(1)} 个月` };
      Object.entries(values).forEach(([key, value]) => { const output = calculator.querySelector(`[data-roi-result="${key}"]`); if (output) output.textContent = value; });
      const queue = calculator.querySelector("[data-roi-review-queue]");
      if (queue) queue.textContent = `预计重点复核：${Math.round(data.volume * Math.min(data.highRiskRate, 100) / 100).toLocaleString("zh-CN")} 件 / 月`;
    };
    calculator.querySelectorAll("[data-roi-scenario]").forEach((button) => button.addEventListener("click", () => {
      const scenario = scenarios[button.dataset.roiScenario] || {};
      inputs.forEach((input) => { input.value = scenario[input.dataset.roiInput] ?? ""; });
      calculator.querySelectorAll("[data-roi-scenario]").forEach((item) => { const active = item === button; item.classList.toggle("is-active", active); item.setAttribute("aria-pressed", String(active)); });
      if (calculator.dataset.roiMode === "maintenance") updateMaintenance(); else updateDefault();
    }));
    inputs.forEach((input) => input.addEventListener("input", calculator.dataset.roiMode === "maintenance" ? updateMaintenance : updateDefault));
    if (calculator.dataset.roiMode === "maintenance") updateMaintenance(); else updateDefault();
  });
}

function heading(kicker, title, description, id, inverse = false) { return `<header class="section-heading${inverse ? " inverse" : ""}">${kicker ? `<p class="section-kicker">${escapeHtml(kicker)}</p>` : ""}<h2 id="${escapeAttr(id)}">${escapeHtml(title || "")}</h2>${description ? `<p>${escapeHtml(description)}</p>` : ""}</header>`; }
function hasContent(value, keys) { return !!value && keys.some((key) => Array.isArray(value[key]) ? value[key].length > 0 : Boolean(value[key])); }
function arrayOrText(value) { return Array.isArray(value) ? value.join("、") : value; }
function readSourceValue(source, path) { return !source || !path ? undefined : path.split(".").reduce((value, key) => value && value[key] !== undefined ? value[key] : undefined, source); }
function isNotMeasured(value) { return value === undefined || value === null || value === "" || value === "not_measured" || value === "not_available"; }
function list(items = [], render) { return (items || []).map(render).join(""); }
function escapeHtml(value) { return String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]); }
function escapeAttr(value) { return escapeHtml(value).replace(/`/g, "&#96;"); }
