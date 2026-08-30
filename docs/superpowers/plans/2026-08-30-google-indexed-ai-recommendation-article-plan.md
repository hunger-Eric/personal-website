# Google 已收录但 AI 不推荐的中英文文章实施计划

日期：2026-08-30
对应设计：`docs/superpowers/specs/2026-08-30-google-indexed-ai-recommendation-article-design.md`
执行边界：只做本地正文、必要测试与验证，不 commit、push、部署、请求搜索收录或发送 IndexNow

## 交付结果

- 新增一篇中文企业文章和一篇独立英文文章。
- 两篇共用 `google-indexed-ai-does-not-recommend-website` slug，并进入现有双语详情、列表、sitemap、Feed、llms.txt、canonical 与 hreflang 链路。
- CTA 分别进入 Open GEO Console `/zh` 与 `/en`。
- 文章明确区分 Google 收录、AI 引用或推荐、曝光、点击与咨询。

## 任务一　核对材料与事实边界

1. 核对现有 GEO 文章，删除会与上一篇重复的发现、抓取、索引通用讲解。
2. 查阅 Google Search Central、OpenAI 和 Perplexity 当前官方资料。
3. 核对 Open GEO 当前公开产品描述、免费检查范围和结果边界。
4. 建立至少五项可追溯材料，只写官方资料或已审核公开事实支持的判断。

完成证据：正文中的外部事实都能回到官方来源；没有虚构客户、竞争对手、算法权重、推荐概率或效果数字。

## 任务二　先写失败测试

1. 新增一个使用真实 MDX 加载器的文章合同测试。
2. 断言中英文文件均存在、元数据正确、内容独立、CTA 与语言路径正确。
3. 断言 sitemap 为两种语言生成互为 alternate 的 URL，英文文章进入英文 Feed。
4. 运行聚焦测试并确认因新文章缺失而失败。

完成证据：红灯失败原因明确指向 `google-indexed-ai-does-not-recommend-website` 尚未实现。

## 任务三　创作中英文正文

1. 中文从 Search Console 已收录但 AI 不推荐的企业负责人问题进入。
2. 英文从海外买家要求 AI 推荐供应商的任务进入，不逐句翻译中文稿。
3. 两篇分别写清问题匹配、实体身份、服务边界、证据与发现路径。
4. 增加有限自查动作、官方来源和 Open GEO CTA。
5. 计算并写入正文 `contentHash`。

完成证据：聚焦测试由红转绿；两篇正文的标题、段落组织和表达顺序明显不同。

## 任务四　文字与事实复核

1. 读取 human-writing 的 revision 规则并逐项修订。
2. 运行 prose 检查脚本，清除中文稿的硬禁用句式与无来源细节。
3. 检查英文稿没有夸大 AI 推荐机制或 Open GEO 产品能力。
4. 重算 `contentHash` 并重新运行聚焦测试。

完成证据：正文检查通过，引用链接有效，未知结果保持未知。

## 任务五　项目级验证

依次运行：

1. `npm.cmd run audit:architecture`
2. `npm.cmd run projects:evidence:audit`
3. `npm.cmd run lint`
4. `npm.cmd run typecheck`
5. `npm.cmd test`
6. `npm.cmd run build`
7. `codegraph sync`
8. `git diff --check`

随后启动本地生产入口，在 1440px 与 390px 检查中英文列表、详情、语言切换、Open GEO CTA、页面溢出和控制台错误。

完成证据：自动化和生产构建通过，真实浏览器路径可用。若发现与本任务无关的既有失败，保留首个失败证据并停止扩大修改面。

## 停止条件

- 官方资料无法支持正文关键判断。
- 需要发明客户结果、竞争对手事实或 AI 内部算法才能继续。
- 现有双语文章基础设施不能自动接入新文章，且修复需要超出最小内容范围。
- 下一步需要 Git、部署、Search Console、IndexNow 或其他外部写入权限。
