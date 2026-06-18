# Personal Website Design System

Version: 2.0
Owner: personal-website
Goal: present the site as an AI Native Lab: a quiet system archive for AI workflow, automation, knowledge systems, and AI-assisted development.

## 1. Strategic Positioning

This site is not a traditional frontend portfolio. It should make one idea clear:

> fengc designs and builds AI Native systems, not just user interfaces.

The homepage, About section, and case system should communicate:

- AI workflow engineering
- automation systems
- system thinking
- multi-model collaboration
- AI-assisted development
- long-term scalable architecture

Avoid resume-like framing such as "I know React" or "frontend / backend / UI design". The valuable outcome is that AI, automation, content, systems, and workflows become something real and runnable.

## 2. Visual Direction

The site should feel like:

- AI lab
- independent research studio
- system notebook
- editorial tech archive

The visual language is clean, restrained, and information-dense. It should feel like a system design archive, not a Dribbble portfolio.

Unified public surface language:

- Homepage, `/projects`, case detail pages, and `/links` must feel like one AI Native Lab system, not separate templates.
- Use warm paper backgrounds, graphite panels, restrained amber accents, low-contrast hairlines, compact mono labels, and quiet system-status controls.
- Avoid cool blue contact-page treatments, isolated dark demo blocks inside unrelated light shells, or sudden palette shifts between sections.
- Interactive demos may use dark graphite canvases, but the surrounding page must share the same accent, border rhythm, button geometry, and typography cadence.

Avoid:

- heavy animation
- neon AI gradients
- over-polished landing-page sections
- large hover effects
- generic three-card feature rows
- technology lists as the main value proposition

## 3. Tokens And UI Rules

Use semantic tokens only:

- `background`
- `foreground`
- `card`
- `muted`
- `border`
- `accent`
- `accent-foreground`
- `success`
- `warning`
- `destructive`

Project semantic token families:

- `surface.paper`, `surface.paper-elevated`, `surface.paper-foreground`
- `surface.graphite`, `surface.graphite-muted`, `surface.graphite-foreground`
- `surface.admin`
- `border.hairline`, `border.inverse`
- `radius.card`, `radius.control`, `radius.panel`
- `shadow.card`, `shadow.overlay`

Typography:

- display titles are confident, not oversized
- section labels can use mono / uppercase for archive feeling
- body copy should be direct and concrete
- metadata should be compact and scannable

Layout:

- use asymmetric grids on desktop, single column on mobile
- prefer lines, tabs, metadata rows, and grouped sections over stacked marketing cards
- cards are used for individual records only
- page sections are not nested inside card shells

Motion:

- use low-intensity CSS transitions only
- no heavy scroll animation
- no decorative motion loops
- main Next.js app should not import GSAP by default
- GSAP belongs in HyperFrames/iframe animation assets unless a page has a concrete motion requirement
- shared motion policy lives in `components/motion/*`
- `prefers-reduced-motion` must disable autoplay, progress transitions, page fades, marquee loops, skeleton shimmer, and iframe animation loading when a static fallback is available

## 4. Information Architecture

Content should flow through normalized models:

`config -> model builder -> locale-aware view model -> page sections -> shared components`

Primary content models:

- `site`
- `nav`
- `about`
- `cases`
- `articles`
- `photography`
- `admin`

Locale rules:

- all visible UI copy comes from a locale-aware source
- proper nouns stay proper nouns
- Chinese and English should never mix on the same navigation row except product/tool names
- `locale === "zh"` belongs in resolver/model-builder layers, not leaf UI components

Reusable UI boundaries:

- `components/system/*` owns public/admin UI primitives such as `PageShell`, `SectionHeader`, `Surface`, `ArchiveCard`, `ActionButton`, `IconButton`, `StatusNote`, `EmptyState`, `FormField`, and `AdminPanel`
- `components/motion/*` owns reduced-motion, in-view playback, autoplay step, and progress primitives
- `lib/ai-readable/routes.ts` owns the canonical public route inventory for sitemap and `llms.txt`
- page-private cards, buttons, forms, and surfaces should be temporary only; extract them once they repeat or become part of public/admin chrome

