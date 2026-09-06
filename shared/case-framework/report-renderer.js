import { renderCasePage } from "./case-renderer.js";

export async function renderReportPage(config) {
  const reportConfig = buildReportConfig(config);
  await renderCasePage(reportConfig);
}

function buildReportConfig(config) {
  const report = config.report || {};
  return {
    mount: config.mount || "#report",
    evidence: config.evidence,
    hero: {
      eyebrow: report.eyebrow || "最终 POC 报告",
      title: report.title || `${config.hero?.eyebrow || "AI POC"} 最终报告`,
      subtitle: report.subtitle || config.hero?.subtitle,
      tags: report.tags || config.hero?.tags,
      validationStatus: config.hero?.validationStatus
    },
    businessValue: {
      title: report.businessProblemTitle || "业务问题与 POC 范围",
      description: report.businessProblem,
      cards: report.scopeCards || []
    },
    solution: {
      title: report.architectureTitle || "最终冻结架构",
      description: report.architectureNote,
      flow: config.solution?.flow,
      roles: config.solution?.roles
    },
    evidence: {
      ...config.evidence,
      title: report.metricsTitle || "最终回归指标",
      description: report.metricsDescription || config.evidence?.description
    },
    customSections: report.customSections || [],
    decisionBoundary: {
      title: report.boundaryTitle || "已验证能力与限制",
      description: report.boundaryDescription,
      verifiedCapabilities: config.decisionBoundary?.verifiedCapabilities,
      notProvenItems: config.decisionBoundary?.notProvenItems,
      decisionSummary: config.decisionBoundary?.decisionSummary
    },
    productionPath: {
      title: report.recommendationTitle || "生产化建议与下一步",
      description: report.recommendation,
      steps: config.productionPath?.steps
    },
    roleDeliverables: {
      title: "工程 Evidence",
      description: "HTML report 是可读展示层；原始 Markdown、JSON、Golden Set 和 runner 继续作为可追溯证据。",
      roleItems: report.evidenceArtifacts || [],
      deliverables: config.roleDeliverables?.deliverables,
      reportLink: report.sourceReportLink,
      workflowLink: config.roleDeliverables?.workflowLink,
      repoLink: config.roleDeliverables?.repoLink
    }
  };
}
