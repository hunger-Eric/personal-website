# Active Change Scope

## Direct local Open GEO article automation

Status: APPROVED, LOCALLY VERIFIED AND RELEASE-AUTHORIZED on 2026-08-25; production status requires a deployment receipt and canonical-site verification.

### Objective and baseline

- Replace the mistaken Open GEO external-link/manual-copy flow with one authenticated Personal Website form that directly creates a task in the locally running Open GEO service.
- Automatically poll Open GEO material preflight and article generation, retrieve the completed model-owned output, import it into the Personal Website draft, and expose preview/edit modes on the same generation page plus one explicit publication action.
- Design the workbench as one coherent Open GEO-inspired task surface with complete empty, active, completed and failure states; no Markdown copying is part of the user path, and the reference website defaults to the official `https://me.itheheda.online` origin while remaining editable.
- Baseline repository: `E:\project\personal-website`, branch `main`, full HEAD `ce4004357c916a42b42217deb859861c647cf88a`.
- Preserve all concurrent user-owned crawler, design, environment, script and untracked work.

### Confirmed model and code boundary

- Open GEO Worker alone owns publisher understanding, source research, source judgment, planning, writing and final editorial output through its currently configured model workflow.
- Personal Website code owns authenticated admin input, loopback-only HTTP transport, hard request limits, idempotency, capability-cookie custody, non-secret task persistence, polling, exact output transfer, MDX safety, mechanical publication identity, preview and publication transport.
- No code path may replace an unavailable or failed Open GEO model task with the Personal Website legacy model/search flow, templates, cached prose, keyword rules, fixtures or a public Open GEO link.
- Open GEO output prose, citations, references and allowed Markdown links remain model-owned and are preserved by the import boundary; the Personal Website does not add a second manual source-confirmation step.

### Local-only and zero-payment boundary

- The Open GEO base URL must resolve from `OPEN_GEO_LOCAL_BASE_URL` or default to `http://127.0.0.1:3000`; only exact loopback hosts `127.0.0.1`, `[::1]` and `localhost` are accepted. Credentials, paths, query strings, fragments and redirects fail closed.
- Only the existing free task endpoints may be called: project admission, preflight status, project status and completed output. Checkout, order, payment and public hosted generation routes are forbidden.
- The Personal Website never persists raw Open GEO capability tokens in run artifacts or returns them in JSON; HttpOnly, same-site, run-scoped local cookies carry them between authenticated polling requests.
- This scope authorizes no real Open GEO task/model call during acceptance, no payment, article publication, branch/worktree operation or Open GEO repository modification. The user separately authorized the exact Personal Website article-scope commit, push and Vercel production deployment on 2026-08-25.

### Production and documentation allowlist

- `app/admin/articles/page.tsx`
- `app/admin/articles/preview/[runId]/page.tsx`
- `app/api/admin/articles/import/route.ts`
- `app/api/admin/articles/open-geo/route.ts`
- `app/api/admin/articles/runs/[runId]/open-geo/route.ts`
- `components/admin/ArticleWorkbench.tsx`
- `lib/article-workbench/open-geo-local.ts`
- `lib/article-workbench/article-format.ts`
- `lib/article-workbench/contracts.ts`
- `lib/article-workbench/core.ts`
- `lib/article-workbench/run-store.ts`
- `lib/article-workbench/server.ts`
- `docs/ACTIVE-CHANGE-SCOPE.md`
- `docs/PROJECT-STATE.md`

The existing manual import route may remain for backward compatibility but receives no new production behavior and is not exposed by the UI.

### Test and evidence allowlist

- `tests/admin/article-workbench.test.tsx`
- `tests/admin/article-workbench-page.test.tsx`
- `tests/admin/article-preview-page.test.tsx`
- `tests/api/admin/articles/import.test.ts`
- `tests/api/admin/articles/open-geo.test.ts`
- `tests/api/admin/articles/run-open-geo.test.ts`
- `tests/article-workbench/open-geo-local.test.ts`
- `tests/article-workbench/article-format.test.ts`
- `tests/article-workbench/contracts.test.ts`
- `tests/article-workbench/core.test.ts`
- `tests/article-workbench/run-store.test.ts`
- `tests/api/admin/articles/run.test.ts`
- `output/playwright/article-workbench/`

### Acceptance

