// config/siteConfig.ts
import raw from "./site.json";

type ShowIn = {
  footer?: boolean;
  about?: boolean;
  contact?: boolean;
  links?: boolean;
};

export type SocialItemInput = {
  key: string;
  label?: string;
  href: string;
  icon?: string;
  showIn?: ShowIn;
  detail?: string;
  description?: string;
  qrImage?: string;
  qrAlt?: string;
  copyValue?: string;
};

export type SocialItem = SocialItemInput & {
  isCopy?: boolean;
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

type FeaturedContent = {
  youtubeVideoId?: string;
  youtubeChannelId?: string;
  youtubeVideoTitle?: string;
};

export type NavDropdownItemCfg = {
  id?: string;
  label: string;
  href: string;
  description?: string;
  icon?: string;
  external?: boolean;
  column?: "left" | "right";
};

export type NavDropdownFooterCfg = {
  text: string;
  linkLabel: string;
  href: string;
};

export type NavItemCfg = {
  id?: string;
  href?: string;
  label?: string;
  show?: boolean;
  isButton?: boolean;
  external?: boolean;
  children?: NavDropdownItemCfg[];
  dropdownFooter?: NavDropdownFooterCfg;
};

type NavConfig = {
  items?: NavItemCfg[];
};

type SiteJson = {
  name?: string;
  title?: string;
  tagline?: string;
  location?: string;
  socials?: SocialItemInput[] | Record<string, string>;
  sections?: Record<string, boolean>;
  repo?: RepoInfo;
  resume?: ResumeDelivery;
  about?: Record<string, unknown>;
  sponsor?: { enabled?: boolean; url?: string };
  featuredContent?: FeaturedContent;
  nav?: NavConfig;
};

const PUBLIC_CONTACT_EMAIL = (process.env.NEXT_PUBLIC_CONTACT_EMAIL || "").trim();

function normalizeEmailHref(href: string): string {
  const value = (href || "").trim();
  if (value === "mailto:" || value === "") {
    return PUBLIC_CONTACT_EMAIL ? `mailto:${PUBLIC_CONTACT_EMAIL}` : "";
  }
  if (value.startsWith("mailto:")) return value;
  if (value.includes("@") && !value.includes("://")) return `mailto:${value}`;
  return value;
}

function toShortSha(sha?: string) {
  if (!sha) return null;
  return sha.slice(0, 7);
}

function formatDateOnly(iso?: string) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function withCopyFlags(item: SocialItemInput): SocialItem {
  const href = (item.href || "").trim();
  if (href.startsWith("copy:")) {
    const value = href.slice("copy:".length);
    return {
      ...item,
      isCopy: true,
      copyValue: item.copyValue ?? (value || null),
      href,
    };
  }
  return { ...item, isCopy: false, copyValue: item.copyValue ?? null };
}

function normalizeSocials(input?: SiteJson["socials"]): SocialItem[] {
  if (!input) return [];

  if (Array.isArray(input)) {
    return input
      .filter(Boolean)
      .map((social) =>
        withCopyFlags({
          key: social.key,
          label: social.label || social.key,
          href:
            social.key === "email"
              ? normalizeEmailHref(social.href)
              : social.href,
          icon: social.icon,
          showIn: social.showIn || {},
          detail: social.detail,
          description: social.description,
          qrImage: social.qrImage,
          qrAlt: social.qrAlt,
          copyValue: social.copyValue,
        })
      )
      .map((social) => ({
        ...social,
        showIn: {
          footer: social.showIn?.footer !== false,
          about: social.showIn?.about !== false,
          contact: social.showIn?.contact !== false,
          links: social.showIn?.links !== false,
        },
      }))
      .filter((social) => Boolean(social.key && social.href));
  }

  const output: SocialItem[] = [];
  for (const [key, href] of Object.entries(input)) {
    if (!href) continue;
    output.push(
      withCopyFlags({
        key,
        label: key[0].toUpperCase() + key.slice(1),
        href,
        showIn: { footer: true, about: true, contact: true, links: true },
      })
    );
  }
  return output;
}

function socialsToFlatMap(socials: SocialItem[]) {
  const map: Record<string, string> = {};
  for (const social of socials) {
    map[social.key] = social.href;
  }
  return map;
}

const data = (raw as SiteJson) || {};
const socialsList = normalizeSocials(data.socials);
const socialsFlat = socialsToFlatMap(socialsList);

const socialsFor = {
  footer: socialsList.filter((social) => social.showIn?.footer),
  about: socialsList.filter((social) => social.showIn?.about),
  contact: socialsList.filter((social) => social.showIn?.contact),
};

const repo: RepoInfo = data.repo || {};
const shortSha = toShortSha(repo.lastCommitSha || undefined);
const lastCommitDateFormatted = formatDateOnly(
  repo.lastCommitDateISO || undefined
);

const resumeDelivery: ResumeDelivery = {
  source: data.resume?.source || "google",
  googleDocId: data.resume?.googleDocId || "",
  file: data.resume?.file || { path: "fengc_Resume.pdf", url: "" },
  filename: data.resume?.filename || "fengc_Resume.pdf",
  cacheSeconds: Number.isFinite(Number(data.resume?.cacheSeconds))
    ? Number(data.resume?.cacheSeconds)
    : 3600,
};

const defaultSections = {
  hero: true,
  about: true,
  education: true,
  experience: true,
  projects: true,
  publications: true,
  articles: true,
  youtube: false,
  certifications: true,
  contact: true,
  resume: true,
};

export const siteConfig = {
  name: data.name || "fengc",
  title: data.title || "AI Native 独立开发者",
  tagline: data.tagline || "构建 AI 驱动的系统、工作流与数字产品。",
  location: data.location || "",
  socials: socialsFlat,
  socialsList,
  socialsFor,
  sections: { ...defaultSections, ...(data.sections || {}) },
  nav: data.nav || undefined,
  repo: {
    url: repo.url,
    lastCommitSha: repo.lastCommitSha,
    lastCommitMessage: repo.lastCommitMessage,
    lastCommitDateISO: repo.lastCommitDateISO,
    lastCommitUrl: repo.lastCommitUrl,
    stars: repo.stars,
    forks: repo.forks,
    downloads: repo.downloads,
    shortSha,
    lastCommitDateFormatted,
  },
  about: data.about || {},
  resumeDelivery,
  resume: { items: [] },
  sponsor: data.sponsor || {
    enabled: true,
    url: "",
  },
  featuredContent: data.featuredContent || {
    youtubeVideoId: "",
    youtubeChannelId: "",
    youtubeVideoTitle: "",
  },
} as const;

export type SiteConfig = typeof siteConfig;
