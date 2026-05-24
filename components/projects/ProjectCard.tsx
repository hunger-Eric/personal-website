"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { FolderOpen, Star, GitFork, Download } from "lucide-react";

import { useLocale } from "@/components/LocaleProvider";
import { getSiteCopy } from "@/config/contentCopy";
import type { ProjectItem, ProjectLink } from "../../config/projects";

interface ProjectCardProps {
  project: ProjectItem;
  iconFor: (type?: string) => ReactNode;
  featured?: boolean;
}

function fallbackImage(): string {
  return "/images/demo_1.png";
}

function formatTechnologies(technologies?: string[]) {
  return (technologies ?? []).slice(0, 4);
}

export function ProjectCard({
  project,
  iconFor,
  featured = false,
}: ProjectCardProps) {
  const { locale } = useLocale();
  const copy = getSiteCopy(locale);
  const hasStats =
    project.githubStars !== undefined ||
    project.githubForks !== undefined ||
    project.downloads !== undefined;

  const href = `/projects/${encodeURIComponent(project.id)}`;
  const summary = project.description?.[0] ?? project.summary ?? "";
  const techs = formatTechnologies(project.technologies);
  const image = project.imageUrl || fallbackImage();

  return (
    <article
      className={[
        "group flex h-full flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-200",
        featured
          ? "border-border shadow-sm hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md"
          : "border-border/80 hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-sm",
      ].join(" ")}
    >
      <Link href={href} className="block">
        <div
          className={[
            "relative overflow-hidden bg-muted",
            featured ? "aspect-[16/9]" : "aspect-[4/3]",
          ].join(" ")}
        >
          <Image
            src={image}
            alt={project.name}
            fill
            unoptimized
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />

          <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-border bg-card/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground backdrop-blur-sm">
            <FolderOpen className="h-3.5 w-3.5" />
            <span>{featured ? copy.projects.featuredBadge : locale === "zh" ? "项目" : "Project"}</span>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-9 w-9 flex-none items-center justify-center rounded-lg border border-border bg-muted/60 text-muted-foreground">
              <FolderOpen className="h-4.5 w-4.5" />
            </span>
            <div className="min-w-0">
              <h4
                className={[
                  "min-w-0 font-semibold leading-snug text-foreground",
                  featured ? "text-xl sm:text-2xl" : "text-lg sm:text-[1.05rem]",
                ].join(" ")}
              >
                <span className="block min-w-0 break-words">{project.name}</span>
              </h4>
              {techs.length ? (
                <p className="mt-1 text-[12px] font-medium text-muted-foreground">
                  {techs.join(" · ")}
                </p>
              ) : null}
            </div>
          </div>

          {summary ? (
            <p
              className={[
                "text-sm leading-6 text-muted-foreground",
                featured ? "line-clamp-3" : "line-clamp-2",
              ].join(" ")}
            >
              {summary}
            </p>
          ) : null}

          {hasStats ? (
            <div className="flex flex-wrap items-center gap-3 border-t border-border/70 pt-3 text-[12px] text-muted-foreground">
              {project.githubStars !== undefined && (
                <span className="inline-flex items-center gap-1.5" title="Stars">
                  <Star className="h-3.5 w-3.5" />
                  <span>{project.githubStars}</span>
                </span>
              )}
              {project.githubForks !== undefined && (
                <span className="inline-flex items-center gap-1.5" title="Forks">
                  <GitFork className="h-3.5 w-3.5" />
                  <span>{project.githubForks}</span>
                </span>
              )}
              {project.downloads !== undefined && (
                <span className="inline-flex items-center gap-1.5" title="Downloads">
                  <Download className="h-3.5 w-3.5" />
                  <span>{project.downloads}</span>
                </span>
              )}
            </div>
          ) : null}
        </div>
      </Link>

      {project.links?.length ? (
        <div className="flex flex-wrap gap-2 border-t border-border/70 p-4 pt-0 sm:p-5 sm:pt-0">
          {project.links.map((link: ProjectLink) => (
            <a
              key={`${project.id}-${link.label}-${link.href}`}
              href={link.href}
              target="_blank"
              rel="noreferrer noopener"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            >
              {iconFor(link.type)}
              <span>{link.label}</span>
            </a>
          ))}
        </div>
      ) : null}
    </article>
  );
}
