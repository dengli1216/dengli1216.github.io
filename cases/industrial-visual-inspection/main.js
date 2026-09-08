const evidenceUrl = "portfolio-evidence.json";

const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (char) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "'": "&#39;",
  '"': "&quot;"
})[char]);

const verifiedItems = [
  "多模态视觉语义理解",
  "结构化 Schema 输出",
  "规则引擎",
  "不确定性 / 主动停止判断",
  "人工复核门控",
  "视觉读数与业务异常分离"
];

const notProvenItems = [
  "真实生产准确率",
  "真实现场泛化能力",
  "Direct OCR",
  "Analog Gauge 专用读数",
  "机器人接入",
  "真实 CMMS / EAM 集成"
];

function renderMetrics(data) {
  const metrics = data.final_regression;
  const primary = [
    ["API 成功", metrics.api_success, "完整 12 图调用成功"],
    ["Schema 合规", metrics.schema_compliance, "输出结构稳定"],
    ["Unsafe Guess", String(metrics.unsafe_guess_count), "不可靠读数不强行猜测"],
    ["人工复核 Gate", metrics.review, "高风险样本进入复核"]
  ];
  const secondary = [
    ["Reading", metrics.reading, "读数/状态匹配"],
    ["Anomaly", metrics.anomaly, "异常判断匹配"],
    ["Critical", metrics.critical_pass, "困难样本仍保留边界"],
    ["P95", `${(metrics.latency_ms.p95 / 1000).toFixed(2)}s`, "最终回归延迟"]
  ];

  document.querySelector("#primary-kpis").innerHTML = primary.map(([label, value, note]) => (
    `<article class="kpi"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong><p>${escapeHtml(note)}</p></article>`
  )).join("");
  document.querySelector("#secondary-kpis").innerHTML = secondary.map(([label, value, note]) => (
    `<article class="kpi"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong><p>${escapeHtml(note)}</p></article>`
  )).join("");
}

function renderBoundaryLists() {
  document.querySelector("#verified-list").innerHTML = verifiedItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  document.querySelector("#not-proven-list").innerHTML = notProvenItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function renderLoadError() {
  document.querySelector("#primary-kpis").innerHTML = '<p class="load-error" role="alert">公开指标暂未加载，请通过本地 Web Server 或 GitHub Pages 访问。</p>';
  document.querySelector("#secondary-kpis").innerHTML = "";
}

fetch(evidenceUrl)
  .then((response) => {
    if (!response.ok) throw new Error(`Evidence file failed: ${response.status}`);
    return response.json();
  })
  .then((data) => {
    renderMetrics(data);
    renderBoundaryLists();
  })
  .catch(() => {
    renderBoundaryLists();
    renderLoadError();
  });
