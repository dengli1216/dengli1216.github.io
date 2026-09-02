const evidenceUrl = "poc/reports/page-evidence.json";

const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (char) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "'": "&#39;",
  '"': "&quot;"
})[char]);

const decisionCases = {
  G10: {
    requirement: "关键同类业绩必须提供可核验材料",
    evidence: "投标响应未提供可验证的同类业绩证明",
    llmStatus: "Gap",
    gate: "Critical Gap",
    action: "补齐证明材料，由 Bid Manager 复核后重新评估"
  },
  G30: {
    requirement: "关键资质在投标有效期内持续有效",
    evidence: "现有资质即将到期，续期状态待确认",
    llmStatus: "Unclear",
    gate: "Manual Review Required",
    action: "核验有效期、续期计划与证明文件后人工授权"
  }
};

function renderDecisionChains(data) {
  const gates = Object.fromEntries(data.key_gate_summary.gates.map((gate) => [gate.case_id, gate]));
  document.querySelector("#decision-chains").innerHTML = ["G10", "G30"].map((caseId) => {
    const details = decisionCases[caseId];
    const gate = gates[caseId];
    const decisionClass = gate.decision === "No-Bid" ? "no-bid" : "conditional";
    const steps = [
      ["要求", details.requirement],
      ["证据", details.evidence],
      ["LLM 状态", details.llmStatus],
      ["Gate", details.gate],
      ["建议", gate.decision],
      ["人工行动", details.action]
    ];
    return `<article class="chain">
      <header class="chain-header"><span>${caseId} · SYNTHETIC</span><strong class="${decisionClass}">${escapeHtml(gate.decision)}</strong></header>
      <ol>${steps.map(([label, value], index) => `<li><span>${index + 1}</span><b>${escapeHtml(label)}</b><p>${escapeHtml(value)}</p></li>`).join("")}</ol>
    </article>`;
  }).join("");
}

function renderEvidence(data) {
  const execution = data.execution_scorecard;
  const quality = data.quality_scorecard;
  const caseCount = data.evidence_meta.dataset.case_count;
  const metrics = [
    [execution.api_cases_completed, "真实 Dify API Run", "30/30 均有 Run ID"],
    [data.key_gate_summary.three_run_consistency, "关键 Gate 三次一致", "G10 / G11 / G12 / G28 / G30"],
    [`${Math.round(quality.schema_compliance_rate * caseCount)}/${caseCount}`, "Schema 合规", "仅针对本轮 Synthetic Golden Set"],
    [`${execution.p95_latency_seconds}s`, "P95 延迟", `平均 ${execution.average_latency_seconds}s`]
  ];
  document.querySelector("#evidence-metrics").innerHTML = metrics.map(([value, label, note]) => `<article class="evidence-metric"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong><p>${escapeHtml(note)}</p></article>`).join("");
  document.querySelector("#evidence-caption").textContent = `${data.evidence_meta.display_label} · ${data.evidence_meta.dataset.source_type} / ${data.evidence_meta.dataset.review_status} · API 未返回可用 Token 或成本数据`;
  document.querySelector("#limitations-list").innerHTML = data.limitations.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  document.querySelector("#workflow-version").textContent = `${data.evidence_meta.workflow_version} · Recorded Dify API Run`;
}

function renderLoadError() {
  document.querySelector("#decision-chains").innerHTML = '<p class="load-error" role="alert">脱敏决策证据暂未加载，请通过本地 Web Server 或 GitHub Pages 访问。</p>';
  document.querySelector("#evidence-metrics").innerHTML = '<p class="load-error" role="alert">验证指标暂不可用。</p>';
}

fetch(evidenceUrl)
  .then((response) => {
    if (!response.ok) throw new Error(`Evidence file failed: ${response.status}`);
    return response.json();
  })
  .then((data) => {
    renderDecisionChains(data);
    renderEvidence(data);
  })
  .catch(renderLoadError);
