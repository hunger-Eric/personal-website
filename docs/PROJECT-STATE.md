# Personal Website Project State

Last updated: 2026-06-18

## Latest Snapshot

- CodeGraph is initialized and current: 300 files, 3,632 nodes, 5,821 edges, status `[OK] Index is up to date`.
- `npm run audit:architecture` passes with no actionable `debtFindingCounts`; remaining matches are categorized token sources, tooling, or test fixtures.
- `npm run lint` passes with 0 errors / 28 warnings. Remaining warnings are existing unused test/helper variables or one existing hook dependency warning.
- `npm test` passes: 90 files / 891 tests. Vitest still prints existing jsdom `Window.scrollTo()` not-implemented notices.
- `npm run build` passes. Admin dashboard routes are now dynamic (`ƒ /admin`, `/admin/site`, `/admin/photography`, etc.) so `ENABLE_ADMIN` and cookies are evaluated at runtime instead of being frozen during build.
- Browser QA on latest production build at `http://localhost:3008` passed for `/`, `/projects`, `/projects/hermes-notebook`, `/articles`, `/articles/hello-agents-ch01`, `/photography`, `/photography/yuan-shui`, `/links`, `/content`, authenticated `/admin`, authenticated `/admin/photography`, `/llms.txt`, `/feed.xml`, `/feed.json`, and `/.well-known/brand-facts.json`: all 200, expected H1s where applicable, no horizontal overflow, no console warnings/errors, and no 4xx/5xx resources.
- Admin photography now degrades gracefully without GitHub photo credentials: `/api/admin/photography` returns the local zh config, empty file lists, original `locales`, and warnings instead of failing the workbench.
- GitHub contribution data now degrades gracefully without `GITHUB_TOKEN`: `/api/github-contributions` returns 200 with empty `days`, `code: "MISSING_TOKEN"`, and a fallback warning so the homepage does not emit browser console errors in local/preview environments.

Remaining known risks:

- Build still warns about missing optional env vars (`GITHUB_TOKEN`, `NEXT_PUBLIC_BASE_URL`, contact/webhook/API keys, analytics token) and stale Browserslist data.
- Admin photography currently edits the zh-shaped config returned as `config`; the raw bilingual payload is preserved as `locales`, but a full bilingual editing workflow remains future work.
- PowerShell may display UTF-8 source/content as mojibake; Node/CodeGraph/build/browser evidence should be used before treating display output as real corruption.

## Current Goal

Refactor the site from an open-source-template-plus-patches portfolio into a maintainable AI Native personal website system. The public site should read as an AI archive system with cinematic case storytelling. Admin remains a dense, predictable workbench.

## Current Architecture

- `app/` owns routes and should stay thin: load data, select metadata, assemble views.
- `config/` owns content models and locale-aware copy. Leaf UI should not branch on `locale === "zh"` for chrome copy.
- `components/system/` is the shared UI primitive layer for shell, section headers, surfaces, archive records, actions, status, empty states, form fields, and admin panels.
- `components/motion/` owns reusable motion policies: reduced motion, in-view playback, autoplay steps, and progress.
- `lib/ai-readable/routes.ts` is the shared crawler inventory for sitemap and `llms.txt`.
- `DESIGN.md` is the visual and interaction source of truth.

## Migration Progress

Completed in this pass:

