# Open GEO Console 中英文文章实施计划

日期：2026-08-29
对应设计：`docs/superpowers/specs/2026-08-29-bilingual-open-geo-content-design.md`
执行范围：仅本地实现与验证；不新建分支或 worktree；不 commit、push、部署、提交搜索引擎或触发 IndexNow

## 交付结果

本计划完成后，本地生产构建应新增同一 GEO 诊断主题的两篇独立文章。

- 中文：`/articles/ai-search-visibility-audit-geo`
- 英文：`/en/articles/ai-search-visibility-audit-geo`

英文文章能力必须是审核正文驱动的真实列表与详情，不得自动翻译或为旧中文文章生成不存在的英文正文。中英文页面应进入对应语言的发现入口，并通过桌面、移动、metadata、结构化数据和机器可读验证。

## 权限与保护边界

- 使用当前 `E:\project\personal-website` 的 `main`，不创建额外分支或 worktree。
- 开始每个写入步骤前重读 Git 状态，保护现有 `docs/ACTIVE-CHANGE-SCOPE.md`、`docs/PROJECT-STATE.md` 修改和 `.codegraph/`、`.codex/`、`.mimocode/`、`.playwright-cli/`、`output/` 等未跟踪内容。
- 本任务不清理、不覆盖、不提交上述现存工作。
- 仅在用户另行明确授权后才进行 Git commit、push、部署、Search Console/Bing 操作或 IndexNow 通知。
- 实现过程中如与并发修改发生同文件冲突，停止并报告，不用覆盖或恢复命令处理。

## Task 1：锁定 Next.js 约束与双语文章测试合同

### 读取

- `node_modules/next/dist/docs/` 中与 App Router 静态动态路由、`generateStaticParams`、metadata alternates 和 sitemap 相关的当前版本文档。
- `app/(site-zh)/articles/[slug]/page.tsx`
- `app/(site-en)/en/articles/page.tsx`
- `lib/mdx/mdx.ts`
- `config/locale.ts`
- `lib/structured-data.ts`
- `lib/ai-readable/routes.ts`

### 先写失败测试

修改或新增以下测试。

- `tests/article-discovery-workbench.test.ts`
- `tests/article-page-metadata.test.ts`
- `tests/article-geo-content.test.ts`
- `tests/locale-routing.test.ts`
- `tests/seo-routes.test.ts`
- `tests/fixtures/articles-en/2026-08-29-ai-search-visibility-audit-geo.mdx`

失败测试必须证明以下当前缺口。

1. 加载器无法按 `en` 读取独立英文目录。
2. `/en/articles` 仍固定传入空列表。
3. `/en/articles/[slug]` 尚不存在。
4. 中英文同 slug 文章尚未输出成对 canonical 与 hreflang。
5. Article JSON-LD 尚未明确输出 `inLanguage`。
6. 当前语言切换会把所有中文文章统一送到 `/en/articles`，不能只为已审核对应页导航到英文详情。
7. sitemap、`llms.txt` 和英文 Feed 尚未发现审核英文正文。

### 运行红灯

```powershell
npm.cmd test -- tests/article-discovery-workbench.test.ts tests/article-page-metadata.test.ts tests/article-geo-content.test.ts tests/locale-routing.test.ts tests/seo-routes.test.ts
```

完成证据是测试因上述缺失行为失败，而不是测试环境、导入错误或无关脏文件失败。

## Task 2：为 MDX 加载层增加固定语言目录

### 修改

- `lib/mdx/mdx.ts`
- `tests/article-discovery-workbench.test.ts`
- `tests/fixtures/articles-en/2026-08-29-ai-search-visibility-audit-geo.mdx`

### 最小实现

1. 引入固定的 `ArticleLocale`，仅接受 `zh | en`。
2. 将语言映射到代码内固定目录：中文 `content/articles`，英文 `content/articles-en`。不得接受调用方传入任意磁盘路径。
3. `getArticles`、`getArticleBySlug`、`getArticleSlugs`、`getRelatedArticles` 及分类/标签读取增加 locale 参数，默认值保持中文，避免现有调用回归。
4. `publicPath` 按语言生成 `/articles/[slug]` 或 `/en/articles/[slug]`。
5. 英文目录缺失时返回空列表；英文文件不存在时返回 `null`，不回退中文。
6. 保持现有 frontmatter Zod 校验、draft 生产过滤、内容哈希和阅读时间逻辑。
7. 测试必须覆盖非法 locale 无法访问目录外文件、英文文件独立读取、中文默认行为不变和同 slug 正文内容不同。

### 验证

