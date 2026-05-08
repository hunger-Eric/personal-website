// scripts/build-og.js
// Generate Open Graph cards as 1200x630 PNGs.
// One-shot: `node scripts/build-og.js` whenever copy or design changes.
// Output: public/images/og/{home,links,articles,projects}.png

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const OUT_DIR = path.join(__dirname, "..", "public", "images", "og");
fs.mkdirSync(OUT_DIR, { recursive: true });

const W = 1200;
const H = 630;
const PAD = 80;

const BG = "#0a0e1a";
const TEXT = "#fafafa";
const MUTED = "#94a3b8";
const ACCENT = "#6366f1";
const RING = "#1f2937";
const FONT = "DejaVu Sans"; // librsvg-friendly system font

// Avatar — embedded inline so the SVG is self-contained.
const AVATAR_PATH = path.join(
  __dirname,
  "..",
  "public",
  "images",
  "avatar.jpg"
);
const avatarDataUri = fs.existsSync(AVATAR_PATH)
  ? `data:image/jpeg;base64,${fs.readFileSync(AVATAR_PATH).toString("base64")}`
  : "";

function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Subtitle becomes up to 2 lines. Honors explicit "\n" splits when set;
// otherwise wraps at the nearest space before maxChars.
function splitSubtitle(text, maxChars) {
  if (!text) return ["", ""];
  if (text.includes("\n")) {
    const lines = text.split("\n");
    return [lines[0] || "", lines[1] || ""];
  }
  if (text.length <= maxChars) return [text, ""];
  let split = text.lastIndexOf(" ", maxChars);
  if (split < 0) split = maxChars;
  return [text.slice(0, split).trim(), text.slice(split).trim()];
}

// Brand glyphs as inline SVG <g> snippets, sized to a 44px box.
function linkedInGlyph() {
  return `
    <rect width="44" height="44" rx="8" fill="#0A66C2"/>
    <text x="22" y="32" font-family="${FONT}" font-size="24" font-weight="700"
          fill="#ffffff" text-anchor="middle">in</text>`;
}

function youtubeGlyph() {
  return `
    <rect width="44" height="44" rx="10" fill="#FF0000"/>
    <polygon points="17,12 17,32 33,22" fill="#ffffff"/>`;
}

function githubGlyph() {
  return `
    <rect width="44" height="44" rx="8" fill="#181717"/>
    <path d="M22 9.5c-6.6 0-12 5.4-12 12 0 5.3 3.4 9.8 8.2 11.4.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.6-.3-5.4-1.3-5.4-5.8 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2 1-.3 2-.4 3-.4s2.1.1 3 .4c2.3-1.5 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.8.8 1.2 1.8 1.2 3.1 0 4.5-2.7 5.5-5.4 5.8.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6C30.6 31.3 34 26.8 34 21.5c0-6.6-5.4-12-12-12z" fill="#ffffff"/>`;
}

function tiktokGlyph() {
  // Simplified TikTok mark: black square + offset cyan/magenta accents
  // behind a white musical-note silhouette. Works at this size without
  // looking muddy.
  return `
    <rect width="44" height="44" rx="8" fill="#000000"/>
    <path d="M27.5 12c.5 2.6 2.3 4.2 4.8 4.5v3a8.7 8.7 0 0 1-4.6-1.2v6.9a7.4 7.4 0 1 1-7.4-7.4c.4 0 .9 0 1.3.1v3.1c-.4-.1-.8-.2-1.3-.2a4.4 4.4 0 1 0 4.4 4.4V12h2.8z" fill="#25F4EE" transform="translate(1.2 0)"/>
    <path d="M27.5 12c.5 2.6 2.3 4.2 4.8 4.5v3a8.7 8.7 0 0 1-4.6-1.2v6.9a7.4 7.4 0 1 1-7.4-7.4c.4 0 .9 0 1.3.1v3.1c-.4-.1-.8-.2-1.3-.2a4.4 4.4 0 1 0 4.4 4.4V12h2.8z" fill="#FE2C55" transform="translate(-1.2 0)"/>
    <path d="M27.5 12c.5 2.6 2.3 4.2 4.8 4.5v3a8.7 8.7 0 0 1-4.6-1.2v6.9a7.4 7.4 0 1 1-7.4-7.4c.4 0 .9 0 1.3.1v3.1c-.4-.1-.8-.2-1.3-.2a4.4 4.4 0 1 0 4.4 4.4V12h2.8z" fill="#ffffff"/>`;
}

