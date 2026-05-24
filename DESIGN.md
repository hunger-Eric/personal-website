# Personal Website Design System

Version: 1.0
Owner: personal-website
Goal: unify the site into a light, quiet, editorial workbench with photography-page clarity.

## 1. Design Intent

This site should feel like a calm personal workbench with a strong visual rhythm:

- light and breathable, but not empty
- content-first, not marketing-first
- expressive where images matter, restrained where text matters
- consistent across home, articles, projects, photography, and admin

The target blend is:

- B: light editor/workbench
- C: photography / gallery / notebook atmosphere

The site should avoid:

- dark, heavy, over-layered cards
- mixed visual languages on adjacent sections
- repeated content blocks that show the same information twice
- ad-hoc component-specific colors that bypass the system

## 2. Core Principles

1. One source of truth for content and locale.
2. One token set for color, spacing, radius, and elevation.
3. One card grammar for content surfaces.
4. One gallery grammar for visual collections.
5. One modal/lightbox grammar for large media.
6. Keep page sections readable without decorative noise.
7. Prefer density with order over density with clutter.

## 3. Visual Tokens

### Color

Use semantic tokens only:

- `background`
- `foreground`
- `card`
- `muted`
- `border`
- `accent`
- `accent-foreground`
- `destructive`
- `success`
- `warning`

Rules:

- accent color may vary by theme, but the page must still read as one palette
- avoid hard-coded `indigo`, `amber`, `sky`, or `slate` except for small semantic badges and charts when mapped through tokens
- all text and controls must remain legible in both locales and both themes

### Typography

- page titles: large, heavy, but not oversized
- section titles: compact, monospace or uppercase only where it helps scanning
- body: medium weight, regular line height, no decorative tracking inflation
- labels and metadata: small, muted, consistent

Rules:

- do not scale font size by viewport width
- avoid negative letter spacing
- use line-clamp for summaries where needed

### Spacing

- page vertical rhythm: generous but not loose
- section padding: consistent across home/article/photo/admin pages
- cards: internal padding should be stable and predictable

Rules:

- no giant empty hero blocks unless a section is intentionally image-led
- no nested page cards inside page cards
- keep repeated lists aligned to a shared grid

### Radius and Elevation

- preferred radius: `rounded-xl` to `rounded-2xl`
- avoid extreme pill usage except for badges and compact controls
- shadows should be subtle and reserved for hover or floating overlays

Rules:

- cards must never feel like dark slabs
- hover should be lift + border change, not glow explosion

### Icons

- use Lucide icons in controls and navigation where available
- icon-only controls must have tooltips or accessible labels
- avoid decorative icons without purpose

## 4. Information Architecture

### Content Sources

The site content should be normalized into a shared model:

- `site`
- `nav`
- `about`
- `projects`
- `articles`
- `photography`
- `admin`

Each section should consume a view model rather than reading raw config fragments directly.

### Locale Rules

- locale state is global
- all visible UI copy must resolve from the locale dictionary or a locale-aware model
- proper nouns stay proper nouns
- translated labels should not be mixed on the same navigation row

Examples:

- zh nav: `关于 / 项目 / 文章 / 摄影`
- en nav: `About / Projects / Articles / Photography`
- zh article intro, project button labels, about copy, and admin labels should all follow zh together

## 5. Page Patterns

### Home

Home should read as a compact workbench:

- hero: short identity + concise intro
- contribution graph: useful, not dominant
- about: readable overview card
- projects: featured visual card + compact supporting list
- articles: short list with tags/categories

Rules:

- no duplicate featured content blocks
- no competing hero blocks
- keep the first viewport calm

### Articles

Articles should follow the photography-page clarity:

- centered title and short description
- cards grouped by category
- category tag visible on each card
- same-category items appear together

Rules:

- no oversized editorial hero card
- no huge repeated feature section
- categories should be stable and obvious

### Photography

Photography is the most image-led section:

- cover cards should feel like curated album entrances
- first cover can auto-compose from the first few photos
- detail page should show a large gallery grid
- lightbox must support large viewing and previous/next navigation

Rules:

- preserve original image quality
- gallery browsing should feel like a sequence, not isolated popups
- private-photo access remains PIN gated

### Projects

Projects should be visually concise:

- featured project can be showcased once
- supporting project content should not repeat the same card structure unnecessarily
- titles, metadata, and actions should be compact and consistent

Rules:

- keep featured area readable
- avoid stacked layers competing with the project title
- project CTAs should be icon-led and short

### Admin

Admin should feel like a workbench, not a product landing page:

- dense, structured, and readable
- stable grids and forms
- explicit actions and predictable save states

Rules:

- upload, reorder, edit, and save must map clearly to the underlying data model
- visual language should stay quiet and functional

## 6. Component Contracts

### Shared Section Shell

Use a shared section shell for:

- heading
- optional icon
- short description
- content area

This shell must be reused across home, articles, and photography entry pages.

### Shared Card

Use one card grammar for content items:

- border + card background
- clear image region or content region
- title
- summary
- metadata row

### Shared Gallery Item

Use one gallery item grammar for photography:

- image first
- badge overlays only when needed
- metadata below image
- consistent aspect ratios

### Shared Modal / Lightbox

Use one modal grammar for all large-media overlays:

- dark scrim
- large centered content
- clear close affordance
- next/previous when browsing a sequence

## 7. Data Flow

### Rule

UI should not assemble page logic from raw fragments in many places.

### Required Flow

Content files/config
-> normalized model builder
-> locale-aware view model
-> page sections
-> shared components

### Benefits

- fewer mixed-language bugs
- fewer duplicate visual states
- easier admin editing
- easier future refactors

## 8. Photography Data Rules

- uploaded images keep original bytes
- generated cover images may be composed from existing photos, but originals stay untouched
- display code may optimize presentation, but not reduce image fidelity
- ordering is part of the data model, not the render layer
- lightbox navigation uses the ordered gallery list

## 9. Articles Data Rules

- article cards must include category or tag context
- cards are grouped by category on index pages
- detail pages can use larger imagery, but should not overwhelm the reading flow

## 10. Migration Strategy

Phase 1:

- unify locale-driven copy across nav, about, projects, articles, and photography
- simplify duplicate sections on home

Phase 2:

- extract shared section/card/gallery/lightbox components
- normalize project and article card data shapes

Phase 3:

- refactor admin photography into a clear ordered album editor
- preserve raw uploads and ordering metadata

Phase 4:

- clean up remaining hard-coded palette and spacing outliers
- verify both desktop and mobile screenshots

## 11. Acceptance Criteria

The redesign is done when:

- zh mode and en mode read as complete, not partial
- homepage feels calm on first view
- projects no longer show repeated or conflicting visual blocks
- article index groups items cleanly by category
- photography cards and lightbox feel like a coherent gallery system
- uploads keep original image fidelity
- admin edits map clearly to data order and content

