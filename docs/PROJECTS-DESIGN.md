# Projects Page Design

## Goal

`/projects` explains the work through a single interactive stage. Visitors should see how a system receives input, processes it, and produces an artifact they can understand.

## Current Direction

- The first screen is a project film stage, not a card wall.
- React owns controls, chapter switching, accessible text, and artifact state.
- HyperFrames-style HTML compositions provide the visual motion layer.
- Archive/filter content sits below the stage as a quieter index.
- The UI must not expose internal brief wording such as "abstract model" or "public version".

## Film Cases

### Hermes Notebook

- Start: scattered files and notes.
- Motion: documents flow into semantic nodes, then resolve into a cited knowledge card.
- Artifact: traceable knowledge card.
- Asset: `public/animations/projects/hermes/index.html`.

### Freight Lead Agent

- Start: market, profile, keywords, and region.
- Motion: public-source nodes connect into evidence, then resolve into a scored lead table.
- Artifact: auditable lead batch.
- Asset: `public/animations/projects/freight/index.html`.

### Element Asset SDK

- Start: a UI button, table, form field, or export entry.
- Motion: a UI element is captured, validated, and packaged into an SDK call.
- Artifact: reusable UI asset.
- Asset: `public/animations/projects/element-sdk/index.html`.

## Interface Rules

- Main stage has a chapter rail, animation viewport, step controls, and artifact panel.
- Controls: play/pause, next, replay, and direct chapter selection.
- `prefers-reduced-motion` disables autoplay and shows the static HTML fallback.
- Animations communicate system state only: input, processing, evidence, artifact.
- No purple/blue AI gradients, floating decorative blobs, or random motion.
- Core copy stays in HTML/React, so the page remains readable if animation assets fail.

## Unified Presentation Style

- The React stage and the embedded animation assets must feel like one surface.
- Use the same system palette across the full demo: graphite canvas, warm paper text, amber accent, low-contrast hairlines, and dark panel surfaces.
- Chapter rail, controls, step buttons, artifact panel, and iframe animations must share border weight, radius, typography rhythm, and status accent behavior.
- Do not mix a light outer shell with dark animation assets, or otherwise make the demo look like separate modules pasted together.
- Archive/filter content stays visually quieter than the film stage and should not introduce a competing palette.
- The same warm paper / graphite / amber system must also appear on the homepage demo console, case detail hero, and `/links` contact card.
- The main animation viewport should be the visual center. Chapter navigation is secondary and should never dominate mobile first viewports.
- Contact and archive surfaces should not introduce blue, purple, or separate mobile-card aesthetics.

## Customer-Legible Storytelling

- The first read is capability and artifact, not technology.
- Every case should answer: what input goes in, what the system does, what artifact comes out, and where the pattern transfers.
- Detail pages keep implementation specifics as an appendix. The top narrative uses customer language.
- Animation labels can include concise English system terms, but Chinese visitors must still understand the flow through nearby Chinese HTML overlays or bilingual asset labels.

## Data Model Additions

`CaseItem.customerStory` may include:

- `animationSrc`
- `posterSrc`
- `sceneAccent`
- `chapterTitle`
- `shortPromise`

## Acceptance Criteria

- `/projects` first viewport feels like one designed stage.
- The page does not render internal brief wording.
- Switching chapters changes title, animation source, active step, and artifact preview.
- Detail pages reuse the single-case stage.
- Browser QA checks desktop and mobile for readable text, no overlap, and working controls.
- Mobile `/projects` shows the animated stage and artifact before the full chapter copy.
- HyperFrames `lint`, `inspect`, and `validate` produce no errors for all three project animations.
- `/`, `/projects`, `/projects/hermes-notebook`, and `/links` screenshots read as one site.
