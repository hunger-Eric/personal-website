# Website Article Workbench Implementation Plan

> 历史实施记录：仅用于追溯该子系统的设计与验收背景，不是当前品牌或视觉权威；当前实现以代码、`DESIGN.md`、`docs/architecture.md` 和 `docs/PROJECT-STATE.md` 为准。

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` (only when the user explicitly authorizes subagents) or `executing-plans` to implement this plan task-by-task. Track progress with the checkboxes below.

**Goal:** Add a local-only article workbench that turns reviewed business facts and public evidence into source-backed website articles, supports human editing and exact preview, and publishes once to the existing website after an explicit user action.

**Architecture:** Keep the management experience inside the existing Admin Workbench, while placing the reusable workflow in an independent `lib/article-workbench` core. Code owns identities, source bindings, validation, persistence, permissions, publication state, and verification; the external model owns research-query proposals and source-bound prose; the user owns business truth and the final publication decision.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5, Zod 3, Vitest 4, MDX, AnySearch JSON-RPC, a replaceable model-provider port with an OpenAI-compatible first adapter, and the existing GitHub Contents API integration.

**Design source:** `docs/superpowers/specs/2026-08-09-website-article-workbench-design.md`

## Global constraints

- Work only in `E:\project\personal-website`; before implementation, re-read the current branch, full HEAD, remotes, worktrees, and dirty status.
- Preserve all unrelated dirty files. `.gitignore` is already modified by the user; append only the one required generated-output rule.
- Run `codegraph status` before exploration, use CodeGraph queries when useful, and run `codegraph sync` after source changes.
- The Admin Workbench remains local-only. Every article API must return 404 when `isAdminEnabled()` is false; production must fail closed.
- Version 1 handles exactly one article per run. It has no draft inbox, scheduling, bulk generation, automatic retry, automatic publication, or legacy-article deletion.
- The user owns business truth. Never invent customers, metrics, outcomes, testimonials, experience, partnerships, or capabilities.
- Search snippets are discovery data only. Every accepted source must be extracted as a full page before it can support the article.
- Do not add heuristic or model fallbacks. Code owns run IDs, source IDs, canonical URLs, content hashes, schemas, state transitions, permissions, and publication verification.
- The workflow depends only on `ModelPort`; provider name, model ID, base URL, authentication, and structured-output capability come from validated server-side configuration.
- The first adapter targets `ARTICLE_MODEL_BASE_URL/chat/completions`. Its initial route is OpenCode Zen Go with model `deepseek-v4-flash`, base URL `https://opencode.ai/zen/go/v1`, and `prompt_only` structured output. These are configuration values, not core-code dependencies.
- The adapter performs zero automatic retries and validates one returned JSON object with Zod. A future provider with a different protocol implements `ModelPort` without changing the workflow core.
- Secrets remain server-only and must never be returned by APIs, written to run artifacts, or included in error messages.
- The UI has one explicit `上传并发布` action. The GitHub write moves the run to `publish_submitted`; only a matching public canonical URL moves it to `published`.
- The article module must not call the Vercel deployment API. It relies on the repository's already configured deployment path and verifies the public content hash afterward.
- Any real model call, AnySearch call, GitHub write, deployment action, or public publication is a separate authorization and acceptance gate.
- Do not retire the legacy Hello Agents article in this plan. Evaluate that only after at least one replacement article is publicly verified.
- Add no package dependency unless the implementation proves the current stack cannot meet a required contract.
- Do not commit, push, deploy, or publish unless the user explicitly authorizes that action.

## Required pre-implementation decision record

Before Task 1 changes source code, record these current values in the task commentary:

1. Repository cwd, branch, full HEAD, remote URL, worktree list, and dirty paths.
2. Record the initial model route as provider `opencode_zen`, model `deepseek-v4-flash`, base URL `https://opencode.ai/zen/go/v1`, protocol `openai_compatible`, and structured-output mode `prompt_only`. Confirm these remain configuration values behind `ModelPort`.
3. GitHub publication target: owner, repository, branch, and the deployment behavior already bound to that branch.
4. Canonical `SITE_URL` and evidence that its current deployment path is healthy.
5. Confirmation that real external calls and publication remain unauthorized until Task 12 obtains separate approval.

## Target file map

New core and configuration files:

