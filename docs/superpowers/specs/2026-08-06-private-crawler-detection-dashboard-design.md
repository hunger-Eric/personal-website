# 私有 AI 爬虫检测后台设计规格

日期：2026-08-06

状态：设计已批准；等待用户审阅本规格后进入实施计划

## 1. 目标

在个人网站中提供一个生产可用的私有检测页面，让站点所有者能够判断近期请求量上涨主要来自以下哪类流量：

1. 已识别的 AI 爬虫；
2. Open GEO Console 自测；
3. 其他已知或疑似自动化程序。

第一版必须回答三个问题：发生了多少自动化请求、它们在什么时间出现、它们访问了哪些路径。它不是通用访客分析产品，也不尝试替代 Cloudflare 的完整安全与日志产品。

## 2. 已确认范围

### 2.1 必须交付

- 生产环境可访问的私有页面 `/admin/crawlers`；
- 24 小时、7 天、30 天三个时间范围；
- 三类自动化流量的请求量、占比和分时趋势；
- User-Agent/爬虫名称排名、热门路径和状态码分布；
- 数据来源、查询时间、最后刷新时间和采样状态说明；
- 明确的未配置、无权限、限流、上游不可用和无数据状态；
- 页面与数据接口都受同一套 HTTP Basic Auth 保护；
- Cloudflare 凭据只在服务端使用。

### 2.2 第一版不做

- 不新增前端埋点；现有 Cloudflare Web Analytics 和 Umami 保持不变；
- 不新增数据库、Cloudflare Worker、队列或定时任务；
- 不保存 IP、访客身份、原始请求日志或长期历史快照；
- 不做邮件/消息告警、导出、多人账号或权限角色；
- 不开放现有内容管理后台到生产环境；
- 不声称通过 User-Agent 识别出的请求具有经过密码学验证的爬虫身份。

## 3. 当前系统约束

个人网站是 Next.js 16 应用，Cloudflare 位于公开域名与 Vercel 之间。现有 `lib/admin-guard.ts`、`proxy.ts` 和 `app/admin/(dashboard)/layout.tsx` 会在生产环境关闭全部旧后台路由。这项安全边界必须保留。

新功能因此不能直接放入现有 `(dashboard)` 布局，也不能把 `isAdminEnabled()` 改成在生产环境全局返回 `true`。爬虫检测后台需要成为一个受独立、窄范围认证保护的生产路由。

## 4. 方案选择

### 4.1 采用：Vercel 服务端读取 Cloudflare GraphQL Analytics

服务端使用只读 API Token 查询 Cloudflare `httpRequestsAdaptiveGroups`，按站点主机名、时间、User-Agent、路径和状态码聚合。`requestSource: "eyeball"` 用于排除 Cloudflare 产品自身生成的内部动作，同时保留到达 Cloudflare 边缘的真实外部请求，包括缓存命中。

选择这一方案的原因：

- 前端 JavaScript 埋点无法可靠覆盖不执行脚本的 AI 爬虫；
- Vercel Middleware 或应用日志看不到被 Cloudflare 缓存直接响应的全部请求；
- 新增 Worker 和数据库会扩大第一版的运行面与维护成本；
- Cloudflare 已经持有完成本目标所需的边缘聚合数据。

### 4.2 不采用：前端埋点作为爬虫主数据源

前端埋点只能观察执行 JavaScript 的客户端，不能作为 AI 爬虫存在与否的可靠证据。它仍可用于真人访问行为分析，但不进入本功能的数据流。

### 4.3 不采用：新的 Worker 收集器

Worker 收集器可以获得更强的自定义能力，但需要新的部署、存储、保留策略和运行维护。本次仅需要站点自身的只读检测，因此不引入。

## 5. 认证与生产隔离

### 5.1 Basic Auth 范围

认证只匹配两个精确前缀：

- `/admin/crawlers`
- `/api/admin/crawlers`

固定用户名为 `admin`，密码来自服务端环境变量 `CRAWLER_DASHBOARD_PASSWORD`。未提供或不匹配时返回 `401`，并带 `WWW-Authenticate` 头触发浏览器原生登录框。密码比较使用恒定时间比较；响应和日志不得包含凭据。

Basic Auth 只在 HTTPS 下使用。它是单人、第一版后台的简化认证，不是未来多人系统的长期身份方案。

### 5.2 与旧后台的关系

