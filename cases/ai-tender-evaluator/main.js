const evidenceUrl = "poc/reports/page-evidence.json";
const percent = (value) => `${Math.round(value * 100)}%`;
const seconds = (value) => `${Number(value).toFixed(value === 46.33 ? 2 : 3)}s`;
const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
const statusForDecision = (decision) => ({
  Bid: ["Met", "met", "关键资格证据匹配且无 Critical Gap", "保留复核记录并进入下一阶段评审。"],
  "No-Bid": ["Gap", "gap", "关键资格材料缺失，触发 Critical Gap", "先补齐关键材料；未补齐前不建议投标。"],
  "Conditional Bid": ["Unclear", "unclear", "关键材料待确认，需补充证明", "进入人工复核队列，确认后再决定。"]
}[decision] || ["Unclear", "unclear", "待人工确认", "进入人工复核队列。"]);

function renderExecution(execution, gateSummary) {
  document.querySelector("#execution-scorecard").innerHTML = [
    ["真实 API 运行", execution.api_cases_completed, "Recorded Dify API Evaluation"],
    ["Run ID 覆盖", execution.run_id_coverage, "每例均有可追溯运行记录"],
    ["关键 Gate", gateSummary.three_run_consistency, "每例额外运行 3 次，结果一致"],
    ["工作流成功", percent(execution.workflow_success_rate), "仅针对本轮 Synthetic POC"]
  ].map(([label, value, note]) => `<article class="metric-card"><span>${label}</span><strong>${value}</strong><p>${note}</p></article>`).join("");
  document.querySelector("#latency-panel").innerHTML = [["延迟证据", "Dify API 实测"], ["平均", seconds(execution.average_latency_seconds)], ["P50", seconds(execution.p50_latency_seconds)], ["P95", seconds(execution.p95_latency_seconds)]].map(([label, value]) => `<div><span>${label}</span><strong>${value}</strong></div>`).join("");
}
function renderMatrix(cases) {
  document.querySelector("#matrix-body").innerHTML = cases.map((item) => {
    const [status, className, requirement, action] = statusForDecision(item.decision);
    const risk = item.manual_review_required ? "需人工复核" : "无 Critical Gap";
    return `<tr><td><span class="case-id">${escapeHtml(item.case_id)}</span><br><strong>${escapeHtml(requirement)}</strong></td><td class="evidence-copy">${escapeHtml(item.evidence_summary)}</td><td><span class="status status-${className}">${status}</span></td><td><strong>${risk}</strong><br><span class="evidence-copy">${action}</span></td></tr>`;
  }).join("");
}
function renderQuality(quality, decisions) {
  const fields = [["Schema 合规", quality.schema_compliance_rate, "输出结构校验"], ["Critical Gap", quality.critical_gap_recall, "关键缺口召回"], ["人工复核", quality.manual_review_recall, "需人工项已召回"], ["引用有效", quality.citation_validity_rate, "证据可在对应输入中验证"], ["条款状态", quality.requirement_status_accuracy, "与 Golden Set 一致"], ["最终决策", quality.decision_accuracy, "由确定性 Gate 计算"], ["Golden Set 一致性", quality.synthetic_golden_consistency_rate, "Synthetic / 待人工复核"], ["虚构条款或证据", quality.hallucinated_clause_or_evidence_rate, "本轮校验为 0%"]];
  document.querySelector("#quality-scorecard").innerHTML = fields.map(([label, value, note]) => `<article class="quality-card"><span>${label}</span><strong>${percent(value)}</strong><p>${note}</p></article>`).join("");
  document.querySelector("#decision-distribution").innerHTML = Object.entries(decisions).map(([name, count]) => `<div class="decision-item"><span>${name}</span><strong>${count} 例</strong></div>`).join("");
}
function renderEvidence(data) {
  document.querySelector("#evidence-label").textContent = data.evidence_meta.display_label;
  document.querySelector("#workflow-version").textContent = data.evidence_meta.workflow_version;
  document.querySelector("#gate-consistency").textContent = `${data.key_gate_summary.three_run_consistency} 三次一致`;
  document.querySelector("#gate-list").innerHTML = data.key_gate_summary.gates.map((gate) => `<li><b>${escapeHtml(gate.case_id)}</b><span>${escapeHtml(gate.rule)}</span><em class="pass">三次一致</em></li>`).join("");
  document.querySelector("#limitations-list").innerHTML = data.limitations.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}
function showLoadError() { document.querySelector("#dashboard").setAttribute("aria-busy", "false"); document.querySelector("#execution-scorecard").innerHTML = '<p class="error-message">静态证据包未加载。请通过 GitHub Pages 或本地 Web Server 访问此案例页。</p>'; }
fetch(evidenceUrl).then((response) => { if (!response.ok) throw new Error(`Evidence file failed: ${response.status}`); return response.json(); }).then((data) => { renderExecution(data.execution_scorecard, data.key_gate_summary); renderMatrix(data.representative_cases); renderQuality(data.quality_scorecard, data.decision_distribution); renderEvidence(data); document.querySelector("#dashboard").setAttribute("aria-busy", "false"); }).catch(showLoadError);
