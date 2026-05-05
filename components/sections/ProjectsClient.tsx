// components/sections/ProjectsClient.tsx
"use client";

import Link from "next/link";
import { useMemo, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import {
  FilledGithub,
  FilledGlobe,
  FilledFileText,
  FilledDownload,
  FilledPlay,
  FilledArrowUpRight,
} from "@/components/FilledIcons";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ProjectItem } from "../../config/projects";
import { Modal } from "../ui/Modal";
import { ProjectCard } from "../projects/ProjectCard";
import { FeaturedProjectsCarousel } from "../projects/FeaturedProjectsTicker";
import { ProjectDetails } from "../projects/ProjectDetails";

interface ProjectsSectionClientProps {
  projects: ProjectItem[];
}

export function ProjectsSectionClient({
  projects,
}: ProjectsSectionClientProps) {
  // If the loader somehow returns an empty list, show nothing
  if (!projects.length) return null;

  const defaultVisibleCount = 3;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedProjectId = searchParams.get("project");
  const selected = useMemo(
    () =>
      selectedProjectId
        ? projects.find((p) => p.id === selectedProjectId) ?? null
        : null,
    [selectedProjectId, projects]
  );

  const visibleProjects = useMemo(
    () => projects.slice(0, Math.min(defaultVisibleCount, projects.length)),
    [projects]
  );

  // Use featured projects for the carousel; fallback to first projects if none marked featured.
  // Also cap to 8 to keep the carousel clean.
  const featuredCarouselProjects = useMemo(() => {
    const featured = projects.filter((p) => p.featured);
    return (featured.length ? featured : projects).slice(0, 8);
  }, [projects]);

  const openProject = (project: ProjectItem) => {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("project", project.id);
    const nextUrl = `${pathname}?${sp.toString()}`;
    router.replace(nextUrl, { scroll: false });
  };

  const closeProject = () => {
    const sp = new URLSearchParams(searchParams.toString());
    sp.delete("project");
    const nextUrl = sp.toString() ? `${pathname}?${sp.toString()}` : pathname;
    router.replace(nextUrl, { scroll: false });
  };

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

  const modalTitle: string | undefined = selected?.name ?? "Project";

  return (
    <section id="projects" className="py-16 scroll-mt-12 lg:py-24 overflow-x-hidden">
      {/* Heading container */}
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-1 items-center gap-4">
            <h2 className="font-mono text-[13px] font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:text-lg">
              ~/Projects
            </h2>
            <div className="hidden h-px w-40 bg-white/15 sm:block sm:w-72" aria-hidden />
          </div>

          <div className="grid grid-cols-1 gap-2 sm:flex sm:items-center">
            <Link
              href="/projects"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3.5 py-2 text-sm font-medium text-white/80 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-white/10 hover:text-white active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 sm:w-auto sm:justify-start"
            >
              <span>View all Projects</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Featured projects carousel (kept aligned to section container like your other sections) */}
      {featuredCarouselProjects.length > 0 && (
        <div className="mx-auto mt-8 w-full max-w-6xl px-4">
          <FeaturedProjectsCarousel projects={featuredCarouselProjects} />
        </div>
      )}

      {/* Regular project cards grid back inside container */}
      <div className="mx-auto mt-8 w-full max-w-6xl px-4">
        <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleProjects.map((project) => (
            <div key={project.id} className="opacity-100 translate-y-0">
              <ProjectCard
                project={project}
                onOpenDetails={openProject}
                iconFor={iconFor}
                hideImage
              />
            </div>
          ))}
        </div>

      </div>

      {/* Info Modal – cached data only */}
      <Modal open={Boolean(selected)} onClose={closeProject} title={modalTitle}>
        {selected && <ProjectDetails project={selected} iconFor={iconFor} />}
      </Modal>
    </section>
  );
}
