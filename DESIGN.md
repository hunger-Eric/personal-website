# Enterprise AI Automation Website Design System

Version: 3.0
Owner: personal-website
Goal: help a small-business owner or operations lead recognize a workflow problem, understand the delivery method, inspect real evidence, and submit the workflow for screening.

## Positioning

The public site sells a transferable diagnosis-and-delivery method, not a fixed vertical template. Projects are evidence of system capabilities; they must never imply that another customer needs the same business logic.

Every public claim must come from the reviewed content model. Do not invent metrics, customer identities, logos, testimonials, or outcomes.

## Visual direction

The public surface uses one restrained system:

- warm ivory paper: `#F3EFE6`
- graphite: `#171916`
- caramel amber: `#C47A18`
- warm hairlines, compact mono labels, strong editorial headings
- square or lightly rounded geometry; no decorative gradient, neon, glass, or random project color

Use asymmetric grids on desktop and one-column flow on mobile. Prefer process maps, evidence rails, tabs, metadata and grouped sections over long article-like stacks of identical cards.

Real project interfaces and reviewed case films are the primary visual evidence. Do not replace them with generic AI imagery, fake dashboards, CSS drawings, or invented screenshots.

## Public journey

1. `/` — recognize a problem, understand system takeover, inspect evidence, see the method.
2. `/projects` — compare reviewed public cases without exposing private sources.
3. `/projects/[id]` — inspect workflow, human boundary, outputs, recovery and limitations.
4. `/contact` — submit a concrete workflow for human screening and a possible 30-minute diagnosis.
5. `/about` — understand suitable work, boundaries and delivery method.

Navigation must keep this decision path visible. Photography, resume, generic social links, custom pages and media aggregation are not public navigation surfaces.

## Shared content contract

Human pages, metadata, JSON-LD, sitemap, `llms.txt`, `brand-facts.json`, and `/ai/*.json` must derive from the same reviewed sources:

- `config/public-identity.ts`
- `config/service-method.ts`
- `config/public-project-cases.json`
- `config/public-content.ts`

Locale-specific leaf components should be progressively moved into this resolver layer. Public project data may only enter `public-project-cases.json` after privacy review.

## Interaction rules

- Problem-signal selectors must update the visible workflow model.
- Case-theatre tabs must reveal meaningful states, not decorative panels.
- Mobile navigation stays open until the visitor closes it, chooses a route, or presses Escape; scrolling alone must not dismiss it.
- Contact submission must expose validation, sending, success and retry/error states.
- Reduced-motion preferences must disable non-essential movement.

## Security and privacy boundaries

- Admin routes are local-development only and fail closed in production.
- Contact submissions are size-limited, same-origin checked, honeypot checked, rate-limited and validated before email delivery.
- Private repository identifiers, raw evidence documents, customer identities and internal paths never enter public bundles.
- Retired photography authentication and photo APIs must not remain in the production route table.

## Acceptance

- `npm run projects:evidence:audit`
- `npm run audit:architecture`
- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`
- desktop and 390px mobile browser QA against the approved target image
- console/error-overlay check and primary CTA, tab, navigation and form-state interaction checks
