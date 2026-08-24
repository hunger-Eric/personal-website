import type { Locale } from "./locale";

export const OPEN_GEO_PROJECT_ID = "open-geo-console";
export const OPEN_GEO_ARTIFACT_ID = "diagnostic-summary";

const openGeoScenarioDefinitions = [
  {
    id: "service-clarity",
    title: {
      zh: "企业服务表达是否容易被 AI 理解",
      en: "Can AI clearly understand the service offering?",
    },
    summary: {
      zh: "使用一个虚构的企业服务页样本，检查实体、服务与证据表达。",
      en: "Use a fictional enterprise service page to inspect how entities, services, and evidence are expressed.",
    },
    steps: [
      {
        title: { zh: "读取示例页面", en: "Read the sample page" },
        detail: {
          zh: "整理页面中的品牌、服务、受众和支持证据。",
          en: "Identify the brand, services, audience, and supporting evidence on the page.",
        },
      },
      {
        title: { zh: "检查语义缺口", en: "Check semantic gaps" },
        detail: {
          zh: "标记机器难以稳定识别的关系与缺失字段。",
          en: "Flag relationships and missing fields that machines may not identify reliably.",
        },
      },
      {
        title: { zh: "形成优先清单", en: "Create a priority list" },
        detail: {
          zh: "把观察整理为可由团队复核的修改顺序。",
          en: "Turn the observations into a change sequence the team can review.",
        },
      },
    ],
    artifact: {
      title: {
        zh: "模拟交付物 · GEO 诊断摘要",
        en: "Simulated deliverable · GEO diagnostic summary",
      },
      findings: [
        {
          zh: "品牌与服务关系需要更直接的语义表达",
          en: "The relationship between the brand and its services needs more direct semantic expression",
        },
        {
          zh: "案例证据应与营销主张分开标注",
          en: "Case evidence should be clearly separated from marketing claims",
        },
        {
          zh: "机器可读入口需要与可见页面保持一致",
          en: "Machine-readable entry points need to remain consistent with visible pages",
        },
      ],
    },
  },
  {
    id: "answer-coverage",
    title: {
      zh: "目标问题的答案覆盖是否完整",
      en: "Does the site fully cover the target questions?",
    },
    summary: {
      zh: "使用一个虚构的问题集，检查页面是否提供清晰、可追溯的回答材料。",
      en: "Use a fictional question set to check whether the page provides clear, traceable answer material.",
    },
    steps: [
      {
        title: { zh: "选择示例问题", en: "Select sample questions" },
        detail: {
          zh: "确认问题意图、受众与需要的证据类型。",
          en: "Confirm the question intent, audience, and required evidence types.",
        },
      },
      {
        title: { zh: "映射现有内容", en: "Map existing content" },
        detail: {
          zh: "把示例页面片段映射到问题与支持证据。",
          en: "Map sample page excerpts to questions and supporting evidence.",
        },
      },
      {
        title: { zh: "生成内容缺口", en: "Identify content gaps" },
        detail: {
          zh: "输出待人工确认的覆盖缺口与补充顺序。",
          en: "Produce coverage gaps and an addition sequence for human review.",
        },
      },
    ],
    artifact: {
      title: {
        zh: "模拟交付物 · 答案覆盖清单",
        en: "Simulated deliverable · Answer coverage checklist",
      },
      findings: [
        {
          zh: "核心问题需要一个直接答案段落",
          en: "Each core question needs a direct answer section",
        },
        {
          zh: "关键限制应出现在正文而非仅放在说明中",
          en: "Key limitations should appear in the main content, not only in notes",
        },
        {
          zh: "每个结论都应连接到可验证来源",
          en: "Every conclusion should connect to a verifiable source",
        },
      ],
    },
  },
] as const;

export type OpenGeoScenarioId = (typeof openGeoScenarioDefinitions)[number]["id"];

