export const OPEN_GEO_PROJECT_ID = "open-geo-console";
export const OPEN_GEO_ARTIFACT_ID = "diagnostic-summary";

export const openGeoScenarios = [
  {
    id: "service-clarity",
    title: "企业服务表达是否容易被 AI 理解",
    summary: "使用一个虚构的企业服务页样本，检查实体、服务与证据表达。",
    steps: [
      { title: "读取示例页面", detail: "整理页面中的品牌、服务、受众和支持证据。" },
      { title: "检查语义缺口", detail: "标记机器难以稳定识别的关系与缺失字段。" },
      { title: "形成优先清单", detail: "把观察整理为可由团队复核的修改顺序。" },
    ],
    artifact: {
      title: "模拟交付物 · GEO 诊断摘要",
      findings: ["品牌与服务关系需要更直接的语义表达", "案例证据应与营销主张分开标注", "机器可读入口需要与可见页面保持一致"],
    },
  },
  {
    id: "answer-coverage",
    title: "目标问题的答案覆盖是否完整",
    summary: "使用一个虚构的问题集，检查页面是否提供清晰、可追溯的回答材料。",
    steps: [
      { title: "选择示例问题", detail: "确认问题意图、受众与需要的证据类型。" },
      { title: "映射现有内容", detail: "把示例页面片段映射到问题与支持证据。" },
      { title: "生成内容缺口", detail: "输出待人工确认的覆盖缺口与补充顺序。" },
    ],
    artifact: {
      title: "模拟交付物 · 答案覆盖清单",
      findings: ["核心问题需要一个直接答案段落", "关键限制应出现在正文而非仅放在说明中", "每个结论都应连接到可验证来源"],
    },
  },
] as const;

export type OpenGeoScenarioId = (typeof openGeoScenarios)[number]["id"];

export function getOpenGeoScenario(id: string | null | undefined) {
  return openGeoScenarios.find((scenario) => scenario.id === id);
}

export function getOpenGeoContactContext(params: {
  project?: string | null;
  scenario?: string | null;
  artifact?: string | null;
}) {
  if (params.project !== OPEN_GEO_PROJECT_ID || params.artifact !== OPEN_GEO_ARTIFACT_ID) return null;
  const scenario = getOpenGeoScenario(params.scenario);
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