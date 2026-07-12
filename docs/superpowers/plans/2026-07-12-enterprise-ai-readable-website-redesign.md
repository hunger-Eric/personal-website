# 企业客户与 AI 双重可读网站实施计划

日期：2026-07-12

设计规格：[`../specs/2026-07-12-enterprise-ai-readable-website-redesign-design.md`](../specs/2026-07-12-enterprise-ai-readable-website-redesign-design.md)

## 执行原则

- 每个任务先写或更新失败测试，再实现最小改动，再运行聚焦测试。
- 项目事实先于页面文案；未经公开审核的 GitHub 内容不能进入页面。
- 私有仓库原文、仓库清单、内部路径和客户信息不能进入这个公共仓库。
- 删除旧页面前先用 CodeGraph、`rg` 和测试确认调用方；页面删除不等于删除用户原始资产。
- 每完成一个阶段都运行 `git diff --check`，按阶段提交，避免一个超大提交。
- 视觉实现以已提交的 PNG 为层级与配色参考，案例文字必须来自审核后的结构化事实。

## 阶段 0：建立实施基线

### Task 0.1：创建实施分支并记录基线

文件：

- `docs/PROJECT-STATE.md`

步骤：

1. 确认当前 `main`、远端差异和未跟踪文件；保持 `.codegraph/` 与 `scripts/sync_feishu_progress.py` 不变。
2. 创建 `codex/enterprise-ai-readable-redesign` 分支。
3. 运行并保存基线结果：

   ```bash
   codegraph status
   npm run audit:architecture
   npm run lint
   npx tsc --noEmit
   npm test
   npm run build
   npm audit --omit=dev
   ```

4. 在 `docs/PROJECT-STATE.md` 只记录命令结果摘要，不粘贴完整日志。

验收：基线失败项与 2026-07-12 审计相符，未误改用户文件。

## 阶段 1：恢复可信工程门禁

### Task 1.1：升级存在安全公告的生产依赖

文件：

- `package.json`
- `package-lock.json`
- `next.config.ts`
- `tests/seo-routes.test.ts`
- 与升级失败直接相关的测试文件

步骤：

1. 查询当前稳定修复版本，升级 `next`、配套 `eslint-config-next`，并更新可安全修复的 `resend`、`postcss`、`js-yaml` 间接依赖。
2. 不使用强制大版本升级掩盖兼容问题。
3. 先运行路由、代理、SEO 和构建相关测试，再运行全量测试与构建。
4. 重新运行 `npm audit --omit=dev`，记录仍存在且无法在本次范围修复的项。

验收：没有当前已知的高危生产依赖；Next.js 构建和路由行为保持可用。

### Task 1.2：恢复 TypeScript 真实门禁

文件：

- `next.config.ts`
- `tsconfig.json`
- `vitest.config.ts`
- `components/hooks/useModalRoute.ts`
- `components/sections/Projects.tsx`
- `components/system/ActionButton.tsx`
- `config/aboutConfig.ts`
- `config/experience.ts`
- `config/navbarConfig.ts`
- 当前 `npx tsc --noEmit` 列出的测试文件

步骤：

1. 删除 `typescript.ignoreBuildErrors`。
2. 为 Vitest 全局类型选择一致策略：在测试配置中声明全局类型，或在测试中显式导入；不通过放宽业务类型解决。
3. 修复 24 个业务源码类型错误，优先解决联合类型收窄、配置解析和多态按钮 props。
4. 修复剩余测试类型错误；避免 `as any` 和无依据的双重断言。
5. 增加 `typecheck` 脚本并让 `build`/CI 明确执行。

验收：

```bash
npm run typecheck
npm test
npm run build
```

全部通过，生产构建不再跳过类型错误。

## 阶段 2：建立 GitHub 事实审核流水线

### Task 2.1：定义公共案例 schema

新增文件：

- `config/project-case-schema.ts`
- `config/public-project-cases.json`
- `tests/config/project-case-schema.test.ts`

修改文件：

- `config/cases.ts`
- `config/cases.json`（迁移完成后删除或缩减为显示设置）

步骤：

1. 用 Zod 定义规格中的公共案例字段：目的、原流程、断点、系统边界、输入、处理、人工审核、输出、恢复、状态、可迁移能力、证据、限制、公开状态和审核时间。
2. `sourceVisibility` 只允许 `public` 与 `private-curated`。
3. 为事实字段使用可选值；缺少证据时省略，不生成填充文字。
4. 增加规则测试：禁止 URL 指向私有仓库，禁止内部绝对路径，禁止疑似凭据和未经批准的客户标识。
5. 先用空或最小合法 fixture 让 schema 测试通过，不迁移旧案例文案。

