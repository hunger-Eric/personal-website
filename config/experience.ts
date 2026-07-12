// config/experience.ts
import raw from "./experience.json";

export type ExperienceLinkType =
  | "pdf"
  | "publication"
  | "abstract"
  | "live"
  | "docs"
  | "video"
  | "github"
  | "external";

export type ExperienceLink = {
  label: string;
  href: string;
  type?: ExperienceLinkType;
  /** Small thumbnail image shown on the left side of the attachment card. */
  image?: string;
  /** Optional subtitle below the label, such as "PDF - 254 KB" or a domain. */
  subtitle?: string;
};

export type ExperienceItem = {
  id: string;
  role: string;
  company: string;
  /** Optional path to a small company logo, such as "/images/visibleseed.png". */
  logoUrl?: string;
  location?: string;
  type?: "internship" | "full-time" | "part-time" | "contract";
  start: string;
  end: string;
  description: string[];
  technologies?: string[];
  links?: ExperienceLink[];
};

type RawExperienceLink = {
  label?: unknown;
  href?: unknown;
  type?: unknown;
  image?: unknown;
  subtitle?: unknown;
};

type RawExperienceItem = {
  hidden?: unknown;
  id?: unknown;
  role?: unknown;
  company?: unknown;
  logoUrl?: unknown;
  location?: unknown;
  type?: ExperienceItem["type"];
  start?: unknown;
  end?: unknown;
  description?: unknown;
  technologies?: unknown;
  links?: unknown;
};

function isExperienceLinkType(value: unknown): value is ExperienceLinkType {
  return (
    value === "pdf" ||
    value === "publication" ||
    value === "abstract" ||
    value === "live" ||
    value === "docs" ||
    value === "video" ||
    value === "github" ||
    value === "external"
  );
}

function normalizeLinks(input: unknown): ExperienceLink[] | undefined {
  if (!Array.isArray(input)) return undefined;

  const out: ExperienceLink[] = [];
  for (const item of input) {
    if (!item || typeof item !== "object") continue;

    const rawLink = item as RawExperienceLink;
    const href = typeof rawLink.href === "string" ? rawLink.href.trim() : "";
    const label = typeof rawLink.label === "string" ? rawLink.label.trim() : "";
    if (!href || !label) continue;

    out.push({
      label,
      href,
      type: isExperienceLinkType(rawLink.type) ? rawLink.type : undefined,
      image: typeof rawLink.image === "string" ? rawLink.image : undefined,
      subtitle:
        typeof rawLink.subtitle === "string" ? rawLink.subtitle : undefined,
    });
  }

  return out.length ? out : undefined;
}

function isRawExperienceItem(value: unknown): value is RawExperienceItem {
  return Boolean(value) && typeof value === "object";
}

function normalize(items: unknown[]): ExperienceItem[] {
  return items
    .filter(isRawExperienceItem)
    .filter((item) => item.hidden !== true)
    .map((item) => ({
      id: String(item.id),
      role: String(item.role),
      company: String(item.company),
      logoUrl: item.logoUrl ? String(item.logoUrl) : undefined,
      location: item.location ? String(item.location) : undefined,
      type: item.type,
      start: String(item.start),
      end: String(item.end),
      description: Array.isArray(item.description)
        ? item.description.map(String)
        : [],
      technologies: Array.isArray(item.technologies)
        ? item.technologies.map(String)
        : undefined,
      links: normalizeLinks(item.links),
    }));
}

export const experience: ExperienceItem[] = normalize(raw as unknown[]);
