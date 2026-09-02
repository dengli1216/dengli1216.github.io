const evidenceUrl = "poc/reports/page-evidence.json";

const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (char) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "'": "&#39;",
  '"': "&quot;"
})[char]);

const casePresentation = {
  G10: {
    input: "关键同类业绩要求 × 未提供可核验证明",
    evidence: "关键材料缺失，未形成可验证的投标原文证据",
    gate: "Critical Gap → No-Bid",
    action: "补齐材料并由投标负责人复核后重新评估"
  },
  G30: {
    input: "关键资质即将到期 × 有效性待确认",
    evidence: "现有信息不足以确认投标有效期内持续合规",
    gate: "Unclear → Conditional Bid",
    action: "核验有效期、续期计划与证明文件后人工审批"
  }
};

function renderDecisionCases(data) {
  const gatesById = Object.fromEntries(data.key_gate_summary.gates.map((gate) => [gate.case_id, gate]));
  const representativeById = Object.fromEntries(data.representative_cases.map((item) => [item.case_id, item]));
  const caseIds = ["G10", "G30"];

  document.querySelector("#decision-cases").innerHTML = caseIds.map((caseId) => {
    const gate = gatesById[caseId];
    const presentation = casePresentation[caseId];
    const representative = representativeById[caseId];
    const decisionClass = gate.decision === "No-Bid" ? "decision-no-bid" : "";
    const evidence = representative?.evidence_summary || presentation.evidence;
    return `<article class="case-decision">
      <div class="case-heading"><span>${escapeHtml(caseId)} · Synthetic</span><strong class="${decisionClass}">${escapeHtml(gate.decision)}</strong></div>
      <dl class="case-body">
        <div class="case-row"><dt>输入摘要</dt><dd>${escapeHtml(presentation.input)}</dd></div>
        <div class="case-row"><dt>证据判断</dt><dd>${escapeHtml(evidence)}</dd></div>
        <div class="case-row"><dt>规则路径</dt><dd>${escapeHtml(presentation.gate)}</dd></div>
        <div class="case-row"><dt>人工行动</dt><dd>${escapeHtml(presentation.action)}</dd></div>
      </dl>
    </article>`;
  }).join("");
}

function renderEvidence(data) {
  const execution = data.execution_scorecard;
  const metrics = [
    [execution.api_cases_completed, "Recorded API Run", "30/30 均有真实 Run ID"],
    [data.key_gate_summary.three_run_consistency, "关键 Gate 三次一致", "G10 / G11 / G12 / G28 / G30"],
    [`${execution.p95_latency_seconds}s`, "P95 延迟", `平均 ${execution.average_latency_seconds}s`]
  ];
  document.querySelector("#evidence-metrics").innerHTML = metrics.map(([value, label, note]) => `<article class="evidence-metric"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong><p>${escapeHtml(note)}</p></article>`).join("");
  document.querySelector("#evidence-caption").textContent = `${data.evidence_meta.display_label} · 数据集 ${data.evidence_meta.dataset.case_count} 例 · ${data.evidence_meta.dataset.review_status} · API 未返回可用 Token/成本数据`;
  document.querySelector("#limitations-list").innerHTML = data.limitations.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  document.querySelector("#workflow-version").textContent = `${data.evidence_meta.workflow_version} · Recorded Dify API Run`;
}

function showLoadError() {
  document.querySelector("#decision-cases").innerHTML = '<p class="load-error" role="alert">脱敏证据包未加载，请通过本地 Web Server 或 GitHub Pages 访问。</p>';
  document.querySelector("#evidence-metrics").innerHTML = '<p class="load-error" role="alert">验证指标暂不可用。</p>';
}

fetch(evidenceUrl)
  .then((response) => {
    if (!response.ok) throw new Error(`Evidence file failed: ${response.status}`);
    return response.json();
  })
  .then((data) => {
    renderDecisionCases(data);
    renderEvidence(data);
  })
  .catch(showLoadError);
