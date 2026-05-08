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

// Palette — restrained: one accent, otherwise greyscale.
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

// Naive two-line wrap for the subtitle. OG subtitles are deliberately short
// so this rarely needs to split — but when it does, break at the nearest
// space before maxChars rather than mid-word.
function wrapTwoLines(text, maxChars) {
  if (!text) return ["", ""];
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

function socialsRow(y) {
  const items = [
    { glyph: linkedInGlyph(), label: "LinkedIn" },
    { glyph: youtubeGlyph(), label: "YouTube" },
    { glyph: githubGlyph(), label: "GitHub" },
  ];
  // Distribute evenly across the content width, left-aligned within each cell.
  const cellWidth = (W - PAD * 2) / items.length;
  return items
    .map((item, i) => {
      const x = PAD + i * cellWidth;
      return `
      <g transform="translate(${x}, ${y})">
        ${item.glyph}
        <text x="60" y="32" font-family="${FONT}" font-size="26" font-weight="600"
              fill="${TEXT}">${escapeXml(item.label)}</text>
      </g>`;
    })
    .join("\n");
}

function avatarBlock() {
  if (!avatarDataUri) return "";
  const size = 200;
  const x = W - PAD - size;
  const y = PAD + 10;
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
  const [sub1, sub2] = wrapTwoLines(subtitle, 44);

  const eyebrowBlock = eyebrow
    ? `<text x="${PAD}" y="160" font-family="${FONT}" font-size="22" font-weight="700"
            letter-spacing="6" fill="${ACCENT}">${escapeXml(
        eyebrow.toUpperCase()
      )}</text>`
    : "";

  // Push title down a bit more when the eyebrow is absent so the layout stays
  // optically balanced against the avatar on the right.
  const titleY = eyebrow ? 270 : 260;
  const sub1Y = titleY + 70;
  const sub2Y = sub1Y + 46;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <!-- Base -->
  <rect width="${W}" height="${H}" fill="${BG}"/>

  <!-- Thin left accent stripe -->
  <rect x="0" y="0" width="6" height="${H}" fill="${ACCENT}"/>

  <!-- Avatar (top-right) -->
  ${avatarBlock()}

  <!-- Eyebrow -->
  ${eyebrowBlock}

  <!-- Title -->
  <text x="${PAD}" y="${titleY}" font-family="${FONT}" font-size="92"
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
      "Software Engineer · Developer · Creator · Business Owner",
  },
  {
    file: "links.png",
    eyebrow: "Links",
    title: "Find me online",
    subtitle: "Socials, content, and writing — all in one place.",
  },
  {
    file: "articles.png",
    eyebrow: "Articles",
    title: "Writing & Notes",
    subtitle: "Deep dives, guides, and dev notes from Kevin Trinh.",
  },
  {
    file: "projects.png",
    eyebrow: "Projects",
    title: "Things I've built",
    subtitle: "Open-source apps, tools, and side projects by Kevin Trinh.",
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