- `lib/article-workbench/contracts.ts`
- `lib/article-workbench/business-profile.ts`
- `lib/article-workbench/run-store.ts`
- `lib/article-workbench/safe-url.ts`
- `lib/article-workbench/anysearch.ts`
- `lib/article-workbench/model.ts`
- `lib/article-workbench/article-format.ts`
- `lib/article-workbench/core.ts`
- `lib/article-workbench/publisher.ts`
- `lib/article-workbench/server.ts`
- `config/article-business-profile.ts`

New Admin APIs:

- `app/api/admin/articles/profile/route.ts`
- `app/api/admin/articles/generate/route.ts`
- `app/api/admin/articles/runs/[runId]/route.ts`
- `app/api/admin/articles/runs/[runId]/publish/route.ts`
- `app/api/admin/articles/runs/[runId]/publication/route.ts`

New Admin UI:

- `app/admin/articles/page.tsx`
- `app/admin/articles/preview/[runId]/page.tsx`
- `components/admin/ArticleWorkbench.tsx`
- `components/admin/BusinessProfileForm.tsx`
- `components/admin/SourcePanel.tsx`
- `components/admin/ArticleEditor.tsx`
- `components/admin/RunStatus.tsx`

Expected existing-file changes:

- `.gitignore`
- `.env.example`
- `DESIGN.md`
- `app/admin/page.tsx`
- the existing Admin sidebar component discovered during Task 9
- `lib/github-photo.ts`
- `lib/mdx/mdx.ts`
- `app/articles/[slug]/page.tsx`
- `vitest.config.ts`
- `README.md`

Tests should mirror the implementation under `tests/article-workbench`, `tests/api/admin/articles`, and the existing article/publication test locations.

---

## Task 1: Define contracts and the reviewed business profile

**Files:**

- Create: `lib/article-workbench/contracts.ts`
- Create: `lib/article-workbench/business-profile.ts`
- Create: `config/article-business-profile.ts`
- Test: `tests/article-workbench/contracts.test.ts`
- Test: `tests/article-workbench/business-profile.test.ts`

**Interfaces and invariants:**

- `ArticleRunStatus` is exactly `created | research_planned | sources_ready | article_generated | validated | publish_submitted | published | failed`.
- `BusinessProfileSchema` contains reviewed company identity, real services, audience, geographic scope, differentiators, approved evidence, disallowed claims, and optional call-to-action.
- `ResearchPlanProposalSchema` accepts 2–5 model-proposed queries with no IDs. Code validates the proposals, assigns `Q001...` in order, and produces `ResearchPlanSchema`; each query retains the model-selected type `general` or `academic`.
- `SourceAssessmentSchema` binds a model-owned semantic category and rationale to one code-owned source ID. Authoritative candidate categories are exactly `official | standard | original_research | peer_reviewed`; user confirmation is stored separately and cannot be set by the model.
- Define ports named `BusinessProfilePort`, `SearchPort`, `ModelPort`, `RunStorePort`, and `PublisherPort`; no framework or HTTP types may leak into these ports.
- `config/article-business-profile.ts` projects the current reviewed Chinese public content through `getLocalizedPublicContent("zh")`. Saved local profile data may replace it only after strict validation.

**Steps:**

- [ ] Write failing schema tests that reject empty services, unreviewed evidence, unknown keys, unsupported run states, proposal-supplied IDs, duplicate code-owned query IDs, and more than five queries.
- [ ] Write a failing test proving the default profile contains only facts already exposed by the current reviewed public-content projection.
- [ ] Implement the schemas, inferred types, typed failure codes, and ports.
- [ ] Implement the default profile projection without copying mutable runtime objects.
- [ ] Run:

  `npm test -- tests/article-workbench/contracts.test.ts tests/article-workbench/business-profile.test.ts`

  Expected: both files pass; malformed profiles and plans fail closed.

- [ ] Re-read the changed files and confirm no customer names, performance claims, or business facts were introduced outside the reviewed source.
- [ ] Commit only if the user separately authorizes a commit.

## Task 2: Add atomic local profile and run persistence

**Files:**

- Create: `lib/article-workbench/run-store.ts`
- Test: `tests/article-workbench/run-store.test.ts`
- Modify: `.gitignore`

**Storage contract:**

