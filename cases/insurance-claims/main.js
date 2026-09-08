(() => {
  const $ = (id) => document.getElementById(id),
    fields = [
      "claims",
      "minutes",
      "hourly",
      "reduction",
      "highRisk",
      "systemCost",
    ].map($),
    money = (n) => `¥${Math.round(n).toLocaleString("zh-CN")}`,
    scenarios = {
      conservative: [2000, 12, 60, 40, 8, 10000],
      baseline: [3000, 12, 65, 45, 8, 12000],
      optimistic: [5000, 12, 65, 50, 10, 15000],
    };
  function calc() {
    const [c, m, h, r, , s] = fields.map((x) =>
        Math.max(0, Number(x.value) || 0),
      ),
      base = ((c * m) / 60) * h,
      after = base * (1 - Math.min(r, 100) / 100),
      saving = base - after,
      net = saving - s;
    $("baseline").textContent = money(base);
    $("afterAi").textContent = money(after);
    $("saving").textContent = money(saving);
    $("net").textContent = money(net);
    $("roiValue").textContent = s ? `${Math.round((net / s) * 100)}%` : "—";
    $("payback").textContent =
      saving > 0 ? `${(s / saving).toFixed(1)} 月` : "—";
    $("roiStatus").textContent =
      saving <= 0
        ? "当前假设下不形成正 ROI：请检视可减少时间比例与系统成本。"
        : net > 0
          ? "当前示例假设下形成正 ROI；请在真实 Pilot 中以实际业务数据验证。"
          : "当前假设下尚未形成正 ROI：月度节省不足以覆盖系统成本。";
  }
  fields.forEach((f) => f.addEventListener("input", calc));
  const scenarioButtons = document.querySelectorAll("[data-scenario]");
  function applyScenario(name) {
    fields.forEach((f, i) => (f.value = scenarios[name][i]));
    scenarioButtons.forEach((button) =>
      button.classList.toggle("active", button.dataset.scenario === name),
    );
    calc();
  }
  scenarioButtons.forEach((button) =>
    button.addEventListener("click", () => applyScenario(button.dataset.scenario)),
  );
  const d = document.querySelector(".lightbox");
  document
    .querySelectorAll("[data-lightbox-open]")
    .forEach((b) => b.addEventListener("click", () => d.showModal()));
  document
    .querySelector("[data-lightbox-close]")
    .addEventListener("click", () => d.close());
  d.addEventListener("click", (e) => {
    if (e.target === d) d.close();
  });
  applyScenario("baseline");
})();