## 5. Homepage Pattern

Homepage sections:

1. Hero
   - primary identity: AI Native Independent Developer / AI Native System Builder
   - concise promise: build AI-powered systems, workflows, and digital products
   - no resume-style technology list

2. What I Build
   - AI Workflow Engineering
   - Automation Systems
   - Knowledge & RAG Systems
   - AI-assisted Creative Production

3. About Thesis
   - explain that the work is about organizing AI into long-term workflows and product systems
   - mention personal and small-team use cases without sounding like sales copy

4. Lab Index / Casebook / System Archive
   - cases are shown as system records
   - expose workflow, AI stack, automation level, status, and tags
   - do not rely on screenshots as the primary proof

5. Articles and Photography
   - keep the existing editorial and gallery clarity

## 6. Case System

Cases are system design records, not project thumbnails.

Each case supports:

- `featured`
- `archive`
- `tags`
- `workflows`
- `aiStack`
- `automation`
- `experiments`
- `role`
- `status`
- `problem`
- `systemOverview`
- `aiOrchestration`
- `architecture`
- `results`
- `learnings`

Case detail page structure:

1. Hero: name, one-line description, role, stack, status
2. Problem: what problem this system solves
3. System Overview: structure, workflow, AI orchestration
4. Workflow: how AI participates, multi-model collaboration, automation flow
5. Architecture: Docker, API, RAG, knowledge system, automation
6. Results: MVP, efficiency, automation effect, scalability
7. Learnings: system design and AI Native workflow thinking

Homepage case behavior:

- with few cases, show a featured lab note plus a compact index
- when cases grow beyond the configured threshold, switch to catalog/index mode
- catalog mode groups by tags, workflows, AI stack, and status rather than only by date

Interactive case demo style:

- Project demos should read as one integrated system surface, not a stack of unrelated modules.
- The React controls, chapter rail, artifact panel, and embedded animation assets must share the same palette and UI language.
- Use graphite canvas, warm paper text, restrained amber accent, fine hairline borders, compact mono labels, and dark panel surfaces for film-style demos.
- Avoid mixing a light outer shell with dark animation assets, or any palette shift that makes the page feel stitched together.
- Archive/filter areas are appendix surfaces and should stay visually quieter than the main demo stage.
- Mobile demos must show the animation/artifact before long explanatory rails; navigation compresses into tabs or segmented controls.
- Case detail pages should lead with problem, system takeover, client artifact, and transferability. Technical implementation details belong in a quieter appendix.
- Animation assets must pass HyperFrames lint, inspect, and validate checks before handoff unless a warning is intentionally documented.

## 7. Admin Direction

Admin remains a quiet workbench:

- dense, structured, readable
- explicit save states
- predictable forms
- case display strategy should be configurable over time

When case management is expanded, it should edit the same case model used by the frontend.

## 8. Quality Bar

Before shipping:

- build must pass
- desktop and mobile layouts must not overflow
- Chinese and English copy must stay synchronized
- hero and about must not repeat the same sentence
- cases must communicate system thinking, not only UI polish

## 9. Anti-Patch Rules

Do not solve design drift by adding another page-local card, button, surface, status banner, or color value. First check whether the change belongs in:

- `DESIGN.md`
- CSS/Tailwind semantic tokens
- `components/system/*`
- `components/motion/*`
- `config/contentCopy.ts` or `config/copy/*`
- `lib/ai-readable/*`

Avoid these as default implementation language:

- raw warm-paper or graphite hex values in page components
- `border-white/10`
- `bg-white/5`
- unqualified `bg-card` on public archive surfaces
- `rounded-2xl` for normal cards or controls
- page-local save/error/deploy/admin status copy
- leaf-level `locale === "zh" ? ... : ...`
