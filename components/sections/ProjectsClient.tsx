"use client";

import { useMemo, type ReactNode } from "react";
import { ArrowRight, FolderOpen } from "lucide-react";
import {
  FilledGithub,
  FilledGlobe,
  FilledFileText,
  FilledDownload,
  FilledPlay,
  FilledArrowUpRight,
} from "@/components/FilledIcons";
import { useLocale } from "@/components/LocaleProvider";
import { getSiteCopy } from "@/config/contentCopy";
import type { ProjectItem } from "../../config/projects";
import { ProjectCard } from "../projects/ProjectCard";

interface ProjectsSectionClientProps {
  projects: ProjectItem[];
}

export function ProjectsSectionClient({
  projects,
}: ProjectsSectionClientProps) {
  const { locale } = useLocale();
  const copy = getSiteCopy(locale);

  const iconFor = (type?: string): ReactNode => {
    switch (type) {
      case "github":
        return <FilledGithub className="h-4 w-4" />;
      case "live":
        return <FilledGlobe className="h-4 w-4" />;
      case "docs":
        return <FilledFileText className="h-4 w-4" />;
      case "download":
        return <FilledDownload className="h-4 w-4" />;
      case "video":
        return <FilledPlay className="h-4 w-4" />;
      default:
        return <FilledArrowUpRight className="h-4 w-4" />;
    }
  };

  const featuredProject = useMemo(
    () => projects.find((project) => project.featured) || projects[0] || null,
    [projects]
  );

  const supportingProjects = useMemo(() => {
    if (!featuredProject) return [];
    return projects.filter((project) => project.id !== featuredProject.id).slice(0, 3);
  }, [projects, featuredProject]);

  const visibleProjects = featuredProject
    ? [featuredProject, ...supportingProjects]
    : [];

  if (!projects.length || !featuredProject) {
    return null;
  }

  return (
    <section id="projects" className="scroll-mt-12 py-16 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="flex items-center gap-4">
          <h2 className="flex items-center gap-2 font-mono text-[13px] font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:text-lg">
            <FolderOpen className="h-4 w-4" />
            <span>{copy.projects.heading}</span>
          </h2>
          <div className="hidden h-px w-40 bg-border sm:block sm:w-72" aria-hidden />
          <div className="flex-1" />
          <a
            href="/projects"
            className="group inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-muted active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            <span>{copy.projects.viewAll}</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </a>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleProjects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              iconFor={iconFor}
              featured={index === 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
