// components/projects/ProjectDetails.tsx
"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  Calendar,
  Tags,
  Tag,
  Globe,
  Download,
  Star,
  GitFork,
  GitCommit,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { ProjectItem } from "../../config/projects";
import {
  formatFullDate,
  formatShortDate,
  getDisplayDates,
  getGithubRepoUrl,
  normalizeRepoUrl,
  displayUrl,
} from "./projectHelpers";

interface ProjectDetailsProps {
  project: ProjectItem;
  iconFor: (type?: string) => ReactNode;
}

export function ProjectDetails({ project, iconFor }: ProjectDetailsProps) {
  // Prefer cached HTML, fall back to plain text — all provided by the server loader
  const htmlExcerpt = (project as any).readmeHtmlExcerpt as string | undefined;
  const htmlFull = (project as any).readmeHtmlFull as string | undefined;
  const plainExcerpt = (project as any).readmePlainExcerpt as
    | string
    | undefined;
  const plainFull = (project as any).readmePlainFull as string | undefined;

  const selectedHtml = htmlFull ?? htmlExcerpt;
  const selectedPlain = plainFull ?? plainExcerpt;

  const hasHtml = Boolean(selectedHtml);
  const hasPlain = Boolean(selectedPlain);

  // Single toggle: show/hide entire README (default visible)
  const [showReadme, setShowReadme] = useState(true);

  const { startLabel, endLabel } = useMemo(
    () => getDisplayDates(project),
    [project]
  );

  const timeRange = useMemo(() => {
    if (!startLabel && !endLabel) return null;
    return [startLabel, endLabel].filter(Boolean).join(" – ");
  }, [startLabel, endLabel]);

  const repoCreatedFull = formatFullDate(project.repoCreatedAt);
  const repoPushedFull = formatFullDate(project.repoPushedAt);

  const githubRepoUrl = getGithubRepoUrl(project);
  const normalizedRepoUrl = githubRepoUrl
    ? normalizeRepoUrl(githubRepoUrl)
    : undefined;

  const hasDownloadsMeta =
    project.downloads !== undefined ||
    !!project.githubLatestReleaseTag ||
    !!project.githubLatestReleaseName ||
    !!project.githubLatestReleasePublishedAt;

  // Latest release pieces
  const latestReleaseTag = project.githubLatestReleaseTag;
  const latestReleaseName =
    project.githubLatestReleaseName ?? project.githubLatestReleaseTag;
  const latestReleaseDateShort = formatShortDate(
    project.githubLatestReleasePublishedAt
  );
  const latestReleaseUrl =
    normalizedRepoUrl && latestReleaseTag
      ? `${normalizedRepoUrl}/releases/tag/${encodeURIComponent(
          latestReleaseTag
        )}`
      : undefined;

  const latestReleaseButtonText = useMemo(() => {
    if (!latestReleaseName) return null;
    if (latestReleaseTag && !latestReleaseName.includes(latestReleaseTag)) {
      return `${latestReleaseName} – ${latestReleaseTag}`;
    }
    return latestReleaseName;
  }, [latestReleaseName, latestReleaseTag]);

  const hasStatsRow =
    project.githubStars !== undefined ||
    project.githubForks !== undefined ||
    project.downloads !== undefined;

  return (
    <div className="space-y-5">
      {/* Combined info row: time range, repo dates, stats */}
      {(timeRange || repoCreatedFull || repoPushedFull || hasStatsRow) && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {timeRange && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span className="font-medium">{timeRange}</span>
            </span>
          )}

          {(repoCreatedFull || repoPushedFull) && (
            <span className="inline-flex items-center gap-1">
              <span className="font-medium">
                {repoCreatedFull && (
                  <>
                    Repo created: {repoCreatedFull}
                    {repoPushedFull ? " · " : ""}
                  </>
                )}
                {repoPushedFull && <>Last push: {repoPushedFull}</>}
              </span>
            </span>
          )}

          {hasStatsRow && (
            <span className="inline-flex flex-wrap items-center gap-4">
              {project.githubStars !== undefined && (
                <span className="inline-flex items-center gap-1">
                  <Star className="h-3.5 w-3.5" />
                  <span className="font-medium">
                    {project.githubStars} Stars
                  </span>
                </span>
              )}
              {project.githubForks !== undefined && (
                <span className="inline-flex items-center gap-1">
                  <GitFork className="h-3.5 w-3.5" />
                  <span className="font-medium">
                    {project.githubForks} Forks
                  </span>
                </span>
              )}
              {project.downloads !== undefined && (
                <span className="inline-flex items-center gap-1">
                  <Download className="h-3.5 w-3.5" />
                  <span className="font-medium">
                    {project.downloads} Downloads
                  </span>
                </span>
              )}
            </span>
          )}
        </div>
      )}

      {/* Badges row (static shields from config) */}
      {project.badges?.length ? (
        <div className="flex flex-wrap gap-2">
          {project.badges.map((src) => (
            <img key={src} src={src} alt="" className="h-6" loading="lazy" />
          ))}
        </div>
      ) : null}

      {/* Tech & tools */}
      {project.technologies?.length ? (
        <div>
          <p className="mb-2 inline-flex items-center gap-2 text-[13px] font-semibold text-foreground">
            <Tags className="h-3.5 w-3.5" />
            <span>Tech &amp; Tools</span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {project.technologies.map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-1 text-xs text-muted-foreground transition-transform transition-colors duration-200 hover:-translate-y-[1px] hover:border-accent/60 hover:bg-white/5"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {/* Repo topics (if any) */}
      {project.repoTopics?.length ? (
        <div>
          <p className="mb-2 inline-flex items-center gap-2 text-[13px] font-semibold text-foreground">
            <Tag className="h-3.5 w-3.5" />
            <span>Topics</span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {project.repoTopics.map((topic) => (
              <span
                key={topic}
                className="rounded-full border border-white/10 bg-white/[0.02] px-2 py-1 text-xs text-muted-foreground transition-transform transition-colors duration-200 hover:-translate-y-[1px] hover:border-accent/60 hover:bg-white/5"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {/* Website + Latest Release buttons (below topics) */}
      {(project.repoHomepage ||
        (hasDownloadsMeta && latestReleaseButtonText && latestReleaseUrl)) && (
        <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
          {project.repoHomepage && (
            <div className="flex flex-col items-start gap-1">
              <div className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-white/90">
                <Globe className="h-3.5 w-3.5 text-white/90" />
                <span>Website</span>
              </div>
              <a
                href={project.repoHomepage}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex w-full items-center justify-center rounded-lg border border-white/25 bg-white/5 px-3.5 py-2 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:border-accent hover:bg-white/10 hover:text-foreground"
              >
                <span className="truncate">
                  {displayUrl(project.repoHomepage)}
                </span>
              </a>
            </div>
          )}

          {hasDownloadsMeta && latestReleaseButtonText && latestReleaseUrl && (
            <div className="flex flex-col items-start gap-1">
              <div className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-white/90">
                <Tag className="h-3.5 w-3.5 text-white/90" />
                <span>
                  Latest Release
                  {latestReleaseDateShort ? ` (${latestReleaseDateShort})` : ""}
                </span>
              </div>
              <a
                href={latestReleaseUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex w-full items-center justify-center rounded-lg border border-white/25 bg-white/5 px-3.5 py-2 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:border-accent hover:bg-white/10 hover:text-foreground"
              >
                <span className="truncate">{latestReleaseButtonText}</span>
              </a>
            </div>
          )}
        </div>
      )}

      {/* Optional short description above README (last content block before README) */}
      {(project.description?.length || project.summary) && (
        <div className="space-y-2 text-sm leading-6 text-muted-foreground">
          {project.description?.length
            ? project.description.map((p, i) => <p key={i}>{p}</p>)
            : project.summary && <p>{project.summary}</p>}
        </div>
      )}

      {/* README wrapper with ONE control button (collapse/show) */}
      {(hasHtml || hasPlain) && (
        <div className="rounded-xl border border-white/10 bg-black/40 p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[13px] font-semibold text-white/85">README</p>

            <button
              type="button"
              onClick={() => setShowReadme((s) => !s)}
              className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/85 shadow-sm transition hover:border-accent hover:bg-white/10 hover:text-foreground"
            >
              {showReadme ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5" />
                  Hide README
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5" />
                  Show README
                </>
              )}
            </button>
          </div>

          {/* README content (hidden entirely when collapsed) */}
          {showReadme && (
            <>
              {hasHtml ? (
                <div
                  className="prose prose-invert max-w-none prose-a:underline prose-img:rounded-lg prose-code:px-1 prose-code:py-0.5 prose-pre:my-3"
                  dangerouslySetInnerHTML={{ __html: selectedHtml! }}
                />
              ) : (
                <div className="space-y-2 rounded-md border border-white/10 bg-white/5 p-3 text-sm text-muted-foreground">
                  <div className="whitespace-pre-wrap">{selectedPlain}</div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Primary links + GitHub actions at the very end */}
      {(project.links?.length || normalizedRepoUrl) && (
        <div className="mt-2 flex flex-wrap justify-start gap-2">
          {project.links?.map((l) => (
            <a
              key={`${project.id}-${l.label}`}
              href={l.href}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/25 bg-white/5 px-3.5 py-2 text-sm font-medium text-white/90 shadow-sm transition-colors hover:border-accent hover:bg-white/10 hover:text-foreground sm:w-auto"
            >
              {iconFor(l.type)}
              <span>{l.label}</span>
            </a>
          ))}

          {normalizedRepoUrl && (
            <>
              {/* Commits button */}
              <a
                href={`${normalizedRepoUrl}/commits`}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/25 bg-white/5 px-3.5 py-2 text-sm font-medium text-white/90 shadow-sm transition-colors hover:border-accent hover:bg-white/10 hover:text-foreground sm:w-auto"
              >
                <GitCommit className="h-3.5 w-3.5" />
                <span>Commits</span>
              </a>

              {/* Releases button only when we have releases/downloads meta */}
              {hasDownloadsMeta && (
                <a
                  href={`${normalizedRepoUrl}/releases`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/25 bg-white/5 px-3.5 py-2 text-sm font-medium text-white/90 shadow-sm transition-colors hover:border-accent hover:bg-white/10 hover:text-foreground sm:w-auto"
                >
                  <Tag className="h-3.5 w-3.5" />
                  <span>Releases</span>
                </a>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