```powershell
npm.cmd test -- tests/article-discovery-workbench.test.ts
```

## Task 3：实现英文列表、详情与审核语言切换

### 修改

- `app/(site-en)/en/articles/page.tsx`
- 新增 `app/(site-en)/en/articles/[slug]/page.tsx`
- `app/(site-zh)/articles/[slug]/page.tsx`
- `config/locale.ts`
- 视最小共享需要新增 `config/article-locales.ts` 或等价的已审核语言映射
- `tests/article-page-metadata.test.ts`
- `tests/locale-routing.test.ts`

### 实现要求

1. 英文列表调用英文加载器并向 `ArticlesPageClient` 传入真实审核文章及英文 CollectionPage JSON-LD。
2. 英文详情采用静态参数，只生成英文目录中实际存在的 slug；不存在的详情保持 404。
3. 英文详情使用英文日期、返回列表、相关文章等界面文案。
4. 中英文 metadata 分别输出自指 canonical；对应正文存在时输出 `zh-CN`、`en`、`x-default` alternates。
5. 语言切换只为明确存在审核对应正文的 slug 导航到另一语言详情。旧中文文章继续进入 `/en/articles`。
6. 如果客户端语言切换需要一份静态映射，则该映射只能记录审核后的语言可用性，并由测试强制其与实际内容目录交集一致，防止形成未受检查的第二套发布状态。
7. 不引入运行时翻译、浏览器存储覆盖正文或对任意 slug 的猜测式英文链接。

### 验证

```powershell
npm.cmd test -- tests/article-page-metadata.test.ts tests/locale-routing.test.ts tests/components/articles/ArticlesBrowser.test.tsx
```

## Task 4：扩展结构化数据与机器可读发现

### 修改

- `lib/structured-data.ts`
- `lib/ai-readable/routes.ts`
- `app/sitemap.ts`
- `app/llms.txt/route.ts`
- `app/feed.xml/route.ts`
- `app/feed.json/route.ts`
- 新增英文 Feed 路由或提取最小共享 Feed 生成器，具体路径在测试中固定为 `/en/feed.xml` 与 `/en/feed.json`
- `tests/lib/structured-data.test.ts`
- `tests/article-discovery-workbench.test.ts`
- `tests/seo-routes.test.ts`

### 实现要求

1. `generateArticleSchema` 输出与 locale 一致的 URL、品牌名和 `inLanguage`。
2. `generateArticleCollectionSchema` 对英文文章使用英文 URL 和标题。
3. `getReadableRoutes` 同时读取审核中文与英文文章，明确保留语言信息，避免英文标题挂到中文 URL。
4. sitemap 对同 slug 双语文章输出两条 URL 及相互 alternates；单语旧文章不得声明不存在的英文 alternate。
5. `llms.txt` 能清楚列出两种语言的文章 URL，不改变既有品牌与项目事实来源。
6. 中文 Feed 继续只输出中文文章并保持 `zh-cn`；英文 Feed 只输出英文文章并使用英文标题、描述、URL 和语言标记。
7. 不重复提交 sitemap，不在测试中发起 IndexNow 或任何搜索引擎外部请求。

### 验证

```powershell
npm.cmd test -- tests/lib/structured-data.test.ts tests/article-discovery-workbench.test.ts tests/seo-routes.test.ts
```

## Task 5：研究并建立正文事实矩阵

### 官方资料核验

仅使用一手资料和项目权威，重新读取并记录访问日期。

- Google Search Central 关于 AI features、抓取、索引和有帮助内容的当前官方文档。
- OpenAI 关于搜索爬虫和发布者控制的当前官方文档。
- Open GEO Console 中文与英文正式页面中当前公开的产品能力与边界。
- `config/website-projects.ts`、`DESIGN.md`、`config/public-identity.ts`、`config/service-method.ts`、`config/public-content.ts`。

### 内部事实矩阵

写作前在工作笔记中为每篇正文列出至少五项可核验材料，并记录来源。材料必须能支撑一条完整诊断过程，至少包含：

1. 可访问与被索引是不同状态。
2. robots、sitemap、初始 HTML、canonical 或安全边缘可能影响发现和抓取。
3. 商业页面需要清晰回答买家问题。
4. 组织、产品、服务和证据一致性影响机器理解与可信度。
5. 诊断结果应转成有优先级、负责人和验证证据的整改项。
6. Open GEO Console 当前公开的诊断、报告和任务包能力。

任何无法指出来源的统计、客户结果、引用提升、排名、法律合规或竞品判断不得进入正文。

## Task 6：独立创作两篇 MDX 正文

### 新增

