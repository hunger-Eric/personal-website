import type { Locale } from "./locale";

export type WebsiteProjectStatus = "simulation" | "reviewed" | "materials-pending";

type LocalizedText = { zh: string; en: string };
export type WebsiteProjectFactKind = "problem" | "solution" | "buyerValue" | "boundary";

export type WebsiteProject = {
  id: "open-geo-console" | "hermes-notebook" | "freight-lead-agent" | "enterprise-content-growth";
  name: LocalizedText;
  category: LocalizedText;
  status: LocalizedText;
  statusKind: WebsiteProjectStatus;
  summary: LocalizedText;
  factKinds: WebsiteProjectFactKind[];
  facts: { zh: string[]; en: string[] };
  interactive: boolean;
  liveUrl?: string;
};

export const websiteProjects: WebsiteProject[] = [
  {
    id: "open-geo-console",
    name: { zh: "Open GEO Console", en: "Open GEO Console" },
    category: { zh: "AI 搜索可见性诊断与整改", en: "AI search visibility diagnosis and remediation" },
    status: { zh: "公开产品｜本页演示使用模拟数据", en: "Public product | simulated on-page demo" },
    statusKind: "simulation",
    summary: {
      zh: "为企业官网做 AI 搜索可见性诊断，把网站技术基础、买家问题、公开答案和引用证据整理成管理层决策报告与供应商任务包。",
      en: "Diagnoses an enterprise website's visibility in AI search, turning technical foundations, buyer questions, public answers, and citation evidence into an executive report and a vendor task package.",
    },
    factKinds: ["problem", "solution", "buyerValue", "boundary"],
    facts: {
      zh: [
        "企业很难看见 AI 能否读懂官网、回答买家问题时引用了谁，以及为什么漏掉自己的品牌",
        "系统把技术检查、公共搜索证据、引用缺口和整改优先级放进同一条诊断流程",
        "客户为一份有证据、有优先级、能直接执行的诊断付费，减少多团队重复排查和无效内容投入",
        "本页互动只演示产品流程，使用模拟数据，不代表正式诊断或客户结果",
      ],
      en: [
        "Companies struggle to see whether AI can understand their site, which sources buyer answers cite, and why their brand is omitted",
        "The system puts technical checks, public-search evidence, citation gaps, and remediation priorities into one diagnostic workflow",
        "Customers pay for an evidence-backed, prioritized diagnosis that vendors can execute without duplicating investigation or content work",
        "The on-page interaction demonstrates the workflow with simulated data and is not a formal diagnosis or customer outcome",
      ],
    },
    interactive: true,
    liveUrl: "https://geo.itheheda.online",
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
    factKinds: ["solution", "boundary"],
    facts: {
      zh: ["当前只公开项目名称与系统方向", "交付状态与结果待公开材料审核后再补充"],
      en: ["Only the project name and system direction are public", "Delivery status and outcomes await public-material review"],
    },
    interactive: false,
  },
  {
    id: "freight-lead-agent",
    name: { zh: "Freight Lead Agent", en: "Freight Lead Agent" },
    category: { zh: "货代销售线索运营系统", en: "Freight sales lead operations system" },
    status: { zh: "可部署系统｜产品能力已核对", en: "Deployable system | product capabilities reviewed" },
    statusKind: "reviewed",
    summary: {
      zh: "为跨境货代团队把找企业、查官网、补公开联系方式、审核线索和准备触达整合成一套可部署的销售运营系统。",
      en: "Gives cross-border freight teams a deployable sales operations system for finding companies, checking websites, enriching public contacts, reviewing leads, and preparing outreach.",
    },
    factKinds: ["problem", "solution", "buyerValue", "boundary"],
    facts: {
      zh: [
        "货代销售要在地图、Excel、企业官网和邮箱之间反复查找，名单质量、处理进度和判断依据很难交接",
        "系统把名单导入、公开企业信息采集、线索复核、发送计划和回复监控接成可暂停、恢复和追踪的流程",
        "客户购买的是一套能在自己环境运行的销售运营系统，用来减少重复人工、保留线索证据并控制真实触达风险",
        "本地测试与验收数据只验证系统能否工作，不作为客户结果或商业成效",
      ],
      en: [
        "Freight sales teams repeatedly move between maps, spreadsheets, company websites, and inboxes, making list quality, progress, and decision evidence hard to hand off",
        "The system connects list import, public-company research, lead review, send plans, and reply monitoring in a pausable, recoverable, traceable workflow",
        "Customers buy a sales operations system they can run in their own environment to reduce repetitive work, preserve lead evidence, and control real outreach risk",
        "Local test and acceptance data verify system behavior only and are not customer outcomes or commercial results",
      ],
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
    factKinds: ["solution", "boundary"],
    facts: {
      zh: ["当前只公开项目名称与方向", "不披露或虚构客户身份、增长指标与项目结果"],
      en: ["Only the project name and direction are public", "No customer identities, growth metrics, or outcomes are disclosed or invented"],
    },
    interactive: false,
  },
];

export function isPublicWebsiteProject(project: WebsiteProject) {
  return project.statusKind !== "materials-pending";
}

export const publicWebsiteProjects = websiteProjects.filter(
  isPublicWebsiteProject
);

export function getWebsiteProjects(locale: Locale) {
  return websiteProjects.map((project) => ({
    id: project.id,
    name: project.name[locale],
    category: project.category[locale],
    status: project.status[locale],
    statusKind: project.statusKind,
    summary: project.summary[locale],
    facts: project.factKinds.map((kind, index) => ({
      kind,
      text: project.facts[locale][index],
    })),
    interactive: project.interactive,
    liveUrl: project.liveUrl,
  }));
}

export function getPublicWebsiteProjects(locale: Locale) {
  return publicWebsiteProjects.map((project) => ({
    id: project.id,
    name: project.name[locale],
    category: project.category[locale],
    status: project.status[locale],
    statusKind: project.statusKind,
    summary: project.summary[locale],
    facts: project.factKinds.map((kind, index) => ({
      kind,
      text: project.facts[locale][index],
    })),
    interactive: project.interactive,
    liveUrl: project.liveUrl,
  }));
}

export function getWebsiteProject(id: string, locale: Locale = "zh") {
  return getWebsiteProjects(locale).find((project) => project.id === id);
}

export function getPublicWebsiteProject(id: string, locale: Locale = "zh") {
  return getPublicWebsiteProjects(locale).find((project) => project.id === id);
}
