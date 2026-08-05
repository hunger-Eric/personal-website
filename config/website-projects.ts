import type { Locale } from "./locale";

export type WebsiteProjectStatus = "simulation" | "reviewed" | "materials-pending";

type LocalizedText = { zh: string; en: string };

export type WebsiteProject = {
  id: "open-geo-console" | "hermes-notebook" | "freight-lead-agent" | "enterprise-content-growth";
  name: LocalizedText;
  category: LocalizedText;
  status: LocalizedText;
  statusKind: WebsiteProjectStatus;
  summary: LocalizedText;
  facts: { zh: string[]; en: string[] };
  interactive: boolean;
};

export const websiteProjects: WebsiteProject[] = [
  {
    id: "open-geo-console",
    name: { zh: "Open GEO Console", en: "Open GEO Console" },
    category: { zh: "AI 搜索可见性诊断", en: "AI search visibility diagnostics" },
    status: { zh: "高保真模拟原型", en: "High-fidelity simulated prototype" },
    statusKind: "simulation",
    summary: {
      zh: "参与式展示企业网站如何被整理为可复核的 GEO 诊断路径。",
      en: "A participatory walkthrough of a reviewable GEO diagnostic path for an enterprise website.",
    },
    facts: {
      zh: ["全部使用虚构样本与模拟数据", "不执行真实抓取、模型调用或正式诊断"],
      en: ["Uses fictional samples and simulated data only", "Does not run live crawling, model calls, or formal diagnosis"],
    },
    interactive: true,
  },
  {
    id: "hermes-notebook",
    name: { zh: "Hermes Notebook", en: "Hermes Notebook" },
    category: { zh: "知识工作流系统", en: "Knowledge workflow system" },
    status: { zh: "公开材料整理中", en: "Public materials in review" },
    statusKind: "materials-pending",
    summary: {
      zh: "面向资料整理、引用与知识沉淀的系统方向；本轮不扩展互动演示。",
      en: "A system direction for source organization, citation, and knowledge capture; no interactive demo in this round.",
    },
    facts: {
      zh: ["当前只公开项目名称与系统方向", "交付状态与结果待公开材料审核后再补充"],
      en: ["Only the project name and system direction are public", "Delivery status and outcomes await public-material review"],
    },
    interactive: false,
  },
  {
    id: "freight-lead-agent",
    name: { zh: "Freight Lead Agent", en: "Freight Lead Agent" },
    category: { zh: "货运线索处理系统", en: "Freight lead processing system" },
    status: { zh: "公开事实已审核", en: "Public facts reviewed" },
    statusKind: "reviewed",
    summary: {
      zh: "把企业 Excel 与公开企业信息整理为可追踪、可人工复核的货运线索处理批次。",
      en: "Turns business spreadsheets and public company information into traceable, human-reviewed freight lead batches.",
    },
    facts: {
      zh: ["公开验收批次为 601 行：521 行有效、80 行无效、0 行处理失败", "只生成待人工审核的外联草稿，不自动批量发送", "公开数字仅代表一个已验收批次，不泛化为其他客户结果"],
      en: ["The disclosed accepted batch had 601 rows: 521 valid, 80 invalid, and 0 processing failures", "Produces outreach drafts for human review and does not auto-send in bulk", "Published numbers describe one accepted batch and are not generalized to other clients"],
    },
    interactive: false,
  },
  {
    id: "enterprise-content-growth",
    name: { zh: "企业内容增长系统", en: "Enterprise Content Growth System" },
    category: { zh: "企业内容工作流", en: "Enterprise content workflow" },
    status: { zh: "公开材料整理中", en: "Public materials in review" },
    statusKind: "materials-pending",
    summary: {
      zh: "企业内容工作流方向；本轮只保留项目入口，暂不扩展互动演示。",
      en: "An enterprise content workflow direction; this round keeps the project entry without an interactive demo.",
    },
    facts: {
      zh: ["当前只公开项目名称与方向", "不披露或虚构客户身份、增长指标与项目结果"],
      en: ["Only the project name and direction are public", "No customer identities, growth metrics, or outcomes are disclosed or invented"],
    },
    interactive: false,
  },
];

export function getWebsiteProjects(locale: Locale) {
  return websiteProjects.map((project) => ({
    id: project.id,
    name: project.name[locale],
    category: project.category[locale],
    status: project.status[locale],
    statusKind: project.statusKind,
    summary: project.summary[locale],
    facts: project.facts[locale],
    interactive: project.interactive,
  }));
}

export function getWebsiteProject(id: string, locale: Locale = "zh") {
  return getWebsiteProjects(locale).find((project) => project.id === id);
}