- `content/articles/2026-08-29-ai-search-visibility-audit-geo.mdx`
- `content/articles-en/2026-08-29-ai-search-visibility-audit-geo.mdx`

### 中文合同

- 标题：《为什么 AI 搜索看不到你的官网？从可抓取性、买家问题到引用缺口做一次 GEO 诊断》
- 必须包含直接答案、状态区分、技术入口、买家问题、实体与证据、整改优先级、适用边界、实施步骤、验收清单、参考来源和下一步。
- 主 CTA 指向 `https://geo.itheheda.online/zh`。
- 次级内部链接连接 `/projects/open-geo-console`、`/services` 和 `/contact`。

### 英文合同

- 标题：“Why AI Search Cannot See Your Website: A Practical GEO Visibility Audit”
- 必须独立组织开头、段落和例子，覆盖 crawlability、indexability、semantic clarity、buyer-question coverage、citation readiness、remediation ownership、boundaries 和 verification。
- 主 CTA 指向 `https://geo.itheheda.online/en`。
- 次级内部链接连接 `/en/projects/open-geo-console`、`/en/services` 和 `/en/contact`。

### 共同边界

- slug 均为 `ai-search-visibility-audit-geo`。
- author 分别使用“实解智能”和“SolveReal Systems”。
- 正文不得逐句翻译，不得使用虚构客户、指标、排名、引文、截图或结果。
- 页面内产品演示如被提及，必须明确是模拟数据。
- 不声称 GEO 保证收录、引用、流量或咨询。
- 引用只保留支撑关键判断的少数官方来源。

### 内容测试

先扩展 `tests/article-geo-content.test.ts`，再写正文直到测试通过。中文和英文使用各自的必要章节与事实断言，不强迫英文机械复制中文标题结构。测试同时检查 CTA、内部链接、禁止声明、日期、内容哈希和两篇正文不相同。

```powershell
npm.cmd test -- tests/article-geo-content.test.ts
```

## Task 7：内容初稿审校与事实复核

### 审校顺序

1. 按 `human-writing` 的现实内容规则检查材料、说话位置、段落增量和自然表达。
2. 初稿完成后读取 `human-writing/references/revision.md`，执行该技能规定的硬禁令和重复表达检查。
3. 逐项回查事实矩阵和每个外部链接，删除无法核验的判断。
4. 核对中英文术语，确保英文不是中文句法搬运，也不使用未经数据支持的地区术语或 SMB 定位。
5. 检查正文中所有产品能力都能回到已审核配置或正式公开页面。

### 停止条件

若正文需要外部统计、客户结果、竞品比较、法律结论或私有产品信息才能成立，停止写作并请求新的范围批准。

## Task 8：完整自动化验证

依次运行：

```powershell
npm.cmd run audit:architecture
npm.cmd run projects:evidence:audit
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
```

失败时只修复本任务引入的问题。若失败来自现存脏改动、环境或并发工作，保留现场并报告，不扩大范围。

构建后核对静态路由清单至少包含：

- `/articles/ai-search-visibility-audit-geo`
- `/en/articles/ai-search-visibility-audit-geo`
- `/en/feed.xml`
- `/en/feed.json`

## Task 9：本地真实页面验收

使用本地生产构建，不访问或修改正式部署。

检查 1440px 桌面和 390px 移动视口：

1. 中英文文章列表各出现一篇对应语言文章。
2. 两个详情页标题、摘要、正文、日期、返回文案和 CTA 语言正确。
3. 同 slug 详情可以双向切换语言。
4. 旧中文文章切换英文仍进入 `/en/articles`。
5. 中文与英文 Open GEO CTA 分别到 `/zh` 和 `/en` 正式产品入口。
6. 页面没有横向溢出，控制台没有 error。
7. 原始 HTML 中存在标题、正文、canonical、hreflang 和 Article JSON-LD。
8. 本地 sitemap、`llms.txt` 与两种语言 Feed 包含正确 URL，且没有未经审核的英文旧文章。

浏览器验收不点击联系表单、不提交消息、不触发真实 Open GEO 任务或外部索引通知。

## Task 10：交付本地结果并等待单独授权

最终向用户报告：

- 设计与实施计划链接。
- 两篇本地文章路径和本地页面入口。
- 英文文章基础设施的实际改动。
- 自动化测试、构建和浏览器证据。
- 事实来源与未作出的承诺。
- 当前 Git diff 和现存无关脏文件的保护结果。

到此停止。只有用户再次明确授权后，才能按范围执行 commit；push、部署、Search Console/Bing、IndexNow 和发布后验收仍分别需要明确授权。
