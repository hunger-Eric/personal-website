import type { Locale } from "./locale";

type CasesCopy = {
  heading: string;
  viewAll: string;
  featuredBadge: string;
  viewDetails: string;
  emptyTitle: string;
  emptyDescription: string;
  indexEyebrow: string;
  indexTitle: string;
  filterLabel: string;
  noMatchesTitle: string;
  noMatchesDescription: string;
  matchingSuffix: string;
  artifactLabel: string;
  caseRecord: string;
  problemLabel: string;
  outcomeLabel: string;
  viewFullCase: string;
  fullCase: string;
  detailBack: string;
  detailEyebrow: string;
  sourceProject: string;
  systemType: string;
  deliverable: string;
  projectStatus: string;
  proofPoints: string;
  links: string;
  implementationAppendix: string;
  implementationTitle: string;
  expand: string;
  scenarioTitle: string;
  systemTitle: string;
  artifactTitle: string;
  transferTitle: string;
  workflowTitle: string;
  resultsTitle: string;
  learningsTitle: string;
  demoTitle: string;
  demoDescription: string;
  filmTitle: string;
  projectFilm: string;
  caseDemo: string;
  inputLabel: string;
  actionLabel: string;
  systemLabel: string;
  processLabel: string;
  transferableValue: string;
  clientArtifact: string;
  screenChange: string;
  artifactPreview: string;
  flowProgress: string;
  systemPreview: string;
  liveLoop: string;
  pauseFilm: string;
  playFilm: string;
  nextStep: string;
  replayFilm: string;
  demoInputLabel: string;
  demoOutputLabel: string;
  demoResultLabel: string;
  demoLiveTrace: string;
  pauseDemo: string;
  playDemo: string;
  nextDemoStep: string;
  replayDemo: string;
  sectionDescription: string;
  roleLabel: string;
  workflowLabel: string;
  aiStackLabel: string;
  aiWorkflowFallback: string;
  aiStackFallback: string;
  tagFallback: string;
  systemArchive: string;
  catalogMode: string;
  recordSuffix: string;
  projectFilmEyebrow: string;
  projectFilmTitle: string;
  projectFilmDescription: string;
  viewCaseIndex: string;
  capabilityDemo: string;
  reusableArtifact: string;
  tryFlow: string;
  tryFlowLabelPrefix: string;
  storyExampleInput: string;
  storyCustomerAction: string;
  storySystemAction: string;
  storyVisibleOutput: string;
  storyProofPrefix: string;
  pauseStory: string;
  playStory: string;
  nextStoryStep: string;
  replayStory: string;
  previousProject: string;
  nextProject: string;
  goToSlidePrefix: string;
  linkLive: string;
  linkGithub: string;
  linkDocs: string;
  linkDownload: string;
  linkVideo: string;
  linkOpen: string;
};