function socialsRow(y) {
  const items = [
    { glyph: linkedInGlyph(), handle: "in/KevinTrinhDev" },
    { glyph: youtubeGlyph(), handle: "@KevinTrinhDev" },
    { glyph: githubGlyph(), handle: "@KevinTrinhDev" },
    { glyph: tiktokGlyph(), handle: "@KevinTrinhDev" },
  ];
  // Even cells across the content width; single-line handle next to glyph.
  const cellWidth = (W - PAD * 2) / items.length;
  return items
    .map((item, i) => {
      const x = PAD + i * cellWidth;
      return `
      <g transform="translate(${x}, ${y})">
        ${item.glyph}
        <text x="58" y="30" font-family="${FONT}" font-size="22" font-weight="600"
              fill="${TEXT}">${escapeXml(item.handle)}</text>
      </g>`;
    })
    .join("\n");
}

function avatarBlock(centerY) {
  if (!avatarDataUri) return "";
  const size = 200;
  const x = W - PAD - size;
  const y = Math.round(centerY - size / 2);
  const cx = x + size / 2;
  const cy = y + size / 2;
  const r = size / 2;
  return `
    <defs>
      <clipPath id="avatar-clip">
        <circle cx="${cx}" cy="${cy}" r="${r}"/>
      </clipPath>
    </defs>
    <image href="${avatarDataUri}" x="${x}" y="${y}"
           width="${size}" height="${size}"
           clip-path="url(#avatar-clip)"
           preserveAspectRatio="xMidYMid slice"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none"
            stroke="${RING}" stroke-width="2"/>`;
}

function svg({ eyebrow = "", title, subtitle = "" }) {
  const [sub1, sub2] = splitSubtitle(subtitle, 56);

  // Eyebrow is a breadcrumb-style label ("Kevin Trinh / Articles"), kept
  // in source case rather than uppercased so the slash reads naturally.
  const eyebrowBlock = eyebrow
    ? `<text x="${PAD}" y="160" font-family="${FONT}" font-size="22" font-weight="600"
            letter-spacing="1" fill="${ACCENT}">${escapeXml(eyebrow)}</text>`
    : "";

  // Title baseline. Slightly lower when an eyebrow exists so the gap reads
  // as deliberate. Title font is 80pt — small enough to leave breathing room
  // beside the avatar even on the longer titles.
  const titleY = eyebrow ? 290 : 270;
  // Title visual centre — for an 80pt font the cap-height middle sits ~28pt
  // above the baseline. Aligning the avatar to this looks balanced.
  const titleVisualCenter = titleY - 28;
  const sub1Y = titleY + 60;
  const sub2Y = sub1Y + 46;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <!-- Base -->
  <rect width="${W}" height="${H}" fill="${BG}"/>

  <!-- Thin left accent stripe -->
  <rect x="0" y="0" width="6" height="${H}" fill="${ACCENT}"/>

  <!-- Avatar (top-right, vertically centred on the title) -->
  ${avatarBlock(titleVisualCenter)}

  <!-- Eyebrow -->
  ${eyebrowBlock}

  <!-- Title -->
  <text x="${PAD}" y="${titleY}" font-family="${FONT}" font-size="80"
        font-weight="700" fill="${TEXT}">${escapeXml(title)}</text>

  <!-- Subtitle -->
  ${
    sub1
      ? `<text x="${PAD}" y="${sub1Y}" font-family="${FONT}" font-size="30" font-weight="400" fill="${MUTED}">${escapeXml(
          sub1
        )}</text>`
      : ""
  }
  ${
    sub2
      ? `<text x="${PAD}" y="${sub2Y}" font-family="${FONT}" font-size="30" font-weight="400" fill="${MUTED}">${escapeXml(
          sub2
        )}</text>`
      : ""
  }

  <!-- Divider above socials -->
  <line x1="${PAD}" y1="510" x2="${W - PAD}" y2="510"
        stroke="${RING}" stroke-width="1"/>

  <!-- Socials row -->
  ${socialsRow(548)}
</svg>`;
}

const CARDS = [
  {
    file: "home.png",
    eyebrow: "",
    title: "Kevin Trinh",
    subtitle:
      "Software Engineer & Creator from Houston, TX.\nBuilding thoughtful software at the University of Houston.",
  },
  {
    file: "links.png",
    eyebrow: "Kevin Trinh / Links",
    title: "Find me online",
    subtitle: "Socials, content, and writing all in one place.",
  },
  {
    file: "articles.png",
    eyebrow: "Kevin Trinh / Articles",
    title: "Writing & Notes",
    subtitle: "Deep dives, guides, and dev notes from Kevin Trinh.",
  },
  {
    file: "projects.png",
    eyebrow: "Kevin Trinh / Projects",
    title: "Things I've built",
    subtitle: "Open source apps, tools, and side projects by Kevin Trinh.",
  },
];

(async () => {
  for (const card of CARDS) {
    const out = path.join(OUT_DIR, card.file);
    const buf = Buffer.from(svg(card));
    await sharp(buf).png({ compressionLevel: 9 }).toFile(out);
    const stat = fs.statSync(out);
    console.log(`✓ ${card.file}  (${(stat.size / 1024).toFixed(1)} KB)`);
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
