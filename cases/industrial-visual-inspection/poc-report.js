const evidenceUrl = "portfolio-evidence.json";

const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (char) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "'": "&#39;",
  '"': "&quot;"
})[char]);

function renderReportMetrics(data) {
  const metrics = data.final_regression;
  const primary = [
    ["API 成功", metrics.api_success, "完整 12 图调用成功"],
    ["Schema 合规", metrics.schema_compliance, "输出结构稳定"],
    ["Unsafe Guess", metrics.unsafe_guess_count, "不可靠读数不强行猜测"],
    ["人工复核 Gate", metrics.review, "高风险样本进入复核"]
  ];
  const complete = [
    ["Reading", metrics.reading],
    ["Anomaly", metrics.anomaly],
    ["Review", metrics.review],
    ["Uncertainty", metrics.uncertainty],
    ["Critical pass", metrics.critical_pass],
    ["Failures", metrics.failures],
    ["Unsafe guess count", metrics.unsafe_guess_count],
    ["Correct abstention count", metrics.correct_abstention_count],
    ["P50 latency", `${metrics.latency_ms.p50}ms`],
    ["P95 latency", `${metrics.latency_ms.p95}ms`],
    ["Prompt tokens", metrics.token_usage.prompt_tokens],
    ["Completion tokens", metrics.token_usage.completion_tokens],
    ["Total tokens", metrics.token_usage.total_tokens],
    ["Cost", metrics.cost]
  ];

  document.querySelector("#report-primary-kpis").innerHTML = primary.map(([label, value, note]) => (
    `<article class="kpi"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong><p>${escapeHtml(note)}</p></article>`
  )).join("");
  document.querySelector("#report-metric-table").innerHTML = complete.map(([label, value]) => (
    `<tr><th scope="row">${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`
  )).join("");
}

function renderLoadError() {
  document.querySelector("#report-primary-kpis").innerHTML = '<p class="load-error" role="alert">公开指标暂未加载，请通过本地 Web Server 或 GitHub Pages 访问。</p>';
  document.querySelector("#report-metric-table").innerHTML = "";
}

fetch(evidenceUrl)
  .then((response) => {
    if (!response.ok) throw new Error(`Evidence file failed: ${response.status}`);
    return response.json();
  })
  .then(renderReportMetrics)
  .catch(renderLoadError);
