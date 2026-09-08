const language = new URLSearchParams(location.search).get("lang") === "en" ? "en" : "zh";
const caseKey = new URLSearchParams(location.search).get("case");
const cases = {
  "insurance-claims": {
    zh: ["AI 保险理赔智能助手", "已完成", "面向理赔材料核验、风险分流与人工审批的规划方向。"],
    en: ["AI Claims Triage Assistant", "In Planning", "A planned direction for claim-material verification, risk routing, and human approval."],
  },
  "contract-risk-reviewer": {
    zh: ["Contract Risk Reviewer", "规划中", "面向条款抽取、风险提示与法务复核的规划方向。"],
    en: ["Contract Risk Reviewer", "In Planning", "A planned direction for clause extraction, risk prompts, and legal review."],
  },
};
const fallback = language === "en"
  ? ["Case in development", "In Development", "This case is being prepared for the portfolio."]
  : ["案例开发中", "开发中", "该案例正在整理展示材料。"];
const item = cases[caseKey]?.[language] || fallback;
document.documentElement.lang = language === "en" ? "en" : "zh-CN";
document.title = `${item[0]} · AI CASES`;
document.querySelector("#name").textContent = item[0];
document.querySelector("#summary").textContent = item[2];
document.querySelector("main span").textContent = item[1];
document.querySelector("main a").href = `../../?lang=${language}`;
document.querySelector("main a").textContent = language === "en" ? "← Back to portfolio" : "← 返回案例库";