`proxy.ts` 先处理上述两个爬虫路径，再执行现有旧后台总开关。除爬虫路径外，生产环境中的 `/admin/*` 和 `/api/admin/*` 继续返回 404。旧 `ADMIN_TOKEN`、本地登录页和内容编辑接口不改变。

页面放在独立路由组中，不继承 `app/admin/(dashboard)/layout.tsx` 的本地限定。API 自身再次执行爬虫后台认证，避免只依赖代理层。

## 6. Cloudflare 数据接入

### 6.1 环境变量

- `CLOUDFLARE_API_TOKEN`：仅授予目标 Zone 的 Analytics Read 权限；
- `CLOUDFLARE_ZONE_ID`：目标站点所在 Zone；
- `CRAWLER_DASHBOARD_PASSWORD`：随机高强度后台密码。

查询主机名从现有 `SITE_URL` 解析，当前为 `me.itheheda.online`，避免把同一 Zone 下的 `geo.itheheda.online` 或其他子域流量混入个人网站。

### 6.2 查询策略

服务端适配器负责：

1. 把 `24h`、`7d`、`30d` 映射为受控时间窗口，拒绝任意时间和任意 GraphQL 查询；
2. 以 Zone、主机名和 `requestSource: "eyeball"` 为固定过滤条件；
3. 查询时间桶、User-Agent、请求路径、响应状态和请求数；
4. 对大时间范围拆分为较小窗口并在服务端聚合，降低查询复杂度与采样波动；
5. 为每个排序查询显式指定 `orderBy`；
6. 读取 `sampleInterval`，在数据发生采样时向页面暴露“估算”状态；
7. 对相同范围的结果缓存 5 分钟。

实现开始时必须先用 Cloudflare GraphQL schema/settings 对目标 Zone 做能力探测，确认当前套餐可用的字段、时间范围和节点限制。如果目标 Zone 不支持所需维度，接口返回明确的 `unsupported_dataset`，不得用零值或前端埋点伪装成功。

Cloudflare 的 Adaptive 数据集可能使用抽样。页面展示的是聚合分析证据，不是逐条原始日志；极少量事件可能无法在高采样流量中稳定出现。

## 7. 分类规则

### 7.1 分类优先级

每个 User-Agent 只进入一个分类，匹配顺序固定为：

1. `open_geo_self_test`
2. `identified_ai_crawler`
3. `other_automation`
4. `unclassified`

`unclassified` 用于计算总请求基线，但不计入“爬虫请求”总数，也不被描述为真人。

### 7.2 Open GEO 自测

包含 `OpenGeoConsoleBot/` 的 User-Agent 归类为 `open_geo_self_test`。第一版不依赖查询参数或 IP 识别，避免把视觉浏览器的普通资源请求错误关联到某次运行。

### 7.3 已识别 AI 爬虫

使用本地、可测试的规则表匹配公开声明的 AI User-Agent，例如 GPTBot、ChatGPT-User、ClaudeBot、Claude-SearchBot、PerplexityBot。规则表包含稳定 ID、显示名称和大小写不敏感的匹配模式。

界面用词固定为“已识别 AI 爬虫”，不使用“已验证真实 AI 爬虫”。User-Agent 可以被伪造，所以分类表示请求声明的身份，不表示对运营方身份的强验证。

### 7.4 其他自动化

搜索引擎爬虫、监控程序、命令行客户端和明确的自动化/无头浏览器特征进入 `other_automation`。该类别可显示子标签，但仍汇总为一个第一版顶层类别。仅凭低置信度特征无法判断时保留为 `unclassified`。

## 8. 服务端接口

`GET /api/admin/crawlers?range=24h|7d|30d` 返回固定结构：

```ts
type CrawlerAnalyticsResponse = {
  meta: {
    range: "24h" | "7d" | "30d";
    start: string;
    end: string;
    generatedAt: string;
    source: "cloudflare-graphql";
    sampled: boolean;
    sampleInterval: number;
  };
  summary: {
    totalRequests: number;
    crawlerRequests: number;
    identifiedAiCrawler: number;
    openGeoSelfTest: number;
    otherAutomation: number;
  };
  trend: Array<{
    bucket: string;
    identifiedAiCrawler: number;
    openGeoSelfTest: number;
    otherAutomation: number;
  }>;
  agents: Array<{
    category: "identified_ai_crawler" | "open_geo_self_test" | "other_automation";
    name: string;
    userAgent: string;
    requests: number;
  }>;
  paths: Array<{
    path: string;
    identifiedAiCrawler: number;
    openGeoSelfTest: number;
    otherAutomation: number;
    total: number;
  }>;
  statuses: Array<{ status: number; requests: number }>;
};
```