验收：无来源字段、隐私字段或虚构指标可以绕过 schema/审计进入公共配置。

### Task 2.2：实现本地私有源清单与证据草稿生成器

新增文件：

- `scripts/project-evidence/read-source-manifest.mjs`
- `scripts/project-evidence/fetch-github-docs.mjs`
- `scripts/project-evidence/build-review-draft.mjs`
- `scripts/project-evidence/audit-public-output.mjs`
- `scripts/project-evidence/README.md`
- `tests/scripts/project-evidence.test.ts`

修改文件：

- `.gitignore`
- `package.json`

本地忽略路径：

- `.private/project-sources.json`
- `.artifacts/project-evidence/`

步骤：

1. 源清单仅保存在 `.private/`，包含仓库、ref 和允许读取的文档路径。
2. 使用已登录的 `gh` CLI 只读获取文档；公共网站运行时和生产构建不访问 GitHub 私有仓库。
3. 草稿生成器输出到 `.artifacts/project-evidence/`，保存来源路径、提交 SHA 和候选事实。
4. 公共发布必须是人工把已审核字段复制到 `config/public-project-cases.json`；不提供“自动发布私有文档”命令。
5. `audit-public-output.mjs` 检查私有仓库 URL、Windows/Unix 绝对路径、邮箱/Token 模式、客户标识和未审核字段。
6. 增加脚本：

   ```json
   {
     "projects:evidence:draft": "node scripts/project-evidence/build-review-draft.mjs",
     "projects:evidence:audit": "node scripts/project-evidence/audit-public-output.mjs"
   }
   ```

验收：私有原文只存在于忽略目录；公共审计对故意插入的泄露 fixture 必须失败。

### Task 2.3：逐项目审核并确定首发案例

本地输入：

- 每个候选项目的 README、DESIGN、PROJECT-STATE、DECISIONS、架构与验收文档

提交输出：

- `config/public-project-cases.json`
- `public/case-artifacts/<case-id>/...`（仅经批准的脱敏 artifact）

步骤：

1. 逐个项目生成证据草稿。
2. 对照当前状态与验收证据，删除过时或互相矛盾的陈述。
3. 按“企业相关性、文档充分度、独特能力、公开安全、状态准确”打分。
4. 首页只选择少量互补案例；其余可进入索引或不公开。
5. 对私有项目只写经确认的高层事实，不提交源链接和内部路径。
6. 每个案例单独由用户审阅公开文案后再标记 `publicStatus: published`。

验收：所有已发布案例通过 schema、隐私审计和人工审核；没有把验证中项目写成成熟交付。

## 阶段 3：统一人类与 AI 内容模型

### Task 3.1：建立身份、方法与服务模型

新增文件：

- `config/public-identity.ts`
- `config/service-method.ts`
- `config/public-content.ts`
- `tests/config/public-content.test.ts`

修改文件：

- `config/siteConfig.ts`
- `config/contentCopy.ts`
- `config/site.json`

步骤：

1. 定义身份、定位、适合诊断的问题、四阶段方法、公开联系方式和 CTA。
2. 中文与英文使用同一结构，允许逐字段本地化，不在叶子组件判断 locale。
3. 首页、联系页、案例页和 AI 路由只能从 `public-content` 读取公开事实。
4. 删除旧的 AI Lab、作品档案、摄影/媒体定位文案。

验收：同一事实不在多份配置中重复维护；中英文结构测试通过。

### Task 3.2：实现机器可读路由

新增文件：

- `app/.well-known/brand-facts.json/route.ts`
- `app/ai/services.json/route.ts`
- `app/ai/projects.json/route.ts`
- `app/ai/projects/[id].json/route.ts`
- `lib/ai-readable/contracts.ts`
- `tests/ai-public-contracts.test.ts`

修改文件：

- `app/llms.txt/route.ts`
- `lib/ai-readable/routes.ts`
- `app/robots.ts`
- `app/sitemap.ts`
- `tests/ai-readable-routes.test.ts`
- `tests/llms.test.ts`
- `tests/seo-routes.test.ts`

步骤：

1. 先为每个新路由写 200、content-type、schema、canonical、语言和版本测试。
2. 实现真实 `brand-facts.json`，消除当前“清单存在、路由不存在”的断链。
3. `llms.txt` 只列企业身份、方法、公开案例、联系与机器路由。
4. 从路由清单删除摄影、内容聚合、简历和无关自定义页。
5. 保证 `/ai/*` 与 `/.well-known/*` 未被 robots 阻止。
6. 增加事实一致性测试：HTML/JSON/llms 使用相同公开模型。

