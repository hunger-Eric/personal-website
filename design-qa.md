# Design QA — four project journey demos

## Scope and state

- Route: `http://127.0.0.1:3109/#project-journeys`
- Implementation: `components/home/ProjectJourneys.tsx` and `components/home/ProjectJourneys.module.css`
- Reference: `C:\Users\fengc\.codex\generated_images\01a00036-7813-7aa3-88a8-8d91100a3aa6\exec-e4f0a29b-0ceb-4e21-9bd6-7735ba479382.png`
- Final implementation capture: `G:\UserCaches\Temp\personal-website-remotion-preview\project-journeys-qa-desktop-v2.png`
- Direct comparison: `G:\UserCaches\Temp\personal-website-remotion-preview\project-journeys-design-comparison-v2.png`
- Desktop viewport: 1938 × 814 CSS px; Chinese locale; Codex Feishu Bridge selected; step 4 of 4.
- Mobile viewport: 390 × 844 CSS px; document client width and scroll width both 375 px.

## Full-view comparison

The combined comparison places the provided design reference and the final browser render in one image. The implementation preserves the reference hierarchy: graphite section, amber eyebrow, large editorial headline, four-project rail, orange active state, four workflow cards, directional arrows, progress controls, and a final project-detail action. It also retains the website's existing navigation and typography so the new section belongs to the current homepage rather than looking like a separate microsite.

The final layout uses the same information density and one-screen desktop composition as the reference. Card borders, icon scale, active-step contrast, and spacing are legible without introducing decorative assets or visual clutter.

## Focused interaction comparison

- Open GEO Console exposes both the live product URL and its interactive simulation route.
- Hermes Notebook renders its own Remotion workflow beginning with “导入分散资料”.
- Freight Lead Agent renders its own Remotion workflow beginning with “Google 地图发现企业”.
- Codex Feishu Bridge renders its own Remotion workflow beginning with “手机飞书提交任务”.
- Every workflow has four independently seekable steps and play/pause control.
- The three Remotion workflows use real project-specific copy rather than one reused generic animation.

## Responsive and runtime evidence

- All four project tabs were opened in the Codex in-app browser and each displayed its expected first-step heading.
- Open GEO links resolve to `https://geo.itheheda.online` and `/projects/open-geo-console#open-geo-demo`.
- Mobile width check: `scrollWidth === clientWidth === 375`; no horizontal overflow.
- All four project tabs remain visible and selectable at 390 × 844.
- Browser console warnings and errors: none.
- Reduced-motion preference pauses the Remotion player.

## Iteration history

1. Added the four-project rail and project-specific journey data.
2. Reduced vertical density so the heading, selector, workflow, and controls fit together on desktop.
3. Added a compact 2 × 2 mobile composition to avoid compressed horizontal cards.
4. Kept Open GEO as a real product/simulation gateway while giving the other three projects independent Remotion workflows.
5. Added directional arrows between desktop workflow cards and reran the visual comparison.

## Findings

- P0: none.
- P1: none.
- P2: none.
- Expected integration difference: the production website navigation remains above the section; the reference was a section-only concept.

## Final result

passed
