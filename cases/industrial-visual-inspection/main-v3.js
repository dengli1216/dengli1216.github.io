const evidenceUrl = "portfolio-evidence.json";

const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (char) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "'": "&#39;",
  '"': "&quot;"
})[char]);

const capabilityLabels = {
  "Gemini semantic VLM structured visual observation": "Gemini semantic VLM：结构化视觉观察",
  "schema-compliant output": "schema-compliant output：输出契约稳定",
  "deterministic rule engine normalization": "deterministic Rule Engine：确定性业务归一化",
  "human review gate": "human review gate：高风险样本进入人工复核",
  "uncertainty and abstention for high-risk samples": "uncertainty / abstention：高风险样本主动保守处理",
  "separation of visual reading/state from anomaly decision": "reading/state 与 anomaly decision 分离"
};

const notProvenLabels = {
  "production accuracy": "production accuracy：当前不声明生产准确率",
  "direct OCR specialist reader": "direct OCR specialist reader：0/3，未通过 gate",
  "ROI Hybrid default path": "ROI Hybrid default path：存在 unsafe guess 回归",
  "analog gauge reader": "analog gauge reader：仅 feasibility，未实现读数器"
};

function renderKpis(data) {
  const result = data.final_regression;
  const kpis = [
    [result.api_success, "API Success", "完整 12 图调用成功"],
    [result.schema_compliance, "Schema", "结构化输出合规"],
    [result.reading, "Reading", "读数/状态匹配"],
    [result.anomaly, "Anomaly", "规则异常判断"],
    [result.review, "Review Gate", "人审门控命中"],
    [String(result.unsafe_guess_count), "Unsafe Guess", "expected null 时不猜数"]
  ];
  document.querySelector("#kpi-grid").innerHTML = kpis.map(([value, label, note]) => (
    `<article class="kpi"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong><p>${escapeHtml(note)}</p></article>`
  )).join("");
  document.querySelector("#evidence-caption").textContent =
    `${data.status} · ${data.dataset.sample_count} 张 ${data.dataset.type} 图片 · critical ${result.critical_pass} · uncertainty ${result.uncertainty} · P50 ${Math.round(result.latency_ms.p50)}ms / P95 ${Math.round(result.latency_ms.p95)}ms`;
}

function renderDecisionLists(data) {
  document.querySelector("#verified-list").innerHTML = data.verified_capabilities.map((item) => (
    `<li>${escapeHtml(capabilityLabels[item] || item)}</li>`
  )).join("");
  document.querySelector("#not-proven-list").innerHTML = data.not_proven.map((item) => (
    `<li>${escapeHtml(notProvenLabels[item] || item)}</li>`
  )).join("");
}

function renderLoadError() {
  document.querySelector("#kpi-grid").innerHTML = '<p class="load-error" role="alert">公开 evidence 暂未加载，请通过本地 Web Server 或 GitHub Pages 访问。</p>';
  document.querySelector("#evidence-caption").textContent = "指标读取失败时，不展示推断数据。";
  document.querySelector("#verified-list").innerHTML = '<li>公开 evidence 暂未加载。</li>';
  document.querySelector("#not-proven-list").innerHTML = '<li>公开 evidence 暂未加载。</li>';
}

fetch(evidenceUrl)
  .then((response) => {
    if (!response.ok) throw new Error(`Evidence file failed: ${response.status}`);
    return response.json();
  })
  .then((data) => {
    renderKpis(data);
    renderDecisionLists(data);
  })
  .catch(renderLoadError);
