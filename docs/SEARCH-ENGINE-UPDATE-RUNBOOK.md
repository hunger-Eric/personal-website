# 搜索引擎站点更新流程

适用场景：新增或实质更新公开页面、发布中英文文章、修改项目详情。只提交本次实际变化的 canonical URL，不重复推送没有变化的全站页面。

## 独立执行原则

- Google、Bing、百度、搜狗是四个独立步骤，固定顺序为 Google → Bing → 百度 → 搜狗。
- 任一平台失败只在该平台回执中记录 `mode=failed`，不得中断或跳过后续平台。
- 整轮存在部分失败时记录 `indexingStatus=partial-submission-unverified`；已经成功的平台不回滚，也不冒充失败平台成功。
- 失败平台可以稍后用 `--engine` 单独重试，不重复触碰已经成功的平台。
- 搜狗需要人工页面链接提交，因此始终放在最后处理；前面平台失败也不影响生成搜狗待提交清单。

## 固定流程

1. 完成内容审核并发布，等待生产部署为 Ready。
2. 确认变化 URL 返回 `200 text/html`，canonical 正确；生产 `sitemap.xml` 已包含这些 URL，并带真实的 `lastmod`。
3. 先运行统一命令的 dry-run。它会检查正式 Sitemap 和页面响应，不向外部平台写入：

   ```powershell
   npm run search:update -- --url https://me.itheheda.online/articles/example-slug
   ```

4. 检查无误后，使用生产环境中的密钥和双重开关执行真实通知：

   ```powershell
   $env:INDEXNOW_ALLOW_SUBMIT = "true"
   $env:BAIDU_ALLOW_SUBMIT = "true"
   npm run search:update -- --submit --url https://me.itheheda.online/articles/example-slug
   ```

   多个 URL 重复添加 `--url`。密钥只通过环境变量提供，不写入命令、仓库、日志或回执。

   若只有百度失败，稍后只重试百度：

   ```powershell
   npm run search:update -- --submit --engine baidu --url https://me.itheheda.online/articles/example-slug
   ```

   `--engine` 支持 `google`、`bing`、`baidu`、`sogou`，可重复提供；未指定时按固定顺序执行全部平台。

5. 保存命令输出的 JSON 回执，并按以下含义报告：

   - `google.status=ready`：变化 URL 已在 Google 已登记的 Sitemap 中，等待 Google 重抓；不是已收录。
   - `bing.mode=submitted`：IndexNow 已受理通知；不是 Bing 已收录。
   - `baidu.mode=submitted`：百度 API 返回接受数量和剩余额度；不是百度已收录。
   - `mode=failed`：只代表该平台本轮失败，其他平台仍会继续；保留错误回执后可单独重试。
   - `sogou.status=pending`：把回执中的 URL 粘贴到搜狗资源平台的页面链接提交入口。当前账号入口不支持 Sitemap 文件，也没有可用于本流程的公开 URL 提交 API。
   - `indexingStatus=submitted-unverified`：整轮只能证明发现/通知/提交状态，不能代替平台索引状态、曝光或点击。

## 四个平台各自的职责

| 平台 | 每次站点更新怎么处理 | 自动化边界 |
| --- | --- | --- |
| Google Search Console | Sitemap 已登记后，生产 Sitemap 和准确 `lastmod` 自动传递变化；仅对极少数最高优先级页面使用 URL Inspection | 普通文章不使用 Google Indexing API；该 API 只允许招聘和直播页面 |
| Bing Webmaster Tools | 对本次变化 URL 发送 IndexNow；Sitemap 持续提供全站发现 | 可自动通知，HTTP 成功不等于收录 |
| 百度搜索资源平台 | 使用“普通收录”的 API token 推送本次变化 URL；Sitemap 作为覆盖补充 | 需要私密 `BAIDU_PUSH_TOKEN` 和独立提交开关 |
| 搜狗资源平台 | 生产 Sitemap 保持最新；当前页面提交入口逐条/批量粘贴本次变化 URL | 当前无公开 API，本步骤保留人工回执 |

## 密钥与首次启用

- `INDEXNOW_KEY`：既有生产配置，公开验证文件为 `/indexnow-key.txt`。
- `BAIDU_SITE`、`BAIDU_PUSH_TOKEN`：从百度搜索资源平台“普通收录 → API提交”显示的接口中原样取得站点标识和 token；token 是秘密，不能提交到 Git。
- `INDEXNOW_ALLOW_SUBMIT`、`BAIDU_ALLOW_SUBMIT` 默认必须为 `false`。只有一次明确的真实提交运行才临时设为 `true`。
- Google 和搜狗不新增虚假的 API 密钥。Google 依赖已登记 Sitemap；搜狗使用平台允许的页面链接提交。

## 日常文章发布清单

若只发布一篇中文文章，通常提交文章详情 URL，同时确认 `/articles`、Feed、`llms.txt` 与 Sitemap 已自动更新。若同一 slug 同时发布中英文全文，则把中文和英文详情 URL 都传给统一命令。只有列表页正文或元数据发生实质变化时，才把 `/articles`、`/en/articles` 作为变化 URL 一并提交。
