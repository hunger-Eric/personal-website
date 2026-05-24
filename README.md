# Personal Website

Customized personal website based on DevfolioX, built with Next.js 16 + TypeScript.

Live site: [me.itheheda.online](https://me.itheheda.online)  
Repository: [hunger-Eric/personal-website](https://github.com/hunger-Eric/personal-website)

## Overview

This project is a config-driven personal site with:

- Homepage, about, projects, articles, and links pages
- Photography section with public and private photos
- Admin panel for editing config JSON files in GitHub
- Post-save Vercel deploy trigger with deployment status polling
- Vitest-based automated test suite and CI workflow

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Vitest + Testing Library
- Vercel (primary deploy target)
- Optional OpenNext/Cloudflare workflow files kept in repo

## Local Development

```bash
git clone https://github.com/hunger-Eric/personal-website
cd personal-website
npm ci
npm run dev
```

Open `http://localhost:3000`.

## Project Structure

- `app/`: App Router pages and API routes
- `components/`: UI and feature components
- `config/`: JSON-driven site content/configuration
- `lib/`: shared utilities (auth, GitHub helpers, parsing)
- `tests/`: unit and component/API tests
- `.github/workflows/test.yml`: CI pipeline

## Key Features

### 1. Config-driven content

Most content is managed through JSON files under `config/`, including:

- `site.json`
- `about.json`
- `navbar.json`
- `projects.json`
- `theme.json`
- `photography.json`
- `pages.json`

### 2. Photography with private access

- Public photos render directly from `config/photography.json`.
- Private photos are unlocked through a PIN flow:
  - `POST /api/auth/photo-session` validates PIN and returns signed per-photo tokens
  - `GET /api/photo/[id]?token=...` verifies token and serves local/private asset or redirect source

### 3. Admin panel with defense-in-depth

Routes:

- `/admin/login`
- `/admin` and `/admin/*` dashboard pages
- `/api/admin/*` admin APIs

Guards:

- Proxy-level gate for `/admin/*` and `/api/admin/*`
- API-level `adminGuard(...)` checks
- Layout-level protection for admin pages

Admin save flow:

1. Admin editor posts config payload to `/api/admin/save`
2. API updates target file in GitHub repo via content API
3. API triggers Vercel deployment (if Vercel token configured)
4. Frontend polls `/api/admin/deploy-status?deployId=...`

## Environment Variables

Copy `.env.example` to `.env.local` and fill values you need.

Core variables:

- `NEXT_PUBLIC_BASE_URL`
- `ENABLE_ADMIN`
- `ADMIN_TOKEN`
- `ADMIN_PASSWORD`
- `GITHUB_TOKEN` (or `PHOTO_GITHUB_TOKEN`)
- `VERCEL_TOKEN`
- `VERCEL_PROJECT_ID`
- `VERCEL_TEAM_ID` (optional)
- `PRIVATE_PHOTO_PIN`
- `PHOTO_AUTH_SECRET`

Optional integrations:

- `YOUTUBE_API_KEY`
- `RESEND_API_KEY`
- `CONTACT_TO_EMAIL`
- `CONTACT_FROM_EMAIL`
- `NEXT_PUBLIC_CF_ANALYTICS_TOKEN`

Validate current env:

```bash
npm run validate-env
```

## Scripts

- `npm run dev`: start dev server
- `npm run build`: production build
- `npm run start`: run production server
- `npm run lint`: run ESLint
- `npm run test`: run Vitest once
- `npm run test:watch`: run Vitest in watch mode
- `npm run validate-env`: environment checks
- `npm run setup`: setup helper script
- `npm run cf:build`: OpenNext Cloudflare build
- `npm run cf:preview`: OpenNext Cloudflare local preview
- `npm run cf:deploy`: OpenNext Cloudflare deploy

## Testing & CI

Run tests locally:

```bash
npm run test
```

CI (`.github/workflows/test.yml`) runs on pushes/PRs to `main`:

1. `npm ci`
2. `npx vitest run`
3. `npm run build`

## Deployment Notes

Current production workflow is GitHub + Vercel.

- Main branch updates can auto-deploy through Vercel Git integration.
- Admin panel saves can also trigger deployment through Vercel API.

Cloudflare/OpenNext files are retained for optional alternate deployment path, but not the primary production path.

## Operations Runbook

### Admin token and login checks

Symptoms:
- `/admin` redirects to `/admin/login` repeatedly
- admin APIs return `404` from guard path

Quick checks:
1. Confirm `ENABLE_ADMIN=true`
2. Confirm `ADMIN_TOKEN` exists and matches the token source
3. Confirm `ADMIN_PASSWORD` is set for login route flow
4. If using URL token bootstrap, use `/admin?token=<ADMIN_TOKEN>` once to set cookie

Notes:
- Guard accepts token from query param, `x-admin-token` header, or `admin_token` cookie.
- Proxy + API guard + layout guard all enforce access.

### Vercel deployId troubleshooting

Save flow:
1. `POST /api/admin/save` writes config to GitHub
2. Route attempts Vercel deploy trigger
3. Response includes `deployId` when trigger succeeds
4. Frontend polls `/api/admin/deploy-status?deployId=...`

If `deployId` is null:
1. Check `VERCEL_TOKEN`
2. Check `VERCEL_PROJECT_ID`
3. Check optional `VERCEL_TEAM_ID` for team-scoped projects
4. Verify repo binding in save payload is still correct:
   - `repo: hunger-Eric/personal-website`
   - `ref: main`

If status stays `PENDING`:
1. Re-check Vercel token scopes
2. Confirm deployment exists in Vercel dashboard/API
3. Re-save once to produce a fresh deployment ID

### Private photo PIN flow checks

Flow:
1. User submits PIN to `POST /api/auth/photo-session`
2. API validates against `PRIVATE_PHOTO_PIN`
3. API returns signed per-photo tokens
4. Client requests `GET /api/photo/[id]?token=...`

Failure cases:
- `501 Private photos not configured`: `PRIVATE_PHOTO_PIN` missing
- `403 Invalid PIN`: wrong PIN value
- `403 Invalid or expired token`: stale token or mismatched photo ID
- `404 Photo not found`: missing/private photo mapping or file path issue

Security notes:
- Set a strong `PHOTO_AUTH_SECRET`
- Keep private assets outside public static paths when possible
