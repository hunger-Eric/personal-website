# Open GEO Console 中英文内容集群设计

日期：2026-08-29
状态：已由用户确认内容方向、发布结构、文章提纲与事实边界；待书面审核后进入实施计划

## 目标

为实解智能官网补充第一组经过审核的英文文章详情，同时增加一篇与 Open GEO Console 直接相关的中文高意图内容。两篇文章围绕同一个 GEO 可见性诊断主题独立创作，共享已审核事实和产品入口，不做逐句翻译。

本轮希望取得的用户可观察结果如下。

- `/articles/ai-search-visibility-audit-geo` 提供中文 GEO 诊断文章。
- `/en/articles/ai-search-visibility-audit-geo` 提供独立撰写的英文 GEO audit 文章。
- 中文和英文文章列表均能发现对应内容。
- 两个详情页输出正确的页面语言、canonical、hreflang 和 Article JSON-LD。
- sitemap、`llms.txt` 和 Feed 能发现审核后的对应语言正文。
- 两篇文章的主要行动入口分别指向 Open GEO Console 中文站和英文站。

## 非目标

- 不批量翻译现有九篇中文文章。
- 不自动生成未经审核的英文详情页。
- 不修改官网视觉系统或重新设计文章阅读页。
- 不重做现有 robots、sitemap、canonical、JSON-LD、`llms.txt` 或 Feed 基础设施，只扩展其既有文章数据源。
- 不编造客户身份、客户结果、排名、引用次数、流量、转化、节省比例或产品能力。
- 不承诺任何搜索引擎或 AI 产品一定收录、引用、推荐或带来咨询。
- 本设计不包含 Git 提交、push、部署、索引申请或真实发布授权。

## 受众与内容定位

### 中文文章

暂定标题为《为什么 AI 搜索看不到你的官网？从可抓取性、买家问题到引用缺口做一次 GEO 诊断》。

目标读者是企业负责人、网站负责人和市场负责人。文章从“官网能够正常打开，但 AI 搜索仍然看不到、误解或不引用”这一实际问题出发，帮助读者区分可访问、被发现、被索引、被理解和被引用，并将诊断结果整理成可执行整改项。

### 英文文章

暂定标题为 “Why AI Search Cannot See Your Website: A Practical GEO Visibility Audit”。

目标读者是 website owners、marketing leaders 和 product teams。文章聚焦如何执行一次有边界的 AI search visibility audit，怎样选择商业价值较高的页面，怎样核对 buyer-question coverage 与 citation readiness，以及怎样把发现转成有负责人和验证证据的 remediation backlog。

### 两种语言的关系

两篇文章使用同一 slug，表示它们是同一主题的语言对应页。它们共享产品事实、诊断框架和主行动入口，但开头、例子、问题表达、段落推进和措辞分别创作。英文稿不得由中文稿逐句翻译，也不得自动从中文正文派生。

## 选题方案与选择理由

本轮比较了三种内容角度。

1. 官网 AI 搜索可见性诊断。它与 Open GEO Console 的公开能力和目标用户问题直接匹配，既能提供独立阅读价值，也能自然引导读者使用产品。
2. GEO 工具选择指南。它可能承接采购意图，但需要研究和比较第三方产品，容易变成证据不足的工具榜单。
3. Open GEO Console 构建故事。它能加强技术品牌，但更偏开发者读者，企业买家的诊断和整改意图较弱。

本轮选择第一种。文章首先解决读者问题，产品作为诊断入口出现，不把正文写成产品广告。

## 已审核事实来源

正文中的 Open GEO Console 事实只来自当前项目权威或重新核验后的官方公开页面。

- `config/website-projects.ts` 中 Open GEO Console 的中英文名称、类别、状态、摘要、问题、方案和买家价值。
- `DESIGN.md` 中的品牌定位、表达原则、内容合同和公开边界。
- `config/public-identity.ts`、`config/service-method.ts` 与 `config/public-content.ts` 中的品牌、服务方法、数据边界和联系边界。
- Open GEO Console 对应语言的正式公开页面，写作时只核对当前可见、可验证的产品事实。
- 与抓取、索引和 AI 搜索能力相关的技术判断，只使用重新核验的官方一手资料。

允许描述的产品能力包括网站技术基础检查、买家问题、公开答案、引用证据、引用缺口、整改优先级、管理层决策报告与供应商任务包。页面内演示必须明确标注为模拟数据。

若正式写作需要引入新的外部统计、竞品比较、法律合规结论或客户结果，立即停止并重新取得事实与范围批准。

## 中文文章结构

1. 直接回答官网正常访问但仍可能不被 AI 搜索发现或引用的原因。
2. 区分可访问、被发现、被索引、被理解和被引用五个状态，避免把 HTTP 200 或单次模型回答当成最终结果。
3. 检查 robots、sitemap、初始 HTML、canonical、状态码与安全拦截等技术入口。
4. 检查高价值页面是否回答真实买家问题，避免只堆叠品牌宣传和抽象能力描述。
5. 检查组织、产品、服务、作者和联系方式是否一致，重要判断是否具有公开、可追溯的证据。
6. 按商业影响、修复条件和验证方式整理整改优先级，形成管理层报告与供应商任务清单。
7. 说明 GEO 诊断可以发现什么、不能保证什么，以及整改后需要怎样持续复查。
8. 将 Open GEO Console 中文站作为主要行动入口，将实解智能服务和联系页作为次级入口。

## 英文文章结构

