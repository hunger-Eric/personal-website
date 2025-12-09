<!-- devfoliox
{
  "title": "DevfolioX",
  "summary": "A minimal, config-driven developer portfolio template built with Next.js and Tailwind CSS.",
  "featured": true,
  "image_url": "https://raw.githubusercontent.com/KevinTrinh1227/devfoliox/main/public/images/demo_1.png",
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
      "href": "https://github.com/KevinTrinh1227/DevfolioX",
      "type": "github"
    },
    {
      "label": "Download",
      "href": "https://devfoliox.vercel.app/d/KevinTrinh1227/DevfolioX/",
      "type": "download"
    }
  ]
}
-->
<div align="center">

# 👨‍💻 DevfolioX

A minimal, user-friendly, responsive dev/personal portfolio template that integrates with numerous platforms and offers tons of useful functionality. Minimal, powerful, and professional, all on a single page. Built with **Next.js** and **Tailwind CSS**.

<!--
[![Downloads](https://img.shields.io/github/downloads/KevinTrinh1227/devfoliox/total?style=for-the-badge&logo=github)](#)
[![Stars](https://img.shields.io/github/stars/KevinTrinh1227/devfoliox?style=for-the-badge&logo=github)](#)
[![Forks](https://img.shields.io/github/forks/KevinTrinh1227/devfoliox?style=for-the-badge&logo=github)](#)
[![Latest Release](https://img.shields.io/github/v/release/KevinTrinh1227/devfoliox?style=for-the-badge&logo=github)](#) -->

<strong>Live Demo: <a target="_blank" href="https://devfoliox.vercel.app">devfoliox.vercel.app</a></strong>

<img src="https://raw.githubusercontent.com/KevinTrinh1227/devfoliox/main/public/images/demo_1.png" alt="DevfolioX screenshot 1" />

<details>
  <summary><strong>VIEW MORE SCREEN SHOTS HERE</strong></summary>
  <p align="center">
  <img src="https://raw.githubusercontent.com/KevinTrinh1227/devfoliox/main/public/images/demo_2.png" alt="DevfolioX screenshot 2" />
  <img src="https://raw.githubusercontent.com/KevinTrinh1227/devfoliox/main/public/images/demo_3.png" alt="DevfolioX screenshot 3" />
  <img src="https://raw.githubusercontent.com/KevinTrinh1227/devfoliox/main/public/images/demo_4.png" alt="DevfolioX screenshot 4" />
  <img src="https://raw.githubusercontent.com/KevinTrinh1227/devfoliox/main/public/images/demo_5.png" alt="DevfolioX screenshot 5" />
  <img src="https://raw.githubusercontent.com/KevinTrinh1227/devfoliox/main/public/images/demo_6.png" alt="DevfolioX screenshot 6" />
  <img src="https://raw.githubusercontent.com/KevinTrinh1227/devfoliox/main/public/images/demo_7.png" alt="DevfolioX screenshot 7" />
  <img src="https://raw.githubusercontent.com/KevinTrinh1227/devfoliox/main/public/images/demo_8.png" alt="DevfolioX screenshot 8" />
  </p>
</details>
</div>

---

<p align="center"><strong>Table of Contents</strong></p>
<p align="center">
  <a href="#-about-devfoliox">About</a> •
  <a href="#-features--integrations">Features</a> •
  <a href="#-core-sections">Core Sections</a> •
  <a href="#-configuration--setup">Configuration &amp; Setup</a> •
  <a href="#-deployment">Deployment</a>
</p>

---

## 🌐 About DevFolioX

**DevfolioX** is a minimal, config-driven portfolio template built for developers and students who want a clean, professional online presence without a lot of overhead. It centralizes your projects, experience, writing, videos, resume/CV, and contact information into a single responsive page.

The template is powered by a few small TypeScript config files, so most updates are made by editing data rather than UI code. It uses **Next.js (App Router)**, **React**, and **Tailwind CSS**, and is designed to be deployed on **Vercel** or **Netlify** as a simple, fully static site for this initial release.

<details>
  <summary><strong>Why I designed DevfolioX with a “less is more” mindset</strong></summary>

I try to keep both my resume and this site focused and easy to scan. A J.P. Morgan recruiter once told me they often spend around **7 seconds** on a resume before deciding whether to keep reading. That stuck with me.

If you overload a page with text, sections, and visual noise, the most important details (your impact, projects, and skills) become a **needle in a haystack**. By keeping things clean, intentional, and well-structured, I make it easier for recruiters, hiring managers, and collaborators to quickly find what actually matters.

DevfolioX follows that same principle: fewer distractions, clearer hierarchy, and just enough detail to invite a deeper look if someone wants it.

</details>

---

## ✨ Features & Integrations

- **Minimal one-page layout** – All key info visible with smooth scrolling and a clean navbar on one page.
- **Config-driven content** – Most text, links, etc live in small JSON/TS config files, so you rarely need to touch UI code.
- **Student & professional ready** – Handles education, experience, projects, open source, and more in a structured way.
- **Resume viewer** – View and download a updated Google Docs–backed PDF directly on the site.
- **Multi-channel contact** – A focused contact form that can notify you via email, Discord, and Telegram.
- **Optional sponsor support** – Add a Sponsor button for GitHub Sponsors, Patreon, Ko-fi, etc.
- **Free-hosting friendly** – Built to run entirely on Vercel or Netlify (including API routes) with no separate backend.
- **And much more** - DevfolioX has dozens of features that tailors to everyone.

**Integrations (all optional):**

- **GitHub** – Display fully updated project details and info using GitHub.
- **Dev.to / Medium** – Pull in recent posts so your writing section stays up-to-date automatically.
- **YouTube** – Embed a featured video and/or a small list of recent uploads.
- **Google Docs** – Use a single Google Doc as the source of truth for your resume/CV and export it as a PDF on demand.
- **Email / Discord / Telegram** – Route contact form submissions to one or more channels so you don’t miss messages.
- **Handshake / Sponsor links** – Surface your Handshake profile and sponsor pages with simple config-only links.

All integrations degrade gracefully: if you don’t configure something, the related section or feature simply stays hidden.

---

## 📚 Core Sections

- **Hero** – Quick intro with your name, role, short value statement, and primary call-to-action buttons (e.g. “View Projects”, “Contact”, “Resume”) plus key social icons.
- **About** – Short bio, what you work on, and a compact skills/tech stack snapshot.
- **Education** – Schools, degrees, dates, locations, and optional coursework/activities.
- **Experience** – Internships and jobs with role, company, dates, and impact-focused bullets.
- **Achievements & Certifications** – Certifications, awards, scholarships, and competitions with tags and optional proof links.
- **Research & Publications** – Optional section for research projects, posters, talks, and papers with links to PDFs, slides, or code.
- **Open Source Contributions** – Highlights external repos you’ve contributed to, with links to PRs/issues.
- **Projects** – Your own repos, configured via hidden README metadata (or config), with titles, descriptions, tools, buttons, GitHub stats, and an optional detailed modal using the README content.
- **Blog / Writing** – Recent posts from platforms like Dev.to / Medium so your writing stays in sync without manual copying.
- **YouTube** – Featured video and/or recent uploads to surface tutorials, devlogs, or project walkthroughs.
- **Coding Stats** – Optional lightweight metrics (e.g. GitHub activity or problem-solving stats) for a quick activity snapshot.
- **Contact** – Focused contact form with multi-channel notifications, plus direct profile/contact links.
- **Resume & CV Viewer** – Inline PDF viewer for your resume/CV with “last updated” metadata and a download button.

---

## 🧩 Configuration & Setup

DevfolioX is **config-driven**. Most customization is done by editing small config files instead of React components.

1. **Download DevFolioX**

   - [Download latest stable release](https://devfoliox.vercel.app/d/kevintrinh1227/devfoliox) (recommended)
   - [Download latest dev release](https://github.com/KevinTrinh1227/devfoliox/archive/refs/heads/main.zip) (latest untested features)
   - Or Clone the repository (Same as dev release)

     ```bash
     git clone https://github.com/KevinTrinh1227/DevfolioX
     ```

     ```bash
     cd devfoliox
     ```

     ```bash
     npm install
     ```

2. **Set up core site config**

   Update the JSON files inside `./config/*.json` to meet your needs.

3. **Configure projects**

   For GitHub-backed projects, you can use a hidden block in each repo’s README:

   ```html
   <!-- devfoliox
   {
     "title": "My Project",
     "summary": "Short summary here.",
     "description": ["Longer description paragraph 1.", "Paragraph 2."],
     "technologies": ["Next.js", "TypeScript", "Tailwind CSS"],
     "start": "AUTO",
     "end": "AUTO",
     "auto_inactive_threshold_days": 90,
     "stats_stars": true,
     "stats_forks": true,
     "stats_downloads": true,
     "links": [
       { "label": "Live Demo", "href": "https://example.com", "type": "live" },
       { "label": "Source", "href": "https://github.com/you/repo", "type": "github" }
     ],
     "badges": [
       "https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white"
     ]
   }
   -->
   ```

   The app will read this at build time, pull GitHub stats (if enabled), and use repo metadata (topics, homepage, created/last push dates) to auto-fill dates and details.

4. **Environment variables (.env.local)**

   Create a `.env.local` file in dir. Only set the ones you plan to use, visit the [.env.example](https://github.com/KevinTrinh1227/DevfolioX/blob/main/.env.example) for example.

5. **Run locally then visit `http://localhost:3000` or given link**

   ```bash
   npm run dev
   ```

---

## 🚀 Deployment

DevfolioX is a standard Next.js app and can run anywhere that supports Node and Next.js.

- **Local production build**

  ```bash
  npm run build
  ```

  ```bash
  npm start
  ```

<details>
  <summary><strong>How to host DevfolioX for free (Vercel / Netlify)</strong></summary>

  <br />

### 🚀 Deploy to Vercel (free)

1. Push your code to GitHub (or GitLab/Bitbucket).
2. Go to Vercel and click **“New Project” → “Import”**.
3. Select your `devfoliox` repo; Vercel will auto-detect it as a Next.js app.
4. Set the same environment variables from `.env.local` in the Vercel project settings.
5. Deploy with the default Next.js settings.

Vercel will handle:

- Static assets and server-side rendering
- API routes (contact form, resume export)
- Automatic redeploys when you push to your main branch

---

### 🌐 Deploy to Netlify (free)

1. Push your code to GitHub (or another supported Git provider).
2. In Netlify, click **“Add new site” → “Import an existing project”** and choose your repo.
3. Use a standard Next.js build command:

   ```bash
   npm run build
   ```

4. Set your environment variables in the Netlify site settings.
5. Deploy. Netlify will serve the static output and run any serverless functions created by your Next.js config.

</details>