- Profile: `output/article-workbench/profile.json`
- Run manifest: `output/article-workbench/runs/<runId>/run.json`
- Safe raw artifacts: research plan, source packet, model response, rendered MDX, and publication receipt under the same run directory.
- Run IDs match `awr_<24 lowercase hex characters>`.
- Writes use same-directory temporary files followed by atomic rename.

**Steps:**

- [ ] Write failing tests for run-ID generation, traversal rejection, missing-run behavior, atomic replacement, interrupted-write preservation, and JSON round trips.
- [ ] Write a failing redaction test using nested keys such as `apiKey`, `authorization`, `token`, `secret`, and `cookie`.
- [ ] Implement the filesystem store with explicit UTF-8 reads, strict schemas on read, and safe artifact names.
- [ ] Persist each state transition before the next external operation begins.
- [ ] Append only `/output/article-workbench/` to the existing dirty `.gitignore`; do not reorder or rewrite unrelated rules.
- [ ] Run:

  `npm test -- tests/article-workbench/run-store.test.ts`

  Expected: persistence, traversal, interruption, and redaction cases pass.

- [ ] Inspect `git diff -- .gitignore` and confirm the only assistant-owned change is the one generated-output rule.
- [ ] Commit only if explicitly authorized.

## Task 3: Implement safe AnySearch research

**Files:**

- Create: `lib/article-workbench/safe-url.ts`
- Create: `lib/article-workbench/anysearch.ts`
- Test: `tests/article-workbench/safe-url.test.ts`
- Test: `tests/article-workbench/anysearch.test.ts`

**Protocol:**

- POST JSON-RPC 2.0 to `https://api.anysearch.com/mcp`.
- Call `batch_search` with code-assigned query IDs, then `extract` for each accepted public URL.
- Add `Authorization: Bearer <ANYSEARCH_API_KEY>` only when configured.
- Parse numbered Markdown result headings into title and canonical URL; never treat snippets as evidence.

**Safety and limits:**

- Allow only public `http` and `https` URLs.
- Reject credentials in submitted URLs, loopback, link-local, private IPv4/IPv6, `.local`, and file URLs. This adapter sends target URLs only to AnySearch and does not directly follow target-site redirects; a future direct-fetch adapter must add per-hop redirect validation.
- Deduplicate canonical URLs, accept at most eight sources, extract with concurrency three, limit each extracted page to 20,000 characters and the packet to 80,000 characters.
- Require at least four successfully extracted sources; otherwise return `insufficient_sources`.
- Before an academic vertical query, call AnySearch `get_sub_domains` for the `academic` domain, use the returned sub-domain, and include every required parameter. Set `open_access: true` when that returned contract supports it; do not hardcode a stale sub-domain schema.
- Perform no automatic retry in version 1.

**Steps:**

- [ ] Write table-driven failing URL tests covering public hosts, IPv4 forms, IPv6 forms, encoded credentials, and local names; assert that the application never fetches a submitted target URL directly.
- [ ] Write mocked-fetch tests that assert the exact JSON-RPC envelopes and headers, including `get_sub_domains` before any academic vertical search.
- [ ] Write tests for Markdown parsing, deduplication, extraction of every accepted result, limits, concurrency, and fewer-than-four failure.
- [ ] Implement URL validation, JSON-RPC transport, deterministic source IDs `S001...`, and the extracted source packet.
- [ ] Persist raw provider responses only after redaction and only within the current run.
- [ ] Run:

  `npm test -- tests/article-workbench/safe-url.test.ts tests/article-workbench/anysearch.test.ts`

  Expected: unsafe destinations fail before extraction and source packets contain full extracted content.

- [ ] Review the implementation for server-side request forgery paths and redirect revalidation.
- [ ] Commit only if explicitly authorized.

## Task 4: Implement the external-model adapter

**Files:**

- Create: `lib/article-workbench/model.ts`
- Modify: `lib/article-workbench/contracts.ts`
- Test: `tests/article-workbench/model.test.ts`
- Modify: `tests/article-workbench/contracts.test.ts`
- Modify: `.env.example`

**Environment contract:**

- `ARTICLE_MODEL_PROVIDER`
- `ARTICLE_MODEL_PROTOCOL`
- `ARTICLE_MODEL_BASE_URL`
- `ARTICLE_MODEL_NAME`
- `ARTICLE_MODEL_API_KEY`
- `ARTICLE_MODEL_STRUCTURED_OUTPUT_MODE`
- `ANYSEARCH_API_KEY`

