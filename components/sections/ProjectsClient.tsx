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
  ChevronDown,
  ChevronUp,
  FolderOpen,
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

  const [showAll, setShowAll] = useState(false);

  // Collapsed count by breakpoint:
  // - Mobile: 3 (stacked, looks fine)
  // - Tablet (sm): 2 (fills exactly one row in a 2-col grid)
  // - Desktop (lg): 3 (fills exactly one row in a 3-col grid)
  const [collapsedCount, setCollapsedCount] = useState(3);

  // Subtle reveal animation for the "new" cards when expanding
  const [revealExtras, setRevealExtras] = useState(false);

  useEffect(() => {
    const mqLg = window.matchMedia("(min-width: 1024px)"); // Tailwind lg
    const mqSm = window.matchMedia("(min-width: 640px)"); // Tailwind sm

    const compute = () => {
      setCollapsedCount(mqLg.matches ? 3 : mqSm.matches ? 2 : 3);
    };

    compute();
    mqLg.addEventListener?.("change", compute);
    mqSm.addEventListener?.("change", compute);

    return () => {
      mqLg.removeEventListener?.("change", compute);
      mqSm.removeEventListener?.("change", compute);
    };
  }, []);

  useEffect(() => {
    if (!showAll) {
      setRevealExtras(false);
      return;
    }
    setRevealExtras(false);
    const t = requestAnimationFrame(() => setRevealExtras(true));
    return () => cancelAnimationFrame(t);
  }, [showAll]);

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

  const visibleProjects = showAll
    ? projects
    : projects.slice(0, collapsedCount);
  const showToggle = projects.length > collapsedCount;

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
              <FolderOpen className="h-4 w-4" />
              <span>View all projects</span>
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
          {visibleProjects.map((project, idx) => {
            const isExtra = showAll && idx >= collapsedCount;

            return (
              <div
                key={project.id}
                className={[
                  "transition-all duration-300 ease-out",
                  isExtra
                    ? revealExtras
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-2"
                    : "opacity-100 translate-y-0",
                ].join(" ")}
                style={
                  isExtra
                    ? {
                        transitionDelay: `${
                          Math.min(idx - collapsedCount, 8) * 45
                        }ms`,
                      }
                    : undefined
                }
              >
                <ProjectCard
                  project={project}
                  onOpenDetails={openProject}
                  iconFor={iconFor}
                />
              </div>
            );
          })}
        </div>

        {showToggle && (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => setShowAll((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-white/10 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              <span>{showAll ? "Show less" : "View more"}</span>
              {showAll ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
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
