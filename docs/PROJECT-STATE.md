# 实解智能官网当前状态

更新：2026-08-23
分支：`main`

## 当前产品

官网已统一为“实解智能”品牌，服务于企业 AI 系统设计与交付。公开页面使用同一套经审核的身份、方法与项目事实；后台只保留文章工作台和 AI 爬虫检测。

## 设计权威

- `DESIGN.md`：唯一品牌与视觉设计合同
- `config/public-identity.ts`：品牌身份
- `config/service-method.ts`：服务方法
- `config/public-project-cases.json`：公开项目事实
- `config/public-content.ts`：共享内容解析

## 2026-08-23 全项目审计

已删除 DevfolioX 模板、旧个人作品集组件、摄影系统、主题切换与色板、旧配置编辑后台、历史 Docker 内容副本、旧演示资产和已完成的阶段性设计方案。根布局固定为暖纸色系统，本地 Docker 不再覆盖当前配置。

保留的历史资料仅限仍有运行价值的文章工作台、爬虫检测设计/实施文档，以及安全审计记录。它们不构成视觉设计权威。

## 验收状态

- `npm run audit:architecture`：通过；扫描 211 个文件，AI-readable 三项合同通过。
- `npm run projects:evidence:audit`：通过；3 个公开案例、231 个公开字符串。
- `npm run lint`：通过，0 error / 0 warning。
- `npm run typecheck`：通过。
- `npm test`：72 个测试文件、621 个测试通过。
- `npm run build`：Next.js 16.3.2 构建通过，生成 36 个静态页面任务。
- `npm audit` 与 `npm audit --omit=dev`：0 个已知漏洞。
- 本地生产构建在 1440×900 与 390×844 下通过首页、项目页视觉检查；移动导航、联系主路径与二维码弹窗可用。
- 退役路径：`/admin/site`、`/api/admin/save`、`/api/og`、`/download` 返回 404；`/photography` 保留到首页的 308 兼容跳转。

## 常用验证

```bash
npm run audit:architecture
npm run projects:evidence:audit
npm run lint
npm run typecheck
npm test
npm run build
```
