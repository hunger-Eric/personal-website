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
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)

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

DevfolioX includes a full MDX-based blog system.

### Creating Articles

Add `.mdx` files to `content/articles/`:

```markdown
---
title: "My First Article"
slug: "my-first-article"
summary: "An introduction to my blog"
date: "2026-01-25"
category: "Tutorial"
tags: ["Next.js", "React"]
featured: true
---

Your article content here...
```

### MDX Components

Use custom components in your articles:

```mdx
<Callout type="info">
  This is an informational callout.
</Callout>

<Callout type="warning">
  This is a warning.
</Callout>
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

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Add environment variables
4. Deploy

### Netlify

1. Push your code to GitHub
2. Import project on [netlify.com](https://netlify.com)
3. Build command: `npm run build`
4. Publish directory: `.next`
5. Add environment variables
6. Deploy

### Cloudflare Pages

1. Push your code to GitHub
2. Create project on Cloudflare Pages
3. Framework preset: Next.js
4. Add environment variables
5. Deploy

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
| `RESEND_API_KEY` | For contact | Send emails via Resend |
| `CONTACT_TO_EMAIL` | For contact | Email recipient |
| `GITHUB_TOKEN` | For GitHub | API access for stats |
| `YOUTUBE_API_KEY` | For YouTube | Fetch channel videos |
| `NEXT_PUBLIC_BASE_URL` | For SEO | Your deployed URL |

Run `npm run validate-env` to check your configuration.

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
