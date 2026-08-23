# 实解智能官网架构

更新：2026-08-23

## 运行结构

- `app/`：Next.js App Router。公开页面、API、Feed 与 AI-readable 路由保持轻薄。
- `components/`：只保留当前公开体验、文章工作台、爬虫后台和共享设计组件。
- `components/system/`：公共与后台共用的表面、按钮、状态和排版原语。
- `config/`：品牌身份、服务方法、项目事实、站点联系信息和语言文案。
- `lib/`：内容解析、结构化数据、联系表单、文章工作流、爬虫分析和 GitHub 发布适配器。
- `content/articles/`：当前公开文章。

## 内容数据流

```text
public-identity + service-method + reviewed project cases
                         |
                  public-content resolver
                    /              \
             human pages      AI-readable routes
```

`config/public-project-cases.json` 是公开项目事实入口。组件不得建立另一份案例数据；机器可读输出不得从页面文案反向抓取。

## 公开与后台边界

公开路由：`/`、`/services`、`/projects*`、`/articles*`、`/about`、`/contact`、Feed、sitemap 与 AI-readable 路由。

后台只保留：

- 文章工作台及其生成、运行记录、发布 API
- AI 爬虫检测页面与只读 API
- 登录 API

旧站配置编辑、主题切换、摄影、贡献图、下载跳转与通用链接工具已经移除。后台生产关闭策略由 `lib/admin-guard.ts`、布局和代理共同执行。

## 视觉与资产

`DESIGN.md` 是唯一视觉合同，`app/globals.css` 是运行时 token 来源。站点固定使用暖纸色、石墨与琥珀，不注入主题脚本。公开静态资产只保留当前 favicon、首页 OG 图、两个联系二维码和两个项目动画。

## 文章发布边界

文章生成、研究、预览、GitHub 写入、部署和公网验证是不同阶段。GitHub 发布适配器只接受明确发布动作，并要求完整写入回执；本地测试不会触发真实外部写入。