export type SiteCopy = {
  hero: {
    line: string;
    description: string;
    badge: string;
    primaryCta: string;
    secondaryCta: string;
    rhythmTitle: string;
    labSignals: Array<{
      label: string;
      value: string;
    }>;
    capabilities: Array<{
      title: string;
      description: string;
      icon: "gitBranch" | "workflow" | "brainCircuit" | "blocks";
    }>;
  };
  about: {
    heading: string;
    socialsButton: string;
    techIntro: string;
    paragraphs: string[];
    afterTechParagraph: string;
    positioningLabel: string;
    positioningStatement: string;
    buildLabel: string;
    directionsLabel: string;
    viewCasesLabel: string;
    audience: {
      title: string;
      lead: string;
      points: string[];
    };
    capabilities: Array<{
      title: string;
      description: string;
      icon: "gitBranch" | "workflow" | "brainCircuit" | "layers";
    }>;
  };
  experience: {
    eyebrow: string;
    title: string;
  };
  education: {
    eyebrow: string;
    title: string;
    minorPrefix: string;
    gpaLabel: string;
    expectedPrefix: string;
    expectedGraduationLabel: string;
    awardsLabel: string;
    activitiesLabel: string;
    courseworkLabel: string;
  };
  youtube: {
    eyebrow: string;
    title: string;
    description: string;
    channelName: string;
    channelDescription: string;
    stats: {
      videos: string;
      subscribers: string;
      views: string;
    };
    videosLabel: string;
    subscribersLabel: string;
    viewsLabel: string;
    viewChannel: string;
    featuredVideo: string;
    watchOnYouTube: string;
    mostRecentVideo: string;
    mostViewedVideo: string;
  };
  certifications: {
    eyebrow: string;
    title: string;
    viewCredential: string;
    viewMore: string;
    showLess: string;
  };
  commandPalette: {
    openLabel: string;
    dialogLabel: string;
    searchTrigger: string;
    searchPlaceholder: string;
    noResultsPrefix: string;
    noResultsSuffix: string;
    nextMode: {
      light: string;
      dark: string;
    };
    toggleThemeDescription: string;
    categoryLabels: Record<"page" | "case" | "article" | "action", string>;
    footer: {
      navigate: string;
      select: string;
      close: string;
    };
    staticItems: Array<{
      id: "home" | "about" | "projects" | "articles" | "resume";
      title: string;
      description: string;
    }>;
  };
  cases: CasesCopy;
  projects: CasesCopy;
  articles: {
    heading: string;
    description: string;
    viewAll: string;
    emptyTitle: string;
    emptyDescription: string;
    categoryFallback: string;
    articlesCountSuffix: string;
    readTimeSuffix: string;
    preface: string;
    chapterPrefix: string;
    chapterSuffix: string;
    allCategories: string;
    otherArticles: string;
    shareLinks: {
      heading: string;
      shareOnPrefix: string;
      copyLink: string;
      linkCopied: string;
      nativeShare: string;
      more: string;
      platforms: Record<
        "x" | "linkedin" | "reddit" | "facebook" | "email" | "sms",
        string
      >;
    };
  };
  photography: {
    heading: string;
    description: string;
    ongoing: string;
    completed: string;
    private: string;
    photosSuffix: string;
    emptyTitle: string;
    emptyDescription: string;
    detailBack: string;
    detailEyebrow: string;
    metadataLabel: string;
    metaStarted: string;
    publicCount: string;
    privateCount: string;
    showPrivate: string;
    hidePrivate: string;
    privateHiddenTitle: string;
    privateHiddenDescription: string;
    noPhotosTitle: string;
    noPhotosDescription: string;
    close: string;
    previous: string;
    next: string;
    pinTitle: string;
    pinDescription: string;
    pinLengthError: string;
    pinIncorrectError: string;
    pinDisabledError: string;
    pinGenericError: string;
    pinNetworkError: string;
    pinSubmit: string;
    pinFootnote: string;
  };
  content: {
    heading: string;
    description: string;
    backToLinks: string;
    mediaKitTitle: string;
    mediaKitDescription: string;
    mediaKitAction: string;
    platformsHeading: string;
    videosHeading: string;
    viewChannel: string;
    builtBy: string;
    rights: string;
    platformBlurbs: Record<
      "youtube" | "instagram" | "tiktok" | "linkedin" | "medium" | "github",
      string
    >;
  };
  customPage: {
    emptyGalleryTitle: string;
    emptyCardsTitle: string;
    contactTitle: string;
    contactDescription: string;
    emailAction: string;
  };
  links: {
    description: string;
    eyebrow: string;
    intro: string;
    stats: {
      mode: string;
      modeValue: string;
      entry: string;
      entryValue: string;
      scan: string;
      scanValue: string;
    };
    websiteTitle: string;
    websiteDescription: string;
    copyEmailTitle: string;
    copyEmailAction: string;
    scanHeading: string;
    scanDescription: string;
    scanBadge: string;
    footerBuiltByPrefix: string;
    footerRights: string;
    share: string;
  };
};

