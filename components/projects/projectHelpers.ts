// components/projects/projectHelpers.ts
import type { CaseItem } from "../../config/cases";

// Helper: format ISO date (e.g. repoCreatedAt) as "Mon YYYY"
export function formatMonthYear(iso?: string): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

// Helper: format ISO date as "Mon DD, YYYY"
export function formatFullDate(iso?: string): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Helper: format ISO as "MM/DD/YY" for compact label
export function formatShortDate(iso?: string): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return undefined;
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${mm}/${dd}/${yy}`;
}

// Helper: compute displayable start/end labels respecting AUTO + threshold
export function getDisplayDates(project: CaseItem): {
  startLabel?: string;
  endLabel?: string;
} {
  const rawStart = project.start?.trim();
  const rawEnd = project.end?.trim();
  const thresholdDays =
    typeof project.autoInactiveThresholdDays === "number" &&
    Number.isFinite(project.autoInactiveThresholdDays)
      ? project.autoInactiveThresholdDays
      : 90;

  const isAuto = (value?: string) =>
    !!value && value.trim().toLowerCase() === "auto";

  let startLabel = rawStart || undefined;
  let endLabel = rawEnd || undefined;

  // AUTO start => use repoCreatedAt if available
  if (isAuto(rawStart) && project.repoCreatedAt) {
    const formatted = formatMonthYear(project.repoCreatedAt);
    if (formatted) startLabel = formatted;
  }

  // AUTO end => use repoPushedAt + threshold rule
  if (isAuto(rawEnd) && project.repoPushedAt) {
    const pushed = new Date(project.repoPushedAt);
    if (!Number.isNaN(pushed.getTime())) {
      const now = new Date();
      const diffMs = now.getTime() - pushed.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      if (diffDays <= thresholdDays) {
        endLabel = "Present";
      } else {
        const formatted = formatMonthYear(project.repoPushedAt);
        if (formatted) endLabel = formatted;
      }
    }
  }

  return { startLabel, endLabel };
}

// Helper: best GitHub repo URL (githubRepoUrl > github link > undefined)
export function getGithubRepoUrl(project: CaseItem): string | undefined {
  if (project.githubRepoUrl) return project.githubRepoUrl;
  const githubLink = project.links?.find((l) => l.type === "github");
  if (githubLink?.href) return githubLink.href;
  return undefined;
}

// Normalize repo URL to owner/repo form (strip .git, trailing slash, etc.)
export function normalizeRepoUrl(url: string): string {
  return url.replace(/\.git$/i, "").replace(/\/+$/, "");
}

// Helper: display URL without protocol
export function displayUrl(url: string): string {
  return url.replace(/^https?:\/\//i, "");
}

