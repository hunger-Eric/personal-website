# 私有 AI 爬虫检测后台设计

日期：2026-08-06
状态：当前方案（实现与部署状态以代码、部署和 QA 证据为准；本文不声称已部署）

## 1. 目标与范围

在个人网站 `me.itheheda.online` 提供受 HTTP Basic Auth 保护的 `/admin/crawlers` 私有后台，区分：

1. `identified_ai_crawler`：按固定、版本化的 AI 爬虫名录识别；
2. `open_geo_self_test`：仅当请求带有效 Open GEO HMAC 签名时计入；
3. `other_automation`：由 `isbot` 等规则识别的其他自动化请求。

后台展示三类请求的摘要、小时趋势、爬虫名、路径和状态码，并支持 `24h`、`7d`、`30d`。

## 2. 当前唯一架构

请求先经过独立 Cloudflare Worker，再转发到现有 Vercel 站点。Worker 对正常请求只执行一次 `fetch(request)`，原响应不因观测失败而改变；分类和 D1 写入通过 `ctx.waitUntil` 尽力完成，D1 失败不影响网站访问。

Worker 路由：

- `me.itheheda.online/robots.txt*`（首轮窄路由）；
- `me.itheheda.online/_crawler-observer/v1/*`（签名读取接口）；
- 验证通过后再扩展为 `me.itheheda.online/*`（宽路由）。

Worker 使用 D1 保存小时聚合，保留 90 天。D1 只保存时间桶、分类、爬虫 id/名称、规范化路径、状态码和计数；不保存 IP、query string、原始 User-Agent 或原始日志。

Next.js 服务端从 `SITE_URL` 推导同源地址，以 `CRAWLER_OBSERVER_READ_SECRET` 对固定 canonical request 生成 HMAC-SHA256，读取 `GET /_crawler-observer/v1/analytics?range=24h|7d|30d`，严格校验响应后交给 Basic Auth 后台渲染。浏览器不会接触 Worker 读取密钥。

## 3. 数据完整性与边界

- Worker API 返回 `source: "cloudflare-worker-d1"`、`bucket: "hour"`、`retentionDays: 90`、`databaseInitializedAt`、`requestedWindowComplete` 和 `bestEffort: true`。
- `30d` 是 D1 初始化后逐小时累计的数据窗口，不是 Cloudflare 历史回填；若初始化时间晚于查询起点，必须显示“仅展示初始化后的数据”，并将 `requestedWindowComplete` 设为 `false`。
- 未签名或签名无效的 Open GEO User-Agent 不得计入 `open_geo_self_test`；可归入 `other_automation` 或忽略。
- User-Agent 规则只能表示请求声明的身份，不等于对运营方身份的强验证。
- Worker 观测是 best-effort；空数据不等于没有未声明爬虫。

Open GEO HMAC 验证器已包含在个人网站 Worker 范围内；Open GEO Console 生产端的签名改造属于另一个项目，本次未授权、未实现、未验证。因此生产环境的 `open_geo_self_test` 计数在 producer 端接入前不能声称已可用。

## 4. 认证与安全

`/admin/crawlers` 和 `/api/admin/crawlers` 继续使用现有 `CRAWLER_DASHBOARD_PASSWORD` Basic Auth；旧内容管理后台保持原有生产禁用边界。Worker 读取接口另以 HMAC 保护，校验时间戳 ±300 秒、方法、主机、路径和 range。所有响应禁止 CDN 共享缓存，页面设置 `noindex, nofollow`。

## 5. API 形状

```ts
type CrawlerAnalyticsResponse = {
  meta: {
    range: "24h" | "7d" | "30d";
    start: string; end: string; generatedAt: string;
    source: "cloudflare-worker-d1";
    bucket: "hour"; retentionDays: 90;
    databaseInitializedAt: string;
    requestedWindowComplete: boolean; bestEffort: true;
    classifier: { aiCrawlerBots: string; otherBots: string };
  };
  summary: { crawlerRequests: number; identifiedAiCrawler: number;
    openGeoSelfTest: number; otherAutomation: number };
  trend: Array<{ bucket: string; identifiedAiCrawler: number;
    openGeoSelfTest: number; otherAutomation: number }>;
  bots: Array<{ id: string; name: string; category: string; requests: number }>;
  paths: Array<{ path: string; identifiedAiCrawler: number;
    openGeoSelfTest: number; otherAutomation: number; total: number }>;
  statuses: Array<{ status: number; requests: number }>;
};
```

## 6. 部署与验收顺序

1. 本地 Worker/D1 migration、schema、HMAC、分类和 dashboard 测试；
2. 创建专用 D1，迁移并检查索引/约束；
3. 配置 Worker/Next 密钥（密钥只使用平台 secret，不进入 wrangler 配置或页面）；
4. 部署窄路由并做只读 QA；
5. 部署宽路由并立即做站点首页、robots、后台和签名 API 只读 QA；
6. 部署 Next.js 后台并验证 Basic Auth、24h/7d/30d、partial-history 和错误状态。

未完成上述真实部署和 QA 前，只能报告“代码实现/自动化测试完成”，不能报告生产可用或历史数据已恢复。回滚时先撤回宽路由，不删除 D1。

## 7. 非目标

本版本不做前端埋点、完整访问日志产品、IP/访客画像、邮件告警、导出、多用户权限、Cloudflare GraphQL 历史回填或 Open GEO Console 跨项目改造。
