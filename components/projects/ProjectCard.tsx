// components/projects/ProjectCard.tsx
"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { FolderGit2, Star, GitFork, Download } from "lucide-react";
import type { ProjectItem, ProjectLink } from "../../config/projects";

interface ProjectCardProps {
  project: ProjectItem;
  onOpenDetails: (project: ProjectItem) => void;
  iconFor: (type?: string) => ReactNode;
  hideImage?: boolean;
}

function fallbackImage(_project: ProjectItem): string {
  // Static fallback (next/og isn't reliable on Cloudflare Workers).
  return "/images/demo_1.png";
}

export function ProjectCard({ project, iconFor, hideImage }: ProjectCardProps) {
  const router = useRouter();

  const hasStats =
    project.githubStars !== undefined ||
    project.githubForks !== undefined ||
    project.downloads !== undefined;

  const liveLink = project.links?.find((l) => l.type === "live");
  const isLive = Boolean(liveLink);

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
      {!hideImage && (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-white/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={project.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            loading="lazy"
          />
        </div>
      )}

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

        {/* Title */}
        <div className="mt-3">
          <h4 className="text-lg font-semibold text-foreground">
            {project.name}
          </h4>
        </div>

        {/* Body */}
        <div className="mt-3 flex-1">
          {firstDesc ? (
            <p className="line-clamp-3 text-[14px] leading-6 text-muted-foreground">
              {firstDesc}
            </p>
          ) : null}

          {/* Tech list — comma-separated, single line */}
          {project.technologies?.length ? (
            <p className="mt-4 truncate text-[12px] font-medium text-indigo-200/80">
              {project.technologies.join(", ")}
            </p>
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