Secret example values remain blank. Non-secret defaults may document the initial OpenCode route. `ARTICLE_MODEL_BASE_URL` must be HTTPS outside tests and must not already end with `/chat/completions`.

**Replaceability contract:**

- `ModelPort` is the only model dependency imported by `core.ts`.
- `OpenAICompatibleModelProvider` is the first adapter; `deepseek-v4-flash` appears only in configuration and tests for that configured route.
- Provider capability determines whether requests use native JSON mode, JSON Schema mode, or prompt-only JSON. The OpenCode Zen Go route uses prompt-only JSON.
- Response parsing and the Zod output contract remain provider-independent.
- Unsupported protocols or structured-output modes fail during server composition; the workflow must not silently substitute another provider or model.

**Model tasks:**

1. `article_research_plan`: receives the reviewed profile and topic; returns only a 2–5 item research plan.
2. `article_source_bound_write`: receives the profile, topic, extracted source packet, and article rules; returns structured title, slug proposal, summary, tags, body, and source assessments.

The writer must cite with source tokens such as `[[S001]]`, must not emit source URLs, must not create a `参考来源` section, and must identify which claims each source supports.

Task 4 expands the provider-neutral `ModelPort` contract from Task 1 with structured planning and source-bound writing inputs/results. Provider request payloads remain private to `model.ts`; the shared contracts contain no provider, HTTP, or OpenAI-specific fields.

**Steps:**

- [ ] Write failing request-contract tests for endpoint construction, authorization headers, configured model name, temperatures 0.2 for planning and 0.4 for writing, and capability-driven inclusion or omission of `response_format`.
- [ ] Write a failing adapter-boundary test using a second in-memory `ModelPort` implementation and prove the provider-neutral model task runner needs no provider-specific branch. Task 5 must separately prove `core.ts` imports only `ModelPort`.
- [ ] Write failing response tests for non-JSON, unknown keys, invalid source IDs, invented URLs, missing assessments, empty prose, and upstream non-2xx responses.
- [ ] Write failing assessment tests proving the model can classify only existing source IDs and cannot set the human-confirmation field.
- [ ] Add blank environment keys to `.env.example` without exposing real values.
- [ ] Implement one request per task, zero retries, one JSON parse, and one Zod validation. Do not repair malformed output with another model call.
- [ ] Persist safe request metadata and safe response text; omit keys and authorization headers.
- [ ] Run:

  `npm test -- tests/article-workbench/model.test.ts`

  Expected: valid structured responses pass and every malformed contract fails terminally.

- [ ] Compare the adapter to the pre-implementation model compatibility record. Stop if the user's endpoint is not actually compatible.
- [ ] Commit only if explicitly authorized.

## Task 5: Build the deterministic workflow state machine

**Files:**

- Create: `lib/article-workbench/core.ts`
- Modify: `lib/article-workbench/contracts.ts`
- Modify: `lib/article-workbench/run-store.ts`
- Modify: `lib/article-workbench/anysearch.ts`
- Test: `tests/article-workbench/core.test.ts`
- Modify: the focused contract, run-store, and AnySearch tests when port alignment requires it

**Public methods:**

- `generateArticle(input)`
- `saveArticleEdits(runId, edits)`
- `submitPublication(runId)`
- `refreshPublication(runId)`

**Steps:**

- [ ] Write failing state-transition tests for the successful path:

  `created → research_planned → sources_ready → article_generated → validated`

- [ ] Write failing tests proving every external boundary is preceded by a persisted checkpoint.
- [ ] Write failure tests for invalid business profile, invalid plan, insufficient sources, invalid model output, invalid citations, publisher conflict, and verification mismatch.
- [ ] Write tests proving publication remains disabled until the user has confirmed at least two distinct authoritative source candidates.
- [ ] Write tests proving `submitPublication` cannot run before `validated`; repeated submission with the same slug and content hash returns the existing receipt/status without another write; and the publisher is never invoked again after a receipt exists.
- [ ] Implement orchestration only against the five ports. Keep HTTP, React, filesystem paths, and provider-specific payloads outside the core.
- [ ] Replace Task 1 placeholder port methods with the actual provider-neutral contracts already implemented by the run store, AnySearch adapter, and model adapter; do not add concrete-provider branches to `core.ts`.
- [ ] Add a structural/behavioral test proving `core.ts` works with an in-memory `ModelPort` and contains no provider/model-specific branch.
- [ ] Store typed failure fields: stage, code, safe message, occurred-at timestamp, and whether user action is required.
- [ ] Run:

  `npm test -- tests/article-workbench/core.test.ts`

  Expected: all legal transitions pass and every illegal or repeated transition is rejected without side effects.

