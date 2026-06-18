"use client";

import Image from "next/image";
import { Star, GitFork, Download } from "lucide-react";

import { FilledGithub, FilledGlobe, FilledFileText, FilledDownload, FilledPlay, FilledArrowUpRight } from "@/components/FilledIcons";

export interface Project {
  id: string;
  name: string;
  summary?: string;
  description?: string[];
  technologies?: string[];
  links?: Array<{ label: string; href: string; type: string }>;
  featured?: boolean;
  imageUrl?: string;
  githubStars?: number;
  githubForks?: number;
  downloads?: number;
  start?: string;
  end?: string;
}

interface ProjectCardProps {
  project: Project;
  hideImage?: boolean;
  iconFor?: (type: string) => React.ReactNode;
}

function getProjectBlurb(project: Project): string {
  return project.description?.[0] || project.summary || "A featured project built to solve a real problem.";
}

function IconWrapper({ type, iconFor }: { type: string; iconFor?: (type: string) => React.ReactNode }) {
  if (iconFor) return <>{iconFor(type)}</>;
  switch (type) {
    case "github":
      return <FilledGithub className="h-4 w-4" />;
    case "live":
      return <FilledGlobe className="h-4 w-4" />;
    case "docs":
      return <FilledFileText className="h-4 w-4" />;
    case "download":
      return <FilledDownload className="h-4 w-4" />;
    case "play":
      return <FilledPlay className="h-4 w-4" />;
    default:
      return <FilledArrowUpRight className="h-4 w-4" />;
  }
}

export function ProjectCard({ project, hideImage, iconFor }: ProjectCardProps) {
  const hasStats = project.githubStars !== undefined || project.githubForks !== undefined || project.downloads !== undefined;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-card border border-hairline bg-surface-paper-elevated shadow-card">
      {/* Image or gradient placeholder */}
      {!hideImage && project.imageUrl ? (
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={project.imageUrl}
            alt={project.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="relative aspect-video bg-gradient-to-br from-primary/10 via-primary/5 to-transparent" />
      )}

      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Project name and badge */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold text-foreground">{project.name}</h3>
          {project.featured && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
              Featured
            </span>
          )}
        </div>

        {/* Blurb */}
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {getProjectBlurb(project)}
        </p>

        {/* Stats row */}
        {hasStats && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {project.githubStars !== undefined && (
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                {project.githubStars.toLocaleString()}
              </span>
            )}
            {project.githubForks !== undefined && (
              <span className="flex items-center gap-1">
                <GitFork className="h-3 w-3" />
                {project.githubForks.toLocaleString()}
              </span>
            )}
            {project.downloads !== undefined && (
              <span className="flex items-center gap-1">
                <Download className="h-3 w-3" />
                {project.downloads.toLocaleString()}
              </span>
            )}
          </div>
        )}

        {/* Technologies */}
        {project.technologies && project.technologies.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {project.technologies.slice(0, 8).map((tech) => (
              <span
                key={tech}
                className="rounded-control bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        {/* Links */}
        {project.links && project.links.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-2">
            {project.links.slice(0, 3).map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.preventDefault();
                  window.open(link.href, "_blank", "noopener,noreferrer");
                }}
                className="inline-flex items-center gap-1 rounded-control border border-border bg-surface-paper px-2 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
              >
                <IconWrapper type={link.type} iconFor={iconFor} />
                <span>{link.label}</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
