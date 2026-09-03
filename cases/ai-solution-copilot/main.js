const evidenceUrl = "poc/reports/page-evidence.json";
function setMetric(name, value) {
  document.querySelectorAll(`[data-metric="${name}"]`).forEach((node) => { node.textContent = value; });
}

function renderEvidence(data) {
  const metrics = data.validated_metrics;
  setMetric("golden_set_cases", metrics.golden_set_cases);
  setMetric("real_api_calls", metrics.run_id_coverage);
  setMetric("contract_and_branch_assertions", metrics.contract_and_branch_assertions);
  setMetric("key_case_three_run_consistency", metrics.key_case_three_run_consistency);
  setMetric("average_seconds", `${data.latency.average_seconds}s`);
  setMetric("p50_seconds", `${data.latency.p50_seconds}s`);
  setMetric("p95_seconds", `${data.latency.p95_seconds}s`);

  const reps = document.querySelector("#representative-list");
  reps.innerHTML = data.representative_evidence.slice(0, 3).map((item) => `
    <div class="representative-item"><strong>${item.result}</strong><span>脱敏代表用例 · Synthetic</span><code>${item.case_id}</code></div>
  `).join("");

  const cases = document.querySelector("#evidence-cases");
  cases.innerHTML = data.representative_evidence.map((item) => `
    <article class="evidence-case"><span class="case-id">${item.case_id}</span><strong>${item.result}</strong><code>Run ID<br>${item.run_id}</code></article>
  `).join("");
}

fetch(evidenceUrl)
  .then((response) => { if (!response.ok) throw new Error("Evidence unavailable"); return response.json(); })
  .then(renderEvidence)
  .catch(() => {
    document.querySelectorAll("[data-metric]").forEach((node) => { node.textContent = "—"; });
    const message = document.createElement("p");
    message.className = "boundary-note";
    message.textContent = "证据包未加载；页面不展示未核验数字。";
    document.querySelector(".hero-copy").append(message);
  });
