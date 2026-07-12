# Personal Website Project State

Last updated: 2026-07-12

## Current Goal

Redesign the public site from an AI Native personal archive into an enterprise-facing, AI-readable customer acquisition site.

The site should help owners and operations leaders at small and medium businesses recognize a repetitive workflow problem, understand the custom diagnosis-and-delivery method, inspect source-grounded project evidence, and submit the workflow for a possible 30-minute initial diagnosis.

The approved design is documented in [`docs/superpowers/specs/2026-07-12-enterprise-ai-readable-website-redesign-design.md`](superpowers/specs/2026-07-12-enterprise-ai-readable-website-redesign-design.md). The detailed execution sequence is documented in [`docs/superpowers/plans/2026-07-12-enterprise-ai-readable-website-redesign.md`](superpowers/plans/2026-07-12-enterprise-ai-readable-website-redesign.md). No redesign implementation has started yet.

## Approved Product Boundaries

- Sell a transferable workflow diagnosis and AI automation delivery method, not fixed industry templates.
- Use real projects as evidence of different kinds of complexity; do not let a project's vertical define the complete service.
- Source every published case from current GitHub README, design, state, decision, architecture, and validation documents.
- Private repositories may only contribute manually reviewed high-level public facts. Do not publish private repository links, raw documents, client identities, internal paths, or sensitive data.
- Human pages and AI outputs must use one reviewed structured content source.
- Preserve the approved warm ivory / graphite / caramel amber visual system and the guided problem-recognition + case-theatre experience.
- Do not publish invented metrics, client logos, testimonials, customer names, or unsupported outcomes.

## Target Public Information Architecture

Keep and rebuild:

- `/`
- `/projects`
- `/projects/[id]`
- `/contact`
- `/about`
- `/articles` only for original, relevant AI/automation/business-process content

Retire from the public site:

- `/photography` and photography detail routes
- `/content`
- `/resume`
- unused custom `/page/[slug]` routes
- homepage education, certifications, contribution graph, media aggregation, and generic social sections
- `/links` as a standalone surface; redirect it to `/contact`

Required machine-readable surfaces:

- `/llms.txt`
- `/.well-known/brand-facts.json`
- `/ai/services.json`
- `/ai/projects.json`
- `/ai/projects/[id].json`
- sitemap, metadata, and JSON-LD generated from the same reviewed facts

## Current Architecture

- Next.js 16 App Router with React 19 and Tailwind.
- `app/` owns routes and should remain thin.
- `config/` owns locale-aware public content models.
- `components/system/` owns shared public/admin primitives.
- `components/motion/` owns reduced-motion and reusable motion policies.
- `lib/ai-readable/routes.ts` owns the current crawler inventory.
- `DESIGN.md` is the existing visual-system source and must be updated during implementation to match the approved enterprise direction.
- Existing CaseFilm/HyperFrame/artifact components are reusable, but their current copy is not an approved project fact source.

## Current Evidence

- CodeGraph: 301 files, 3,663 nodes, 5,879 edges; index reported current on 2026-07-12.
- `npm run audit:architecture`: passes; 297 files scanned and no actionable architecture debt reported by the current audit.
- `npm run lint`: 0 errors and 28 warnings.
- `npm test`: 90 files and 891 tests pass.
- `npm run build`: passes and generates 52 pages, but the build currently skips type errors.
- `npx tsc --noEmit`: fails with 163 errors; 24 are in non-test source files.
- `npm audit --omit=dev`: reports one high-severity direct Next.js vulnerability group and five moderate production dependency findings, with fixes available.
- Browser audit at desktop and 390px mobile widths found no horizontal overflow.
- Current `/links` is hard-coded to English and is a social link page rather than a business consultation flow.
- Current `llms.txt` still describes the old independent-developer/archive positioning and includes photography/content routes.
- `/.well-known/brand-facts.json` is advertised by route inventory and tests but is not an actual built route.

## Project Source Audit

GitHub inventory on 2026-07-12 found 16 recent candidate repositories with usable README/design/state documentation across enterprise automation, knowledge systems, AI visibility, creative production, agent runtime, and data processing.

The public website must not mirror all repositories. Before a project becomes a case:

1. Read its current source documents.
2. Reconcile docs with runtime or validation evidence.
3. Extract a public fact candidate.
4. Review privacy and disclosure boundaries.
5. Publish only approved facts into the public case model.

Private source identifiers and raw fetched content must stay in ignored local review artifacts, not in the public website repository.

## Known Existing Worktree State

The branch was `main...origin/main [ahead 3]` when this design phase started.

Pre-existing untracked paths that are unrelated to this redesign and must not be overwritten:

- `.codegraph/`
- `scripts/sync_feishu_progress.py`

## Immediate Next Step

The user reviews the detailed implementation plan. After approval, implementation begins with dependency/type-gate repair and the GitHub project-source audit before writing public case copy.

## Verification Commands

```bash
npm run audit:architecture
npm run lint
npx tsc --noEmit
npm test
npm run build
```

Browser acceptance must cover desktop and 390px mobile for:

- homepage problem recognition and CTAs
- case theatre fallback and interaction
- project index and detail facts
- contact validation, success, failure, and retry
- all machine-readable routes
- retired-route redirects and sitemap cleanup
