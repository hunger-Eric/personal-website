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

// Brand glyphs as inline SVG <g> snippets, sized to a 56px box.
// Geometry follows each platform's actual mark (LinkedIn 'in' with the
// official curve on the n; YouTube horizontal play; Instagram camera with
// proper proportions; TikTok offset cyan/magenta note).
const GLYPH_SIZE = 56;

function linkedInGlyph() {
  return `
    <rect width="56" height="56" rx="10" fill="#0A66C2"/>
    <circle cx="17" cy="18" r="3" fill="#ffffff"/>
    <rect x="14" y="23" width="6" height="20" fill="#ffffff"/>
    <path d="M24 23h6v3c1.2-2 3.6-3.4 6.6-3.4 5 0 7.4 2.8 7.4 7.6V43h-6V31.6c0-2.2-1-3.6-3-3.6s-4 1.6-4 4V43h-7V23z"
          fill="#ffffff"/>`;
}

function youtubeGlyph() {
  // Rounded rectangle with a centered play triangle — matches YT's actual
  // app-mark proportions when squared off (red rounded square + triangle).
  return `
    <rect width="56" height="56" rx="13" fill="#FF0000"/>
    <polygon points="22,17 22,39 40,28" fill="#ffffff"/>`;
}

function tiktokGlyph() {
  // Black square + offset cyan/magenta accents behind the white note.
  // The triple-fill creates the brand's chromatic-aberration look without
  // a filter (which librsvg rasterises inconsistently).
  const note =
    "M34 14c.5 3 2.5 4.7 5.5 5v3.7a11 11 0 0 1-6-1.5v8.4a8.8 8.8 0 1 1-8.8-8.8c.5 0 1 0 1.5.1v3.7c-.5-.2-1-.3-1.5-.3a5.4 5.4 0 1 0 5.4 5.4V14H34z";
  return `
    <rect width="56" height="56" rx="10" fill="#000000"/>
    <path d="${note}" fill="#25F4EE" transform="translate(1.6 0)"/>
    <path d="${note}" fill="#FE2C55" transform="translate(-1.6 0)"/>
    <path d="${note}" fill="#ffffff"/>`;
}

function socialsRow(y) {
  const items = [
    { glyph: linkedInGlyph(), handle: "in/KevinTrinhDev" },
    { glyph: tiktokGlyph(), handle: "@KevinTrinhDev" },
    { glyph: youtubeGlyph(), handle: "@KevinTrinhDev" },
  ];
  // Horizontal layout per cell: glyph on the left with the handle text
  // sitting to its right and vertically centred against the glyph.
  const cellWidth = (W - PAD * 2) / items.length;
  return items
    .map((item, i) => {
      const cellLeft = PAD + i * cellWidth;
      const labelX = cellLeft + GLYPH_SIZE + 16;
      const labelY = y + GLYPH_SIZE / 2 + 8;
      return `
      <g transform="translate(${cellLeft}, ${y})">
        ${item.glyph}
      </g>
      <text x="${labelX}" y="${labelY}" font-family="${FONT}" font-size="24"
            font-weight="600" fill="${TEXT}">${escapeXml(item.handle)}</text>`;
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

  <!-- Socials row (glyph + handle, horizontal) -->
  ${socialsRow(540)}
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
    eyebrow: "",
    title: "Find me online",
    subtitle: "Socials, content, and writing all in one place.",
  },
  {
    file: "articles.png",
    eyebrow: "",
    title: "Writing & Notes",
    subtitle: "Deep dives, guides, and dev notes from Kevin Trinh.",
  },
  {
    file: "projects.png",
    eyebrow: "",
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
