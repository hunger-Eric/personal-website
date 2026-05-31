#!/usr/bin/env node
// scripts/build-banners.js
//
// Generates clean, light, branded SVG banners for projects and articles.
// Each banner is a 1200×630 SVG suitable for both card thumbnails and OG.
// Output goes to /public/images/banners/{slug}.svg.
//
// Run: node scripts/build-banners.js

const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "public", "images", "banners");
const ARTICLES_DIR = path.join(ROOT, "content", "articles");
const PROJECTS_JSON = path.join(ROOT, "config", "projects.json");

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// Soft, light palette options. Each one is a {bgFrom, bgTo, accent, dot}.
// Background is a near-white-ish gradient with a hint of color so the title
// stays the focus and the banner reads "clean / light" instead of dark.
const PALETTES = [
  { bgFrom: "#eef2ff", bgTo: "#ffffff", accent: "#4f46e5", dot: "#a5b4fc" }, // indigo
  { bgFrom: "#f0f9ff", bgTo: "#ffffff", accent: "#0284c7", dot: "#7dd3fc" }, // sky
  { bgFrom: "#ecfdf5", bgTo: "#ffffff", accent: "#059669", dot: "#6ee7b7" }, // emerald
  { bgFrom: "#fff7ed", bgTo: "#ffffff", accent: "#ea580c", dot: "#fdba74" }, // orange
  { bgFrom: "#fdf4ff", bgTo: "#ffffff", accent: "#a21caf", dot: "#f5d0fe" }, // fuchsia
  { bgFrom: "#fef2f2", bgTo: "#ffffff", accent: "#dc2626", dot: "#fca5a5" }, // red
  { bgFrom: "#f5f3ff", bgTo: "#ffffff", accent: "#7c3aed", dot: "#c4b5fd" }, // violet
  { bgFrom: "#fffbeb", bgTo: "#ffffff", accent: "#d97706", dot: "#fcd34d" }, // amber
];

// Stable hash → palette index. Same slug always gets the same palette.
function paletteFor(slug) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) {
    h = (h * 31 + slug.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(h) % PALETTES.length;
  return PALETTES[idx];
}

// Wrap a title onto up to N lines without busting the SVG.
function wrapTitle(title, maxCharsPerLine = 22, maxLines = 3) {
  const words = title.replace(/\s+/g, " ").trim().split(" ");
  const lines = [];
  let line = "";
  for (const w of words) {
    if (!line.length) {
      line = w;
      continue;
    }
    if (line.length + 1 + w.length <= maxCharsPerLine) {
      line += " " + w;
    } else {
      lines.push(line);
      line = w;
      if (lines.length === maxLines - 1) break;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  // If we ran out of lines mid-title, ellipsize the last line.
  const consumed = lines.join(" ").split(" ").length;
  if (consumed < words.length && lines.length) {
    const last = lines[lines.length - 1];
    lines[lines.length - 1] =
      last.length > maxCharsPerLine - 1
        ? last.slice(0, maxCharsPerLine - 1) + "…"
        : last + "…";
  }
  return lines;
}

function escapeXml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function bannerSvg({ title, eyebrow, slug }) {
  const W = 1200;
  const H = 630;
  const p = paletteFor(slug);
  const lines = wrapTitle(title, 22, 3);
  // Vertically center the lines as a block.
  const lineHeight = 92;
  const totalH = lines.length * lineHeight;
  const startY = H / 2 - totalH / 2 + lineHeight * 0.78;

  const tspans = lines
    .map(
      (l, i) =>
        `<tspan x="80" y="${Math.round(startY + i * lineHeight)}">${escapeXml(l)}</tspan>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${escapeXml(title)}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${p.bgFrom}"/>
      <stop offset="100%" stop-color="${p.bgTo}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.85" cy="0.15" r="0.7">
      <stop offset="0%" stop-color="${p.accent}" stop-opacity="0.18"/>
      <stop offset="60%" stop-color="${p.accent}" stop-opacity="0.04"/>
      <stop offset="100%" stop-color="${p.accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>

  <!-- subtle dot grid in the bottom-right -->
  <g fill="${p.dot}" opacity="0.55">
    ${Array.from({ length: 6 }, (_, r) =>
      Array.from({ length: 8 }, (_, c) => {
        const cx = 760 + c * 50;
        const cy = 380 + r * 40;
        return `<circle cx="${cx}" cy="${cy}" r="3"/>`;
      }).join("")
    ).join("")}
  </g>

  <!-- accent bar -->
  <rect x="80" y="80" width="64" height="6" rx="3" fill="${p.accent}"/>

  ${
    eyebrow
      ? `<text x="80" y="124" font-family="ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="600" fill="${p.accent}" letter-spacing="3">${escapeXml(eyebrow.toUpperCase())}</text>`
      : ""
  }

  <text font-family="ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="78" font-weight="800" fill="#0f172a" letter-spacing="-1.5">
    ${tspans}
  </text>

  <text x="80" y="${H - 70}" font-family="ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="600" fill="#475569" letter-spacing="1">me.itheheda.online</text>
</svg>
`;
}

function writeBanner(slug, title, eyebrow) {
  const out = path.join(OUT_DIR, `${slug}.svg`);
  fs.writeFileSync(out, bannerSvg({ title, eyebrow, slug }));
  console.log(`✓ ${path.relative(ROOT, out)}`);
}

// --- Projects ---
const projectsRaw = JSON.parse(fs.readFileSync(PROJECTS_JSON, "utf8"));

const githubProjects = (projectsRaw.github_readme_projects || []).map((p) => {
  const m = p.repo_url.match(/github\.com\/([^/]+)\/([^/]+)/i);
  if (!m) return null;
  const owner = m[1];
  const repo = m[2].replace(/\.git$/, "");
  const slug = `${owner}-${repo}`.toLowerCase();
  const title = repo.replace(/[-_]/g, " ").replace(/\b\w/g, (c) =>
    c.toUpperCase()
  );
  return { slug, title };
});

const localProjects = (projectsRaw.local_projects || []).map((p) => ({
  slug: p.id,
  title: p.name,
}));

[...githubProjects.filter(Boolean), ...localProjects].forEach((p) =>
  writeBanner(p.slug, p.title, "Project")
);

// --- Articles ---
const articleFiles = fs.readdirSync(ARTICLES_DIR).filter(
  (f) => f.endsWith(".mdx") || f.endsWith(".md")
);

for (const file of articleFiles) {
  const slug = path.basename(file).replace(/\.mdx?$/, "");
  const raw = fs.readFileSync(path.join(ARTICLES_DIR, file), "utf8");
  const fm = matter(raw).data || {};
  const title = fm.title || slug;
  const eyebrow = fm.category || "Article";
  writeBanner(slug, title, eyebrow);
}

console.log(`\nDone. Banners in ${path.relative(ROOT, OUT_DIR)}/`);
