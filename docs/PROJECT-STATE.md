# 实解智能官网当前状态

更新：2026-08-25
分支：`main`

## 当前产品

官网已统一为“实解智能”品牌，服务于企业 AI 系统设计与交付。公开页面使用同一套经审核的身份、方法与项目事实；后台只保留文章工作台和访问检测。

文章工作台已于 2026-08-25 在本地替换为“本地 Open GEO 自动生成 + 官网自动导入/同页预览编辑/发布”：管理员在一个参考 Open GEO 表单结构的页面填写主题、参考网站、目标读者、已审核事实和写作要求，其中参考网站默认使用正式官网 `https://me.itheheda.online` 且仍可临时修改。官网服务器只通过回环地址创建现有免费任务、轮询状态并把完成输出自动导入可编辑草稿，不再跳转 Open GEO 或要求复制 Markdown。生成完成后，当前页面直接出现安全 MDX 预览，并可在“预览文章 / 编辑文章”之间原位切换；独立预览网址只保留为兼容入口。Open GEO Worker 继续独占研究、来源判断与写作职责；官网只做传输、安全校验、机械元数据和预览，保留文章已有来源与链接，不再要求管理员二次勾选“来源确认”。能力凭据只保存在 HttpOnly、同站、按运行隔离的 Cookie 中，不写入运行工件；生成链路不进入订单或收费流程，发布器也只在人工点击最终发布按钮时才初始化。本项生产状态必须以对应提交、Vercel 部署回执和正式入口验证为准；验收未创建真实 Open GEO 模型任务或发布文章。

文章工作台功能提交 `7dfdc04236c1d1b0a510a672acf137945100e5ec` 已推送到 `main`；Vercel 生产部署 `dpl_HmLCgpx2yfqctUHaHXSH3GS5knT5` 状态 Ready 并绑定 `https://me.itheheda.online`。正式域名 `/` 与 `/articles` 返回 200；`/admin/articles` 按生产禁用合同继续返回 404。本回执证明功能代码已发布且公开站点健康，不证明本地 Open GEO 生成路径可从云端运行，也未触发真实模型任务、付款或文章发布。

双语品牌与可索引英文站已于 2026-08-24 完成实施和本地验收：中文页面保留现有网址并显示“实解智能”，英文核心页面使用 `/en` 前缀并显示“SolveReal Systems”，同一 Organization 实体通过 `name` / `alternateName` 关联两种名称。两种语言均由独立 root layout 直接输出对应 `<html lang>`、正文、metadata 与 JSON-LD；语言切换导航到真实对应网址。英文文章索引只接收审核后的英文全文，当前没有英文文章详情页，中文单语文章切换英文时进入 `/en/articles`。发布状态与线上可用性以本页“当前验收状态”的生产部署回执为准，不把代码提交或构建通过冒充为搜索引擎收录。

访问检测继续使用 Cloudflare Worker + D1 的入口层聚合：后台拆为 `/admin/crawlers/human` 与 `/admin/crawlers/machines` 两个可互相跳转的页面，AI 爬虫、Open GEO 自测和其他自动化维持原分类，人类页统计疑似人类浏览器的 HTML 页面请求，并显示国家/地区、一级行政区、设备类型、浏览器和操作系统分布。地区直接使用 Cloudflare 入站请求的粗粒度国家与一级行政区数据；只保存小时桶、规范化路径、状态码、归一化类别和计数，不保存城市、经纬度、邮编、IP、Cookie、Referer 或原始 User-Agent，也不声称是独立访客。生产 D1 迁移、Worker 和网站已于 2026-08-24 发布；线上人类访问数据从 `2026-08-24T07:09:16.592Z` 开始累计。

AI 爬虫官方 IP 规则由同一 Worker 的每日 Cron（UTC 03:17，北京时间 11:17）自动同步。同步只接受固定的 OpenAI 与 Perplexity 官方 JSON；每个来源独立校验和更新，失败不会清空上一次成功版本。Workers 运行时重定向模式兼容问题已于 2026-08-24 修复，五个官方来源均在生产完成成功同步。

