<!-- devfoliox
{
  "title": "DevfolioX",
  "summary": "A minimal, config-driven developer portfolio template built with Next.js and Tailwind CSS.",
  "featured": true,
  "image_url": "https://raw.githubusercontent.com/KevinTrinhDev/devfoliox/main/public/images/demo_1.png",
  "description": [
    "DevfolioX is a one-page portfolio focused on simplicity, speed, and practical integrations for students and developers.",
    "It centralizes projects, experience, writing, and contact into a single minimal layout while remaining easy to configure and deploy on free hosting."
  ],
  "technologies": ["Next.js", "TypeScript", "Tailwind CSS"],
  "badges": [
    "https://img.shields.io/badge/Telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white",
    "https://img.shields.io/badge/Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white",
    "https://img.shields.io/badge/next%20js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white",
    "https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white",
    "https://img.shields.io/badge/dev.to-0A0A0A?style=for-the-badge&logo=devdotto&logoColor=white",
    "https://img.shields.io/badge/Medium-12100E?style=for-the-badge&logo=medium&logoColor=white",
    "https://img.shields.io/badge/YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white",
    "https://img.shields.io/badge/Google%20Docs-4285F4?style=for-the-badge&logo=google-docs&logoColor=white",
    "https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"
  ],
  "start": "AUTO",
  "end": "AUTO",
  "auto_inactive_threshold_days": 90,
  "stats_stars": true,
  "stats_forks": true,
  "stats_downloads": true,
  "links": [
    {
      "label": "Demo",
      "href": "https://devfoliox.vercel.app",
      "type": "live"
    },
    {
      "label": "Source",
      "href": "https://github.com/KevinTrinhDev/DevfolioX",
      "type": "github"
    },
    {
      "label": "Download",
      "href": "https://devfoliox.vercel.app/d/KevinTrinhDev/DevfolioX/",
      "type": "download"
    }
  ]
}
-->
<div align="center">

# DevfolioX

A minimal, config-driven developer portfolio template built with **Next.js 16**, **React 19**, and **Tailwind CSS**.

