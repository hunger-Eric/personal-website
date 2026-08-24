# 双语品牌与可索引英文站实施计划

日期：2026-08-24
依据：`docs/superpowers/specs/2026-08-24-bilingual-brand-and-seo-design.md`

## 实施约束

- 保留现有中文公开网址；英文只增加 `/en` 前缀。
- 不生成或自动翻译英文文章正文。
- 不改变后台、联系接口、爬虫检测、部署配置或现有公开项目事实。
- 网址是语言权威；不能再由 `localStorage` 在同一网址切换公开页面语言。
- 不执行 Git 提交、推送或部署。

## 任务 1：建立可测试的语言与网址合同

改动：

- 扩展 `config/locale.ts`，集中定义 locale、HTML language、URL 前缀、品牌名称和路径转换辅助函数。
- 扩展 `config/public-identity.ts`，将中文与英文公开品牌名纳入同一配置。
- 先补充路径转换、品牌选择和 metadata 的单元测试。

完成证据：测试证明普通页面双向映射，中文文章无英文版本时回到 `/en/articles`，品牌名按 locale 选择。

## 任务 2：把页面首屏语言绑定到服务端路由

改动：

- 使用 Next.js 多 root layout：中文公开页面、英文公开页面和后台分别拥有明确 `<html lang>`。
- 抽出共享站点文档壳，避免复制字体、分析脚本、导航和页脚。
- 中文页面移入不改变 URL 的 route group；新增 `/en` 英文 route group。
- `LocaleProvider` 接受必需的服务端初始 locale，不再从存储恢复并覆盖公开 URL。

完成证据：构建产物与原始 HTML 中，中文为 `zh-CN`，英文为 `en`。

## 任务 3：把全局导航改成 locale-aware URL

改动：

- `LangSwitch` 改为真实链接。
- 桌面导航、移动导航、页脚、页面内返回链接与 CTA 使用当前 locale 的路径。
- 英文页面显示 `SolveReal Systems`，中文页面显示“实解智能”。
- 未翻译中文文章切换英文时进入 `/en/articles`。

完成证据：组件测试和浏览器验证中英文导航不会回到错误语言。

## 任务 4：新增英文核心页面

改动：

- 为首页、服务、项目列表、项目详情、文章索引、关于和联系页建立 `/en` 服务端入口。
- 复用现有已审核的本地化配置和组件，向 `LocaleProvider` 提供 `en`。
- 英文文章索引为空时显示明确的“暂无审核英文译文”状态，不展示中文文章。
- 不创建 `/en/articles/[slug]`，直到仓库出现符合英文发布合同的正文来源。

完成证据：所有英文核心路径可以直接访问和刷新，页面主要可见内容为英文。

## 任务 5：实现双语 SEO 与同一品牌结构化数据

改动：

- `buildPublicPageMetadata` 接收 locale 与是否存在语言对应页，生成对应 canonical、`hreflang`、Open Graph locale 和 locale 品牌名。
- 结构化数据生成器接收 locale；Organization 使用稳定 `@id`，中英文 `name` / `alternateName` 互换。
- 项目与文章结构化数据使用当前语言 URL 和内容。
- sitemap 同时输出中英文核心页与项目页，只输出中文文章；为真实双语页面添加 alternates。

完成证据：metadata、structured-data、sitemap 测试覆盖两种语言和单语文章边界。

## 任务 6：同步设计权威与项目状态

改动：

- 更新 `DESIGN.md` 的双语品牌、公开路径和语言行为。
- 功能通过验收后更新 `docs/PROJECT-STATE.md` 当前状态和验证摘要。

完成证据：权威文档不再声明“无独立英文品牌名”，且不将未部署功能写成线上事实。

## 任务 7：验证

按顺序执行：

1. 定向 Vitest。
2. `npm run audit:architecture`。
3. `npm run projects:evidence:audit`。
4. `npm run lint`。
5. `npm run typecheck`。
6. `npm test`。
7. `npm run build`。
8. `codegraph sync` 后检查状态。
9. 启动本地生产构建，检查中文/英文原始 HTML、canonical、`hreflang` 和 JSON-LD。
10. 在 1440×900 与 390×844 下检查首页、核心内页、语言切换和页面级横向溢出。

停止条件：多 root layout 与现有后台或 Cloudflare 构建合同冲突且无法在最小改动面内解决；英文现有内容缺失导致必须发明事实；测试显示需要迁移中文 URL。
