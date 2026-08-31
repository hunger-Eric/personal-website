# 实解智能官网

实解智能面向中文企业客户，提供企业 AI 系统设计与交付服务。官网从真实业务流程出发，展示服务方法、经审核的项目证据、系统边界与公开文章。

- 线上地址：[me.itheheda.online](https://me.itheheda.online)
- 技术栈：Next.js 16、React 19、TypeScript、Tailwind CSS、Vitest

## 本地开发

```bash
npm ci
npm run dev
```

默认访问 `http://localhost:3000`。

## 目录与权威来源

- `app/`：公开页面、AI-readable 路由和受保护后台
- `components/`：当前页面与共享系统组件
- `config/public-identity.ts`：品牌身份与公开定位
- `config/service-method.ts`：服务方法
- `config/public-project-cases.json`：经公开审核的项目事实
- `config/public-content.ts`：人类页面与机器可读页面的共享解析层
- `DESIGN.md`：唯一品牌与视觉设计合同
- `docs/architecture.md`：当前代码架构
- `docs/PROJECT-STATE.md`：当前状态与验收结果

## 页面

公开页面包括 `/`、`/services`、`/projects`、`/projects/[id]`、`/articles`、`/about` 与 `/contact`。机器可读入口包括 `/llms.txt`、`/.well-known/brand-facts.json` 和 `/ai/*.json`。

后台只保留仍在使用的两个工具：

- `/admin/articles`：文章研究、编辑、预览与人工确认发布
- `/admin/crawlers`：AI 爬虫访问检测

后台在生产环境默认关闭并失败为 404。旧配置编辑器、主题编辑器、摄影系统和自动部署轮询接口已经移除。

## 环境变量

从 `.env.example` 创建 `.env.local`，按需配置：

- `NEXT_PUBLIC_BASE_URL`
- `GOOGLE_SITE_VERIFICATION`、`BING_SITE_VERIFICATION`、`YANDEX_SITE_VERIFICATION`、`NAVER_SITE_VERIFICATION`：国际站长平台提供的公开站点所有权验证值；留空时不输出对应标签
- `BAIDU_SITE_VERIFICATION`、`SO360_SITE_VERIFICATION`、`SOGOU_SITE_VERIFICATION`、`SHENMA_SITE_VERIFICATION`、`TOUTIAO_SITE_VERIFICATION`：百度、360、搜狗、神马、头条搜索平台提供的公开验证值；只复制平台生成的 `content` 值，不提交账号凭据
- `INDEXNOW_KEY`：公开托管在 `/indexnow-key.txt` 的 IndexNow key；`INDEXNOW_ALLOW_SUBMIT` 默认必须为 `false`
- `ENABLE_ADMIN`、`ADMIN_TOKEN`、`ADMIN_PASSWORD`
- `GITHUB_TOKEN`：仅用于文章工作台的明确发布动作
- `ARTICLE_MODEL_*`、`ANYSEARCH_API_KEY`：文章研究与生成
- `RESEND_API_KEY`、`CONTACT_TO_EMAIL`、`CONTACT_FROM_EMAIL`
- `CRAWLER_DASHBOARD_PASSWORD`、`CRAWLER_OBSERVER_READ_SECRET`

生成文章不会自动发布；只有已认证用户明确点击“上传并发布”后，才会执行 GitHub 写入。测试和本地预览不等于授权真实模型调用、外部检索、发布或部署。

## 搜索引擎接入

阶段计划和账号侧操作边界见 [`docs/superpowers/plans/2026-08-24-website-exposure-growth-plan.md`](docs/superpowers/plans/2026-08-24-website-exposure-growth-plan.md)。Google、Bing、Yandex、Naver、百度、360、搜狗、神马与头条的验证值只通过环境变量注入；仓库不保存账号凭据。所有搜索引擎共用正式 `robots.txt` 与 `sitemap.xml`，不为单个平台复制页面或地图。

IndexNow 通知入口默认只校验参数并返回 URL 数量，不发送网络请求：

```bash
npm run indexnow:notify -- --url https://me.itheheda.online/services
```

真实提交是独立权限门：必须同时显式传入 `--submit` 且令 `INDEXNOW_ALLOW_SUBMIT=true`。仅允许正式 HTTPS 同源、无 query/hash 的公开页面路径；`/admin`、`/api`、`/private`、异域 URL 和非白名单路径都会失败关闭。部署、控制台验证、sitemap 提交和真实 IndexNow 通知均需单独授权。

## 验收

```bash
npm run audit:architecture
npm run projects:evidence:audit
npm run lint
npm run typecheck
npm test
npm run build
```

桌面端与 390px 移动端还需通过真实浏览器视觉与主路径交互检查。
