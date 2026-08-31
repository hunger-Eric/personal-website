import type { Locale } from "./locale";

type ProductStep = {
  title: string;
  description: string;
};

type OpenGeoProductCopy = {
  eyebrow: string;
  heading: string;
  description: string;
  stepsLabel: string;
  steps: ProductStep[];
  outputsEyebrow: string;
  outputsHeading: string;
  outputs: string[];
  boundaryLabel: string;
  boundary: string;
  primaryAction: string;
  secondaryAction: string;
  humanBoundary: string;
  reportShowcase?: {
    eyebrow: string;
    heading: string;
    description: string;
    facts: Array<{ label: string; value: string }>;
    disclaimer: string;
    action: string;
    path: string;
    preview: {
      label: string;
      brandLine: string;
      title: string;
      summary: string;
      sections: string[];
      targetLabel: string;
      target: string;
      generatedLabel: string;
      generated: string;
      questionsLabel: string;
      questions: string;
    };
  };
};

export const openGeoProductCopy: Record<Locale, OpenGeoProductCopy> = {
  zh: {
    eyebrow: "Open GEO Console · 正式产品",
    heading: "Open GEO 到底做什么？",
    description:
      "输入需要诊断的网站与目标问题，系统检查页面是否容易被 AI 访问、理解和引用，再把发现整理成团队可以执行的整改顺序。",
    stepsLabel: "真实产品流程",
    steps: [
      {
        title: "输入网站",
        description: "提供企业官网、重点页面，以及希望覆盖的买家问题。",
      },
      {
        title: "执行检查",
        description: "核对技术基础、公开内容、问题覆盖与引用证据。",
      },
      {
        title: "标出问题",
        description: "把访问、语义、答案和引用缺口放进同一份证据清单。",
      },
      {
        title: "形成整改",
        description: "按影响与实施顺序整理网站修改建议和后续监测方向。",
      },
    ],
    outputsEyebrow: "你最终拿到什么",
    outputsHeading: "一套可以直接进入整改的诊断结果",
    outputs: ["证据问题清单", "页面修改建议", "整改优先级", "持续监测方向"],
    boundaryLabel: "人工判断仍然保留",
    boundary:
      "AI 平台、公开页面和查询结果会持续变化。诊断用于确定问题与整改优先级，关键结论、发布修改和后续投入仍由网站负责人复核决定。",
    primaryAction: "进入 Open GEO 正式产品",
    secondaryAction: "阅读 AI 可见性审计方法",
    humanBoundary:
      "诊断结果与整改优先级需要人工复核，是否修改、发布或持续监测由网站负责人决定。",
    reportShowcase: {
      eyebrow: "真实产物样例 · 中文报告",
      heading: "先看一份完整报告，再判断这套诊断有没有用",
      description:
        "这里按照 Open GEO 最新中文报告的章节和视觉结构做原生页面预览，不再使用静态截图。完整报告从公开页面证据出发，把网站现状、买家问题、未出现原因和整改动作整理成可执行的深度诊断。",
      facts: [
        { label: "检测对象", value: "实解智能官网" },
        { label: "报告结构", value: "9 个完整章节" },
        { label: "问题诊断", value: "3 个买家问题" },
        { label: "生成日期", value: "2026-08-31" },
      ],
      disclaimer:
        "报告保留生成当日的公开页面证据，用于展示 Open GEO 当前的报告结构与交付深度；它不是对网站或 AI 平台状态的实时监测。",
      action: "查看完整中文深度报告",
      path: "/projects/open-geo-console/report",
      preview: {
        label: "Open GEO 中文深度报告结构预览",
        brandLine: "决策型深度报告",
        title: "核心结论",
        summary:
          "实解智能从真实流程诊断开始，把稳定、重复的步骤交给系统，并为关键动作保留人工确认、异常恢复与可审计证据。",
        sections: [
          "核心结论",
          "网站现状",
          "客户问题",
          "回答差距",
          "页面分析",
          "技术整改",
          "行动摘要",
          "文章示例",
          "来源与方法",
        ],
        targetLabel: "检测网站",
        target: "me.itheheda.online",
        generatedLabel: "生成时间",
        generated: "2026-08-31",
        questionsLabel: "已回答问题",
        questions: "3 / 3",
      },
    },
  },
  en: {
    eyebrow: "Open GEO Console · Live product",
    heading: "What does Open GEO actually do?",
    description:
      "Submit the website and target questions to diagnose. The system checks whether AI can access, understand, and cite the site, then turns the evidence into an executable remediation order.",
    stepsLabel: "Live product flow",
    steps: [
      {
        title: "Input the site",
        description: "Provide the company site, priority pages, and buyer questions to cover.",
      },
      {
        title: "Run checks",
        description: "Inspect technical foundations, public content, answer coverage, and citation evidence.",
      },
      {
        title: "Identify gaps",
        description: "Combine access, semantics, answer, and citation gaps in one evidence list.",
      },
      {
        title: "Plan remediation",
        description: "Order website changes and ongoing monitoring by impact and implementation sequence.",
      },
    ],
    outputsEyebrow: "What you receive",
    outputsHeading: "A diagnosis ready to move into remediation",
    outputs: [
      "Evidence-backed issue list",
      "Page change recommendations",
      "Remediation priorities",
      "Ongoing monitoring direction",
    ],
    boundaryLabel: "Human judgment remains",
    boundary:
      "AI platforms, public pages, and query results continue to change. The diagnosis identifies issues and priorities; site owners still review key conclusions, approve changes, and decide the next investment.",
    primaryAction: "Open the live Open GEO product",
    secondaryAction: "Read the AI visibility audit method",
    humanBoundary:
      "People review the diagnosis and priorities, then decide what to change, publish, or continue monitoring.",
    reportShowcase: {
      eyebrow: "Real deliverable · English report",
      heading: "Review a complete report before deciding whether the diagnosis is useful",
      description:
        "This native preview reproduces the section and visual structure of the latest English Open GEO report instead of using a static screenshot. The complete report connects public-page evidence, buyer questions, visibility gaps, and remediation actions in one decision-ready diagnosis.",
      facts: [
        { label: "Audit target", value: "SolveReal Systems" },
        { label: "Report structure", value: "9 complete sections" },
        { label: "Question diagnosis", value: "3 buyer questions" },
        { label: "Generated", value: "Aug 31, 2026" },
      ],
      disclaimer:
        "The report preserves evidence from the date it was generated to demonstrate the current Open GEO deliverable. It is not live monitoring of the website or AI platforms.",
      action: "View the complete English deep report",
      path: "/en/projects/open-geo-console/report",
      preview: {
        label: "Open GEO English deep-report structure preview",
        brandLine: "Decision-ready report",
        title: "Core conclusion",
        summary:
          "SolveReal Systems starts with real process diagnosis, assigns stable repetitive steps to the system, and keeps human confirmation, recovery paths, and auditable evidence around critical actions.",
        sections: [
          "Core conclusion",
          "Website status",
          "Customer questions",
          "Answer gaps",
          "Page analysis",
          "Technical remediation",
          "Action summary",
          "Article example",
          "Sources and method",
        ],
        targetLabel: "Audited website",
        target: "me.itheheda.online",
        generatedLabel: "Generated",
        generated: "Aug 31, 2026",
        questionsLabel: "Questions answered",
        questions: "3 / 3",
      },
    },
  },
};