const zhCases: CasesCopy = {
  heading: "~/AI Native Lab",
  viewAll: "进入系统档案",
  featuredBadge: "精选档案",
  viewDetails: "查看系统记录",
  emptyTitle: "暂无系统档案",
  emptyDescription: "案例档案还在整理中。",
  indexEyebrow: "案例索引",
  indexTitle: "更多系统记录",
  filterLabel: "能力筛选",
  noMatchesTitle: "没有匹配案例",
  noMatchesDescription: "换一个能力筛选看看。",
  matchingSuffix: "个匹配档案",
  artifactLabel: "交付物",
  caseRecord: "案例记录",
  problemLabel: "解决的问题",
  outcomeLabel: "交付结果",
  viewFullCase: "查看完整案例",
  fullCase: "完整案例",
  detailBack: "返回案例",
  detailEyebrow: "AI Native 系统案例",
  sourceProject: "来源项目",
  systemType: "系统类型",
  deliverable: "交付物",
  projectStatus: "项目状态",
  proofPoints: "可信交付点",
  links: "链接",
  implementationAppendix: "实现附录",
  implementationTitle: "实现细节与项目记录",
  expand: "展开",
  scenarioTitle: "这一类问题是什么",
  systemTitle: "系统如何接管",
  artifactTitle: "客户拿走什么",
  transferTitle: "可以迁移到哪里",
  workflowTitle: "自动化边界",
  resultsTitle: "沉淀结果",
  learningsTitle: "项目经验",
  demoTitle: "系统流程演示",
  demoDescription: "查看输入、处理、日志和输出如何一步步推进。",
  filmTitle: "三条系统流程",
  projectFilm: "项目影像",
  caseDemo: "案例演示",
  inputLabel: "输入",
  actionLabel: "动作",
  systemLabel: "系统",
  processLabel: "处理",
  transferableValue: "可迁移价值",
  clientArtifact: "客户交付物",
  screenChange: "屏幕上发生什么变化",
  artifactPreview: "交付物预览",
  flowProgress: "流程进度",
  systemPreview: "系统预览",
  liveLoop: "实时循环",
  pauseFilm: "暂停流程演示",
  playFilm: "播放流程演示",
  nextStep: "下一步流程",
  replayFilm: "重播流程演示",
  demoInputLabel: "输入",
  demoOutputLabel: "输出",
  demoResultLabel: "结果",
  demoLiveTrace: "实时轨迹",
  pauseDemo: "暂停演示",
  playDemo: "播放演示",
  nextDemoStep: "下一步演示",
  replayDemo: "重播演示",
  sectionDescription:
    "这里不是普通作品集，而是系统设计档案。每个案例都记录问题、工作流、AI 参与方式、自动化和可扩展路径。",
  roleLabel: "角色",
  workflowLabel: "工作流",
  aiStackLabel: "AI 栈",
  aiWorkflowFallback: "AI 工作流",
  aiStackFallback: "AI 辅助工作流",
  tagFallback: "系统档案",
  systemArchive: "系统档案",
  catalogMode: "目录模式",
  recordSuffix: "个档案",
  projectFilmEyebrow: "AI Native Lab / Project Film",
  projectFilmTitle: "看一个系统如何从输入走到交付",
  projectFilmDescription:
    "资料、公开信息、界面元素，是很多业务都会遇到的起点。这里把它们放进同一套可观察的系统流程：输入、判断、证据和交付物一起推进。",
  viewCaseIndex: "查看案例索引",
  capabilityDemo: "抽象能力演示",
  reusableArtifact: "通用输出物",
  tryFlow: "体验流程",
  tryFlowLabelPrefix: "体验流程",
  storyExampleInput: "抽象输入",
  storyCustomerAction: "客户动作",
  storySystemAction: "系统动作",
  storyVisibleOutput: "客户看见的结果",
  storyProofPrefix: "可信点：",
  pauseStory: "暂停故事演示",
  playStory: "播放故事演示",
  nextStoryStep: "下一步故事",
  replayStory: "重播故事演示",
  previousProject: "上一个项目",
  nextProject: "下一个项目",
  goToSlidePrefix: "跳到项目",
  linkLive: "在线预览",
  linkGithub: "GitHub",
  linkDocs: "文档",
  linkDownload: "下载",
  linkVideo: "视频",
  linkOpen: "打开",
};