- [ ] Review the call graph and confirm the model cannot choose source identities, storage paths, or publication state.
- [ ] Commit only if explicitly authorized.

## Task 6: Render citations and canonical MDX

**Files:**

- Create: `lib/article-workbench/article-format.ts`
- Test: `tests/article-workbench/article-format.test.ts`

**Output contract:**

- Replace valid source tokens in first-appearance order with visible markers `〔1〕`, `〔2〕`, and so on.
- Append one code-generated `## 参考来源` section with source title, publisher when known, and canonical Markdown link.
- Require at least two unique cited sources and reject unknown source IDs, uncited source assessments, spoofed source headings, raw URLs in prose, and a body-level H1.
- Code generates final frontmatter: title, slug, summary, date, category `企业 AI 工作流`, tags, `featured: false`, `draft: false`, author, and `contentHash`.
- Code selects repository path `content/articles/YYYY-MM-DD-<slug>.mdx`.
- Append a small related-links block to `/projects`, `/services`, and `/contact`.

**Steps:**

- [ ] Write failing tests for citation ordering, repeat citations, missing sources, malicious MDX, frontmatter escaping, slug normalization, and stable hashing.
- [ ] Add a fixture containing Chinese prose, repeated citations, a table, and related links; assert the exact rendered MDX.
- [ ] Implement formatting as pure functions. Compute `contentHash` from one documented canonical representation that excludes the hash field itself.
- [ ] Ensure user edits pass through the same validation and deterministic rendering as generated prose.
- [ ] Run:

  `npm test -- tests/article-workbench/article-format.test.ts`

  Expected: the exact fixture snapshot is stable and invalid citations fail closed.

- [ ] Open the rendered fixture and manually confirm the source links are readable and the body contains no duplicate H1.
- [ ] Commit only if explicitly authorized.

## Task 7: Add create-only GitHub publication and public hash verification

**Files:**

- Create: `lib/article-workbench/publisher.ts`
- Test: `tests/article-workbench/publisher.test.ts`
- Modify: `lib/github-photo.ts`
- Modify: `lib/mdx/mdx.ts`
- Modify: `app/articles/[slug]/page.tsx`
- Test: the existing GitHub helper, MDX, and article metadata test files

**Publisher contract:**

- Change `upsertRepoFile` to return `{ contentSha, commitSha, path }`; existing callers may ignore the return value.
- Article publication is create-only for different content. If the target path exists with the same content hash, return the existing receipt/status without writing; if it exists with a different hash, return `slug_conflict` and do not overwrite.
- A successful GitHub write records its receipt and moves the run only to `publish_submitted`.
- Never call the existing Vercel deployment helper from the article workflow.
- Parse optional `contentHash` in article frontmatter and expose it on the public article page as metadata `other: { "article-content-hash": contentHash }`.
- Verify the canonical public URL with `cache: "no-store"`. A missing or mismatched hash remains pending; an exact match moves to `published`.

**Steps:**

- [ ] Write failing GitHub helper tests for the typed return value while preserving all existing callers.
- [ ] Write failing publisher tests for create success, same-hash idempotency, different-hash conflict, recovery when GitHub succeeded before local receipt persistence, provider failure, receipt persistence, and no deployment call.
- [ ] Write failing public-verification tests for 404, stale hash, exact hash, network failure, and repeated polling.
- [ ] Implement the smallest compatible helper change and the article-specific publisher.
- [ ] Extend frontmatter and public metadata without making `contentHash` mandatory for legacy articles.
- [ ] Run focused tests for the helper, publisher, MDX loader, and article metadata.
- [ ] Run the existing photo/config save tests to prove the shared helper change does not regress them.
- [ ] Review that `publish_submitted` is never reported as publicly live.
- [ ] Commit only if explicitly authorized.

