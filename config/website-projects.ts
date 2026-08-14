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
    factKinds: ["problem", "solution", "buyerValue"],
    facts: {
      zh: [
        "企业很难看见 AI 能否读懂官网、回答买家问题时引用了谁，以及为什么漏掉自己的品牌",
        "系统把技术检查、公共搜索证据、引用缺口和整改优先级放进同一条诊断流程",
        "客户得到一套可以持续执行的 GEO 优化方案，明确官网需要修改的位置、对应的修改建议，以及下一阶段应持续监测和迭代的方向",
      ],
      en: [
        "Companies struggle to see whether AI can understand their site, which sources buyer answers cite, and why their brand is omitted",
        "The system puts technical checks, public-search evidence, citation gaps, and remediation priorities into one diagnostic workflow",
        "Customers receive an actionable, ongoing GEO optimization plan that identifies what to change on the website, recommends how to change it, and defines what to monitor and improve next",
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
    category: { zh: "Google 地图获客与定制营销系统", en: "Google Maps prospecting and personalized outreach" },
    status: { zh: "可部署系统｜覆盖找客到跟进", en: "Deployable system | prospecting through follow-up" },
    statusKind: "reviewed",
    summary: {
      zh: "从 Google 地图批量发现目标企业，逐家读取官网业务与公开联系方式，再依据每家企业的网站内容准备定制营销邮件，并接入审核、发送与回复跟进。",
      en: "Finds target companies through Google Maps, reads each official website for business context and public contacts, prepares personalized outreach from that context, and carries it through review, sending, and reply follow-up.",
    },
    factKinds: ["problem", "solution", "buyerValue"],
    facts: {
      zh: [
        "销售人员要从 Google 地图找到目标企业，逐个确认官网、读取业务内容、寻找公开联系方式，再为每家公司单独准备开发邮件；这套工作很难靠人工持续放大",
        "系统按关键词和地区采集 Google 地图企业，进入官网提取业务信息与公开联系方式，结合每家公司的网站内容生成定制邮件，再交给销售审核、发送和跟进",
        "客户购买后，可以让一个小团队持续完成企业发现、官网研究和定制写信，减少逐家公司从零处理的时间，也避免所有潜在客户收到同一套通用话术",
      ],
      en: [
        "Sales teams must find target companies on Google Maps, verify each official website, understand the business, locate public contacts, and prepare a different message for every company, which is difficult to scale manually",
        "The system collects Google Maps companies by keyword and region, extracts business context and public contacts from each website, generates a personalized message, and sends it to sales for review, delivery, and follow-up",
        "Customers can use a small team to sustain company discovery, website research, and personalized writing while spending less time starting from zero for every prospect and avoiding one generic message for everyone",
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
