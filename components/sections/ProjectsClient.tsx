// components/sections/ProjectsClient.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Github,
  Globe,
  FileText,
  Download,
  PlayCircle,
  ExternalLink,
  FolderGit2,
} from "lucide-react";
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

  // Always show 3 cards by default, then expand when "Show More" is clicked
  const [showAll, setShowAll] = useState(false);
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

  // Show 3 cards by default, all if "Show More" is clicked
  const visibleProjects = useMemo(() => {
    if (showAll) return projects;
    return projects.slice(0, Math.min(defaultVisibleCount, projects.length));
  }, [projects, showAll]);

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
        return <Github className="h-3.5 w-3.5" />;
      case "live":
        return <Globe className="h-3.5 w-3.5" />;
      case "docs":
        return <FileText className="h-3.5 w-3.5" />;
      case "download":
        return <Download className="h-3.5 w-3.5" />;
      case "video":
        return <PlayCircle className="h-3.5 w-3.5" />;
      default:
        return <ExternalLink className="h-3.5 w-3.5" />;
    }
  };

  const modalTitle: string | undefined = selected?.name ?? "Project";

  return (
    <section id="projects" className="py-16 scroll-mt-12 overflow-x-hidden">
      {/* Heading container */}
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              ~/Projects
            </h2>

            <h3 className="mt-3 text-2xl font-semibold sm:text-3xl">
              Some things I&apos;ve been working on.
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3.5 py-2 text-sm font-medium text-white/80 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-white/10 hover:text-white active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              <FolderGit2 className="h-4 w-4" />
              <span>Projects directory</span>
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
              />
            </div>
          ))}
        </div>
        
        {/* Show More button */}
        {!showAll && projects.length > defaultVisibleCount && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setShowAll(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-white/80 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-white/10 hover:text-white active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              <span>Show More Projects</span>
              <ExternalLink className="h-4 w-4 rotate-90" />
            </button>
          </div>
        )}
        
        {/* Show Less button when expanded */}
        {showAll && projects.length > defaultVisibleCount && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setShowAll(false)}
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-white/80 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-white/10 hover:text-white active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              <span>Show Less</span>
              <ExternalLink className="h-4 w-4 -rotate-90" />
            </button>
          </div>
        )}
      </div>

      {/* Info Modal – cached data only */}
      <Modal open={Boolean(selected)} onClose={closeProject} title={modalTitle}>
        {selected && <ProjectDetails project={selected} iconFor={iconFor} />}
      </Modal>
    </section>
  );
}