const enCases: CasesCopy = {
  heading: "~/AI Native Lab",
  viewAll: "Open system archive",
  featuredBadge: "Featured record",
  viewDetails: "View system record",
  emptyTitle: "No system records yet",
  emptyDescription: "Case records are still being organized.",
  indexEyebrow: "Case index",
  indexTitle: "More system records",
  filterLabel: "Capability filter",
  noMatchesTitle: "No matching records",
  noMatchesDescription: "Try another capability filter.",
  matchingSuffix: "matching records",
  artifactLabel: "Artifact",
  caseRecord: "Case record",
  problemLabel: "Problem",
  outcomeLabel: "Outcome",
  viewFullCase: "View full case",
  fullCase: "Full case",
  detailBack: "Back to cases",
  detailEyebrow: "AI Native system case",
  sourceProject: "Source project",
  systemType: "System type",
  deliverable: "Deliverable",
  projectStatus: "Project status",
  proofPoints: "Proof points",
  links: "Links",
  implementationAppendix: "Implementation appendix",
  implementationTitle: "Implementation details and project record",
  expand: "Expand",
  scenarioTitle: "What problem class is this?",
  systemTitle: "How the system takes over",
  artifactTitle: "What the customer gets",
  transferTitle: "Where this pattern transfers",
  workflowTitle: "Automation boundary",
  resultsTitle: "Durable results",
  learningsTitle: "Project learnings",
  demoTitle: "System flow demo",
  demoDescription: "See how input, processing, logs, and output move step by step.",
  filmTitle: "Three system flows",
  projectFilm: "Project film",
  caseDemo: "Case demo",
  inputLabel: "Input",
  actionLabel: "Action",
  systemLabel: "System",
  processLabel: "Process",
  transferableValue: "Transferable value",
  clientArtifact: "Client artifact",
  screenChange: "What changes on screen",
  artifactPreview: "Artifact preview",
  flowProgress: "Flow progress",
  systemPreview: "System Preview",
  liveLoop: "live loop",
  pauseFilm: "Pause film demo",
  playFilm: "Play film demo",
  nextStep: "Next film step",
  replayFilm: "Replay film demo",
  demoInputLabel: "Input",
  demoOutputLabel: "Output",
  demoResultLabel: "Result",
  demoLiveTrace: "Live trace",
  pauseDemo: "Pause demo",
  playDemo: "Play demo",
  nextDemoStep: "Next demo step",
  replayDemo: "Replay demo",
  sectionDescription:
    "This is not a normal portfolio. Each record captures the problem, workflow, AI orchestration, automation, and scaling path.",
  roleLabel: "Role",
  workflowLabel: "Workflow",
  aiStackLabel: "AI Stack",
  aiWorkflowFallback: "AI workflow",
  aiStackFallback: "AI-assisted workflow",
  tagFallback: "system archive",
  systemArchive: "System Archive",
  catalogMode: "Catalog Mode",
  recordSuffix: "records",
  projectFilmEyebrow: "AI Native Lab / Project Film",
  projectFilmTitle: "See how a system moves from input to delivery",
  projectFilmDescription:
    "Sources, public signals, and interface elements are common starting points. This archive puts them into observable system flows where input, judgment, evidence, and deliverables move together.",
  viewCaseIndex: "View case index",
  capabilityDemo: "Capability demo",
  reusableArtifact: "Reusable artifact",
  tryFlow: "Try flow",
  tryFlowLabelPrefix: "Try flow",
  storyExampleInput: "Example input",
  storyCustomerAction: "Customer action",
  storySystemAction: "System action",
  storyVisibleOutput: "Visible output",
  storyProofPrefix: "Proof: ",
  pauseStory: "Pause story demo",
  playStory: "Play story demo",
  nextStoryStep: "Next story step",
  replayStory: "Replay story demo",
  previousProject: "Previous project",
  nextProject: "Next project",
  goToSlidePrefix: "Go to project",
  linkLive: "Live",
  linkGithub: "GitHub",
  linkDocs: "Docs",
  linkDownload: "Download",
  linkVideo: "Video",
  linkOpen: "Open",
};