## Task 8: Expose protected Admin APIs

**Files:**

- Create: `lib/article-workbench/server.ts`
- Create: the five API route files listed in the target file map
- Test: `tests/api/admin/articles/profile.test.ts`
- Test: `tests/api/admin/articles/generate.test.ts`
- Test: `tests/api/admin/articles/run.test.ts`
- Test: `tests/api/admin/articles/publish.test.ts`
- Test: `tests/api/admin/articles/publication.test.ts`

**Routes:**

- `GET /api/admin/articles/profile`
- `PUT /api/admin/articles/profile`
- `POST /api/admin/articles/generate`
- `GET /api/admin/articles/runs/:runId`
- `PUT /api/admin/articles/runs/:runId`
- `POST /api/admin/articles/runs/:runId/publish`
- `GET /api/admin/articles/runs/:runId/publication`

**Steps:**

- [ ] Build server composition that wires the local store, AnySearch, model adapter, formatter, and publisher from validated environment only.
- [ ] Write tests proving every route returns 404 when Admin is disabled, including production mode.
- [ ] Add strict request schemas, a 64 KiB request-body limit, run-ID validation, text-length limits, and safe response projections.
- [ ] Map errors consistently: 400 malformed input, 404 unavailable or missing, 409 illegal state or slug conflict, 413 oversized body, 422 invalid source/article contract, and 502 upstream provider failure.
- [ ] Ensure API responses never contain extracted full-page text by default, environment values, tokens, raw authorization headers, or filesystem paths.
- [ ] Run:

  `npm test -- tests/api/admin/articles`

  Expected: happy paths, production lockout, size limits, conflicts, and redaction all pass.

- [ ] Inspect route handlers and confirm none imports a client component or invokes deployment directly.
- [ ] Commit only if explicitly authorized.

## Task 9: Build the local Admin experience and exact preview

**Files:**

- Modify: `DESIGN.md`
- Modify: `app/admin/page.tsx`
- Modify: the discovered Admin sidebar component
- Create: all Admin UI files listed in the target file map
- Test: `tests/admin/article-workbench.test.tsx`
- Test: `tests/admin/article-preview.test.tsx`

**Interaction contract:**

- Update `DESIGN.md` before UI code with the workbench layout, state colors, local-only warning, desktop/mobile behavior, and publication wording.
- Desktop uses a two-column workbench: business/topic controls on the left; sources, editor, validation, and status on the right.
- Mobile becomes a single readable column. There is no draft list, hidden second confirmation, scheduler, or bulk action.
- Preview renders the same MDX component path as the public article and visibly says `本地预览，尚未发布`.
- After the one publish action, poll publication status every five seconds for at most five minutes; polling never resubmits.

**Steps:**

- [ ] Write component tests for profile editing, generation states, source expansion, article edits, validation messages, preview navigation, publish-button gating, and pending/public status.
- [ ] Add source-category review controls that show the model's category and rationale while requiring explicit user confirmation for at least two authoritative candidates.
- [ ] Add an `文章工作台` entry to the existing local Admin navigation.
- [ ] Implement the workbench with native `fetch`, abortable requests, explicit disabled states, and no secret inputs in client state.
- [ ] Reuse the existing MDX renderer for preview; do not duplicate article rendering rules in the client.
- [ ] Make source links visible in the editor/preview while keeping full extracted text collapsed by default.
- [ ] Run:

  `npm test -- tests/admin/article-workbench.test.tsx tests/admin/article-preview.test.tsx`

  Expected: all user-visible states and the single-action publication contract pass.

- [ ] Run lint and typecheck for the touched UI and routes.
- [ ] Re-read `DESIGN.md` against the implemented desktop and mobile hierarchy.
- [ ] Commit only if explicitly authorized.

## Task 10: Protect public discovery and document setup

**Files:**

- Modify: `vitest.config.ts`
- Modify: `README.md`
- Test: existing article index, sitemap, RSS, JSON Feed, llms, and structured-data tests
- Create focused regression tests only where current coverage has no suitable file

**Steps:**