验收：所有机器路由返回 200，且没有旧个人站定位或未审核案例。

### Task 3.3：重构 JSON-LD 与 metadata

文件：

- `lib/structured-data.ts`
- `app/layout.tsx`
- `app/page.tsx`
- `app/projects/page.tsx`
- `app/projects/[id]/page.tsx`
- `app/contact/page.tsx`
- `tests/lib/structured-data.test.ts`

步骤：

1. 根页面使用 `Person` + `ProfessionalService`。
2. 方法使用 `Service`；案例根据事实选择 `SoftwareApplication`、`CreativeWork` 或 `Article`。
3. 移除所有项目固定 `Offer price: 0` 的旧逻辑。
4. metadata 和可见页面标题使用企业客户语言，不再使用通用 portfolio/React 关键词。
5. 增加 JSON-LD 与可见事实一致性测试。

验收：结构化数据不夸大项目类型、价格或成熟度。

## 阶段 4：重建导航与页面骨架

### Task 4.1：简化导航、页脚和语义结构

文件：

- `config/navbar.json`
- `config/navbarConfig.ts`
- `components/NavbarCenteredDesktop.tsx`
- `components/NavbarCenteredMobile.tsx`
- `components/Footer.tsx`
- `components/ConditionalChrome.tsx`
- `app/layout.tsx`
- 对应导航、页脚、布局测试

步骤：

1. 导航收敛为：方法、案例、关于、联系。
2. 主 CTA 永远指向 `/contact`；移动端与桌面端使用一致文案。
3. 删除 `copy:` 页脚链接和社交生物页逻辑。
4. 修复全局 `<main>` 与页面内嵌套 `<main>`，保证每页一个主要 landmark。
5. 修复移动菜单打开后因滚动监听自动关闭的竞态；增加滚动位置回归测试。
6. 页脚只保留必要身份、案例、相关文章和联系入口。

验收：键盘、Escape、焦点、滚动锁、移动菜单和锚点导航通过组件与浏览器测试。

### Task 4.2：实现旧路由重定向

文件：

- `next.config.ts`
- `proxy.ts`
- `tests/proxy.test.ts`
- 新增 `tests/redirects.test.ts`

步骤：

1. `/links` 永久重定向到 `/contact`。
2. 社交 UTM 首页访问改为进入 `/contact` 或保留首页并携带来源；默认选择 `/contact`，同时保留 UTM 参数。
3. 对即将删除的页面建立明确 301/308 或 410 策略：有替代内容则重定向，无替代内容则返回规范 404/410。
4. 不把 `/admin` 认证逻辑与公共重定向混在一起重写。

验收：UTM 不丢失，重定向无循环，admin gate 不回归。

## 阶段 5：首页体验实现

### Task 5.1：实现企业首页组件边界

新增文件：

- `components/home/EnterpriseHero.tsx`
- `components/home/WorkflowTheatre.tsx`
- `components/home/WorkflowPatterns.tsx`
- `components/home/ProjectEvidenceGallery.tsx`
- `components/home/DeliveryMethod.tsx`
- `components/home/DiagnosisCta.tsx`
- `components/home/index.ts`
- 对应 `tests/components/home/*.test.tsx`

修改文件：

- `app/page.tsx`
- `app/globals.css`
- `tailwind.config.js`
- `config/theme.json`
- `config/visualTokens.ts`
- `DESIGN.md`

步骤：

1. 先写首页区块顺序、CTA、服务端文字 fallback 和 locale 测试。
2. 将配色收敛为暖象牙、石墨、焦糖琥珀和派生暖灰；删除首页随机项目色。
3. Hero 实现问题识别控件，但控件只改变示例状态，不收集表单数据。
4. WorkflowTheatre 复用现有 motion policy，提供三个章节、键盘控制、reduced-motion 静态状态和服务端等价文字。
5. ProjectEvidenceGallery 只读取已发布案例，展示真实 artifact 和三类公开事实。
6. 删除首页旧 Hero、ContributionGraph、SystemDemoConsole、About 重复段、Education、Certifications、ContentMedia 等挂载。
7. 组件无调用后再删除旧实现及测试，不保留两套首页。

验收：首屏在桌面与移动端清楚说明问题、方法和 CTA；无 JS 时仍有完整文字。

### Task 5.2：视觉与交互回归

文件：

- 首页组件与视觉测试
- `docs/superpowers/specs/assets/enterprise-ai-readable-homepage-target.png`

步骤：