中国爬虫 UA 规则已扩展为 DeepSeekBot、Bytespider、Baiduspider、Sogou Spider、360Spider 与 PetalBot，并在机器访问页提供独立覆盖表。该组规则只依据 User-Agent 线索，统一保持“仅声明身份”；其中 DeepSeek 当前没有公开官方爬虫身份或强验证资料。本项已于 2026-08-24 完成 Worker 与网站生产发布。

## 设计权威

- `DESIGN.md`：唯一品牌与视觉设计合同
- `config/public-identity.ts`：品牌身份
- `config/service-method.ts`：服务方法
- `config/public-project-cases.json`：公开项目事实
- `config/public-content.ts`：共享内容解析

## 2026-08-23 全项目审计

已删除 DevfolioX 模板、旧个人作品集组件、摄影系统、主题切换与色板、旧配置编辑后台、历史 Docker 内容副本、旧演示资产和已完成的阶段性设计方案。根布局固定为暖纸色系统，本地 Docker 不再覆盖当前配置。

保留的历史资料仅限仍有运行价值的文章工作台、爬虫检测设计/实施文档，以及安全审计记录。它们不构成视觉设计权威。

## 验收状态

- 官网曝光增长阶段一已基于 `ca3dcfa8b1c08d3d0f912da2042f4c24a03e3424` 完成本地实现：新增环境变量驱动的 Google/Bing 所有权验证元数据、`/indexnow-key.txt` 与默认 dry-run 的 IndexNow 通知入口。Google/Bing 账号验证、sitemap/URL Inspection 与真实 IndexNow 提交必须以本页后续生产回执为准，不把本地代码或测试冒充为线上已启用或已收录。执行计划见 `docs/superpowers/plans/2026-08-24-website-exposure-growth-plan.md`。
- 官网曝光增长阶段一实现提交 `40a84837914ba428c2b71ec102a69d7c4268dc86` 已直接快进并推送到 `main`；生产部署 `dpl_7BEZpHEMU81HxLpPLYT4JGFaRKkX` 状态 Ready 并绑定 `https://me.itheheda.online`。正式首页已确认 Google/Bing 验证元数据生效，`/indexnow-key.txt` 返回 200 且内容匹配生产配置。Google Search Console 与 Bing Webmaster Tools 均已完成 URL-prefix 站点所有权验证；`https://me.itheheda.online/sitemap.xml` 已分别提交并处理成功，两边均发现 38 个 URL，0 个 sitemap 错误或警告。Google URL Inspection 确认 `/` 与 `/en` 当时均“尚未收录”，两者已收到“已请求编入索引、加入优先抓取队列”回执。IndexNow 已对 `/` 与 `/en` 发出一次真实通知并返回 HTTP 202、`urlCount=2`。以上只证明代码发布、所有权验证、sitemap 读取与通知/请求已受理，不证明搜索引擎已经收录、产生曝光、点击或咨询转化；Google/Bing 的效果数据仍在生成，需进入每周反馈闭环复核。生产部署验证窗口内的 Vercel error 与 5xx 查询均未返回日志记录。
- 阶段二保留 4 个中文、2 个英文假设型内容 brief，见 `docs/superpowers/plans/2026-08-24-stage-two-content-briefs.md`。用户于 2026-08-26 授权中文 Brief 02 正文、提交、推送与发布；《AI 自动化 PoC 验收记录怎么做？从测试样本到上线放行》已完成本地正文与验收，slug 为 `ai-automation-poc-acceptance-record-release-decision`。本文由 Codex 对照已审核服务及项目配置撰写，示意记录没有客户成绩；未调用 Open GEO 工作台生成、未新增英文正文或搜索通知。工作区完整测试 81 文件/677 项通过；干净导出候选 81 文件/670 项、lint、typecheck、两项审计及生产构建通过，本地浏览器确认列表入口、正文、移动表格和英文回退。原工作区 typecheck/build 因扫描另一任务的 `output/` 源码副本失败，保留该证据；不改检查规则、不删除副本。尚未推送或发布：`main` 的前置提交 `93edf62` 是另一任务只获准本地提交的中英文链接修复，须确认是否一并发布。其余五篇仍未进入正文；新文章的收录、曝光、点击和转化均未验证。详细本地证据见 `output/exposure-audit/2026-08-26-poc-article-local-validation.md`。

