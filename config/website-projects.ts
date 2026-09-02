import type { Locale } from "./locale";

export type WebsiteProjectStatus = "reviewed" | "materials-pending";

type LocalizedText = { zh: string; en: string };
export type WebsiteProjectFactKind = "problem" | "solution" | "buyerValue" | "boundary";

export type WebsiteProject = {
  id: "open-geo-console" | "hermes-notebook" | "freight-lead-agent" | "codex-feishu-bridge" | "enterprise-content-growth";
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
    category: { zh: "企业官网 GEO 诊断与 AI 搜索可见性整改", en: "AI search visibility diagnosis and remediation" },
    status: { zh: "公开产品｜可直接使用", en: "Public product | available now" },
    statusKind: "reviewed",
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
    interactive: false,
    liveUrl: "https://geo.itheheda.online",
  },
  {
    id: "hermes-notebook",
    name: { zh: "Hermes Notebook", en: "Hermes Notebook" },
    category: { zh: "企业数据整理与 AI 应用引擎", en: "Enterprise data engine for AI applications" },
    status: { zh: "可部署系统｜让企业资料可被 AI 检索和引用", en: "Deployable system | makes enterprise data retrievable and citable by AI" },
    statusKind: "reviewed",
    summary: {
      zh: "把散落在 PDF、Word、Excel、PPT、图片、本地文件夹和业务网页中的企业资料，整理成带来源、可检索的知识。企业可以通过 API 在这些数据上开发客服机器人、内部知识问答和业务助手。",
      en: "Turns enterprise information scattered across PDFs, Word, Excel, PowerPoint, images, local folders, and business web pages into citable, retrievable knowledge that can support customer-service bots, internal Q&A, and other business assistants through APIs.",
    },
    factKinds: ["problem", "solution", "buyerValue"],
    facts: {
      zh: [
        "企业真正有价值的数据散落在文件夹、Office 文档、PDF、图片和业务网页里。员工查找困难，不同 AI 应用又要重复整理同一批资料",
        "Hermes 导入多种格式的资料，恢复文档结构，建立可追溯的知识节点和检索索引，再通过受权限限制的问答与检索接口向上层应用提供证据",
        "客户得到一套由自己控制的企业知识引擎。客服机器人、内部问答和后续业务助手可以复用同一份整理好的企业数据，不必为每个 AI 应用重新清洗和导入资料",
      ],
      en: [
        "A company's most valuable information is scattered across folders, Office documents, PDFs, images, and business web pages. Employees struggle to find it, while separate AI applications repeatedly prepare the same material",
        "Hermes imports multiple formats, restores document structure, builds traceable knowledge nodes and retrieval indexes, and supplies evidence to downstream applications through permission-scoped query and retrieval APIs",
        "Customers receive an enterprise knowledge engine they control. Customer-service bots, internal Q&A, and future business assistants can reuse the same prepared data instead of cleaning and importing it again for every AI application",
      ],
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
    id: "codex-feishu-bridge",
    name: { zh: "Codex Feishu Bridge", en: "Codex Feishu Bridge" },
    category: { zh: "企业 AI 办公协作系统", en: "Enterprise AI collaboration system" },
    status: { zh: "可部署系统｜在飞书内协同使用 Codex", en: "Deployable system | collaborative Codex access in Feishu" },
    statusKind: "reviewed",
    summary: {
      zh: "把 Codex 接入企业飞书。成员用电脑或手机即可提交问题、文件和长期任务；即使离开工位，也能在原话题补充信息、查询状态和接收交付，任务由公司里保持在线的工作电脑继续执行。",
      en: "Connects Codex to an enterprise Feishu workspace. Members can submit questions, files, and long-running tasks from a computer or phone, then add context, check status, and receive deliverables after leaving their desks while an online company workstation continues the execution.",
    },
    factKinds: ["problem", "solution", "buyerValue"],
    facts: {
      zh: [
        "员工要在飞书、文件和 AI 工具之间反复搬运需求与结果，复杂任务往往只能交给少数会使用 Codex 的人代办；离开公司电脑后，任务也很难继续推进",
        "成员通过电脑或手机飞书提交需求和附件，系统把任务交给公司里保持在线的工作电脑，由 Codex 在指定工作目录中执行；同一话题的授权成员可以继续补充，结果与文件再送回原话题",
        "客户得到一套部署在自有工作站上的企业 AI 办公入口。成员回家或离开工位后，仍能用手机继续任务；团队还可以把反复验证有效的工作流程整理成可复用 Skill，让后续任务按同一方法执行，减少对个别熟练员工的依赖",
      ],
      en: [
        "Employees repeatedly move requests, files, and results between Feishu and separate AI tools. Complex work is often delegated to a few Codex users, and tasks become difficult to continue once people leave the company workstation",
        "Members submit requests and attachments from Feishu on a computer or phone. The system hands the work to Codex on an online company workstation, accepts follow-up input from authorized members in the same topic, and returns results and files there",
        "Customers receive an enterprise AI work entry point deployed on their own workstation. After going home or leaving their desks, members can continue tasks from their phones, while the team can turn repeatedly proven workflows into reusable Skills so later work follows the same method without depending on a few experienced employees",
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
    liveUrl: project.id === "open-geo-console" ? `${project.liveUrl}/${locale}` : project.liveUrl,
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
    liveUrl: project.id === "open-geo-console" ? `${project.liveUrl}/${locale}` : project.liveUrl,
  }));
}

export function getWebsiteProject(id: string, locale: Locale = "zh") {
  return getWebsiteProjects(locale).find((project) => project.id === id);
}

export function getPublicWebsiteProject(id: string, locale: Locale = "zh") {
  return getPublicWebsiteProjects(locale).find((project) => project.id === id);
}