接口不接受自定义 Zone、主机名、User-Agent 过滤表达式或原始 GraphQL 文本，避免成为任意查询代理。

## 9. 页面体验

页面使用现有管理界面的颜色、边框、排版和间距语言，但采用独立的轻量页头，不显示旧内容管理导航。

从上到下包含：

1. 标题、数据源、最后更新时间和 24h/7d/30d 切换；
2. 自动化请求总数以及三类流量的摘要卡；
3. 三类流量的分时趋势；
4. 爬虫/User-Agent 排名；
5. 热门路径；
6. 状态码分布；
7. “User-Agent 身份未验证”和“数据可能经过采样”的解释。

第一版不增加图表依赖。趋势使用可访问的轻量 SVG 或 CSS 图形，并同时保留文本/表格值。窄屏下卡片变为单列，表格允许横向滚动，不隐藏分类、路径或请求数。

无自动化结果时显示“所选时间内未识别到自动化流量”，同时保留总请求基线和数据来源；它不等于证明没有未声明身份的爬虫。

## 10. 错误处理

- 缺少环境变量：`configuration_missing`；
- Cloudflare 401：`cloudflare_auth_invalid`；
- Cloudflare 403：`cloudflare_permission_denied`；
- Cloudflare 429：`cloudflare_rate_limited`，不自动高频重试；
- 套餐或 Schema 不支持：`unsupported_dataset`；
- 请求超时或 5xx：`cloudflare_unavailable`；
- 非法 range：`invalid_range`。

页面为每种错误提供可行动的中文说明。没有成功响应时不得渲染零值统计。可以在本次请求失败时展示最后一个未过期的 5 分钟缓存，但必须标记缓存时间；不存在有效缓存就显示错误。

## 11. 测试与验收

### 11.1 自动化验证

- Basic Auth：未认证、错误密码、正确密码、旧后台生产隔离；
- 分类器：三类规则、优先级、大小写、未知 User-Agent；
- Cloudflare 适配器：查询变量、主机名过滤、时间拆分、聚合、采样标记；
- API：三个 range、响应结构、配置错误、401/403/429/5xx、无数据；
- 页面：加载、成功、无数据、采样和错误状态；
- `npm run lint`；
- `npm run typecheck`；
- `npm test`；
- `npm run build`。

### 11.2 真实验收

部署和环境变量配置获得单独授权后，在生产域名完成以下验证：

1. 未认证访问 `/admin/crawlers` 会出现登录挑战；
2. 正确凭据能打开页面，其他旧后台路径仍返回 404；
3. 24 小时范围显示 Cloudflare 返回的真实个人网站数据；
4. 路径、状态码和请求总量与同一时间窗口的 Cloudflare Analytics 数量级一致；
5. 使用 `OpenGeoConsoleBot` 访问个人网站后，缓存刷新窗口内该请求进入 Open GEO 自测类别；
6. 桌面和 390px 移动端均能读取三类数量、趋势和热门路径。

自动化测试、构建和 HTTP 200 不能替代上述真实入口验收。未配置 Cloudflare 凭据或未部署时，状态只能报告为“实现完成，生产可用性未验证”。

## 12. 安全与隐私

- Cloudflare Token 只授予目标 Zone 的 Analytics Read，绝不使用 Global API Key；
- Token、后台密码和 Authorization 头不进入客户端包、页面 HTML、错误正文或日志；
- 不查询或返回客户端 IP；
- API 响应设置为私有且不可被共享 CDN 缓存；
- 页面设置 `noindex, nofollow`；
- Basic Auth 是第一版单人保护，未来多人使用时迁移到 Cloudflare Access，并在源站验证 Access Token。

## 13. 官方参考

- [Cloudflare GraphQL Analytics 认证](https://developers.cloudflare.com/analytics/graphql-api/getting-started/authentication/)
- [Cloudflare GraphQL Analytics 限制](https://developers.cloudflare.com/analytics/graphql-api/limits/)
- [按主机名查询 HTTP 请求](https://developers.cloudflare.com/analytics/graphql-api/tutorials/end-customer-analytics/)
- [Cloudflare Analytics 采样](https://developers.cloudflare.com/analytics/graphql-api/sampling/)
- [HTTP Basic Authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Authentication)