- [ ] Extend coverage collection to the new article-workbench files without lowering the existing 90% thresholds.
- [ ] Add README setup for Admin enablement, model variables, AnySearch, GitHub publication configuration, local output location, and the explicit no-auto-publish boundary.
- [ ] Add one canonical MDX fixture and prove it appears exactly once in `/articles`, sitemap, RSS, JSON Feed, `llms.txt`, and article JSON-LD.
- [ ] Prove legacy articles still load when `contentHash` is absent.
- [ ] Run focused discovery tests, then:

  `npm run lint`

  `npm run typecheck`

  `npm test`

  `npm run build`

  Expected: all commands exit 0; coverage thresholds remain unchanged.

- [ ] Run `codegraph sync` and `codegraph status`; record whether the index is current.
- [ ] Review the complete diff for generated files, secrets, unrelated edits, and scope expansion.
- [ ] Commit only if explicitly authorized.

## Task 11: Perform offline browser acceptance

**Files:**

- Add a test-only fixture injection at the narrowest server-composition seam if required.
- Store screenshots under `output/playwright/article-workbench/`; do not commit them.

**Acceptance paths:**

- Desktop viewport: 1440 × 1000.
- Mobile viewport: 390 × 844.
- Profile loads and saves.
- Topic generation reaches a fixture-backed validated article.
- Sources are inspectable.
- Manual edits survive reload.
- Preview matches the public MDX renderer.
- `上传并发布` is disabled until validation and moves only to a fixture-backed pending state.

**Steps:**

- [ ] Start the local app with Admin enabled and test-only adapters; do not use real model, AnySearch, GitHub, deployment, or public-site calls.
- [ ] Execute the complete user journey on desktop and mobile.
- [ ] Capture screenshots for initial, generated, edited preview, publication pending, and validation-error states.
- [ ] Check console errors, failed network requests, keyboard navigation, focus visibility, overflow, and source-link readability.
- [ ] Record browser, viewport, entry URL, observed final state, and any remaining visual limitation.
- [ ] Remove any temporary test-only bypass that is not intentionally part of the test seam.
- [ ] Re-run the focused tests affected by browser findings.
- [ ] Commit only if explicitly authorized.

## Task 12: Run one real canary, then request separate publication authorization

This task is deliberately split into generation and publication. Authorization for one does not authorize the other.

### 12A. One real generation canary

- [ ] Re-read cwd, branch, full HEAD, remote, worktrees, dirty status, environment presence, model name, `SITE_URL`, and GitHub target.
- [ ] Obtain explicit authorization for one real model-and-AnySearch generation run.
- [ ] Generate one article from the reviewed business profile and one user-approved topic.
- [ ] Do not retry automatically. On provider, schema, source, or validation failure, preserve the run and stop with the first divergence.
- [ ] Human-review every business claim, citation, source link, title, summary, CTA, and rendered preview.
- [ ] Save the final reviewed article and record its exact content hash.

### 12B. One separately authorized publication

- [ ] Before asking for authorization, show the user the repository, branch, target path, public URL, title, slug, content hash, current HEAD, and dirty status.
- [ ] Obtain explicit authorization for that exact publication target.
- [ ] Invoke the one publication action once.
- [ ] Confirm a GitHub receipt moves the run to `publish_submitted`, not `published`.
- [ ] Poll verification only; never resubmit while waiting.
- [ ] Confirm the canonical public URL exposes the exact content hash.
- [ ] Verify the public reader page, source links, JSON-LD, `/articles`, sitemap, RSS, JSON Feed, `llms.txt`, and desktop/mobile rendering.
- [ ] Report implementation evidence, offline acceptance, external-generation evidence, Git receipt, deployment/public verification, and any unverified boundary separately.
- [ ] Do not delete or unpublish the legacy Hello Agents article. If replacement quality is accepted, write a separate retirement plan and request new authorization.
- [ ] Commit or push only if separately authorized.

## Done when

The feature is complete only when all of the following are true:

1. A reviewed business profile can be maintained locally without exposing secrets or inventing facts.
2. One topic produces a full-page AnySearch source packet and a source-bound article through the configured external model.
3. Human edits pass through the same citation and MDX validation as generated text.
4. Exact preview uses the public article renderer.
5. One explicit publish action creates a new repository article without overwriting an existing path.
6. The UI distinguishes `publish_submitted` from a publicly verified `published` state.
7. Public discovery surfaces contain the article once, with readable source links and structured metadata.
8. Automated checks, desktop/mobile offline acceptance, and one separately authorized real canary provide evidence at their correct boundaries.
