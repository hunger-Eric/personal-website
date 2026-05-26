// config/siteConfig.ts
import raw from "./site.json";

type ShowIn = { footer?: boolean; about?: boolean; contact?: boolean };

export type SocialItemInput = {
  key: string;
  label?: string;
  href: string; // supports: "https://...", "mailto:...", "copy:VALUE"
  icon?: string; // lucide-react icon name (e.g., "Github", "Mail")
  showIn?: ShowIn; // per-section visibility; default = show everywhere
  detail?: string; // optional right-side detail (Contact section)
};

export type SocialItem = SocialItemInput & {
  // Computed flags for convenience
  isCopy?: boolean; // true if href starts with "copy:"
  copyValue?: string | null;
};

type RepoInfo = {
  url?: string;
  lastCommitSha?: string;
  lastCommitMessage?: string;
  lastCommitDateISO?: string;
  lastCommitUrl?: string;
  stars?: number;
  forks?: number;
  downloads?: number;
};

type ResumeDelivery = {
  source?: "google" | "file";
  googleDocId?: string;
  file?: { path?: string; url?: string };
  filename?: string;
  cacheSeconds?: number;
};

// ----- NEW: nav + dropdown types -----
export type NavDropdownItemCfg = {
  id?: string;
  label: string;
  href: string;
  description?: string;
  icon?: string; // lucide-react icon name, e.g. "User", "BookOpen"
  external?: boolean;
  // "left" = goes in first column; anything else (or undefined) = right side (columns 2–3)
  column?: "left" | "right";
};

export type NavDropdownFooterCfg = {
  text: string; // left bold text
  linkLabel: string; // right clickable label
  href: string; // link (opens in new tab)
};

export type NavItemCfg = {
  id?: string; // e.g., "about", "projects", "resume"
  href?: string; // override link (external or internal) — can be "" to disable click
  label?: string; // visible text
  show?: boolean; // toggle visibility
  isButton?: boolean; // render as button (e.g., Resume)
  external?: boolean; // force new tab
  children?: NavDropdownItemCfg[]; // dropdown items
  dropdownFooter?: NavDropdownFooterCfg; // optional footer for this dropdown
};

type NavConfig = {
  items?: NavItemCfg[];
};

type SiteJson = {
  name?: string;
  title?: string;
  tagline?: string;
  location?: string;
  socials?: SocialItemInput[] | Record<string, string>; // supports both new & legacy
  sections?: Record<string, boolean>;
  repo?: RepoInfo;
  resume?: ResumeDelivery;
  about?: any;
  sponsor?: { enabled?: boolean; url?: string };
  // ----- NEW: allow nav in site.json -----
  nav?: NavConfig;
};

const PUBLIC_CONTACT_EMAIL = (process.env.NEXT_PUBLIC_CONTACT_EMAIL || "").trim();

function normalizeEmailHref(href: string): string {
  const raw = (href || "").trim();
  if (raw === "mailto:" || raw === "") {
    return PUBLIC_CONTACT_EMAIL ? `mailto:${PUBLIC_CONTACT_EMAIL}` : "";
  }
  if (raw.startsWith("mailto:")) return raw;
  if (raw.includes("@") && !raw.includes("://")) return `mailto:${raw}`;
  return raw;
}

// ---------- helpers ----------
function toShortSha(sha?: string) {
  if (!sha) return null;
  return sha.slice(0, 7);
}