- Initialized and synced CodeGraph: 271 files, 2866 nodes, 4590 edges.
- Ran five read-only audits for Product Design, architecture, hardcoding/i18n, AI-readable, and motion/HyperFrames.
- Added `components/system/*` primitives.
- Added `components/motion/*` primitives and migrated case motion components to shared hooks/progress.
- Added `config/copy/admin.ts` and moved admin login/dashboard chrome copy out of leaf pages.
- Added `lib/ai-readable/routes.ts` and migrated `app/sitemap.ts` / `app/llms.txt/route.ts` to the shared inventory.
- Updated `app/robots.ts` to disallow `/admin/`.
- Added project and photography JSON-LD coverage.
- Added semantic Tailwind/CSS tokens for paper, graphite, admin, borders, radii, shadows, and semantic states.
- Added `npm run audit:architecture`.
- Removed confirmed mojibake from touched admin and case/config source files.
- Migrated `/content` onto `PageShell`, `SectionHeader`, `Surface`, `ArchiveCard`, and centralized `contentCopy`.
- Migrated `/articles` list shell, category browser, chapter rows, article cards, and empty states onto system primitives.
- Migrated `/photography` list shell, album cards, and empty state onto system primitives.
- Rebuilt `config/contentCopy.ts` as clean zh/en source copy with article, photography, and content chrome text.
- Migrated `/links` onto `PageShell`, `SectionHeader`, `Surface`, semantic tokens, and centralized `contentCopy.links`.
- Migrated contact QR, copy-contact, and share controls away from hardcoded paper hex values.
- Rebuilt `config/siteConfig.ts` to remove confirmed mojibake defaults while preserving the public config API.
- Migrated `CasesBrowser`, `CaseChapterRail`, and `CaseCard` onto system tokens/primitives and centralized case chrome copy in `contentCopy.cases`.
- Removed confirmed mojibake from case browser/chapter/card tests and UI copy.
- Migrated `app/projects/[id]/page.tsx` onto `PageShell`, `Surface`, `ActionButton`, semantic tokens, and centralized case detail copy.
- Migrated `CaseDemo` copy and borders onto `contentCopy.cases` and system tokens.
- Rebuilt `config/contentCopy.ts` as clean UTF-8 for all current public copy groups after finding remaining mojibake in the central copy source.
- Migrated `CaseFilmStage`, `ArtifactPreviewPanel`, and `HyperFramePreview` onto centralized film/demo copy, semantic graphite tokens, `Surface`, `ActionButton`, and `IconButton`.
- Removed the custom-HTML redirect from `app/articles/[slug]/page.tsx` so canonical App Router article URLs keep metadata and JSON-LD while standalone HTML remains linked from the MDX body.
- Cleaned confirmed mojibake in `app/articles/[slug]/page.tsx` UI copy and comments.
- Migrated `SystemDemoConsole` onto centralized case demo copy, semantic paper tokens, `Surface`, and accessible case-name preview controls.
- Migrated `CasesClient` onto centralized case section copy, semantic paper tokens, `ActionButton`, and copy-driven metadata/fallback labels.
- Migrated `BrandGlyphs` from hardcoded official brand colors to token-driven monochrome platform glyphs; platform identity is now shape-based while color inherits from the surrounding design system.
- Migrated `ProjectsFilmLayout` onto `PageShell`, `EmptyState`, `ActionButton`, semantic paper tokens, and centralized project-film copy in `contentCopy.cases`.
- Migrated `HeroShowcaseSection` hero badge, CTAs, lab signals, capability records, and rhythm title into structured `contentCopy.hero`; the section now uses `ActionButton` and `Surface` instead of private link/card styling and no longer branches on `locale === "zh"`.
- Migrated `AboutSection` positioning, build labels, audience panel, capability records, directions label, and action labels into structured `contentCopy.about`; the section now uses `Surface` and `ActionButton`, removes local locale helpers, and fixes prior hook/`any` lint debt in that component.
- Migrated unmounted case-story building blocks `CaseStoryPlayer` and `FlagshipCaseCard` onto centralized `contentCopy.cases` story labels/actions plus `Surface`, `ActionButton`, and `IconButton`; removed their local `locale === "zh"` UI branches and replaced one hardcoded graphite panel hex with semantic surface tokens. CodeGraph currently reports no page callers for these two components, so page QA verifies `/projects` remains unaffected rather than claiming the story player is routed.
- Migrated global desktop/mobile navigation away from template residual classes (`border-white/*`, `bg-white/*`, `bg-card`, `rounded-md/xl/2xl`, `shadow-xl`, `slate-950`) onto semantic paper/graphite surface tokens and control/panel radii. Mobile menu/close aria labels now live in `config/locale.ts`; the mobile drawer uses the shared `IconButton` primitive with ref support and typed lucide icons instead of private hamburger/X markup and `any` icon lookup. Focused nav tests now mock the actual `getNavbarConfig(locale)` API.
- Migrated `ExperienceSection` onto `SectionHeader`, `Surface`, semantic paper/accent/border tokens, and centralized `contentCopy.experience`. Removed its white/indigo/template visual residue, fixed hook ordering for empty data, and updated focused tests with typed mocks plus LocaleProvider coverage. Browser runtime currently shows `#experience` is not enabled on the live homepage config, so this component is covered by focused component tests until it is mounted again.
- Migrated `YouTubeSection` onto `SectionHeader`, `Surface`, `ActionButton`, `next/image`, semantic paper/accent/graphite tokens, and centralized `contentCopy.youtube`. Removed its hardcoded profile/section labels and old transparent white card language. The shared `ActionButton` secondary tone now uses `bg-surface-paper` instead of `bg-card` so the primitive no longer spreads template card color by default. Browser runtime currently shows `#youtube` is not enabled on the live homepage config, so this component is covered by focused component tests until it is mounted again.
- Migrated the unmounted global `CommandPalette` onto centralized `contentCopy.commandPalette`, semantic surface/border/radius/shadow tokens, and locale-driven static command labels. Fixed the real broken footer shortcut text, removed template white-overlay classes from the palette shell, and cleaned its React hook lint issues. CodeGraph currently reports no page callers and Browser confirms zero command-palette triggers on `/`, so live palette interaction QA is not claimable until the component is mounted.
- Rebuilt `config/copy/admin.ts` as clean UTF-8 admin copy covering common labels, sidebar, login, dashboard, and photography workbench chrome. Migrated `AdminSidebar` from hardcoded English and white-overlay template classes to admin copy plus semantic admin/border/muted tokens. Migrated `app/admin/(dashboard)/photography/page.tsx` onto `AdminSidebar`, `AdminPanel`, `FormField`, `ActionButton`, `IconButton`, `StatusNote`, and `EmptyState`; removed confirmed mojibake labels/status text, removed unused `GripVertical`, replaced `any` error handling with `unknown`, and kept the existing API/data model unchanged.
- Migrated shared `components/admin/AdminEditor.tsx` from a nested page shell with hardcoded save/CI/deploy text and template card styling into a reusable admin editor content shell using `ActionButton`, `StatusNote`, semantic tokens, typed generic config payloads, and centralized `adminCopy.editor`. Migrated `app/admin/(dashboard)/theme/page.tsx` onto `AdminPanel`, `adminCopy.theme`, typed theme data, semantic border/radius/accent tokens, and removed its local preset labels, local English labels, `any` preset typing, `rounded-2xl`, `border-white/10`, and `bg-card` residues. Because `AdminEditor` is used by about/navbar/pages/site/theme, this pass improves the shared admin editing boundary while preserving existing config APIs.
- Migrated `app/admin/(dashboard)/site/page.tsx`, the admin source for public identity/social links/section toggles, onto `AdminPanel`, `FormField`, `EmptyState`, semantic form tokens, typed site/social data, and centralized `adminCopy.site`. Removed its local `Field` helper, local Chinese labels/placeholders, `any` social typing, page-private panels, `rounded-2xl`, `bg-card`, and amber-specific focus classes. The existing `site` config API and data shape are unchanged; remaining mojibake in `config/site.json` is data-source debt and should be handled separately from the admin UI shell migration.
- Migrated `app/admin/(dashboard)/navbar/page.tsx` onto typed navbar config helpers, `AdminPanel`, `FormField`, `ActionButton`, `IconButton`, and centralized `adminCopy.navbar`. Removed page-private card/input styles, `any` menu item typing, `rounded-2xl`, `bg-card`, and amber focus classes. The editor now exposes add/remove controls for menu items and dropdown children while preserving the existing `config/navbar.json` shape; remaining mojibake in `config/navbar.json` is data-source debt.
- Migrated `app/admin/(dashboard)/about/page.tsx` from a flat old form into a typed editor for the real raw config shape: root identity/tech stack plus `zh`/`en` localized role line, README paragraphs, after-tech summary, and CTA fields. Removed the local `Field` helper, `any` filters, page-private sections, template radius/card classes, and hardcoded leaf copy by moving labels into `adminCopy.about`. Remaining mojibake in `config/about.json` is data-source debt and was not guessed or rewritten in this pass.
- Migrated `app/admin/(dashboard)/page.tsx` dashboard entry away from per-card color classes, `rounded-2xl`, `bg-card`, and private quick-link pills. The page now uses semantic admin surfaces plus `ActionButton`, keeping the admin workbench entry aligned with the shared design system.
- Migrated `app/admin/(dashboard)/pages/page.tsx` from a large JSX-only editor with `content: any` into typed page/block helpers and a dedicated block editor section using `AdminPanel`, `FormField`, `ActionButton`, `IconButton`, and `EmptyState`. Moved custom-page labels, block type names, empty states, preview labels, and default new-page/new-block text into `adminCopy.pages`. The saved config contract remains `{ pages: [...] }`, and `config/pages.json` is currently empty.
- Migrated `components/PageBlocks.tsx`, the public renderer for `/page/[slug]`, onto typed block content helpers, `Surface`, `ActionButton`, `EmptyState`, semantic `section` / `article` / `figure` markup, and `next/image` for gallery assets. Added `contentCopy.customPage` so gallery/card empty states and contact CTA copy are no longer hardcoded in the leaf renderer. The custom page config schema is unchanged.
- Migrated `components/sections/Certifications.tsx` from dark template cards (`border-white/*`, `bg-white/*`, `rounded-xl`, accent-specific buttons) to the shared public section system: `SectionHeader`, `Surface`, `ActionButton`, semantic `article` cards, and centralized `contentCopy.certifications`. The certificate data source and homepage section switch are unchanged.
- Migrated the shared MDX rendering stack (`CodeBlock`, `MdxRenderer`, `MdxComponents`) onto semantic graphite/paper surfaces, semantic state tokens, shared radius tokens, and accessible code/callout/embed controls. Removed MDX-local `border-white/*`, `bg-white/*`, `rounded-xl`, raw hue callout classes, and the hardcoded code-panel hex. Node UTF-8 reads confirm the X/Twitter arrow is real source text while PowerShell may display it as mojibake.
- Migrated the unmounted `ShareLinks` article sharing primitive onto centralized `contentCopy.articles.shareLinks`, semantic paper/status tokens, and shared radius tokens. Platform identity now comes from icon shape instead of hardcoded brand hex colors; copy/share device labels are no longer hardcoded in the leaf component. CodeGraph currently reports no page callers, so this component is verified with focused component tests and build until it is mounted.
- Migrated the unmounted `FeaturedCasesTicker` / `FeaturedCasesCarousel` onto shared motion hooks (`useAutoplaySteps`, `usePrefersReducedMotion`), `Surface`, `ActionButton`, `IconButton`, semantic paper/accent tokens, and centralized `contentCopy.cases` carousel labels. Removed its local reduced-motion effect, private button class strings, `bg-card`, `rounded-2xl`, indigo/slate indicator colors, and hardcoded carousel/action labels. CodeGraph currently reports no page callers, so live visual QA is not claimable until it is mounted.
- Migrated mounted `DemoTimeline` onto the shared system/motion boundary: `Surface`, `IconButton`, `MotionProgress`, semantic paper/graphite tokens, and centralized `contentCopy.cases` timeline labels. Removed the component-local play/next/replay aria copy, `Input` / `Output` / `Result` / `live trace` labels, the hardcoded graphite hex panel, `border-white/10`, `bg-card`, and private rounded control styles while preserving the existing demo data contract and reduced-motion autoplay behavior.
- Migrated the mounted `ContentMediaSection` homepage content slot onto `SectionHeader`, centralized `contentCopy.content` / `contentCopy.youtube` labels, semantic paper/graphite/accent tokens, and typed `siteConfig.featuredContent` access. Removed its `siteConfig as any`, `border-white/10`, `bg-white/5`, `bg-slate-900`, `rounded-lg/xl/md`, hardcoded `~/Content`, and white ring/card overlays. The section still intentionally hides when the YouTube feed returns no videos.
- Migrated the homepage `EducationSection` onto `SectionHeader`, polymorphic `Surface as="article"`, `next/image`, centralized `contentCopy.education`, semantic paper/border/radius/shadow tokens, and typed education tests. Removed its local heading/subtitle labels, hardcoded education metadata labels, `border-white/10`, `bg-white/5`, `bg-white/10`, private card styling, and raw date dash glyphs. The shared `Surface` primitive now supports `as="div" | "article" | "section"` so repeated archive records can keep semantic HTML without private wrappers.
- Migrated the mounted photography detail stack (`app/photography/[slug]/page.tsx`, `PhotographyGallery`, and `PhotoPinModal`) into the shared system boundary. The detail route now normalizes source photos, owns ImageGallery JSON-LD, uses `PageShell`, `SectionHeader`, `Surface`, and `ActionButton`, and keeps gallery cards semantic with `Surface as="article"`. Gallery/private-access/lightbox/PIN chrome copy now comes from `contentCopy.photography`; old `rounded-2xl`, `bg-card`, `border-white/10`, white overlay button styling, hardcoded Chinese labels, and confirmed mojibake in the photography tests/page were removed. Added focused coverage for the PIN modal contract and gallery private-session behavior.
- Migrated the admin authentication entry (`app/admin/(auth)/login/page.tsx`) into the shared admin system boundary. The login page now uses `PageShell`, `AdminPanel`, `FormField`, `ActionButton`, and `StatusNote`; `adminCopy.login` owns the visible panel title and form/error/loading copy. Removed route-local `rounded-2xl`, `rounded-lg`, `bg-card`, private button/form styling, and untyped login response handling while preserving password POST and redirect behavior. The shared `AdminPanel` and informational `StatusNote` primitives now use `bg-surface-admin` instead of spreading `bg-card` through the admin workbench.
- Migrated legacy homepage preview adapters `components/sections/Articles.tsx` and `components/sections/Content.tsx` away from their old template implementations. CodeGraph and `rg` show these exports currently have no route callers and are only referenced by focused tests, so they are now compatibility adapters using current `SectionHeader`, `Surface`, `ActionButton`, `EmptyState`, centralized `contentCopy`, typed `Article` data, and fixed platform glyphs. Removed their `any` sorting/icon lookup, `locale`-independent hardcoded chrome labels, `border-white/10`, `bg-white/5`, `rounded-md/xl/2xl`, and platform-specific color tile classes. Updated their tests to assert system-surface behavior without reintroducing audit residue literals.
- Migrated the mounted homepage `ProjectsClient` section away from the old open-source-template project panel. It now selects localized project arrays through a locale map instead of leaf `locale === ...` branches, uses `SectionHeader` and `ActionButton`, pulls heading/description/action copy from `contentCopy.projects`, and sends the primary action to the internal `/projects` archive rather than a hardcoded GitHub profile URL. Rewrote the two stale projects tests to the current `projectsZh` / `projectsEn` contract and removed confirmed mojibake test fixtures.
- Rewrote the stale `ArticlesBrowser` tests to the current article archive interaction: category cards first, URL `category` selection, category detail chapter rows, empty states, and centralized article copy. This clears the previous full-test failures without changing the public article routing contract.
- Tightened `AdminSidebar` active state styling from raw accent CSS value classes and `rounded-lg` to semantic `bg-accent/10`, `text-accent`, and `rounded-control`; added an accessible label to the icon back link. Rewrote its tests around `adminCopy` instead of old English strings.
- Migrated the generic `ShareButton` default visual style from `bg-card` to `bg-surface-paper` and updated its focused tests to assert system token behavior while preserving Web Share API and clipboard fallback behavior.
- Rewrote the stale `CertificationsSection`, `PageBlocks`, and shared `AdminEditor` tests to the current architecture contracts: centralized zh admin/public copy, system surface/action tokens, `next/image` URL output, typed config data, save payload transformation, and captured CI/deploy polling callbacks. This cleared the remaining old focused test failures without changing the public component APIs.
- Adjusted lint boundaries so generated `.open-next`, runtime `docker-data`, scripts, Tailwind config, and test fixtures no longer drown source lint signal. Product/source files remain linted.
- Typed admin config, photography, GitHub release, GitHub contribution, modal route, navbar, and experience config boundaries to remove source `any`/dynamic `require` debt while preserving route/config contracts.
- Removed React compiler purity and synchronous-effect findings from `Tooltip`, `ThemeProvider`, `Typewriter`, and `FeaturedProjectsTicker`.
- Added audit categories for `token-source`, `tooling`, `test-fixture`, and `ui-source`; `npm run audit:architecture` now reports both total findings and actionable `debtFindingCounts` / `topDebtFindings`.
- Moved theme toggle UI copy into `config/copy/theme.ts`, migrated `ThemeToggle` and `ThemeDropdown` away from `bg-white/5`, `border-white/10`, and private radius classes, and removed its unused hook/icon lint warnings.
- Moved OG image and case-story accent palettes into `config/ogTheme.ts` and `config/caseTheme.ts`; `app/api/og/route.tsx` and `config/caseStories.ts` no longer scatter raw color literals while preserving their existing runtime contracts.
- Migrated the unmounted `PublicationsSection` onto `SectionHeader`, `Surface`, and `ActionButton`, removed its white-overlay/template visual residue, and cleaned real mojibake separators/comments from its focused test. Shared `Surface` default/admin tones now use semantic surface tokens instead of `bg-card`.