1. RED tests prove one form submission creates one loopback Open GEO preflight with a stable idempotency key; no link, legacy generation call, checkout, order or payment request exists.
2. Preflight promotion, task stages and final output automatically advance through authenticated polling and survive page refresh through non-secret run state plus an HttpOnly capability cookie.
3. Completed Open GEO output automatically becomes an editable, previewable Personal Website draft on the same generation page, with prose and Markdown links preserved; it is not automatically published.
4. Missing local service, malformed/redirected responses, missing capability, needs-input, expired and failed tasks stop visibly without task recreation or semantic fallback.
5. Completed and historical source-backed drafts preserve their embedded sources and links without requiring a second source-confirmation checkbox; publication still requires one explicit user click.
6. Focused tests, lint, typecheck, full tests, build, architecture/evidence audits, CodeGraph and `git diff --check` pass.
7. Authenticated local browser checks at 1440x900 and 390x844 verify responsive empty/active/completed UI with no horizontal overflow or console error using route mocks only; no real model task is created.

### Stop conditions

- Stop if completion requires changing Open GEO, sharing its database or hash secret, storing raw capability tokens on disk, using a non-loopback target, weakening admin authentication, calling commerce, or auto-publishing.
- Stop on overlap with user-owned files, a production path outside this allowlist, or evidence that the existing Open GEO free task API cannot support capability-based server polling.

## Parallel executable scope: unified traffic dashboard

Status: APPROVED and LOCALLY VERIFIED on 2026-08-25; not committed or deployed. The user explicitly confirmed this traffic work may proceed in parallel with the article-generation backend work.

### Objective and fixed boundary

- Add a top-level `Personal Website / Open GEO Console` selector to both authenticated human-traffic and machine-traffic pages, preserving `site`, view and time range in the URL.
- Read only two fixed observer endpoints with distinct HMAC secrets. Missing `site` defaults to `personal`; invalid or repeated values fail closed; arbitrary URLs are forbidden.
- Local implementation only: no production secret, live observer request, Cloudflare/Vercel mutation, deployment, publication or Git state change.

### Allowlist

- `.env.example`, `scripts/validate-env.js`, `DESIGN.md`
- `app/admin/(crawler-dashboard)/crawlers/dashboard-page.tsx`, `app/admin/(crawler-dashboard)/crawlers/page.tsx`, `app/admin/(crawler-dashboard)/crawlers/human/page.tsx`, `app/admin/(crawler-dashboard)/crawlers/machines/page.tsx`, `app/api/admin/crawlers/route.ts`
- `components/admin/crawlers/CrawlerDashboard.tsx`, `config/copy/crawler-dashboard.ts`
- `lib/crawler-analytics/types.ts`, `lib/crawler-analytics/worker-schema.ts`, `lib/crawler-analytics/service.ts`
- `tests/api/admin-crawlers.test.ts`, `tests/components/admin/crawlers/CrawlerDashboard.test.tsx`, `tests/crawler-dashboard-page.test.tsx`, `tests/lib/crawler-analytics-service.test.ts`, `tests/lib/crawler-analytics-worker-schema.test.ts`
- `docs/ACTIVE-CHANGE-SCOPE.md`, `docs/PROJECT-STATE.md`

### Achieved evidence

- Five focused files passed 45 tests; the complete suite passed 76 files and 661 tests; touched-file lint, typecheck and production build passed.
- Eight authenticated local browser states passed: two sites by human/machine view at desktop and mobile widths, with correct selection, no horizontal overflow and no console errors.
- Both observer secrets remained absent during browser acceptance, producing the explicit configuration-missing state and zero live observer reads. No external or Git mutation was performed.

## Unified traffic dashboard Production rollout

Status: APPROVED on 2026-08-25, but the cross-repository rollout stopped before all external mutation because the Open GEO traffic-only release candidate cannot be isolated in the current checkout under the approved Git boundary.

- This repository's external target is Vercel project `personal-website` (`prj_eybWuVuRiAOtdFQTAz9rA63LPT41`) and Production alias `https://me.itheheda.online`.
- The only new Production variable is `OPEN_GEO_OBSERVER_READ_SECRET`; its value must equal the new Open GEO Worker's `OBSERVER_READ_SECRET` and must never be printed or persisted in repository evidence.
- The deployable artifact may contain only the unified crawler-dashboard allowlist above, based on `ce4004357c916a42b42217deb859861c647cf88a`. Concurrent article-generation files and behavior must remain absent.
- Current rollback authority is Vercel deployment `dpl_2gJbERBcPgcPcq8BE74aDnTaB2fp`.
- No Git/Vercel/secret mutation may begin until the exact approval phrase in the Open GEO scope is received and the traffic-only archive is proven clean.