const zh: SiteCopy = {
  hero: {
    line: "AI Native 独立开发者",
    description:
      "构建 AI 驱动的系统、工作流与数字产品。从自动化、知识库到 AI 内容创作，让想法快速变成真正可运行的系统。",
    badge: "AI Native 系统构建者",
    primaryCta: "进入案例档案",
    secondaryCta: "查看工作方式",
    rhythmTitle: "工作节奏",
    labSignals: [
      { label: "方向", value: "AI Native Lab" },
      { label: "方法", value: "工作流优先" },
      { label: "输出", value: "可运行系统" },
    ],
    capabilities: [
      {
        title: "AI 工作流工程",
        description: "多模型协同、AI 辅助开发、原型迭代流程。",
        icon: "gitBranch",
      },
      {
        title: "自动化系统",
        description: "Docker、n8n、API、影刀与长期可维护自动化。",
        icon: "workflow",
      },
      {
        title: "知识库与 RAG 系统",
        description: "本地知识库、多源检索、业务资料和内容资产接入。",
        icon: "brainCircuit",
      },
      {
        title: "AI 辅助内容生产",
        description: "AI 内容创作、视觉表达、素材整理和数字叙事。",
        icon: "blocks",
      },
    ],
  },
  about: {
    heading: "~/关于我",
    socialsButton: "查看全部社交",
    techIntro: "我常设计的系统能力：",
    paragraphs: [
      "我关注的不是 AI 能生成什么，而是如何把 AI 真正组织进长期工作流与产品系统。",
      "我不只是使用 AI 写代码，而是在设计 AI 时代的新型工作方式：让模型、自动化、内容和业务流程能稳定协同。",
    ],
    afterTechParagraph:
      "面向个人和小团队，我更关心能不能快速验证想法、减少重复劳动，并把系统做成以后还能继续扩展的样子。",
    positioningLabel: "核心定位",
    positioningStatement: "我设计 AI 时代的新型工作方式。",
    buildLabel: "我构建什么",
    directionsLabel: "已有方向",
    viewCasesLabel: "查看案例",
    audience: {
      title: "面向初创团队与小团队",
      lead: "帮助个人与小团队快速构建 AI Native 工作流，以更低成本完成自动化、知识管理与产品原型开发。",
      points: [
        "降低重复劳动",
        "快速验证 idea",
        "把 AI 接进业务",
        "整理混乱流程",
        "沉淀长期系统",
      ],
    },
    capabilities: [
      {
        title: "AI 工作流工程",
        description:
          "使用 Codex、Claude Code 与多模型协同，把 AI Native 开发工作流接进原型、产品迭代和内容整理。",
        icon: "gitBranch",
      },
      {
        title: "自动化系统",
        description:
          "基于 Docker、n8n、API 与自动化流程，搭建长期可维护的业务自动化系统。",
        icon: "workflow",
      },
      {
        title: "知识库与 RAG 系统",
        description:
          "构建本地知识库、RAG 与多源检索系统，让 AI 能真正连接业务资料、文档和内容资产。",
        icon: "brainCircuit",
      },
      {
        title: "AI 辅助创作",
        description:
          "结合 AI 与视觉表达，整理素材、生成内容方案，并把创意流程沉淀成可重复执行的系统。",
        icon: "layers",
      },
    ],
  },
  experience: {
    eyebrow: "工作经历",
    title: "~/Experience",
  },
  education: {
    eyebrow: "~/Education",
    title: "学习与训练记录",
    minorPrefix: "辅修",
    gpaLabel: "GPA",
    expectedPrefix: "预计",
    expectedGraduationLabel: "预计毕业",
    awardsLabel: "奖项",
    activitiesLabel: "活动与社团",
    courseworkLabel: "相关课程",
  },
  youtube: {
    eyebrow: "内容频道",
    title: "~/YouTube",
    description: "用视频记录项目、教程、工作流和日常构建过程。",
    channelName: "hunger-Eric",
    channelDescription: "分享项目、教程和开发日志的软件开发者与内容创作者。",
    stats: {
      videos: "0",
      subscribers: "0",
      views: "0",
    },
    videosLabel: "视频",
    subscribersLabel: "订阅者",
    viewsLabel: "观看",
    viewChannel: "查看频道",
    featuredVideo: "精选视频",
    watchOnYouTube: "在 YouTube 观看",
    mostRecentVideo: "最新视频",
    mostViewedVideo: "最多观看",
  },
  certifications: {
    eyebrow: "认证档案",
    title: "已验证的技能与证书",
    viewCredential: "查看证书",
    viewMore: "查看更多",
    showLess: "收起",
  },
  commandPalette: {
    openLabel: "打开命令面板",
    dialogLabel: "命令面板",
    searchTrigger: "搜索...",
    searchPlaceholder: "搜索页面、案例、文章...",
    noResultsPrefix: "没有找到",
    noResultsSuffix: "相关结果",
    nextMode: {
      light: "切换到浅色模式",
      dark: "切换到深色模式",
    },
    toggleThemeDescription: "切换网站色彩模式",
    categoryLabels: {
      page: "页面",
      case: "案例",
      article: "文章",
      action: "操作",
    },
    footer: {
      navigate: "导航",
      select: "选择",
      close: "关闭",
    },
    staticItems: [
      {
        id: "home",
        title: "首页",
        description: "返回网站首页",
      },
      {
        id: "about",
        title: "关于",
        description: "了解我的工作方式",
      },
      {
        id: "projects",
        title: "案例",
        description: "打开 AI 系统案例档案",
      },
      {
        id: "articles",
        title: "文章",
        description: "阅读文章和工作笔记",
      },
      {
        id: "resume",
        title: "简历",
        description: "查看我的简历",
      },
    ],
  },
  cases: zhCases,
  projects: zhCases,
  articles: {
    heading: "~/文章",
    description:
      "把 AI 组织进工作流与产品系统的实践记录。从智能体构建、自动化到工程思考，写下来，让想法变成可迭代的系统。",
    viewAll: "查看全部文章",
    emptyTitle: "还没有文章",
    emptyDescription: "发布后会显示在这里。",
    categoryFallback: "未分类",
    articlesCountSuffix: "篇",
    readTimeSuffix: "阅读",
    preface: "前言",
    chapterPrefix: "第",
    chapterSuffix: "章",
    allCategories: "全部分类",
    otherArticles: "其他文章",
    shareLinks: {
      heading: "分享这篇文章",
      shareOnPrefix: "分享到",
      copyLink: "复制链接",
      linkCopied: "链接已复制",
      nativeShare: "使用设备分享",
      more: "更多",
      platforms: {
        x: "X / Twitter",
        linkedin: "LinkedIn",
        reddit: "Reddit",
        facebook: "Facebook",
        email: "邮件",
        sms: "短信",
      },
    },
  },
  photography: {
    heading: "摄影",
    description:
      "用镜头记录走过的路、看过的风景。全栈程序员 / 摄影爱好者。",
    ongoing: "进行中",
    completed: "已完成",
    private: "私密",
    photosSuffix: "张",
    emptyTitle: "暂无相册",
    emptyDescription: "摄影项目正在准备中。",
    detailBack: "返回摄影索引",
    detailEyebrow: "影像档案",
    metadataLabel: "摄影档案元数据",
    metaStarted: "始于",
    publicCount: "张公开",
    privateCount: "张私密",
    showPrivate: "显示私密照片",
    hidePrivate: "隐藏私密照片",
    privateHiddenTitle: "私密照片已隐藏",
    privateHiddenDescription: "输入 PIN 码查看本次会话可访问的照片。",
    noPhotosTitle: "暂无照片",
    noPhotosDescription: "这个影像档案还没有公开照片。",
    close: "关闭",
    previous: "上一张",
    next: "下一张",
    pinTitle: "私密照片",
    pinDescription: "请输入 PIN 码查看私密照片。",
    pinLengthError: "请输入 6 位 PIN 码",
    pinIncorrectError: "PIN 码错误，请重试",
    pinDisabledError: "私密照片功能未启用",
    pinGenericError: "验证失败，请重试",
    pinNetworkError: "网络错误，请重试",
    pinSubmit: "查看私密照片",
    pinFootnote: "PIN 码由网站所有者设置，照片仅限本次会话访问。",
  },
  content: {
    heading: "Content & Socials",
    description:
      "所有公开发布渠道的索引。这里汇总视频、文章、社交账号和实时媒体资料。",
    backToLinks: "Links",
    mediaKitTitle: "Live Media Kit",
    mediaKitDescription: "Aggregated stats via Beacons.AI",
    mediaKitAction: "Open",
    platformsHeading: "Where to follow me",
    videosHeading: "Recent on YouTube",
    viewChannel: "View channel",
    builtBy: "Built by fengc",
    rights: "All rights reserved",
    platformBlurbs: {
      youtube: "教程、开发日志和项目演示",
      instagram: "幕后片段和构建瞬间",
      tiktok: "短视频、开发技巧和演示",
      linkedin: "职业更新和长观点",
      medium: "长文和深度笔记",
      github: "开源项目和代码",
    },
  },
  customPage: {
    emptyGalleryTitle: "暂无图片",
    emptyCardsTitle: "暂无内容",
    contactTitle: "联系我",
    contactDescription: "有任何问题或合作意向，欢迎联系。",
    emailAction: "发送邮件",
  },
  links: {
    description:
      "fengc 的公开联系入口：GitHub、邮箱、微信公众号、个人微信和内容渠道。",
    eyebrow: "AI Native Builder",
    intro:
      "把 AI、自动化、知识系统和业务流程组织成可运行的系统。这里是公开联系方式和内容入口。",
    stats: {
      mode: "Mode",
      modeValue: "Public",
      entry: "Entry",
      entryValue: "Links",
      scan: "Scan",
      scanValue: "WeChat",
    },
    websiteTitle: "个人网站",
    websiteDescription: "AI Native Lab / system archive",
    copyEmailTitle: "Copy email",
    copyEmailAction: "Copy email",
    scanHeading: "Scan channels",
    scanDescription: "WeChat / 公众号",
    scanBadge: "QR",
    footerBuiltByPrefix: "Built by",
    footerRights: "All rights reserved",
    share: "Share",
  },
};