function formatDateOnly(iso?: string) {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

/** Normalize "copy:" scheme into flags */
function withCopyFlags(item: SocialItemInput): SocialItem {
  const rawHref = (item.href || "").trim();
  if (rawHref.startsWith("copy:")) {
    const value = rawHref.slice("copy:".length);
    return {
      ...item,
      isCopy: true,
      copyValue: value || null,
      href: rawHref, // keep original so components can decide behavior
    };
  }
  return { ...item, isCopy: false, copyValue: null };
}

/**
 * Accept either:
 *  - new array form (with icon/per-section showIn), OR
 *  - legacy object map (key -> href).
 * Normalize into array of SocialItem (with isCopy/copyValue flags).
 */
function normalizeSocials(input?: SiteJson["socials"]): SocialItem[] {
  if (!input) return [];

  // New array form
  if (Array.isArray(input)) {
    return input
      .filter(Boolean)
      .map((s) =>
        withCopyFlags({
          key: s.key,
          label: s.label || s.key,
          href: s.key === "email" ? normalizeEmailHref(s.href) : s.href,
          icon: s.icon,
          showIn: s.showIn || {}, // default show everywhere handled below
          detail: s.detail,
        })
      )
      .map((s) => ({
        // default: show everywhere unless explicitly false
        ...s,
        showIn: {
          footer: s.showIn?.footer !== false,
          about: s.showIn?.about !== false,
          contact: s.showIn?.contact !== false,
        },
      }))
      .filter((s) => !!s.key && !!s.href);
  }

  // Legacy object form -> convert to basic list (show everywhere)
  const out: SocialItem[] = [];
  for (const [key, href] of Object.entries(input)) {
    if (!href) continue;
    out.push(
      withCopyFlags({
        key,
        label: key[0].toUpperCase() + key.slice(1),
        href,
        icon: undefined,
        showIn: { footer: true, about: true, contact: true },
      })
    );
  }
  return out;
}

/**
 * For back-compat, produce a flat map like:
 * { github?: string, linkedin?: string, devto?: string, email?: string, ... }
 * NOTE: we pass through the raw href (which can be "copy:..."). Components that
 * use this flat map should either filter out copy entries or handle them.
 */
function socialsToFlatMap(socials: SocialItem[]) {
  const map: Record<string, string> = {};
  for (const s of socials) {
    map[s.key] = s.href;
  }
  return map;
}

const data = (raw as SiteJson) || {};

// ── Socials: normalized arrays + flat map (for legacy components)
const socialsList = normalizeSocials(data.socials);
const socialsFlat = socialsToFlatMap(socialsList);

// Per-section filtered arrays (copy-aware)
const socialsFor = {
  footer: socialsList.filter((s) => s.showIn?.footer),
  about: socialsList.filter((s) => s.showIn?.about),
  contact: socialsList.filter((s) => s.showIn?.contact),
};

// ── Repo helpers
const repo: RepoInfo = data.repo || {};
const shortSha = toShortSha(repo.lastCommitSha || undefined);
const lastCommitDateFormatted = formatDateOnly(
  repo.lastCommitDateISO || undefined
);

// ── Resume delivery (server/browser cache window)
const resumeDelivery: ResumeDelivery = {
  source: data.resume?.source || "google",
  googleDocId: data.resume?.googleDocId || "",
  file: data.resume?.file || { path: "Kevin_Trinh_Resume.pdf", url: "" },
    filename: data.resume?.filename || "fengc_Resume.pdf",
  cacheSeconds: Number.isFinite(Number(data.resume?.cacheSeconds))
    ? Number(data.resume?.cacheSeconds)
    : 3600,
};

// ── Sections default flags
const defaultSections = {
  hero: true,
  about: true,
  education: true,
  experience: true,
  projects: true,
  publications: true,
  articles: true,
  youtube: true,
  certifications: true,
  contact: true,
  resume: true,
};

export const siteConfig = {
  name: data.name || "fengc",
  title: data.title || "AI Native 独立开发者",
  tagline:
    data.tagline ||
    "构建 AI 驱动的系统、工作流与数字产品。",
  location: data.location || "",

  // Back-compat map used by some components
  socials: socialsFlat,

  // New richer socials exports
  socialsList, // full list with isCopy/copyValue
  socialsFor, // per-section filtered lists

  // Sections flags
  sections: { ...defaultSections, ...(data.sections || {}) },

  // NEW: nav passthrough (typed above)
  nav: data.nav || undefined,

  // Repo + preformatted helpers
  repo: {
    url: repo.url,
    lastCommitSha: repo.lastCommitSha,
    lastCommitMessage: repo.lastCommitMessage,
    lastCommitDateISO: repo.lastCommitDateISO,
    lastCommitUrl: repo.lastCommitUrl,
    stars: repo.stars,
    forks: repo.forks,
    downloads: repo.downloads,

    // helpers
    shortSha,
    lastCommitDateFormatted, // e.g., "Jan 10, 2025"
  },

  // About passthrough
  about: data.about || {},

  // Resume delivery
  resumeDelivery,

  // Keep placeholder for structured resume items if you add later
  resume: { items: [] },

  // Sponsor
  sponsor: data.sponsor || {
    enabled: true,
    url: "",
  },

  // Featured content (landing-page Content section)
  featuredContent: (data as any).featuredContent || {
    youtubeVideoId: "",
    youtubeChannelId: "",
  },
} as const;

export type SiteConfig = typeof siteConfig;