1. Explain why a technically healthy website may still be absent from AI-generated answers.
2. Separate crawlability, indexability, semantic clarity, buyer-question coverage, and citation readiness.
3. Prioritize pages with commercial intent instead of treating every public URL as equally important.
4. Check whether key claims, product definitions, organizational identity, and contact information are consistent and supported by accessible evidence.
5. Turn findings into a remediation backlog with an owner, expected evidence, and a verification method.
6. Explain what a GEO visibility audit can establish and what it cannot guarantee.
7. Use the English Open GEO Console experience as the primary CTA, with SolveReal Systems services and contact as secondary paths.

## 文章存储与读取结构

### 内容目录

- 中文文章继续使用 `content/articles/`。
- 新增 `content/articles-en/`，只保存经过人工审核的英文正文。
- 两篇文章使用 slug `ai-search-visibility-audit-geo`。

英文目录不存在或没有审核正文时，英文列表保持空态，相应详情页返回 404。系统不得回退到中文正文，也不得在运行时翻译。

### 读取接口

现有中文文章读取行为保持默认兼容。文章加载层增加明确 locale 参数或等价的语言专用入口，将语言映射到固定目录。调用方不得接受任意用户路径，也不得通过 locale 参数读取目录外文件。

### 页面路由

- 中文详情沿用 `/articles/[slug]`。
- 新增英文详情 `/en/articles/[slug]`。
- `/en/articles` 开始读取审核后的英文目录。
- 英文详情页使用英文标题、摘要、正文、页面语言与结构化数据。

语言切换只在对应语言正文真实存在时导航到同 slug 详情；旧中文文章没有英文正文时，继续进入 `/en/articles`，不创建不存在的英文 URL。

## 搜索与机器可读发现

- 中英文对应详情分别输出自指 canonical。
- 当同一 slug 的两种正文均存在时，输出 `zh-CN`、`en` 和 `x-default` hreflang；缺少对应正文时不声明不存在的 alternate。
- sitemap 同时包含两条公开 URL，并保持语言对应关系。
- `llms.txt` 的文章区域能区分并列出中英文文章，不把英文标题错误挂到中文 URL。
- 中文 Feed 保持现有行为；新增或扩展英文 Feed 时使用明确英文路径和英文元数据，避免把两种语言混入一个标记为 `zh-cn` 的 Feed。
- Article JSON-LD 的 headline、description、inLanguage、url、author 和 datePublished 与页面正文一致。

## 行动入口

中文文章的主要 CTA 指向 `https://geo.itheheda.online/zh`，英文文章的主要 CTA 指向 `https://geo.itheheda.online/en`。CTA 说明读者可以从一次网站诊断开始，不承诺诊断一定带来收录、引用、排名、流量或咨询。

实解智能的服务页、Open GEO Console 项目页和联系页只作为次级内部链接。联系入口继续使用现有人工筛选、无固定响应时间和不自动报价边界。

## 测试与验收

实施遵循先失败测试、再最小实现的顺序。

自动化测试至少覆盖以下行为。

- 中文文章加载行为不回归。
- 英文目录为空时列表为空、详情返回 404。
- 审核英文 MDX 存在时，英文列表和详情能够读取英文正文。
- 中英文同 slug 页面具有正确 canonical、hreflang、`lang` 和 Article JSON-LD。
- 没有英文正文的旧文章语言切换仍进入 `/en/articles`。
- sitemap、`llms.txt` 与对应语言 Feed 包含新文章 URL 和正确标题。
- 非法 locale、路径穿越和格式错误的 frontmatter 无法进入公开内容。
- 两篇正文不包含禁止声明、虚构指标或未审核客户事实。

本地验证包括 `npm run audit:architecture`、`npm run projects:evidence:audit`、`npm run lint`、`npm run typecheck`、完整测试和生产构建。用户可见页面还需在 1440px 桌面与 390px 移动视口下检查中英文列表、详情、语言切换、内部链接、主 CTA、页面溢出和控制台错误。

## 允许改动面

实施阶段仅允许修改以下类别的路径。

- 两篇新 MDX 正文及新的英文文章内容目录。
- 文章加载层与中英文文章列表、详情路由。
- 与文章语言发现直接相关的 sitemap、`llms.txt`、Feed、metadata 和结构化数据。
- 对应的自动化测试。
- 经授权的最小状态文档更新。

现有 `.codegraph/`、`.playwright-cli/`、`output/`、`.codex/`、`.mimocode/` 和其他无关脏文件必须保留原样，不得清理、提交或纳入发布候选。

## 停止条件与权限门

出现以下任一情况时停止实施并请求用户决定。

- 写作所需事实超出已审核配置与官方一手资料。
- 英文稿只能成为中文稿的机械翻译。
- 主题需要竞品结论、外部统计、法律判断、客户结果或私有项目细节才能成立。
- 实现要求修改与文章双语发现无关的架构或视觉系统。
- 现有脏改动与本任务目标文件发生无法安全隔离的冲突。
- 自动化通过但真实中英文页面、语言切换或机器可读入口无法验证。

Git commit、push、部署、Search Console/Bing 操作、IndexNow 通知和公开发布都需要分别取得明确授权。本设计获批只授权编写设计和后续本地实现计划，不自动授予这些外部动作权限。

## 完成定义

本地实施完成需要同时满足以下条件。

- 两篇独立正文符合内容结构和事实边界。
- 英文文章列表与详情能力可用，且不影响旧中文文章。
- 中英文 canonical、hreflang、结构化数据和机器发现入口一致。
- 所有约定自动化检查通过。
- 桌面和移动真实阅读路径通过。
- 明确区分本地代码完成、Git 提交、生产发布、搜索引擎收录、曝光、点击和咨询转化。