const en: SiteCopy = {
  hero: {
    line: "AI Native Independent Developer",
    description:
      "I build AI-powered systems, workflows, and digital products, from automation pipelines and knowledge systems to AI-assisted creative experiences.",
    badge: "AI Native Lab",
    primaryCta: "Open case archive",
    secondaryCta: "View working method",
    rhythmTitle: "Work Rhythm",
    labSignals: [
      { label: "Mode", value: "AI Native Lab" },
      { label: "Method", value: "workflow first" },
      { label: "Output", value: "runnable systems" },
    ],
    capabilities: [
      {
        title: "AI Workflow Engineering",
        description:
          "multi-model collaboration, AI-assisted development, prototyping loops",
        icon: "gitBranch",
      },
      {
        title: "Automation Systems",
        description: "Docker, n8n, APIs, Yingdao, and maintainable automation",
        icon: "workflow",
      },
      {
        title: "Knowledge & RAG Systems",
        description:
          "local knowledge bases, retrieval, business context, content assets",
        icon: "brainCircuit",
      },
      {
        title: "Creative Production",
        description:
          "AI content production, visual thinking, asset systems, narrative design",
        icon: "blocks",
      },
    ],
  },
  about: {
    heading: "~/About Me",
    socialsButton: "View all socials",
    techIntro: "Systems I usually design:",
    paragraphs: [
      "I care less about what AI can generate in isolation, and more about how AI can be organized into long-term workflows and product systems.",
      "I do not only use AI to write code. I design new working patterns where models, automation, content, and business processes can cooperate reliably.",
    ],
    afterTechParagraph:
      "For individuals and small teams, the goal is faster idea validation, less repetitive work, and systems that can keep scaling after the first version ships.",
    positioningLabel: "Positioning",
    positioningStatement: "I design new working patterns for the AI era.",
    buildLabel: "What I Build",
    directionsLabel: "Existing directions",
    viewCasesLabel: "View cases",
    audience: {
      title: "For Startups & Small Teams",
      lead: "I help individuals and small teams build AI Native workflows for automation, knowledge management, and product prototyping at lower cost.",
      points: [
        "reduce repetitive work",
        "validate ideas faster",
        "connect AI to operations",
        "organize messy workflows",
        "build long-term systems",
      ],
    },
    capabilities: [
      {
        title: "AI Workflow Engineering",
        description:
          "I connect Codex, Claude Code, and multi-model workflows to prototyping, product iteration, and content operations.",
        icon: "gitBranch",
      },
      {
        title: "Automation Systems",
        description:
          "I build maintainable automation systems with Docker, n8n, APIs, and operational workflows.",
        icon: "workflow",
      },
      {
        title: "Knowledge & RAG Systems",
        description:
          "I design local knowledge bases, RAG flows, and multi-source retrieval so AI can work with real business context.",
        icon: "brainCircuit",
      },
      {
        title: "AI-assisted Creative Production",
        description:
          "I connect AI with visual thinking, content structure, and reusable creative production workflows.",
        icon: "layers",
      },
    ],
  },
  experience: {
    eyebrow: "Experience",
    title: "~/Experience",
  },
  education: {
    eyebrow: "~/Education",
    title: "Where I have been studying.",
    minorPrefix: "Minor in",
    gpaLabel: "GPA",
    expectedPrefix: "Expected",
    expectedGraduationLabel: "Expected Graduation",
    awardsLabel: "Awards",
    activitiesLabel: "Activities and societies",
    courseworkLabel: "Relevant coursework",
  },
  youtube: {
    eyebrow: "Content channel",
    title: "~/YouTube",
    description: "Videos documenting projects, tutorials, workflows, and everyday building.",
    channelName: "hunger-Eric",
    channelDescription:
      "Software dev and content creator sharing projects, tutorials, and dev logs.",
    stats: {
      videos: "0",
      subscribers: "0",
      views: "0",
    },
    videosLabel: "videos",
    subscribersLabel: "subscribers",
    viewsLabel: "views",
    viewChannel: "View channel",
    featuredVideo: "Featured video",
    watchOnYouTube: "Watch on YouTube",
    mostRecentVideo: "Most recent video",
    mostViewedVideo: "Most viewed video",
  },
  certifications: {
    eyebrow: "Credential archive",
    title: "Verified skills and credentials",
    viewCredential: "View credential",
    viewMore: "View more",
    showLess: "Show less",
  },
  commandPalette: {
    openLabel: "Open command palette",
    dialogLabel: "Command palette",
    searchTrigger: "Search...",
    searchPlaceholder: "Search pages, cases, articles...",
    noResultsPrefix: "No results found for",
    noResultsSuffix: "",
    nextMode: {
      light: "Switch to Light Mode",
      dark: "Switch to Dark Mode",
    },
    toggleThemeDescription: "Toggle color theme",
    categoryLabels: {
      page: "Page",
      case: "Case",
      article: "Article",
      action: "Action",
    },
    footer: {
      navigate: "Navigate",
      select: "Select",
      close: "Close",
    },
    staticItems: [
      {
        id: "home",
        title: "Home",
        description: "Go to homepage",
      },
      {
        id: "about",
        title: "About",
        description: "Learn more about my working method",
      },
      {
        id: "projects",
        title: "Cases",
        description: "Open the AI system case archive",
      },
      {
        id: "articles",
        title: "Articles",
        description: "Read essays and working notes",
      },
      {
        id: "resume",
        title: "Resume",
        description: "View my resume",
      },
    ],
  },
  cases: enCases,
  projects: enCases,
  articles: {
    heading: "~/Articles",
    description:
      "Notes on organizing AI into workflows and product systems. From agent building and automation to engineering thinking: write it down, turn ideas into iterable systems.",
    viewAll: "View all articles",
    emptyTitle: "No articles yet",
    emptyDescription: "New posts will show up here after publishing.",
    categoryFallback: "Uncategorized",
    articlesCountSuffix: "posts",
    readTimeSuffix: "read",
    preface: "Preface",
    chapterPrefix: "Chapter",
    chapterSuffix: "",
    allCategories: "All Categories",
    otherArticles: "Other Articles",
    shareLinks: {
      heading: "Share this article",
      shareOnPrefix: "Share on",
      copyLink: "Copy link",
      linkCopied: "Link copied",
      nativeShare: "Share via your device",
      more: "More",
      platforms: {
        x: "X / Twitter",
        linkedin: "LinkedIn",
        reddit: "Reddit",
        facebook: "Facebook",
        email: "Email",
        sms: "Message",
      },
    },
  },
  photography: {
    heading: "Photography",
    description:
      "A visual record of places I have been and scenes I have seen. Full-stack developer / photography enthusiast.",
    ongoing: "Ongoing",
    completed: "Done",
    private: "Private",
    photosSuffix: "photos",
    emptyTitle: "No albums yet",
    emptyDescription: "Photography projects are on the way.",
    detailBack: "Back to photography",
    detailEyebrow: "Image archive",
    metadataLabel: "Photography archive metadata",
    metaStarted: "Started",
    publicCount: "public photos",
    privateCount: "private photos",
    showPrivate: "Show private photos",
    hidePrivate: "Hide private photos",
    privateHiddenTitle: "Private photos are hidden",
    privateHiddenDescription: "Enter the PIN to unlock photos for this session.",
    noPhotosTitle: "No photos yet",
    noPhotosDescription: "This image archive has no public photos yet.",
    close: "Close",
    previous: "Previous image",
    next: "Next image",
    pinTitle: "Private photos",
    pinDescription: "Enter the PIN to view private photos.",
    pinLengthError: "Enter a 6-digit PIN",
    pinIncorrectError: "Incorrect PIN. Try again.",
    pinDisabledError: "Private photo access is not enabled.",
    pinGenericError: "Verification failed. Try again.",
    pinNetworkError: "Network error. Try again.",
    pinSubmit: "View private photos",
    pinFootnote: "The PIN is set by the site owner. Photos are available for this session only.",
  },
  content: {
    heading: "Content & Socials",
    description:
      "A public index of everywhere I publish: videos, articles, social profiles, and live media-kit references.",
    backToLinks: "Links",
    mediaKitTitle: "Live Media Kit",
    mediaKitDescription: "Aggregated stats via Beacons.AI",
    mediaKitAction: "Open",
    platformsHeading: "Where to follow me",
    videosHeading: "Recent on YouTube",
    viewChannel: "View channel",
    builtBy: "Built by fengc",
    rights: "All rights reserved",
    platformBlurbs: {
      youtube: "Tutorials, dev logs, and project demos",
      instagram: "Behind-the-scenes and build moments",
      tiktok: "Short clips, dev tips, and demos",
      linkedin: "Career updates and longer-form takes",
      medium: "Long-form articles and deep dives",
      github: "Open-source projects and code",
    },
  },
  customPage: {
    emptyGalleryTitle: "No images yet",
    emptyCardsTitle: "No content yet",
    contactTitle: "Contact",
    contactDescription: "Questions, collaboration ideas, or useful context are welcome.",
    emailAction: "Send email",
  },
  links: {
    description:
      "Public contact entry for fengc: GitHub, email, WeChat, and content channels.",
    eyebrow: "AI Native Builder",
    intro:
      "I organize AI, automation, knowledge systems, and business workflows into runnable systems. This page is the public contact and content entry.",
    stats: {
      mode: "Mode",
      modeValue: "Public",
      entry: "Entry",
      entryValue: "Links",
      scan: "Scan",
      scanValue: "WeChat",
    },
    websiteTitle: "Personal Website",
    websiteDescription: "AI Native Lab / system archive",
    copyEmailTitle: "Copy email",
    copyEmailAction: "Copy email",
    scanHeading: "Scan channels",
    scanDescription: "WeChat / official account",
    scanBadge: "QR",
    footerBuiltByPrefix: "Built by",
    footerRights: "All rights reserved",
    share: "Share",
  },
};

export const siteCopy: Record<Locale, SiteCopy> = { zh, en };

export function getSiteCopy(locale: Locale): SiteCopy {
  return siteCopy[locale] || siteCopy.zh;
}
