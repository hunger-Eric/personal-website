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
  /** Optional subtitle below the label (e.g. "PDF · 254 KB" or domain). */
  subtitle?: string;
};

export type ExperienceItem = {
  id: string;
  role: string;
  company: string;
  /** Optional path to a small company logo (e.g. "/images/visibleseed.png"). */
  logoUrl?: string;
  location?: string;
  type?: "internship" | "full-time" | "part-time" | "contract";
  start: string; // e.g. "Jun 2024"
  end: string; // e.g. "Aug 2024" or "Present"
  description: string[];
  technologies?: string[];
  links?: ExperienceLink[];
};

function normalizeLinks(input: any): ExperienceLink[] | undefined {
  if (!Array.isArray(input)) return undefined;
  const out: ExperienceLink[] = [];
  for (const raw of input) {
    if (!raw || typeof raw !== "object") continue;
    const href = typeof raw.href === "string" ? raw.href.trim() : "";
    const label = typeof raw.label === "string" ? raw.label.trim() : "";
    if (!href || !label) continue;
    out.push({
      label,
      href,
      type: raw.type as ExperienceLinkType | undefined,
      image: typeof raw.image === "string" ? raw.image : undefined,
      subtitle: typeof raw.subtitle === "string" ? raw.subtitle : undefined,
    });
  }
  return out.length ? out : undefined;
}

// Light runtime guard (keeps shape predictable). Items with `hidden: true`
// in experience.json are filtered out — used to temporarily remove a role
// without losing its data.
function normalize(items: any[]): ExperienceItem[] {
  return (items || []).filter((it) => it && it.hidden !== true).map((it) => ({
    id: String(it.id),
    role: String(it.role),
    company: String(it.company),
    logoUrl: it.logoUrl ? String(it.logoUrl) : undefined,
    location: it.location ? String(it.location) : undefined,
    type: it.type,
    start: String(it.start),
    end: String(it.end),
    description: Array.isArray(it.description)
      ? it.description.map(String)
      : [],
    technologies: Array.isArray(it.technologies)
      ? it.technologies.map(String)
      : undefined,
    links: normalizeLinks(it.links),
  }));
}

export const experience: ExperienceItem[] = normalize(raw as any[]);