## Known Existing Worktree Changes

At start, the worktree already had uncommitted changes in `docker-compose.yml`, `proxy.ts`, several tests, new case components/tests, and `docker-data/`. Treat those as user-owned work and do not revert them.

## Remaining Migration Work

- Move remaining case/public chrome copy from leaf components into `config/copy/*` or the cleaned `config/contentCopy.ts` structure.
- Replace high-frequency hardcoded hex and `border-white/10` / `bg-white/5` / `bg-card` / `rounded-2xl` sites with system primitives and semantic tokens.
- Split `config/cases.ts` into smaller case source, normalization, GitHub enrichment, story attachment, and sorting modules.
- Add poster assets for reduced-motion case demos.
- Decide whether legacy static `public/articles/*.html` should get canonical/JSON-LD injection for direct visits; canonical article URLs now stay on App Router pages.

## Latest Verification

- `codegraph sync`: PASS / already up to date.
- `codegraph status`: OK, up to date, 295 files, 3593 nodes, 5766 edges.
- `npm run audit:architecture`: PASS. Remaining report-only debt after the test-contract pass: 28 visual residue hits, 157 hardcoded hex hits, 10 locale branch hits. `components/ShareButton.tsx`, `components/admin/AdminSidebar.tsx`, `components/cases/DemoTimeline.tsx`, `components/sections/ProjectsClient.tsx`, `components/sections/Articles.tsx`, and `components/sections/Content.tsx` are no longer top visual-residue findings.
- Targeted eslint for changed admin/copy/config files: PASS.
- Targeted eslint for migrated content/articles/photography/copy files: PASS.
- Targeted eslint for migrated links/contact/share/siteConfig files: PASS.
- Focused tests: PASS, 5 files / 14 tests (`ai-readable-routes`, `seo-routes`, `llms`, Articles section, Content section).
- Focused tests after links pass: PASS, 5 files / 27 tests (`ai-readable-routes`, `seo-routes`, `llms`, Content section, proxy).
- Focused case tests after case-browser pass: PASS, 4 files / 9 tests (`CasesBrowser`, `CaseFilmStage`, `DemoTimeline`, `CaseStoryPlayer`).
- Focused case/detail tests after case-detail pass: PASS, 5 files / 11 tests (`CasesBrowser`, `CaseFilmStage`, `DemoTimeline`, `CaseStoryPlayer`, `seo-routes`).
- Focused film/AI-readable tests after film/article pass: PASS, 2 files / 4 tests (`CaseFilmStage`, `ai-readable-routes`).
- Focused system-demo tests after system-demo pass: PASS, 2 files / 5 tests (`SystemDemoConsole`, `CaseFilmStage`).
- Focused cases-client tests after cases-client pass: PASS, 3 files / 6 tests (`CasesBrowser`, `SystemDemoConsole`, `seo-routes`).
- Focused BrandGlyphs tests after glyph pass: PASS, 2 files / 17 tests (`BrandGlyphs`, `Content`).
- Focused project-film tests after `ProjectsFilmLayout` pass: PASS, 3 files / 7 tests (`CasesBrowser`, `CaseFilmStage`, `seo-routes`).
- Focused hero tests after `HeroShowcaseSection` pass: PASS, 3 files / 16 tests (`heroshowcase`, `Content`, `seo-routes`).
- Focused about tests after `AboutSection` pass: PASS, 3 files / 15 tests (`About`, `heroshowcase`, `seo-routes`).
- Focused case-story tests after case-story building-block pass: PASS, 3 files / 7 tests (`CaseStoryPlayer`, `CaseFilmStage`, `CasesBrowser`).
- Focused navigation lint after nav pass: PASS (`NavbarCenteredDesktop`, `NavbarCenteredMobile`, `IconButton`, `locale`, and nav tests).
- Focused navigation tests after nav pass: PASS, 3 files / 19 tests (`NavbarCenteredMobile`, `NavbarCenteredDesktop`, `LangSwitch`). Vitest still prints jsdom `window.scrollTo` not-implemented notices from existing scroll behavior.
- Focused Experience lint after Experience pass: PASS (`ExperienceSection`, `contentCopy`, and the Experience tests).
- Focused Experience tests after Experience pass: PASS, 2 files / 19 tests (`ExperienceSection`, `HeroShowcaseSection`).
- Focused YouTube lint after YouTube pass: PASS (`YouTubeSection`, `contentCopy`, `ActionButton`, and YouTube tests).
- Focused YouTube tests after YouTube pass: PASS, 2 files / 21 tests (`YouTubeSection`, `YouTubeSection branch coverage`).
- Focused CommandPalette lint after CommandPalette pass: PASS (`CommandPalette`, `contentCopy`, and `CommandPalette` test).
- Focused CommandPalette tests after CommandPalette pass: PASS, 1 file / 3 tests.
- Focused admin photography/sidebar lint after admin pass: PASS (`app/admin/(dashboard)/photography/page.tsx`, `components/admin/AdminSidebar.tsx`, `config/copy/admin.ts`).
- Mojibake scan after admin pass: PASS for `config/copy/admin.ts`, `app/admin/(dashboard)/photography/page.tsx`, and `components/admin/AdminSidebar.tsx`.
- Focused admin editor/theme lint after editor pass: PASS (`components/admin/AdminEditor.tsx`, `app/admin/(dashboard)/theme/page.tsx`, `config/copy/admin.ts`).
- Mojibake scan after editor pass: PASS for `config/copy/admin.ts`, `app/admin/(dashboard)/theme/page.tsx`, and `components/admin/AdminEditor.tsx`; Node UTF-8 reads confirm `adminCopy` contains real Chinese while PowerShell may display mojibake for UTF-8 files without indicating source corruption.
- Focused admin site lint after site pass: PASS (`app/admin/(dashboard)/site/page.tsx`, `config/copy/admin.ts`).
- Mojibake scan after site pass: PASS for `app/admin/(dashboard)/site/page.tsx` and `config/copy/admin.ts`. `config/site.json` still contains real mojibake content and is tracked as separate data-source cleanup debt.
- Focused admin navbar/about lint after navbar/about pass: PASS (`app/admin/(dashboard)/navbar/page.tsx`, `app/admin/(dashboard)/about/page.tsx`, `config/copy/admin.ts`).
- Focused admin dashboard/navbar/about lint after dashboard pass: PASS (`app/admin/(dashboard)/page.tsx`, `app/admin/(dashboard)/navbar/page.tsx`, `app/admin/(dashboard)/about/page.tsx`, `config/copy/admin.ts`).
- Focused admin pages lint after pages pass: PASS (`app/admin/(dashboard)/pages/page.tsx`, `config/copy/admin.ts`).
- Focused custom-page renderer lint after `PageBlocks` pass: PASS (`components/PageBlocks.tsx`, `config/contentCopy.ts`).
- Focused certifications lint after `CertificationsSection` pass: PASS (`components/sections/Certifications.tsx`, `config/contentCopy.ts`).
- Focused MDX lint after MDX rendering pass: PASS (`components/mdx/CodeBlock.tsx`, `components/mdx/MdxRenderer.tsx`, `components/mdx/MdxComponents.tsx`).
- Focused ShareLinks lint after article sharing pass: PASS (`components/articles/ShareLinks.tsx`, `config/contentCopy.ts`, `tests/components/articles/ShareLinks.test.tsx`).
- Focused ShareLinks tests after article sharing pass: PASS, 1 file / 15 tests.
- Focused FeaturedCasesCarousel lint after carousel pass: PASS (`components/cases/FeaturedCasesTicker.tsx`, `config/contentCopy.ts`).
- Focused DemoTimeline lint after timeline pass: PASS (`components/cases/DemoTimeline.tsx`, `config/contentCopy.ts`, `tests/components/cases/DemoTimeline.test.tsx`).
- Focused DemoTimeline tests after timeline pass: PASS, 1 file / 3 tests.
- Focused ContentMedia lint after homepage content pass: PASS (`components/sections/ContentMedia.tsx`, `tests/components/sections/contentmedia.test.tsx`).
- Focused ContentMedia tests after homepage content pass: PASS, 1 file / 10 tests.
- Focused Education lint after Education pass: PASS (`components/sections/Education.tsx`, `components/system/Surface.tsx`, `config/contentCopy.ts`, `tests/components/sections/education.test.tsx`).
- Focused Education tests after Education pass: PASS, 1 file / 19 tests.
- Focused photography detail/gallery lint after photography pass: PASS (`components/PhotographyGallery.tsx`, `components/PhotoPinModal.tsx`, `app/photography/[slug]/page.tsx`, `config/contentCopy.ts`, `tests/components/PhotographyGallery.test.tsx`, `tests/components/PhotoPinModal.test.tsx`).
- Focused photography detail/gallery tests after photography pass: PASS, 2 files / 23 tests (`PhotographyGallery`, `PhotoPinModal`).
- Focused admin login lint after admin-auth pass: PASS (`app/admin/(auth)/login/page.tsx`, `components/system/AdminPanel.tsx`, `components/system/StatusNote.tsx`, `config/copy/admin.ts`, `tests/admin-login-page.test.tsx`).
- Focused admin login tests after admin-auth pass: PASS, 1 file / 5 tests (`AdminLoginPage`).
- Focused legacy Articles/Content preview lint after adapter pass: PASS (`components/sections/Articles.tsx`, `components/sections/Content.tsx`, `tests/components/sections/Articles.test.tsx`, `tests/components/sections/Content.test.tsx`).
- Focused legacy Articles/Content preview tests after adapter pass: PASS, 2 files / 6 tests.
- Focused ProjectsClient lint after section pass: PASS (`components/sections/ProjectsClient.tsx`, `tests/components/sections/projectsclient.test.tsx`, `tests/components/sections/projects.test.tsx`).
- Focused ProjectsClient tests after section pass: PASS, 2 files / 11 tests.
- Focused ArticlesBrowser/AdminSidebar lint after test-contract pass: PASS (`components/articles/ArticlesBrowser.tsx`, `tests/components/articles/ArticlesBrowser.test.tsx`, `components/admin/AdminSidebar.tsx`, `tests/components/AdminSidebar.test.tsx`).
- Focused ArticlesBrowser/AdminSidebar tests after test-contract pass: PASS, 2 files / 14 tests.
- Focused ShareButton lint after system-token pass: PASS (`components/ShareButton.tsx`, `tests/components/ShareButton.test.tsx`).
- Focused ShareButton tests after system-token pass: PASS, 1 file / 9 tests.
- Focused remaining-test cleanup lint after `CertificationsSection` / `PageBlocks` / `AdminEditor` test-contract pass: PASS (`components/admin/AdminEditor.tsx`, `tests/components/AdminEditor.test.tsx`, `components/PageBlocks.tsx`, `tests/components/PageBlocks.test.tsx`, `components/sections/Certifications.tsx`, `tests/components/sections/certifications.test.tsx`).
- Focused remaining-test cleanup tests after contract pass: PASS, 3 files / 47 tests (`AdminEditor`, `PageBlocks`, `CertificationsSection`).
- `git diff --check` after navbar/about pass: PASS except expected CRLF normalization warnings for the touched tracked admin page files.
- `npm run build`: PASS, 59 static pages generated. Warnings are missing optional env vars and stale Browserslist data.
- Full `npm run lint`: PASS, 0 errors / 33 warnings. Remaining warnings are older unused variables or hook dependency notices in existing components/tests, not blocking errors.
- Full `npm test`: PASS, 90 files / 890 tests. Vitest still prints jsdom `Window.scrollTo()` not-implemented notices from existing tests, but the run exits 0.
- HTTP endpoint check on localhost: `/articles/hello-agents-ch01` returns 200 with canonical and JSON-LD; `/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/feed.xml`, `/feed.json`, and `/.well-known/brand-facts.json` return 200. `/admin` and `/admin/login` return 404 in the current dev server and were blocked by the Browser plugin, so admin browser QA remains unresolved; build output confirms both routes exist.
- Browser QA on `http://localhost:3011`: `/content`, `/articles`, `/photography`, `/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/feed.xml`, `/feed.json`, and `/.well-known/brand-facts.json` all return 200 with no console errors. Mobile checks for `/content`, `/articles`, and `/photography` show no horizontal overflow.
- Browser QA on `http://localhost:3012`: `/links` returns 200 on desktop and mobile, has one H1, two JSON-LD scripts, no console errors, and no horizontal overflow.
- Browser QA on `http://localhost:3013`: `/projects` and `/projects/hermes-notebook` return 200 on desktop and mobile, have expected H1/JSON-LD, no console errors, and no horizontal overflow.
- Browser QA on `http://localhost:3014`: `/projects` and `/projects/hermes-notebook` return 200 on desktop and mobile, have expected H1/JSON-LD, no console errors, and no horizontal overflow after detail-page rewrite.
- Browser QA on existing `http://localhost:3000`: `/`, `/projects`, `/projects/hermes-notebook`, `/articles`, `/articles/hello-agents-ch01`, `/photography`, `/photography/yuan-shui`, `/links`, and `/content` render on desktop with expected H1s and no app runtime errors. Mobile checks for `/`, `/projects`, `/projects/hermes-notebook`, `/articles`, `/photography`, `/links`, and `/content` show no horizontal overflow. Browser blocked `/admin`, `/admin/login`, and text/JSON endpoints with `ERR_BLOCKED_BY_CLIENT`, so those were verified with HTTP where possible.
- Browser QA after `SystemDemoConsole` migration on existing `http://localhost:3000`: `/` desktop and mobile render the expected H1 and system-demo section, no runtime error, one JSON-LD script on desktop, and no mobile horizontal overflow.
- Browser QA after `CasesClient` migration on existing `http://localhost:3000`: `/` desktop and mobile render the expected H1 and cases section, expose six project links plus the `/projects` view-all link on desktop, no runtime error, one JSON-LD script on desktop, and no mobile horizontal overflow.
- Browser plugin timed out while opening a new tab after the `BrandGlyphs` migration. HTTP checks on existing `http://localhost:3000` show `/links` and `/content` return 200 with SVG/currentColor glyph markup, canonical tags, JSON-LD, and no runtime-error marker.
- Browser QA after `ProjectsFilmLayout` migration on existing `http://localhost:3000`: `/projects` desktop and mobile render the project-film H1, archive section, ten project links, one JSON-LD script on desktop, no runtime error, and no mobile horizontal overflow.
- Browser QA after `HeroShowcaseSection` migration on existing `http://localhost:3000`: `/` desktop and mobile render the hero H1, badge, project/archive CTAs, four capability records, no console errors, one JSON-LD script on desktop, no runtime error, and no horizontal overflow.
- Browser QA after `AboutSection` migration on existing `http://localhost:3000`: `/` desktop and mobile render `#about`, positioning statement, four capability records, audience panel, project/link actions, no console errors, no runtime error, and no horizontal overflow.
- Browser QA after case-story building-block migration on existing `http://localhost:3000`: `/projects` desktop and mobile still render the project-film page with story-demo anchor present, one JSON-LD script on desktop, no console errors, no runtime error, and no horizontal overflow. CodeGraph confirms `CaseStoryPlayer` / `FlagshipCaseCard` have no current route caller, so their behavior is covered by focused component tests until they are mounted.
- Browser QA after global navigation migration on existing `http://localhost:3000`: desktop `/` renders the semantic nav with one visible `案例` button; clicking it scrolls to the projects/cases section without route change, no visible Next overlay, no console errors, and no horizontal overflow. Mobile `/` at 390x844 renders the localized hamburger, opens a graphite drawer with `主导航` aria label and menu links, closes via the localized close button with body scroll unlocked, and clicking the `/ #projects` case link closes the drawer and scrolls to the projects section with no console errors or horizontal overflow. One Browser attempt timed out while reattaching to the webview; retry succeeded.
- Browser check after `ExperienceSection` migration on existing `http://localhost:3000`: current homepage DOM does not include `#experience` even though CodeGraph shows the component is available, so live visual QA for Experience is not claimable in the current config. Browser confirmed the rendered homepage has no console errors and no horizontal overflow while listing active sections (`top`, `system-demo`, `case-story-demo`, `about`, `projects`, `certifications`).
- Browser check after `YouTubeSection` migration on existing `http://localhost:3000`: current homepage DOM does not include `#youtube` even though CodeGraph shows `Page` can render `YouTubeSection`, so live visual QA for YouTube is not claimable in the current config. Browser confirmed the rendered homepage has no console errors and no horizontal overflow while listing active sections (`top`, `system-demo`, `case-story-demo`, `about`, `projects`, `certifications`).
- Browser check after `CommandPalette` migration on existing `http://localhost:3000`: current homepage has zero command-palette trigger buttons, matching CodeGraph's no-caller result, so live palette interaction QA is not claimable until it is mounted. Desktop `/` renders the expected H1 and active sections with one JSON-LD script, no console errors, and no horizontal overflow; the empty `nextjs-portal` container is present but contains no overlay text. Mobile `/` at 390x844 renders the expected H1, one visible menu button, no console errors, and no horizontal overflow.
- Browser plugin timed out while reattaching to the webview after the admin photography/sidebar migration, so this pass used build plus HTTP evidence. HTTP checks on existing `http://localhost:3000` show `/` returns 200 with title `fengc – AI Native 构建者` and H1 `AI Native 独立开发者`, `/photography` returns 200 with title `Photography | fengc | fengc` and H1 `摄影`, and `/admin/photography` returns 404 because `ENABLE_ADMIN=true` is not active in the current runtime. Build output confirms `/admin/photography` is still generated as an admin route.
- HTTP checks after admin editor/theme migration on existing `http://localhost:3000`: `/` returns 200, `/robots.txt` returns 200, and `/admin/theme` returns 404 because `ENABLE_ADMIN=true` is not active in the current runtime. Build output confirms `/admin/theme` and the other admin routes are still generated.
- HTTP checks after admin site migration on existing `http://localhost:3000`: `/` returns 200, `/.well-known/brand-facts.json` returns 200, and `/admin/site` returns 404 because `ENABLE_ADMIN=true` is not active in the current runtime. Build output confirms `/admin/site` is still generated.
- HTTP checks after admin dashboard/navbar/about migration on existing `http://localhost:3000`: `/`, `/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/feed.xml`, `/feed.json`, and `/.well-known/brand-facts.json` return 200. `/admin`, `/admin/navbar`, and `/admin/about` return 404 because `ENABLE_ADMIN=true` is not active in the current runtime. Build output confirms all three admin routes are still generated.
- HTTP checks after admin pages migration on existing `http://localhost:3000`: `/`, `/sitemap.xml`, `/llms.txt`, and `/.well-known/brand-facts.json` return 200. `/admin/pages` returns 404 because `ENABLE_ADMIN=true` is not active in the current runtime. Build output confirms `/admin/pages` is still generated.
- HTTP checks after `PageBlocks` migration on existing `http://localhost:3000`: `/`, `/sitemap.xml`, `/llms.txt`, `/feed.xml`, `/feed.json`, and `/.well-known/brand-facts.json` return 200. `npm run build` still generates `/page/[slug]` successfully; current `config/pages.json` has no custom pages to browse directly.
- HTTP checks after `CertificationsSection` migration on existing `http://localhost:3000`: `/`, `/sitemap.xml`, `/llms.txt`, `/feed.xml`, `/feed.json`, and `/.well-known/brand-facts.json` return 200. Build still generates 59 pages.
- Browser QA after MDX rendering migration on existing `http://localhost:3000`: `/articles` and `/articles/hello-agents-ch01` return 200 on desktop and mobile, have expected H1s, canonical tags, JSON-LD, no console errors, no horizontal overflow, and no DOM classes matching the MDX visual residues removed in this pass. The current repo has no `.md` or `.mdx` article source files to exercise an actual rendered MDX code block, so component-level coverage is lint/build plus route DOM checks until such content is added.
- HTTP checks after FeaturedCasesCarousel migration on existing `http://localhost:3000`: `/projects`, `/projects/hermes-notebook`, `/sitemap.xml`, `/llms.txt`, and `/.well-known/brand-facts.json` return 200. `npm run build` still generates 59 pages. CodeGraph reports the carousel has no current page callers, so this pass is verified by focused lint, audit, build, and route health rather than live carousel interaction.
- HTTP checks after DemoTimeline migration on existing `http://localhost:3000`: `/`, `/projects`, `/projects/hermes-notebook`, `/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/feed.xml`, `/feed.json`, and `/.well-known/brand-facts.json` return 200. `npm run build` still generates 59 pages with only optional environment and Browserslist warnings.
- Browser QA after `ContentMediaSection` migration on existing `http://localhost:3000`: `/` returns 200 on desktop and mobile, keeps the expected H1, one JSON-LD script, and no horizontal overflow. The current runtime did not render `#content` because the section hides when the YouTube feed returns no videos, so visible content-media QA is covered by focused component tests until feed data is present. Browser console still reports existing 500 resource errors on `/`, not attributed to this section migration.
- Browser QA after `EducationSection` migration on existing `http://localhost:3000`: `/` returns 200 on desktop and mobile, keeps the expected H1, one JSON-LD script, and no horizontal overflow. The current runtime did not render `#education` because `config/education.json` is an empty array, so visible education-card QA is covered by focused component tests until education data is present. Browser console still reports existing 500 resource errors on `/`, not attributed to this section migration.
- Browser QA after photography detail/gallery migration on existing `http://localhost:3000`: `/photography` and `/photography/yuan-shui` return 200 on desktop and mobile, have expected H1s (`摄影`, `沅水`), canonical tags, two JSON-LD scripts, no console errors, no horizontal overflow, and the detail gallery renders two semantic `article.break-inside-avoid` cards. Whole-page DOM still contains global `bg-card` / `border-white/10` residues from other components, but the gallery subtree has no `rounded-2xl`, `bg-card`, `border-white/10`, or `bg-white/5` residue and does contain `rounded-card` / `bg-surface-paper-elevated`. `/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/feed.xml`, `/feed.json`, and `/.well-known/brand-facts.json` return 200.
- Admin login QA after admin-auth migration: focused jsdom tests verify visible shell copy, disabled empty-password submit state, password POST payload, default `/admin` redirect, redirect query handling, API error rendering, and network error rendering. Existing `http://localhost:3000` still returns 404 for `/admin/login` because the running dev server was started without `ENABLE_ADMIN=true`; a temporary same-directory dev server on another port could not stay up because Next detected the existing dev server. Build output confirms `/admin/login` is generated. Public HTTP checks on existing `http://localhost:3000` return 200 for `/`, `/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/feed.xml`, `/feed.json`, and `/.well-known/brand-facts.json`.
- Legacy preview adapter QA after Articles/Content pass: focused tests verify the compatibility exports still render article previews, content/social links, YouTube thumbnail URL, fixed platform glyphs, and system-surface classes while avoiding old template residue. Existing `http://localhost:3000` returns 200 for `/`, `/articles`, `/content`, `/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/feed.xml`, `/feed.json`, and `/.well-known/brand-facts.json`. These adapters are not mounted on current routes, so Browser visual QA remains route-level for `/articles` and `/content` rather than claiming visible homepage sections.
- Browser QA after `ProjectsClient` migration on existing `http://localhost:3000`: `/` and `/projects` render on desktop and mobile with expected H1s and no horizontal overflow. The homepage `#projects` subtree has no `bg-card`, `rounded-md`, or `github.com/hunger-Eric` residue, and the internal `/projects` archive action is present. Browser console still reports the previously observed 500 resource errors on `/`, not attributed to this section migration.
- Browser QA after lint/runtime cleanup on existing `http://localhost:3000`: `/`, `/projects`, `/projects/hermes-notebook`, `/articles`, `/articles/hello-agents-ch01`, `/photography`, `/photography/yuan-shui`, `/links`, and `/content` render on desktop and 390px mobile with expected H1s, canonical tags, JSON-LD where applicable, no framework overlay, no console errors, and no horizontal overflow.
- HTTP crawler endpoint check after lint/runtime cleanup on existing `http://localhost:3000`: `/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/feed.xml`, `/feed.json`, and `/.well-known/brand-facts.json` return 200. `robots.txt` blocks `/admin`; sitemap and `llms.txt` include projects/articles/photography signals; brand facts include `fengc`.
- `npm run audit:architecture` after token/audit cleanup: PASS. Total report counts are 157 hardcoded hex, 20 visual residue, 10 locale branch; actionable UI debt is now 8 hardcoded hex, 14 visual residue, 9 locale branch.
- Focused Publications/System/OG/theme lint after token/audit cleanup: PASS (`components/ThemeToggle.tsx`, `config/copy/theme.ts`, `app/api/og/route.tsx`, `config/ogTheme.ts`, `config/caseTheme.ts`, `config/caseStories.ts`, `components/sections/Publications.tsx`, `components/system/Surface.tsx`, `scripts/audit-site-architecture.mjs`).
- Focused Publications tests after section migration: PASS, 1 file / 17 tests.
- `npm run build` after token/audit cleanup: PASS, 59 pages generated. Warnings are missing optional env vars and stale Browserslist data.
- Browser QA after token/audit cleanup on existing `http://localhost:3000`: `/`, `/projects`, `/projects/hermes-notebook`, `/articles`, `/photography`, `/links`, and `/content` render on desktop and 390px mobile with expected H1s, canonical tags, JSON-LD where applicable, no framework overlay, no console errors, and no horizontal overflow.
- HTTP OG check after token/audit cleanup: `/api/og?title=fengc&subtitle=AI%20Native&theme=dark` and `theme=light` return 200 `image/png`.

## Verification Commands

Browser QA targets:

- `/`
- `/projects`
- `/projects/hermes-notebook`
- `/articles`
- article detail
- `/photography`
- photography detail
- `/links`
- `/content`
- `/admin`
- `/robots.txt`
- `/sitemap.xml`
- `/llms.txt`
- `/feed.xml`
- `/feed.json`
- `/.well-known/brand-facts.json`
