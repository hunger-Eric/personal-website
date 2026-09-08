# SEO and GEO Bilingual Article Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish and verify a Chinese and English article explaining why a website with SEO still needs GEO.

**Architecture:** Add one reviewed MDX source per locale under the existing article loaders, register the shared slug in the locale-switch allowlist, and update the explicit AI-readable route inventory. A dedicated content contract test binds titles, sources, CTA routes, limitations, locale mapping, and content hashes.

**Tech Stack:** Next.js 16 content routes, MDX, TypeScript, Vitest, Vercel Git deployment

## Global Constraints

- Use slug `why-geo-after-seo` and publication date `2026-09-08` in both locales.
- Keep SEO and GEO complementary and do not promise indexing, citations, rankings, traffic, or conversions.
- Use primary sources from Google Search Central, OpenAI crawler documentation, and the KDD 2024 GEO paper.
- Use only reviewed first-party facts for SolveReal Systems and Open GEO Console.
- Preserve all unrelated tracked and untracked work and stage only named article files.

---

### Task 1: Lock the bilingual content contract

**Files:**
- Create: `tests/seo-geo-bilingual-article.test.ts`
- Modify: `tests/ai-readable-routes.test.ts`

**Interfaces:**
- Consumes: `getArticleBySlug(slug, locale)` and `reviewedBilingualArticleSlugs`
- Produces: failing assertions for both articles, their locale mapping, primary sources, CTA paths, limitations, and canonical hashes

- [ ] **Step 1: Write the failing article test**

Create a Vitest test that loads `why-geo-after-seo` in `zh` and `en`, asserts the approved titles and date, checks the Google, OpenAI, and arXiv URLs, checks localized Open GEO, services, project, and contact links, checks the no-guarantee wording, and recalculates `contentHash` after removing its frontmatter line.

- [ ] **Step 2: Add the expected AI-readable routes**

Insert these paths into the existing exact article route array in publication order.

```ts
"/articles/why-geo-after-seo",
"/en/articles/why-geo-after-seo",
```

- [ ] **Step 3: Run the tests and confirm RED**

Run `npm.cmd exec vitest run tests/seo-geo-bilingual-article.test.ts tests/ai-readable-routes.test.ts`.
Expected result: failure because the two MDX sources and locale registration do not exist.

### Task 2: Publish the article sources and locale mapping

**Files:**
- Create: `content/articles/2026-09-08-why-geo-after-seo.mdx`
- Create: `content/articles-en/2026-09-08-why-geo-after-seo.mdx`
- Modify: `config/locale.ts`

**Interfaces:**
- Consumes: the existing frontmatter and MDX conventions
- Produces: `/articles/why-geo-after-seo`, `/en/articles/why-geo-after-seo`, and locale switching between them

- [ ] **Step 1: Write the Chinese article**

Use these sections in a natural article flow.

```text
## 直接答案
## SEO 已经打好的地基
## GEO 补上的是答案里的可见性
## 一个页面会在哪几步掉下去
## 哪些网站已经该做 GEO 检查
## 从一组真实问题开始
## 适用边界
## 实施步骤
## 验收清单
## 参考来源
## 下一步
```

- [ ] **Step 2: Write the English article independently**

Use equivalent English sections and preserve the same evidence and conversion boundaries without sentence-by-sentence translation.

- [ ] **Step 3: Register the slug**

Add `"why-geo-after-seo"` to `reviewedBilingualArticleSlugs` in `config/locale.ts`.

- [ ] **Step 4: Calculate canonical hashes**

For each MDX file, remove the `contentHash` line, normalize CRLF to LF, calculate SHA-256 over the remaining UTF-8 content, and write `contentHash: "sha256:<digest>"` back into frontmatter.

- [ ] **Step 5: Run the focused tests and confirm GREEN**

Run `npm.cmd exec vitest run tests/seo-geo-bilingual-article.test.ts tests/ai-readable-routes.test.ts tests/article-geo-content.test.ts`.
Expected result: all selected test files pass.

### Task 3: Review, verify, publish, and inspect production

**Files:**
- Review only the two MDX files, locale mapping, two test files, plan, and approved design named above.

**Interfaces:**
- Consumes: committed repository state and the existing Vercel Git integration
- Produces: one scoped implementation commit and production evidence for both localized routes

- [ ] **Step 1: Apply the human-writing revision pass**

Check both articles for unsupported claims, repeated conclusions, generic marketing copy, hard translation, prohibited rhetorical reversals, colons, and em dashes. Recalculate hashes after every content edit.

- [ ] **Step 2: Run repository validation**

Run the focused tests, `npm.cmd run lint -- <changed files>`, `npm.cmd run typecheck`, `npm.cmd run build`, `npm.cmd run audit:architecture`, and `git diff --check`.
Expected result: changed-file checks pass; any full-suite baseline failure must match the already documented unrelated failures.

- [ ] **Step 3: Commit and push exact paths**

Stage only the two MDX files, `config/locale.ts`, the dedicated article test, the AI-readable route test, this plan, and the approved design. Commit with `feat: publish bilingual SEO and GEO guide`, then push `main` without force.

- [ ] **Step 4: Verify the Vercel production deployment**

Wait for the deployment bound to the exact implementation SHA. Check both production URLs over HTTP and in desktop and mobile browsers, including title, localized CTA links, horizontal overflow, and console errors.

- [ ] **Step 5: Report the publication boundary**

Report the commit, deployment, production URLs, checks, and any remaining limitation. State that publication does not prove search indexing or AI citation.
