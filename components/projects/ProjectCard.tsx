// components/projects/ProjectCard.tsx
"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { FolderGit2, Star, GitFork, Download, Clock } from "lucide-react";
import type { ProjectItem, ProjectLink } from "../../config/projects";

interface ProjectCardProps {
  project: ProjectItem;
  onOpenDetails: (project: ProjectItem) => void;
  iconFor: (type?: string) => ReactNode;
}

function formatRelativeDate(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  const now = Date.now();
  const diffMs = now - d.getTime();
  const days = Math.floor(diffMs / 86_400_000);
  if (days < 1) return "today";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function fallbackImage(project: ProjectItem): string {
  const params = new URLSearchParams({
    title: project.name,
    subtitle: project.technologies?.slice(0, 3).join(" · ") || "Project",
  });
  return `/api/og?${params.toString()}`;
}

export function ProjectCard({ project, iconFor }: ProjectCardProps) {
  const router = useRouter();

  const hasStats =
    project.githubStars !== undefined ||
    project.githubForks !== undefined ||
    project.downloads !== undefined;

  const liveLink = project.links?.find((l) => l.type === "live");
  const isLive = Boolean(liveLink);

  const lastUpdated = formatRelativeDate(project.repoPushedAt);

  const projectHref =
    (project as any).href ||
    ((project as any).slug
      ? `/projects/${String((project as any).slug)}`
      : "") ||
    `/projects/${project.id}`;

  const goToProject = () => router.push(projectHref);

  const onCardKeyDown: React.KeyboardEventHandler<HTMLElement> = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      goToProject();
    }
  };

  const firstDesc = project.description?.length
    ? project.description[0]
    : project.summary ?? "";

  const actionBtnClass =
    "inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-transparent px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-accent hover:text-foreground";

  const image = project.imageUrl || fallbackImage(project);

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={goToProject}
      onKeyDown={onCardKeyDown}
      className={[
        "group flex h-full flex-col overflow-hidden rounded-lg border border-white/10 bg-white/5",
        "cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-white/30",
        "transition-colors transition-shadow transition-transform duration-200 ease-out",
        "hover:bg-white/[0.07] hover:border-white/15 hover:shadow-sm hover:-translate-y-[1px]",
      ].join(" ")}
      aria-label={`Open ${project.name} project page`}
    >
      {/* Cover image */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-white/5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={project.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          loading="lazy"
        />
        {/* Live status glow (issue #5) */}
        {isLive && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-950/70 px-2.5 py-1 text-[11px] font-semibold text-emerald-200 backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Live
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        {/* TOP ROW: icon + stats */}
        <div className="flex items-center justify-between gap-3">
          <span
            className="inline-flex items-center justify-center text-indigo-300/95"
            aria-hidden="true"
            title="Project"
          >
            <FolderGit2 className="h-7 w-7" />
          </span>

          {hasStats ? (
            <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
              {project.githubStars !== undefined && (
                <span className="inline-flex items-center gap-1" title="Stars">
                  <Star className="h-4 w-4" />
                  <span>{project.githubStars}</span>
                </span>
              )}
              {project.githubForks !== undefined && (
                <span className="inline-flex items-center gap-1" title="Forks">
                  <GitFork className="h-4 w-4" />
                  <span>{project.githubForks}</span>
                </span>
              )}
              {project.downloads !== undefined && (
                <span className="inline-flex items-center gap-1" title="Downloads">
                  <Download className="h-4 w-4" />
                  <span>{project.downloads}</span>
                </span>
              )}
            </div>
          ) : null}
        </div>

        {/* Title with updated marker */}
        <div className="mt-3 flex items-baseline justify-between gap-3">
          <h4 className="text-lg font-semibold text-foreground">
            <span
              className={[
                "bg-[length:0%_2px] bg-left-bottom bg-no-repeat",
                "bg-gradient-to-r from-white/70 to-white/70",
                "transition-[background-size] duration-300 ease-out",
                "group-hover:bg-[length:100%_2px]",
              ].join(" ")}
            >
              {project.name}
            </span>
          </h4>
          {lastUpdated ? (
            <span
              className="inline-flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground"
              title={`Last updated ${lastUpdated}`}
            >
              <Clock className="h-3 w-3" />
              {lastUpdated}
            </span>
          ) : null}
        </div>

        {/* Body */}
        <div className="mt-3 flex-1">
          {firstDesc ? (
            <p className="line-clamp-3 text-[14px] leading-6 text-muted-foreground">
              {firstDesc}
            </p>
          ) : null}

          {/* Tech chips */}
          {project.technologies?.length ? (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {project.technologies.slice(0, 6).map((t) => (
                <span
                  key={`${project.id}-tech-${t}`}
                  className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-medium text-slate-200/80"
                >
                  {t}
                </span>
              ))}
              {project.technologies.length > 6 && (
                <span className="rounded-md px-2 py-0.5 text-[11px] text-muted-foreground">
                  +{project.technologies.length - 6}
                </span>
              )}
            </div>
          ) : null}
        </div>

        {/* FOOTER: action buttons */}
        {project.links?.length ? (
          <div className="mt-4 pt-3">
            <div className="flex flex-wrap justify-start gap-2">
              {project.links.map((link: ProjectLink) => (
                <a
                  key={`${project.id}-${link.label}-${link.href}`}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className={actionBtnClass}
                >
                  {iconFor(link.type)}
                  <span>{link.label}</span>
                </a>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}
