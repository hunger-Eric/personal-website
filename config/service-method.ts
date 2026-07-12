export const serviceMethod = {
  problemSignals: [
    {
      id: "repetitive-entry",
      title: { zh: "重复录入与整理", en: "Repeated entry and cleanup" },
      description: {
        zh: "同一批信息需要在表格、聊天、邮件或业务系统之间反复复制。",
        en: "The same information is repeatedly copied across spreadsheets, chat, email, or business systems.",
      },
    },
    {
      id: "system-handoffs",
      title: { zh: "多系统无法衔接", en: "Disconnected systems" },
      description: {
        zh: "流程依赖人工下载、转发、核对和重新上传，状态无法持续追踪。",
        en: "The workflow relies on manual downloads, forwarding, checks, and uploads, with no durable status trail.",
      },
    },
    {
      id: "scattered-information",
      title: { zh: "信息分散难以追踪", en: "Scattered information" },
      description: {
        zh: "资料、判断依据和处理结果分散在个人经验与不同文件中。",
        en: "Source material, decision rationale, and outcomes are scattered across files and individual knowledge.",
      },
    },
    {
      id: "repeated-judgment",
      title: { zh: "重复判断与录入", en: "Repeated judgment and recording" },
      description: {
        zh: "相似规则每天由人工重新判断，结果还要再写回其他系统。",
        en: "People repeat similar judgments every day and then re-enter the result elsewhere.",
      },
    },
    {
      id: "fragile-automation",
      title: { zh: "自动化失败后只能重来", en: "Fragile automation" },
      description: {
        zh: "脚本或流程一旦中断，缺少恢复点、异常记录和人工接管机制。",
        en: "When a script or workflow stops, there is no checkpoint, exception record, or human takeover path.",
      },
    },
  ],
  method: [
    {
      id: "diagnose",
      title: { zh: "诊断现状", en: "Diagnose the current workflow" },
      description: {
        zh: "还原真实输入、处理步骤、责任人、异常与交付结果。",
        en: "Map real inputs, processing steps, owners, exceptions, and deliverable outcomes.",
      },
    },
    {
      id: "human-boundary",
      title: { zh: "设计人机边界", en: "Design the human boundary" },
      description: {
        zh: "明确 AI 可以处理什么、关键决策由谁审核、哪些动作必须人工确认。",
        en: "Define what AI may handle, who reviews critical decisions, and which actions require confirmation.",
      },
    },
    {
      id: "validate",
      title: { zh: "验证真实流程", en: "Validate the real workflow" },
      description: {
        zh: "使用真实样本验证输入、异常、恢复、审核与输出，而不是只演示理想路径。",
        en: "Validate inputs, exceptions, recovery, review, and outputs with real samples rather than an idealized demo path.",
      },
    },
    {
      id: "deliver",
      title: { zh: "交付并持续优化", en: "Deliver and improve" },
      description: {
        zh: "交付可运行系统、操作边界和追踪证据，再根据真实使用调整。",
        en: "Deliver a working system, operating boundaries, and traceable evidence, then improve it from real use.",
      },
    },
  ],
  suitableWork: [
    {
      zh: "高频、规则相对稳定、需要跨文件或跨系统流转的业务流程",
      en: "High-frequency workflows with relatively stable rules that move across files or systems",
    },
    {
      zh: "需要 AI 处理非结构化信息，但关键结果仍需人工审核的流程",
      en: "Workflows where AI handles unstructured information while critical results still require human review",
    },
    {
      zh: "需要保存状态、异常、恢复记录和可审计输出的自动化改造",
      en: "Automation that must preserve state, exceptions, recovery records, and auditable outputs",
    },
  ],
  boundaries: [
    {
      zh: "不销售固定行业模板；每个客户从实际流程诊断开始。",
      en: "No fixed industry templates are sold; every engagement starts from the actual workflow.",
    },
    {
      zh: "不承诺所有步骤无人值守；关键决策和高风险动作保留人工审核。",
      en: "Not every step is promised to be unattended; critical decisions and high-risk actions retain human review.",
    },
    {
      zh: "不使用虚构指标、客户身份或未经批准的项目结果作为销售证明。",
      en: "No invented metrics, customer identities, or unapproved project outcomes are used as sales proof.",
    },
    {
      zh: "初步提交不等于自动报价或必然安排会议。",
      en: "An initial submission is not an automatic quote or a guaranteed meeting.",
    },
  ],
} as const;
