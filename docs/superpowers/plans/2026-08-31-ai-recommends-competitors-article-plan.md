# AI 推荐竞争对手却不推荐本企业：中英文文章实施计划

## 交付范围

- 新增中文文章 `content/articles/2026-08-31-why-ai-recommends-competitors-not-your-company.mdx`。
- 新增英文文章 `content/articles-en/2026-08-31-why-ai-recommends-competitors-not-your-company.mdx`。
- 将共享 slug 加入现有审核双语文章映射。
- 新增一个聚焦测试文件，验证双语文章加载、语言路径、CTA、sitemap、`llms.txt` 与英文 Feed。
- 不修改现有 SEO、Feed、详情页、文章工作台或发布基础设施。
- 不执行 commit、push、部署、Search Console 或 IndexNow。

## 任务一：锁定失败行为

新建 `tests/ai-recommends-competitors-article.test.ts`，使用真实文章加载器和现有公开路由验证以下结果：

1. 中文标题为《为什么 AI 总在推荐竞争对手，却不推荐我的企业？》。
2. 英文标题为 “Why Does AI Recommend Your Competitors but Leave Out Your Company?”。
3. 日期与更新时间为 `2026-08-31`，作者和公开路径与语言一致。
4. 中文正文只含 Open GEO 中文 CTA，英文正文只含英文 CTA，两篇正文不相同。
5. 共享 slug 已进入审核双语文章映射。
6. sitemap 为两条 URL 生成 `zh-CN`、`en`、`x-default` alternates。
7. `llms.txt` 与英文 RSS、JSON Feed 发现对应公开 URL。

先运行 `npm.cmd test -- tests/ai-recommends-competitors-article.test.ts`。预期测试因文章与双语映射尚不存在而失败；失败原因必须与缺少本组文章一致。

## 任务二：研究并记录材料

使用官方一手材料核对会影响正文判断的当前事实，至少覆盖：

- Google 对索引资格、生成式搜索展示和排名系统的公开边界。
- OpenAI 对发布者抓取控制及搜索可见性的公开说明。
- Perplexity 对爬虫和发布者控制的公开说明。
- Bing 或 IndexNow 对更新发现的公开说明，只在正文确实需要时引用。
- 正式实解智能和 Open GEO 页面中的已审核产品事实与语言入口。

内部材料至少形成五个可独立支撑段落的事实节点：可重复的买家问题测试、答案理由与引用记录、服务证据覆盖、企业实体一致性、真实第三方引用、抓取发现边界和日期化复查。缺少可靠材料时缩短正文，不用推演或虚构补篇幅。

## 任务三：完成最小实现

1. 在 `config/locale.ts` 的审核双语文章数组中加入 `why-ai-recommends-competitors-not-your-company`。
2. 独立创作中文正文，从企业负责人看到竞争对手名单的场景进入，给出固定测试条件、记录引用、比较官网、判断差距和安排复查的过程。
3. 独立创作英文正文，从 repeatable buyer-prompt competitor audit 进入，重点说明 evidence coverage、independent references、test controls 和 remediation queue。
4. 两篇均引用少量关键官方来源；不得虚构企业测试结果、客户案例、竞争对手缺陷或 Open GEO 成效。
5. 计算正文最终内容哈希，写入 frontmatter 的 `contentHash`。

完成后重新运行聚焦测试，预期全部通过。

## 任务四：写作审校

初稿完成后读取 `human-writing/references/revision.md`，按现实商业文章边界审校：

- 清除翻案腔、冒号式提示语、破折号、三项以上同构排比、商业黑话与模型惯用路标。
- 每一节必须增加事实、动作、区别或可执行判断，不用同义改写撑篇幅。
- 检查中文和英文不是逐句翻译，且与上一篇“已收录但不被推荐”没有大段重复。
- 运行 `scripts/check_prose.py` 检查中文正文，所有硬禁令清零。

## 任务五：自动化验收

依次运行：

1. `npm.cmd test -- tests/ai-recommends-competitors-article.test.ts`
2. `npm.cmd run audit:architecture`
3. `npm.cmd run projects:evidence:audit`
4. `npm.cmd run lint`
5. `npm.cmd run typecheck`
6. `npm.cmd test`
7. `npm.cmd run build`
8. `git diff --check`
9. `codegraph sync`

若任何失败来自本任务，先修复并重新运行对应检查；若失败来自受保护的既有脏文件或环境，保留证据并停止，不清理或修改无关内容。

## 任务六：本地真实页面验收

使用本地生产构建或已验证的本地运行入口检查：

- 中文和英文文章列表能进入对应详情页。
- 两个详情页的标题、语言、canonical、hreflang 和 Article JSON-LD 正确。
- 语言切换落到同 slug 的另一语言详情页。
- 中文 CTA 指向 Open GEO `/zh`，英文 CTA 指向 `/en`。
- 1440×900 和 390×844 下正文可读，无页面级横向溢出或控制台错误。

## 完成与停止条件

本地完成仅表示文章、发现链路、测试、构建和本地真实页面通过。公开发布、搜索收录、AI 提及、曝光、点击和咨询都不在本轮完成声明内。

正文和本地验收完成后停止，向用户报告文件、来源、测试证据和仍需单独授权的 commit、push、部署及搜索通知步骤。