export const openGeoDemoCopy: Record<Locale, {
  eyebrow: string;
  heading: string;
  notice: string;
  journeyLabel: string;
  journey: readonly string[];
  selectProject: string;
  projectSummary: string;
  projectHelper: string;
  selectScenario: string;
  scenarioQuestion: string;
  backToProject: string;
  scenariosLabel: string;
  start: string;
  advance: string;
  step: string;
  recordLabel: string;
  input: string;
  inputValue: string;
  processing: string;
  processingValue: string;
  output: string;
  outputValue: string;
  previous: string;
  next: string;
  viewDeliverable: string;
  resetSelection: string;
  deliverable: string;
  simulatedData: string;
  artifactLabel: string;
  artifactDisclaimer: string;
  contact: string;
  changeScenario: string;
  restart: string;
}> = {
  zh: {
    eyebrow: "Open GEO Console · 参与式原型",
    heading: "亲手走完一次 AI 可见性诊断",
    notice: "模拟体验 · 全部为模拟数据；未执行真实抓取、模型调用或正式诊断。",
    journeyLabel: "体验流程",
    journey: ["选择项目", "选择场景", "点击开始", "主动推进", "查看交付物"],
    selectProject: "选择项目",
    projectSummary: "AI 搜索可见性诊断 · 高保真模拟原型",
    projectHelper: "本轮只开放 Open GEO Console。其他项目待你确认这套体验后再扩展。",
    selectScenario: "选择示例场景",
    scenarioQuestion: "你想先检查哪一种问题？",
    backToProject: "返回项目",
    scenariosLabel: "示例场景",
    start: "点击开始",
    advance: "主动推进",
    step: "步骤",
    recordLabel: "模拟处理记录",
    input: "输入",
    inputValue: "虚构企业页面与示例问题",
    processing: "处理",
    processingValue: "结构化检查与人工复核点标记",
    output: "输出",
    outputValue: "仅供体验的观察记录",
    previous: "上一步",
    next: "下一步",
    viewDeliverable: "查看模拟交付物",
    resetSelection: "重新选择",
    deliverable: "查看交付物",
    simulatedData: "模拟数据",
    artifactLabel: "模拟交付物",
    artifactDisclaimer: "这是一份交互示意，不是对任何真实企业的判断，也不代表客户结果。",
    contact: "携带此项目上下文联系",
    changeScenario: "更换场景",
    restart: "重新开始",
  },
  en: {
    eyebrow: "Open GEO Console · Participatory prototype",
    heading: "Walk through an AI visibility diagnosis",
    notice: "Simulated experience · All data is fictional; no live crawling, model calls, or formal diagnosis is performed.",
    journeyLabel: "Experience flow",
    journey: ["Select project", "Select scenario", "Start", "Advance", "View deliverable"],
    selectProject: "Select project",
    projectSummary: "AI search visibility diagnosis · High-fidelity simulated prototype",
    projectHelper: "This experience currently covers Open GEO Console only. Other projects can be added after this format is validated.",
    selectScenario: "Select a sample scenario",
    scenarioQuestion: "Which issue would you like to inspect first?",
    backToProject: "Back to project",
    scenariosLabel: "Sample scenarios",
    start: "Start",
    advance: "Advance",
    step: "Step",
    recordLabel: "Simulated processing record",
    input: "Input",
    inputValue: "Fictional company pages and sample questions",
    processing: "Processing",
    processingValue: "Structured checks and human-review markers",
    output: "Output",
    outputValue: "Observations for this simulation only",
    previous: "Previous",
    next: "Next",
    viewDeliverable: "View simulated deliverable",
    resetSelection: "Choose again",
    deliverable: "View deliverable",
    simulatedData: "Simulated data",
    artifactLabel: "Simulated deliverable",
    artifactDisclaimer: "This is an interactive illustration, not a judgment about any real company or a representation of customer results.",
    contact: "Contact us with this context",
    changeScenario: "Change scenario",
    restart: "Start over",
  },
};

export function getOpenGeoScenarios(locale: Locale) {
  return openGeoScenarioDefinitions.map((scenario) => ({
    id: scenario.id,
    title: scenario.title[locale],
    summary: scenario.summary[locale],
    steps: scenario.steps.map((step) => ({
      title: step.title[locale],
      detail: step.detail[locale],
    })),
    artifact: {
      title: scenario.artifact.title[locale],
      findings: scenario.artifact.findings.map((finding) => finding[locale]),
    },
  }));
}

export const openGeoScenarios = getOpenGeoScenarios("zh");

export function getOpenGeoScenario(
  id: string | null | undefined,
  locale: Locale = "zh"
) {
  return getOpenGeoScenarios(locale).find((scenario) => scenario.id === id);
}

export function getOpenGeoContactContext(params: {
  project?: string | null;
  scenario?: string | null;
  artifact?: string | null;
}, locale: Locale = "zh") {
  if (params.project !== OPEN_GEO_PROJECT_ID || params.artifact !== OPEN_GEO_ARTIFACT_ID) return null;
  const scenario = getOpenGeoScenario(params.scenario, locale);
  if (!scenario) return null;
  return {
    projectId: OPEN_GEO_PROJECT_ID,
    projectName: "Open GEO Console",
    scenarioId: scenario.id,
    scenarioTitle: scenario.title,
    artifactId: OPEN_GEO_ARTIFACT_ID,
    artifactTitle: scenario.artifact.title,
  } as const;
}