1. 使用相同桌面与 390px 视口截图，与目标图并排检查层级、色彩、间距和交互状态。
2. 不追求复制目标图中的占位文案、项目数据或假界面。
3. 检查所有 CTA、章节切换、案例切换、焦点状态和 reduced-motion。
4. 记录并修复可见差异，直到不存在破版、色彩漂移和交互死区。

验收：视觉语言统一，案例区域不出现蓝/绿/紫等未授权装饰色。

## 阶段 6：联系与诊断申请

### Task 6.1：建立联系领域模型与 API

新增文件：

- `lib/contact/schema.ts`
- `lib/contact/delivery.ts`
- `lib/contact/rate-limit.ts`
- `app/api/contact/route.ts`
- `tests/api/contact.test.ts`
- `tests/lib/contact.test.ts`

修改文件：

- `.env.example`
- `scripts/validate-env.js`
- `wrangler.jsonc`
- Cloudflare 环境类型声明

步骤：

1. 用 Zod 定义必填/可选字段、长度、联系方式二选一和授权确认。
2. 加入 honeypot、请求体限制和基于 Cloudflare KV 的速率限制；本地测试提供内存 adapter，不把内存限流冒充生产限流。
3. 使用 Resend 作为主投递，Discord/Telegram 仅作为显式配置的通知 adapter；任何目标未配置时返回可运维错误，不静默丢失。
4. 日志不记录表单正文和完整联系方式。
5. 覆盖成功、校验失败、honeypot、限流、投递失败和重试安全测试。

验收：重复提交不会造成通知风暴；失败时用户能重试且运营端有可诊断日志。

### Task 6.2：实现 `/contact` 渐进式表单

新增文件：

- `app/contact/page.tsx`
- `components/contact/WorkflowDiagnosisForm.tsx`
- `components/contact/ContactMethodField.tsx`
- 对应组件测试

步骤：

1. 首屏只突出流程描述、联系方式和隐私授权；可选问题渐进展开。
2. 提供字段级错误、提交中、成功、失败与重试状态。
3. 成功文案只承诺人工筛选，不承诺固定时限或必然会议。
4. 增加 Umami 事件：CTA、开始填写、提交成功/失败；不发送表单正文。
5. 提供键盘、屏幕阅读器和移动端输入体验。

验收：首页 -> contact -> 提交 -> 成功/失败路径在浏览器中完成。

## 阶段 7：案例索引与详情重构

### Task 7.1：重建案例索引

文件：

- `app/projects/page.tsx`
- `components/cases/CasesPageClient.tsx`
- `components/cases/CasesBrowser.tsx`
- `components/cases/ProjectEvidenceGallery.tsx`（如与首页共享则放入公共边界）
- 对应案例组件测试

步骤：

1. 页面只读取 `published` 案例。
2. 默认按“证明的流程能力”组织，不按技术栈或行业锁定服务。
3. 每条展示项目状态、流程断点、交付系统、可迁移能力和公开限制。
4. 删除从 GitHub README 运行时抓取并直接渲染为案例的路径。

验收：索引与 `/ai/projects.json` 的案例集合完全一致。

### Task 7.2：重建案例详情

文件：

- `app/projects/[id]/page.tsx`
- `components/cases/CaseFilmStage.tsx`
- `components/cases/ArtifactPreviewPanel.tsx`
- `components/cases/HyperFramePreview.tsx`
- 对应页面与组件测试

步骤：

1. 使用固定语义结构：目的、原流程、边界、输入、处理、人工审核、输出、恢复、状态、迁移能力、证据、限制。
2. 删除直接渲染 `readmeHtmlFull` 的主内容路径；README 只能作为审核输入或公开附录。
3. 动画与 artifact 使用已审核事实，提供静态图和服务端文字 fallback。
4. 每个详情页提供联系 CTA，但不把垂直场景写成固定服务。

验收：HTML、JSON 路由和 JSON-LD 的事实一致；禁用 JS 后内容完整。

## 阶段 8：删除旧个人站表面

### Task 8.1：删除无关公共路由与调用方

候选删除：

- `app/photography/`
- `app/content/`
- `app/resume/route.ts`
- `app/page/[slug]/`
- `app/links/`
- 摄影公共组件、内容聚合组件、教育/证书/贡献图组件及其仅有测试
- 对应配置、复制文本和 AI route kind

步骤：

1. 对每个候选先运行 CodeGraph callers/impact 与 `rg`。
2. 删除路由、导航、sitemap、llms、Feed 和 JSON-LD 引用。
3. 删除无调用组件、配置与测试。
4. `private-photos/`、原始照片和用户数据默认保留；若用户以后要求清理，再进行独立备份与删除审核。
5. 检查 admin photography/API/photo auth 是否已无用途；删除代码前保留用户资产。