**Live Demo: [devfoliox.vercel.app](https://devfoliox.vercel.app)**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/KevinTrinhDev/DevfolioX)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/KevinTrinhDev/DevfolioX)

<img src="https://raw.githubusercontent.com/KevinTrinhDev/devfoliox/main/public/images/demo_1.png" alt="DevfolioX screenshot" />

<details>
<summary><strong>More Screenshots</strong></summary>
<p align="center">
<img src="https://raw.githubusercontent.com/KevinTrinhDev/devfoliox/main/public/images/demo_2.png" alt="DevfolioX screenshot 2" />
<img src="https://raw.githubusercontent.com/KevinTrinhDev/devfoliox/main/public/images/demo_3.png" alt="DevfolioX screenshot 3" />
<img src="https://raw.githubusercontent.com/KevinTrinhDev/devfoliox/main/public/images/demo_4.png" alt="DevfolioX screenshot 4" />
<img src="https://raw.githubusercontent.com/KevinTrinhDev/devfoliox/main/public/images/demo_5.png" alt="DevfolioX screenshot 5" />
<img src="https://raw.githubusercontent.com/KevinTrinhDev/devfoliox/main/public/images/demo_6.png" alt="DevfolioX screenshot 6" />
<img src="https://raw.githubusercontent.com/KevinTrinhDev/devfoliox/main/public/images/demo_7.png" alt="DevfolioX screenshot 7" />
<img src="https://raw.githubusercontent.com/KevinTrinhDev/devfoliox/main/public/images/demo_8.png" alt="DevfolioX screenshot 8" />
</p>
</details>

</div>

---

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Blog System](#blog-system)
- [Theme Customization](#theme-customization)
- [SEO](#seo)
- [Analytics](#analytics)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [Testing](#testing)

---

## Features

### Core Features
- **Config-driven** - Edit JSON files, not React components
- **Responsive design** - Optimized for all screen sizes
- **Dark/Light mode** - System preference detection with manual toggle
- **Command palette** - Press `Cmd+K` to search everything
- **PWA ready** - Installable as a Progressive Web App

### Pages & Sections
- **Homepage** - Hero, about, skills, experience, projects, articles, contact
- **Projects page** - `/projects` listing with individual `/projects/[slug]` pages
- **Articles page** - `/articles` listing with individual `/articles/[slug]` pages
- **404 page** - Custom not found page

### Integrations
- **GitHub** - Auto-fetch project stats, contribution graph, pinned repos
- **YouTube** - Display latest videos from your channel
- **Dev.to** - Sync articles from your Dev.to profile
- **Google Docs** - Embed your resume directly
- **Contact form** - Email via Resend API

### SEO & Performance
- **Automatic sitemap** - Generated at `/sitemap.xml`
- **Robots.txt** - Configurable at `/robots.txt`
- **JSON-LD** - Structured data for rich search results
- **Dynamic OG images** - Auto-generated social images
- **Optimized fonts** - Inter + JetBrains Mono with no FOUT
- **Image optimization** - AVIF/WebP with lazy loading

---

## Quick Start

### Option 1: One-Click Deploy (Recommended)

Click the Vercel or Netlify button above to deploy instantly.

### Option 2: Manual Setup

```bash
# Clone the repository
git clone https://github.com/KevinTrinhDev/DevfolioX
cd devfoliox

# Install dependencies
npm install

# Run the setup wizard
npm run setup

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see your site.

---

## Configuration

All configuration is done through JSON files in the `config/` directory:

| File | Purpose |
|------|---------|
| `site.json` | Personal info, social links, section toggles |
| `projects.json` | GitHub repos to feature (or manual entries) |
| `experience.json` | Work history and education |
| `articles.json` | External article links (or use MDX blog) |
| `theme.json` | Theme mode and accent color |

### Site Configuration (`config/site.json`)

```json
{
  "name": "Your Name",
  "title": "Full-Stack Developer",
  "email": "you@example.com",
  "github": "yourusername",
  "sections": {
    "hero": true,
    "about": true,
    "skills": true,
    "experience": true,
    "projects": true,
    "articles": true,
    "youtube": false,
    "contact": true
  }
}
```

### Projects Configuration

Projects can be auto-populated from GitHub READMEs or defined manually:

```json
{
  "githubRepos": [
    "yourusername/awesome-project",
    "yourusername/another-project"
  ],
  "manualProjects": []
}
```

Add a hidden metadata block to your GitHub README for rich project data:

```markdown
<!-- devfoliox
{
  "title": "My Project",
  "summary": "A brief description",
  "featured": true,
  "technologies": ["React", "Node.js"]
}
-->
```

---

## Blog System

DevfolioX ships a full MDX-based blog at `/articles`. Articles are validated
with Zod at parse time, fully pre-rendered at build, and served from
Cloudflare Workers.

### What you get out of the box

- **MDX articles** with front-matter, custom components, and GFM
- **Search + tag/category filters** (client-side, debounced)
- **Featured carousel** + paginated list
- **Per-article view counter** backed by Cloudflare KV (`ARTICLE_VIEWS`)
  with cookie + IP rate limiting
- **Table of contents** with scroll-spy
- **Related articles** scored by shared tags
- **Reading time** auto-calculated
- **Share links** (X, LinkedIn, Reddit, Facebook, email, SMS, copy, native share)
- **RSS 2.0 feed** at `/feed.xml`
- **JSON Feed 1.1** at `/feed.json`
- **Sitemap** at `/sitemap.xml` (sourced from MDX, not the legacy config)
- **Robots** at `/robots.txt` (blocks AI crawlers by default)
- **JSON-LD `BlogPosting` schema** + canonical URLs per article
- **OpenGraph + Twitter cards** including image alt text from frontmatter

### Creating articles

Add a `.mdx` file to `content/articles/`. Frontmatter is validated against a
Zod schema — invalid articles are skipped at build with a clear error.

```markdown
---
title: "Deploying Next.js to Cloudflare Workers"
slug: "cloudflare-workers-opennext"     # optional; defaults to filename
summary: "What I learned moving off Vercel."
date: "2026-04-22"                      # required, must be parseable
updated: "2026-04-26"                   # optional
category: "Infrastructure"              # optional, single value
tags: ["Cloudflare", "Next.js"]         # optional array
featured: true                          # optional
draft: false                            # excluded in production when true
imageSrc: "/images/cover.png"           # optional, relative to public/
imageAlt: "Cloudflare dashboard"        # optional, shown on cover + OG
author: "Kevin Trinh"                   # optional, defaults to siteConfig.name
---

Article body in Markdown / MDX...
```

**Frontmatter rules:**
- `title` and `date` are required.
- `slug` must be kebab-case (`^[a-z0-9][a-z0-9-]{0,80}$`); the filename is used as a fallback.
- `date` / `updated` must parse via `new Date(...)` — `"2026-04-22"` and ISO 8601 both work.
- `tags` must be a string array.

### MDX components

The following components are available inside any `.mdx` article:

```mdx
<Callout kind="info">       Info box (also: warning, success, danger, tip) </Callout>
<YouTube id="dQw4w9WgXcQ" />              {/* nocookie embed */}
<Tweet url="https://twitter.com/.../1234" />
<Figure src="/images/x.png" alt="..." caption="..." />
Press <Kbd>Ctrl</Kbd>+<Kbd>K</Kbd>
```

### View counter

`/api/views/<slug>` (GET returns count, POST increments). Uses
`ARTICLE_VIEWS` KV with three layers of abuse prevention:
1. Slug allow-list (only published article slugs accepted)
2. Cookie dedupe per visitor (24h)
3. Per-IP throttle via KV (60s window)

Honors `DNT: 1` and `Sec-GPC: 1`, and skips obvious crawlers via UA regex.

### Verifying articles after deploy

```bash
curl -sI https://kevintrinh.dev/articles | head -1
curl -s   https://kevintrinh.dev/feed.xml   | head -20
curl -s   https://kevintrinh.dev/feed.json  | jq '.version, (.items | length)'
curl -s   https://kevintrinh.dev/sitemap.xml | head -10
curl -s   https://kevintrinh.dev/articles/<slug> | grep -o '"@type":"BlogPosting"'
```

---

## Theme Customization

### Theme Configuration (`config/theme.json`)

```json
{
  "defaultMode": "dark",
  "allowToggle": true,
  "accentColor": "indigo"
}
```

### Available Accent Colors

- `indigo` (default)
- `emerald`
- `rose`
- `amber`
- `cyan`

### Custom Colors

Edit `app/globals.css` to add custom CSS variables:

```css
:root {
  --accent: #your-color;
  --accent-hover: #your-hover-color;
}
```

---

## SEO

### Automatic Features

- **Sitemap** - Auto-generated at `/sitemap.xml`
- **Robots.txt** - Configured at `/robots.txt`
- **JSON-LD** - Structured data for Person, WebSite, SoftwareApplication, Article
- **Open Graph** - Dynamic OG images via `/api/og`
- **Canonical URLs** - Automatic canonical tags

### Metadata

Each page has optimized metadata. Customize in `app/layout.tsx` or per-page with `generateMetadata()`.

---

## Analytics

DevfolioX integrates with **Cloudflare Web Analytics** — privacy-friendly,
no cookies, free, and works natively from Cloudflare Workers (Vercel
Analytics' beacon doesn't reliably reach Vercel from a CF Worker).

### Setup

1. Open the [Cloudflare Web Analytics dashboard](https://dash.cloudflare.com/?to=/:account/web-analytics).
2. Add a site for your domain.
3. Copy the **site token** (a hex string).
4. Set it as `NEXT_PUBLIC_CF_ANALYTICS_TOKEN` in your environment (Cloudflare Workers env or `.env.local`).

The beacon is only injected when the env var is present, so previews and
local dev stay quiet.

---

## Deployment

This repo ships to **Cloudflare Workers** via OpenNext. Vercel/Netlify still
work but require dropping the OpenNext-specific bits in `wrangler.jsonc`
and `open-next.config.ts`.

### Cloudflare Workers (current setup)

```bash
npm run cf:build      # OpenNext compile
npm run cf:preview    # local Worker preview
npm run cf:deploy     # deploy to production
```

KV bindings (already wired in `wrangler.jsonc`):
- `NEXT_INC_CACHE_KV` — Next.js ISR cache
- `ARTICLE_VIEWS` — per-article view counts + IP rate-limit keys

### Rollback

If a deploy breaks production:

```bash
# List recent versions
npx wrangler deployments list

# Roll back to the previous one
npx wrangler rollback
```

Worker rollbacks are near-instant and don't require a rebuild.

### Vercel / Netlify (alternative)

1. Push your code to GitHub
2. Import on Vercel or Netlify; framework auto-detects as Next.js
3. Set `NEXT_PUBLIC_BASE_URL` and any other env vars from `.env.example`
4. Deploy

---

## Environment Variables

Create a `.env.local` file:

```env
# Required for contact form
RESEND_API_KEY=re_xxxxx
CONTACT_TO_EMAIL=you@example.com

# Required for GitHub features
GITHUB_TOKEN=ghp_xxxxx

# Optional: YouTube integration
YOUTUBE_API_KEY=AIza_xxxxx

# Optional: Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXX
```

### Variable Reference

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_BASE_URL` | For SEO | Your deployed URL (used by sitemap, feeds, OG, JSON-LD) |
| `NEXT_PUBLIC_CF_ANALYTICS_TOKEN` | Optional | Cloudflare Web Analytics site token |
| `RESEND_API_KEY` | For contact | Send emails via Resend |
| `CONTACT_TO_EMAIL` | For contact | Email recipient |
| `GITHUB_TOKEN` | Optional | Higher GitHub API limits for contributions graph |
| `GITHUB_USERNAME` | Optional | Default GitHub user for stats |
| `YOUTUBE_API_KEY` | For YouTube | Fetch channel videos |

Run `npm run validate-env` to check your configuration.

---

## Testing

```bash
npm run test          # one-shot
npm run test:watch    # rerun on save
```

The Vitest suite covers:
- Frontmatter Zod schema (valid + invalid cases)
- Reading-time math
- The MDX loader against the real `content/articles/` directory
- RSS 2.0 + JSON Feed 1.1 route handlers (shape, item count, XML escaping)

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run setup` | Interactive setup wizard |
| `npm run validate-env` | Validate environment variables |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest unit tests |
| `npm run cf:build` | OpenNext build for Cloudflare Workers |
| `npm run cf:preview` | Preview the Worker locally |
| `npm run cf:deploy` | Deploy to Cloudflare Workers |

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Blog**: MDX with gray-matter
- **Search**: Fuse.js
- **Icons**: Lucide React
- **Fonts**: Inter, JetBrains Mono

---

## License

MIT License - feel free to use this for your own portfolio.

---

<div align="center">

**[Live Demo](https://devfoliox.vercel.app)** | **[Report Bug](https://github.com/KevinTrinhDev/DevfolioX/issues)** | **[Request Feature](https://github.com/KevinTrinhDev/DevfolioX/issues)**

</div>
