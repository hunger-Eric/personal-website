# AI 推荐竞争对手却不推荐本企业：中英文文章设计

## 目标

为实解智能官网新增一组中英文企业文章，从企业负责人真实会遇到的问题出发：向 AI 询问供应商时，回答列出了竞争对手，却没有自己的企业。

文章需要帮助读者理解这种差异可能来自哪些公开证据，并给出可执行的检查顺序。Open GEO 作为对比审计和持续复查工具自然出现，不承诺收录、推荐、排名、曝光、点击或咨询结果。

## 与现有文章的边界

现有文章《官网已经被 Google 收录，为什么 AI 还是不推荐你？》主要区分搜索收录与 AI 推荐，并解释买家问题匹配、主体清晰度、服务边界和证据完整性。

本组文章不再重复解释“收录不等于推荐”。它从同一个买家问题中的竞争对手差异入手，重点回答：

1. 如何选取真实买家问题和合理的对比对象。
2. 如何比较 AI 回答中出现与未出现企业的公开材料。
3. 如何判断差距来自官网内容、企业实体关系、可核验服务证据、外部引用还是抓取与发现。
4. 如何把一次对比转成有优先级的整改和复查记录。

## 读者与使用场景

主要读者是已经尝试用 ChatGPT、Perplexity、Google AI 功能或其他 AI 助手寻找同类供应商，并发现竞争对手更常出现的企业负责人、市场负责人和业务负责人。

文章不假设读者掌握 GEO 技术术语。所有判断都从一次具体的供应商问题和可查看的公开页面开始。

## 中文文章设计

建议标题为《为什么 AI 总在推荐竞争对手，却不推荐我的企业？》

中文正文从企业负责人输入一个真实采购问题后看到竞争对手名单的场景切入。正文依次处理以下内容：

1. 固定问题、语言、地区、时间和 AI 产品，避免把不同测试条件混在一起。
2. 记录 AI 实际列出的企业、引用页面和理由，不用品牌名提示 AI。
3. 对照竞争对手和本企业的官网，检查服务对象、具体问题、交付物、验收方式、适用边界和联系路径。
4. 检查品牌名、产品名、域名、项目页和结构化数据表达的主体关系是否一致。
5. 区分企业自己的说法与真实第三方引用，不购买、交换或批量制造外链。
6. 按“影响买家判断的内容缺口、主体冲突、证据缺口、技术发现问题”的顺序整改，并使用同一问题定期复查。

Open GEO 的出现位置放在完成第一次人工对比之后。它用于保存问题、抓取可公开访问的页面、比较证据覆盖并生成可复查记录，不能被描述为能让 AI 必然推荐企业。

## 英文文章设计

建议标题为 “Why Does AI Recommend Your Competitors but Leave Out Your Company?”

英文正文独立创作，不逐句翻译中文文章。它从一个面向国际采购的 buyer prompt audit 展开，侧重以下内容：

1. Establishing a repeatable comparison instead of collecting isolated screenshots.
2. Separating mention frequency from the reasons and citations shown in an answer.
3. Comparing evidence coverage across service fit, buyer constraints, deliverables, acceptance evidence, entity consistency, and independent references.
4. Avoiding false conclusions caused by personalization, region, freshness, or prompt wording.
5. Turning the audit into a short remediation queue and a dated retest.

英文文章使用自然的国际企业采购语境，不照搬中文例句。Open GEO 英文入口作为 evidence-gap audit 的下一步，不宣称跨模型排名或推荐保证。

## 事实与来源边界

正文只使用以下材料：

- 官网已经审核的实解智能、SolveReal Systems 和 Open GEO 公开事实。
- 当前正式页面能够直接验证的产品能力、服务边界和公开入口。
- Google、Microsoft/Bing、OpenAI、Perplexity 等官方发布的抓取、搜索或发布者说明。
- 能够明确支撑某项判断的可靠公开研究或文档。

不得虚构客户经历、竞争对手缺陷、测试结果、用户原话、行业排名、AI 推荐率、流量或转化数据。示范用的采购问题必须明确写成方法示例，不能伪装成真实客户案例。

## 发布形态

- 中英文各一篇 MDX，使用同一语义主题和共享 slug。
- 建议 slug 为 `why-ai-recommends-competitors-not-your-company`。
- 两篇分别进入现有中文和英文文章列表、详情、sitemap、Feed、`llms.txt`、canonical 与 hreflang 链路。
- 中文主 CTA 指向 `https://geo.itheheda.online/zh`，英文主 CTA 指向 `https://geo.itheheda.online/en`。
- 不修改既有 SEO、Feed、路由或发布基础设施，除非测试发现与本组文章直接相关的缺口，并另行说明。

## 验收标准

1. 两篇文章从同一真实用户问题出发，但结构、例子和表达均为独立创作。
2. 不与上一篇“已收录但不被推荐”文章重复争论同一个结论。
3. 每项事实和产品能力都有已审核配置、正式页面或可靠来源支撑。
4. 正文不虚构客户、竞争对手表现或 Open GEO 成效。
5. 文章列表、详情、语言切换、CTA、sitemap、Feed、`llms.txt`、canonical、hreflang 和 Article JSON-LD 均由测试覆盖。
6. 桌面与移动视口正文可读，无页面级横向溢出或控制台错误。
7. 代码完成、发布、搜索收录、AI 提及、曝光、点击和咨询分别记录，不互相替代。

## 权限与停止条件

本设计获批后只允许进入正文与测试实施计划。Git commit、push、部署、Search Console、IndexNow 或任何真实外部提交仍需分别取得明确授权。

若研究材料不足以支撑一篇长文、需要引入未经审核的企业事实、发现主题与现有文章大面积重复，或现有发布链路存在与内容无关的问题，应停止实施并报告，不用虚构材料或扩大改动范围补齐。
