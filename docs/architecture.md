# Personal Website Architecture

This repository is organized around a small number of stable layers so the
site can evolve without every feature turning into a one-off component.

## 1. App routes

The `app/` directory is the public surface area.

- `app/page.tsx` renders the homepage.
- `app/articles/` handles article index and article detail pages.
- `app/projects/` handles project index and project detail pages.
- `app/photography/` handles photography index, album pages, and photo viewing.
- `app/links/` is a standalone link hub with its own layout.
- `app/admin/` contains the private editorial/admin workspace.
- `app/api/` contains server endpoints for auth, saves, deploy state, photos,
  view counts, social data, and utility metadata.

Each route should stay thin: it should assemble data and choose layout, not
rebuild domain logic inline.

## 2. Content model

The site keeps most visible copy and navigation labels in config-driven
modules under `config/`.

- `config/site.json` and `config/siteConfig.ts` define core site identity.
- `config/locale.ts` defines shared navigation labels and locale flags.
- `config/contentCopy.ts` defines locale-aware page copy for the hero, about,
  projects, articles, and photography surfaces.
- `config/articles.json`, `config/projects.json`, `config/photography.json`,
  and related typed helpers provide structured data for those sections.

The goal is to keep visible text and page metadata flowing from a shared model
instead of scattering hardcoded strings across components.

## 3. UI composition

Reusable UI lives in `components/`.

- `components/sections/` contains the homepage sections.
- `components/articles/` contains article cards, browsers, and page clients.
- `components/projects/` contains project cards, browsers, and page clients.
- `components/photography/` contains the photography index client.
- `components/admin/` contains the admin shell and editors.

These components should stay presentational or lightly stateful. They should
receive data and callbacks, then render the UI with the shared design tokens.

## 4. Visual system

The design is intentionally light, calm, and content-first.

- Neutral background with restrained accent color usage.
- Shared spacing, radius, border, and shadow tokens.
- Dense, scannable cards rather than decorative marketing blocks.
- Locale changes should keep the same layout language, only swapping copy.

`DESIGN.md` is the primary contract for visual decisions. When we change the
site shape, we should update that file before or alongside implementation.

## 5. Photography workflow

Photography is handled as a small editorial pipeline.

- Admin uploads preserve original file quality.
- Photo metadata is written into structured config.
- Public albums show collage-style covers.
- Album detail pages support larger viewing and sequential navigation.
- Private photos are gated through the session/token flow in `app/api/auth/`
  and `app/api/photo/`.

## 6. Data and server responsibilities

Server-side code under `app/api/` should handle:

- authentication and authorization,
- repository-backed config updates,
- deployment and CI status reporting,
- media upload and retrieval,
- structured metadata endpoints.

Client components should not duplicate those responsibilities.

## 7. Practical rules

- Prefer config-driven copy over hardcoded page text.
- Prefer small, focused components over large page-local branches.
- Keep public pages readable in both Chinese and English without mixing the
  two arbitrarily.
- Keep photography original quality intact; display can be optimized, but the
  source asset should not be degraded.
- Avoid introducing new visual patterns unless they are captured in
  `DESIGN.md`.

