export const serviceMethod = {
  capabilities: [
    {
      id: "intake",
      title: { zh: "多来源信息汇总", en: "Multi-source intake" },
      description: {
        zh: "把分散信息形成统一、可追踪的结构化底稿。",
        en: "Turn scattered information into one traceable operating record.",
      },
      example: {
        zh: "资料散落在文档、表格和业务网页里，需要统一整理并保留来源。",
        en: "Documents, spreadsheets, and business web pages need to be brought together with their sources preserved.",
      },
    },
    {
      id: "decisions",
      title: { zh: "重复判断与录入", en: "Repeated decisions and entry" },
      description: {
        zh: "把稳定规则交给系统，把例外与高风险决策保留给人工。",
        en: "Give stable rules to the system while people retain exceptions and high-risk decisions.",
      },
      example: {
        zh: "同类信息每天重复分类、核对，再录入其他系统。",
        en: "Similar information is classified and checked every day, then entered into another system.",
      },
    },
    {
      id: "handoffs",
      title: { zh: "系统之间的数据接力", en: "Handoffs between systems" },
      description: {
        zh: "跨文件与业务系统传递状态，减少人工搬运和断点。",
        en: "Carry state across files and business systems with fewer manual transfers and gaps.",
      },
      example: {
        zh: "文件、任务和处理结果需要在不同工具之间反复传递。",
        en: "Files, tasks, and results repeatedly move between different tools.",
      },
    },
    {
      id: "recovery",
      title: { zh: "异常恢复与人工审核", en: "Recovery and human review" },
      description: {
        zh: "记录异常、保留恢复点，让系统真正可持续运行。",
        en: "Record exceptions and recovery points so the system can keep operating.",
      },
      example: {
        zh: "流程中断后需要知道停在哪里、谁来接管、如何继续。",
        en: "When work stops, the team needs to know where it stopped, who takes over, and how to continue.",
      },
    },
  ],
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
  deliverables: [
    {
      id: "workflow-map",
      title: { zh: "现状流程与系统边界", en: "Current workflow and system boundary" },
      description: {
        zh: "梳理步骤、责任人、输入输出与异常，说明系统接管什么、人工保留什么。",
        en: "Map steps, owners, inputs, outputs, and exceptions, including what the system handles and what people retain.",
      },
    },
    {
      id: "working-system",
      title: { zh: "可运行系统与部署结果", en: "Working system and deployment result" },
      description: {
        zh: "按约定交付可运行系统，或可复现的部署包、配置和运行入口，而不只是一份演示文档。",
        en: "Deliver a working system, or an agreed reproducible deployment package, configuration, and operating entry point—not only a presentation.",
      },
    },
    {
      id: "operating-guide",
      title: { zh: "操作说明与人工审核入口", en: "Operating guide and human review points" },
      description: {
        zh: "说明日常操作、所需权限、人工确认、异常接管和责任归属。",
        en: "Document routine operation, required access, human confirmation, exception takeover, and ownership.",
      },
    },
    {
      id: "recovery-path",
      title: { zh: "异常与恢复路径", en: "Exception and recovery path" },
      description: {
        zh: "保留异常记录、恢复点和重试或人工接管方式，避免流程中断后只能从头开始。",
        en: "Preserve exception records, checkpoints, and retry or human takeover paths so an interruption does not require restarting from scratch.",
      },
    },
    {
      id: "acceptance-evidence",
      title: { zh: "验收样本与结果记录", en: "Acceptance samples and result records" },
      description: {
        zh: "使用双方约定的真实样本记录预期、实际结果、异常和可追踪输出。",
        en: "Use agreed real samples to record expected and actual results, exceptions, and traceable outputs.",
      },
    },
    {
      id: "handover-support",
      title: { zh: "交接与后续支持范围", en: "Handover and support scope" },
      description: {
        zh: "在项目约定中明确系统归属、维护方式、变更范围与后续支持，不默认承诺固定服务时限。",
        en: "Define system ownership, maintenance, change scope, and follow-up support in the engagement without implying a default service-level commitment.",
      },
    },
  ],
  dataBoundaries: [
    {
      id: "required-data",
      title: { zh: "必要数据与真实样本", en: "Necessary data and real samples" },
      description: {
        zh: "只索取验证真实流程所必需的样本；开始前确认数据敏感性、用途和可用范围。",
        en: "Request only the samples needed to validate the real workflow, with sensitivity, purpose, and permitted use agreed before work starts.",
      },
    },
    {
      id: "deployment-processing",
      title: { zh: "部署与处理位置", en: "Deployment and processing location" },
      description: {
        zh: "本地、私有环境或云端方案由企业系统、数据要求和运维条件共同决定，不作一刀切承诺。",
        en: "Local, private, or cloud deployment is chosen from the company's systems, data requirements, and operating conditions rather than a blanket promise.",
      },
    },
    {
      id: "access-control",
      title: { zh: "最小权限与账户控制", en: "Least privilege and account control" },
      description: {
        zh: "系统只使用完成约定流程所需的权限；条件允许时，由企业保留账户、令牌和最终授权控制。",
        en: "The system uses only access needed for the agreed workflow; where practical, the company retains control of accounts, tokens, and final authorization.",
      },
    },
    {
      id: "retention-deletion",
      title: { zh: "保留、备份与删除", en: "Retention, backups, and deletion" },
      description: {
        zh: "数据保留周期、副本、备份与删除方式按项目明确，未约定的处理方式不视为默认承诺。",
        en: "Retention periods, copies, backups, and deletion are defined per engagement; unspecified handling is not treated as a default commitment.",
      },
    },
    {
      id: "human-authorization",
      title: { zh: "人工授权与高风险动作", en: "Human authorization for high-risk actions" },
      description: {
        zh: "外部发送、付款、发布或其他高风险动作必须保留人工授权或明确的审批入口。",
        en: "External sending, payment, publication, and other high-risk actions must retain human authorization or an explicit approval point.",
      },
    },
    {
      id: "verified-claims",
      title: { zh: "合规与安全声明", en: "Compliance and security claims" },
      description: {
        zh: "未经约定、审查或认证，不把技术实现表述为法律合规结论或安全认证。",
        en: "Technical implementation is not presented as a legal compliance conclusion or security certification without the relevant agreement, review, or certification.",
      },
    },
  ],
  faq: [
    {
      id: "diagnosis-fit",
      question: { zh: "哪些企业适合先做 AI 自动化诊断？", en: "Which companies should start with an AI automation diagnosis?" },
      answer: {
        zh: "高频发生、规则相对稳定、需要跨文件或系统流转，并且存在重复判断、异常处理或追踪困难的流程，通常值得先诊断。诊断的目标是判断是否适合自动化，而不是预设一定要上 AI。",
        en: "High-frequency workflows with relatively stable rules, cross-file or cross-system handoffs, repeated judgment, exception handling, or weak traceability are usually worth diagnosing. The goal is to determine fit, not to assume AI must be added.",
      },
    },
    {
      id: "saas-rpa-custom",
      question: { zh: "中小企业应该先买 SaaS、RPA，还是做定制系统？", en: "Should a small or medium business choose SaaS, RPA, or a custom system?" },
      answer: {
        zh: "标准流程且产品边界可接受时先看 SaaS；界面稳定、规则明确的重复操作可评估 RPA；跨系统、含非结构化信息、需要人工审核和异常恢复时，再考虑定制系统。应先诊断流程，再选择技术。",
        en: "Start with SaaS when the workflow is standard and product boundaries are acceptable; evaluate RPA for stable interfaces and explicit repetitive rules; consider a custom system when work crosses systems, includes unstructured information, and requires human review and recovery. Diagnose the workflow before choosing the technology.",
      },
    },
    {
      id: "provider-checks",
      question: { zh: "选择 AI 系统服务商时应该核实什么？", en: "What should a buyer verify when choosing an AI system provider?" },
      answer: {
        zh: "核实对方能否用真实样本复现流程，是否说清人机边界、标准交付物、异常恢复、数据权限、验收方式和后续支持；案例、客户身份和指标也应能被验证，不能只看演示。",
        en: "Verify whether the provider can reproduce the workflow with real samples and clearly define human boundaries, deliverables, exception recovery, data access, acceptance, and follow-up support. Cases, customer identities, and metrics should also be verifiable—not just demonstrated.",
      },
    },
    {
      id: "schedule-price",
      question: { zh: "项目周期和费用如何确定？", en: "How are schedule and price determined?" },
      answer: {
        zh: "周期和费用取决于流程诊断、系统连接数量、样本与异常复杂度、部署要求和验收范围。初步提交用于判断是否适合继续诊断，不等于自动报价。",
        en: "Schedule and price depend on workflow diagnosis, the number of system integrations, sample and exception complexity, deployment requirements, and acceptance scope. An initial submission is for fit assessment, not an automatic quote.",
      },
    },
    {
      id: "automation-guarantee",
      question: { zh: "是否承诺全自动或一定提升业务指标？", en: "Is full automation or a guaranteed business result promised?" },
      answer: {
        zh: "不承诺所有步骤无人值守，也不发明提升比例。关键决策和高风险动作保留人工审核，实际结果取决于流程、数据、使用方式和双方约定的验收标准。",
        en: "No promise is made that every step will be unattended, and no improvement percentage is invented. Critical decisions and high-risk actions retain human review; results depend on the workflow, data, use, and agreed acceptance criteria.",
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
