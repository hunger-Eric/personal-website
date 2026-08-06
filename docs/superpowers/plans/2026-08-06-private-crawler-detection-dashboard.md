# 私有 AI 爬虫检测后台实施计划

> 当前计划只针对 `E:\project\personal-website`。生产部署和 QA 必须以实际平台证据为准；本计划本身不代表已部署。

## 目标

交付一个由专用 Cloudflare Worker + D1 支撑、由 Next.js Basic Auth 保护的 `/admin/crawlers`。它按小时聚合并展示 90 天内的已识别 AI 爬虫、有效签名的 Open GEO 自测和其他自动化流量，支持 `24h`、`7d`、`30d`。

## 已锁定的实现合同

- Worker 位于 `me.itheheda.online` 前方，正常请求仅一次 `fetch(request)`，观测写入 `ctx.waitUntil`，失败不改变原站响应。
- D1 仅保存小时桶、分类、bot id/名称、规范化路径、状态码和计数；不保存 IP、query string、原始 User-Agent 或原始日志；保留 90 天。
- 读取接口为 `GET /_crawler-observer/v1/analytics?range=24h|7d|30d`，以 HMAC canonical request 保护。
- Next 服务端以 `CRAWLER_OBSERVER_READ_SECRET` 签名并严格校验 Worker 响应；浏览器只接触 Basic Auth 页面/API。
- `30d` 仅表示 D1 初始化后的累计窗口。初始化前没有历史回填；窗口不完整时必须显示 `requestedWindowComplete=false` 和说明。
- Open GEO HMAC 验证器只在个人网站 Worker 范围内实现。Open GEO Console producer 端属于跨项目工作，当前未授权、未实现、未验证。
- 所有统计标记为 best-effort；User-Agent 识别不等于真实身份验证。

## 实施步骤

### 1. Worker 与 D1

- 固定依赖和版本化 AI bot 名录，使用 `isbot` 识别其他自动化；
- 添加 D1 migration、小时聚合 upsert、90 日清理和必要索引；
- 实现 Open GEO HMAC 分类、读取 HMAC、range 校验和严格响应 schema；
- 删除配置中的明文 secret 占位，部署时使用 Cloudflare secret；
- 补齐正常转发、分类优先级、签名失败、D1 失败隔离和 API 合同测试。

### 2. Next.js 后台

- 将服务端数据源切换为 Worker+D1，不再使用 Cloudflare GraphQL token、Zone ID、GraphQL adapter、采样字段或本地 User-Agent 原始数据；
- 保留 `/admin/crawlers` 与 `/api/admin/crawlers` Basic Auth；
- 严格校验 `meta/summary/trend/bots/paths/statuses`；
- 展示三类摘要、小时趋势、bot、路径、状态码、初始化时间和 best-effort/partial-history 说明；
- 恢复 30d 入口，但不得暗示存在初始化前历史；
- 保留 noindex、no-store 和空数据的诚实说明。

### 3. 本地验证

依次运行 Worker 测试、crawler dashboard 聚焦测试、`npm run lint`、`npm run typecheck`、`npm test` 和 `npm run build`。自动化通过只证明本地回归，不证明生产部署。

### 4. 生产部署顺序

1. 创建专用 D1 并执行 migration；
2. 设置 Worker 的 `OBSERVER_READ_SECRET`、`OPEN_GEO_SELF_TEST_SECRET` 和 Next 的 `CRAWLER_OBSERVER_READ_SECRET`（不记录值）；
3. 先部署 `robots.txt*` 与 `/_crawler-observer/v1/*` 窄路由，执行只读 API/站点 QA；
4. 再扩展 `me.itheheda.online/*` 宽路由，立即确认首页、静态资源、robots 和后台可访问；
5. 部署 Next.js，验证 Basic Auth、三种窗口、partial-history、错误和移动端只读路径。

## 验收与停止条件

- 未部署前报告“实现完成/自动化通过/真实可用性未验证”；
- 任何 secret、D1 或 route 身份不明确时停止，不猜测、不绕过；
- 发现 Worker 观测影响原站响应时立即停止宽路由发布并先回滚宽路由；
- 不修改 `E:\project\open-geo-console`，不做 producer 端签名接入，不回填 GraphQL 历史数据。

## 参考

- [Cloudflare Workers best practices](https://developers.cloudflare.com/workers/best-practices/workers-best-practices/)
- [D1 Worker API](https://developers.cloudflare.com/d1/worker-api/d1-database/)
- [Worker routes](https://developers.cloudflare.com/workers/configuration/routing/routes/)
- [AI Crawl Control GraphQL reference](https://developers.cloudflare.com/ai-crawl-control/reference/graphql-api/)（仅作背景；当前实现不调用 GraphQL）

## 生产路由修复增量（已批准，待部署）

本增量不改变采集合同：官网仍由同一个 Worker 通过 `me.itheheda.online/*` broad route 采集并写入 D1。为修复 Next 服务器读取 analytics 时的路由边界，给该 Worker 增加 origin-only Custom Domain `crawler-observer.itheheda.online`。

Cloudflare Route 不能作为同一 zone 内稳定的 fetch target；因此 Next 不再请求 `me.itheheda.online/_crawler-observer/v1/analytics`，而是向 Custom Domain 发起同一 canonical HMAC 读取。Custom Domain 只允许精确 analytics path（`/_crawler-observer/v1/analytics?range=24h|7d|30d`）：非 GET 返回 `405` 并带 `Allow: GET`，缺失或错误 HMAC 返回 `401`，其他路径返回 `404`；不启用 CORS，并使用 `Cache-Control: no-store`，浏览器仍只访问现有 Basic Auth 页面/API。

不新增环境变量：沿用 `CRAWLER_OBSERVER_READ_SECRET`、`OBSERVER_READ_SECRET` 与 `OPEN_GEO_SELF_TEST_SECRET`，只调整读取 URL 的固定 host 配置。

### 当前生产状态与下一步

- 当前已确认 broad 采集 route 与 D1 写入可用。
- 同域读取失败已定位为 Cloudflare Route 不能作为 same-zone fetch target。
- Custom Domain 修复尚未部署，仍需按只读 QA 验证：有效 HMAC analytics、缺失/错误 HMAC 为 401、精确 analytics 路径的非 GET 为 405 且 `Allow: GET`、其他路径为 404、无 CORS/no-store、官网 broad route 回源不变、Basic Auth dashboard 三个窗口。
- 在上述验收完成前，状态只能写为“broad 采集/D1 可用；同域读取已定位；Custom Domain 修复待部署/验收”。

部署顺序：先创建/绑定 Custom Domain 并部署 Worker，执行 Custom Domain 与 broad route 的只读 QA；通过后再部署 Next.js 读取 host 变更并执行生产只读 QA。失败时先回滚 Next 读取 host，保留 D1 与 broad route，不删除数据库。
