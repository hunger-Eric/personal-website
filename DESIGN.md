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