- `npm run audit:architecture`：通过；扫描 227 个文件，AI-readable 三项合同通过。
- `npm run projects:evidence:audit`：通过；3 个公开案例、231 个公开字符串。
- `npm run lint`：通过，0 error / 0 warning。
- `npm run typecheck`：通过。
- `npm test`：75 个测试文件、641 个测试通过；Crawler Observer 3 个测试文件、56 个测试通过。
- `npm run build`：Next.js 16.3.2 构建通过，生成 48 个页面任务；包含 `/en` 首页、5 个英文核心内页入口、4 个英文项目详情页和动态 `/indexnow-key.txt`。
- `npm audit` 与 `npm audit --omit=dev`：0 个已知漏洞。
- 本地生产构建在 1440×900 与 390×844 下通过首页、项目页视觉检查；移动导航、联系主路径与二维码弹窗可用。
- 双语品牌与英文站在本地生产入口通过原始 HTML 与真实浏览器检查：中文输出 `lang="zh-CN"`，英文输出 `lang="en"`；英文导航、品牌名、canonical、语言 alternates、同一品牌 JSON-LD、未翻译文章 404 与 `/en/articles` 回退边界正确；1440×900 与 390×844 无页面级横向溢出，浏览器控制台无错误。
- 双语品牌与英文站提交 `95a978c` 已发布为 Vercel 生产部署 `dpl_2P8Y9MoHhFrx3GJveD1CstP6ejwC`，状态 Ready 并绑定 `https://me.itheheda.online`。正式域名的中文首页、`/en`、`/en/services`、`/en/articles` 与英文项目详情均返回 200，语言、品牌、canonical、语言 alternates、同一 Organization `@id` 和 sitemap 正确且不含 localhost；未翻译英文文章返回 404。真实浏览器复核英文首页和服务页无页面级横向溢出，该部署近 15 分钟未发现 error 日志。
- 语言切换与英文项目详情修复提交 `f22e9a9` 已发布为 Vercel 生产部署 `dpl_9CnhSmkSqvf5cU3r2wuvrWByjmse`，状态 Ready 并绑定 `https://me.itheheda.online`。正式域名真实点击确认 `/services` 与 `/en/services` 可双向切换；英文 Open GEO 项目页、完整模拟流程、模拟交付物及 `/en/contact` 携带的场景上下文均为英文，主内容无中文残留或页面级横向溢出。
- 访问检测的人类/机器双页面在 1440×900 与 390×844 下通过真实浏览器检查；页面互跳保留时间范围，移动端无页面级横向溢出，国家/地区、一级行政区、设备、浏览器和操作系统表格可读。
- 生产 D1 已包含人类页面、客户端与地区三张聚合表；中国爬虫覆盖网站部署 `dpl_8bHDu8KhTD989PSEanocctFBoErL` 为 Ready 并绑定 `https://me.itheheda.online`；正式首页返回 200，访问检测页面与接口未认证时返回 401，该部署发布后 10 分钟内未发现 error 日志。生产敏感变量不可导出，因此本轮没有把认证态后台读取冒充为已完成的端到端验收。
- 官方爬虫规则自动同步已修复；中国爬虫 UA 覆盖发布为 Worker 版本 `e29e11d0-b8e3-4bfa-9f17-cd9577bd1011`。生产 D1 此前于 `2026-08-24T07:36:59.261Z` 成功更新 OpenAI 三项和 Perplexity 两项规则，五项错误码均为空。
- 退役路径：`/admin/site`、`/api/admin/save`、`/api/og`、`/download` 返回 404；`/photography` 保留到首页的 308 兼容跳转。

## 常用验证

```bash
npm run audit:architecture
npm run projects:evidence:audit
npm run lint
npm run typecheck
npm test
npm run build
```