验收：构建不再生成已退休路由，sitemap/llms 不含死链接，仓库无孤儿导入。

### Task 8.2：审查文章并收窄内容出口

文件：

- `content/`
- `config/articles.json`
- `app/articles/`
- `lib/mdx/`
- Feed 路由与测试

步骤：

1. 建立“原创、AI/Agent/自动化/企业流程相关、适合公开”的 allowlist。
2. 只有 allowlist 内容进入 `/articles`、Feed、sitemap 和 `llms.txt`。
3. 不相关内容归档或删除必须逐篇确认，避免误删原创资料。
4. 导航将“文章”降为次级入口，首页不展示泛内容流。

验收：AI 输出不会把教程搬运或无关内容当作核心专业能力。

## 阶段 9：安全、性能与可访问性收口

### Task 9.1：安全头与内容安全策略

文件：

- `next.config.ts`
- `app/layout.tsx`
- `tests/security-headers.test.ts`

步骤：

1. 为当前脚本、字体、图片、iframe 和分析域生成最小 CSP。
2. 生产启用 HSTS、`frame-ancestors`/等价嵌入限制和现有基础头。
3. 删除不再需要的预连接与第三方域。
4. 确保 JSON-LD 和主题脚本不迫使 CSP 使用过宽 `unsafe-inline`；必要时使用 nonce/hash 方案。

验收：安全头测试和生产预览通过，联系表单与分析仍可用。

### Task 9.2：性能与可访问性

文件：

- 首页、案例、联系相关组件
- motion policy
- 图片与动画资源

步骤：

1. 限制首屏 JS 和 iframe；案例动画延迟加载，静态 fallback 优先。
2. reduced-motion 下禁用自动播放和进度动画。
3. 修复对比度、焦点、目标尺寸、阅读顺序、aria-live 和表单错误关联。
4. 检查 200% 缩放、键盘路径、390px reflow 和无 JS 内容。

验收：核心任务不依赖动画，移动端无滚动陷阱或横向溢出。

## 阶段 10：全量验证、文档与上线

### Task 10.1：自动化验收

命令：

```bash
codegraph sync
npm run projects:evidence:audit
npm run audit:architecture
npm run lint
npm run typecheck
npm test
npm run build
npm audit --omit=dev
```

补充检查：

- 所有机器路由 200、schema 正确、事实一致。
- 已退休路由符合重定向/404/410 设计。
- 公共仓库隐私扫描无命中。
- 构建路由清单不含摄影、内容聚合、简历和自定义页。

### Task 10.2：浏览器验收

桌面与 390px 移动端流程：

1. 首页加载并识别问题。
2. 切换流程结构和案例剧场章节。
3. 打开项目索引与详情。
4. 从首页和项目详情进入 `/contact`。
5. 验证表单校验、成功、失败、限流和重试。
6. 验证键盘、焦点、reduced-motion、无横向溢出和无框架错误。
7. 检查控制台与 4xx/5xx 资源。

### Task 10.3：范围受控的文档同步

文件：

- `DESIGN.md`
- `docs/PROJECT-STATE.md`
- `docs/PROJECTS-DESIGN.md`（若内容仍适用则重写，否则删除）
- `README.md`
- `.env.example`
- 必要的部署说明

步骤：

1. 用最终实现更新架构、路由、环境变量和验收命令。
2. 删除旧 AI Lab、摄影和个人档案叙事，不追加迁移流水账。
3. `PROJECT-STATE.md` 保持短小，只记录当前事实、风险、下一步和命令。

### Task 10.4：提交、推送与线上验证

步骤：

1. 确认 diff 只包含重设计范围，用户原有未跟踪文件保持不变。
2. 按阶段整理提交；运行最终验证后推送分支。
3. 观察 GitHub Actions 与部署结果。
4. 在真实域名验证首页、案例、联系、机器路由、重定向、移动端和控制台。
5. 只有线上证据完成后才更新项目状态为已上线。

## 完成定义

只有同时满足以下条件才算完成：

- 工程门禁可信，类型检查和安全依赖通过。
- 所有公开案例来自审核后的源文档事实。
- 私有项目没有泄露源链接、原文、客户身份或内部路径。
- 人类页面与 AI 机器输出由同一内容模型生成。
- 首页、案例和联系形成完整业务转化路径。
- 无关个人站页面已从代码、路由和机器输出中退出，同时用户原始资产得到保留。
- 自动化测试、浏览器 QA、CI、部署和真实域名验证均完成。
