export const adminCopy = {
  common: {
    brand: "实解智能",
    product: "系统工作台",
    backToSite: "返回官网",
  },
  sidebar: {
    general: "当前工具",
    dashboard: "工作台首页",
    articles: "文章工作台",
    crawlers: "AI 爬虫检测",
    scopeHint: "仅保留当前在用的运营工具",
  },
  login: {
    title: "实解智能管理后台",
    description: "请输入管理员密码",
    panelTitle: "访问验证",
    passwordLabel: "密码",
    passwordPlaceholder: "输入管理员密码",
    submit: "进入管理后台",
    verifying: "验证中...",
    loading: "加载中...",
    tokenHint: "也可以使用访问令牌直接登录。",
    errors: {
      loginFailed: "登录失败",
      network: "网络错误，请重试",
    },
  },
  dashboard: {
    title: "系统工作台",
    description: "管理文章生产，并查看 AI 爬虫访问情况。官网品牌与设计由代码中的权威配置维护。",
    cards: {
      articles: {
        label: "文章工作台",
        description: "基于业务事实、公开来源和人工编辑生成网页文章。",
      },
      crawlers: {
        label: "AI 爬虫检测",
        description: "查看已验证爬虫、访问趋势和抓取异常。",
      },
    },
    quickLinks: {
      title: "快捷链接",
      website: "网站首页",
      github: "GitHub 仓库",
    },
  },
} as const;
