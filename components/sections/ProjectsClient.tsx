"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";
import { ArrowRight, Folder } from "lucide-react";

import { useLocale } from "@/components/LocaleProvider";
import { getSiteCopy } from "@/config/contentCopy";
import { ProjectCard } from "@/components/projects/ProjectCard";
import {
  FeaturedProjectsCarousel,
  FeaturedProjectsTicker,
} from "@/components/projects/FeaturedProjectsTicker";

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

interface ProjectsSectionClientProps {
  projects: Project[];
}

const GITHUB_URL = "https://github.com/KevinTrinhDev";
const DESKTOP_VISIBLE = 3;
const MOBILE_VISIBLE = 6;
const CAROUSEL_CAP = 8;
const FALLBACK_BLURB = "A featured project built to solve a real problem.";

function getProjectBlurb(project: Project): string {
  return project.description?.[0] || project.summary || FALLBACK_BLURB;
}

export function ProjectsSectionClient({
  projects,
}: ProjectsSectionClientProps) {
  const { locale } = useLocale();
  const copy = getSiteCopy(locale);

  const featuredProjects = useMemo(
    () => projects.filter((p) => p.featured),
    [projects]
  );

  const carouselProjects = useMemo(() => {
    if (featuredProjects.length > 0) {
      return featuredProjects.slice(0, CAROUSEL_CAP);
    }
    return projects.slice(0, CAROUSEL_CAP);
  }, [featuredProjects, projects]);

  const mobileProjects = useMemo(
    () => projects.slice(0, MOBILE_VISIBLE),
    [projects]
  );

  const desktopProjects = useMemo(
    () => projects.slice(0, DESKTOP_VISIBLE),
    [projects]
  );

  if (!projects.length) return null;

  return (
    <section id="projects" className="scroll-mt-12 py-16 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="grid gap-5 border-t border-border pt-5 lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* Left column: heading + view all link */}
          <div>
            <h2 className="flex items-center gap-2 font-mono text-[13px] font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:text-lg">
              <Folder className="h-4 w-4" />
              <span>~/Projects</span>
            </h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              {locale === "zh"
                ? "这里不是普通作品集，而是系统设计档案。每个项目都记录问题、workflow、AI 参与方式、自动化和可扩展路径。"
                : "This is not a normal portfolio. Each record captures the problem, workflow, AI orchestration, automation, and scaling path."}
            </p>
            <Link
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              <span>{copy.projects.viewAll || "View all Projects"}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Right column: content area */}
          <div>
            {/* Desktop: Featured carousel (hidden on mobile, visible on lg) */}
            <div className="hidden lg:block">
              {carouselProjects.length > 0 && (
                <FeaturedProjectsCarousel projects={carouselProjects} />
              )}
            </div>

            {/* Mobile: Project cards grid */}
            <div className="lg:hidden">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {mobileProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    iconFor={(type: string) => (
                      <svg data-testid={`icon-${type}`} />
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Desktop: Compact grid with hideImage */}
            <div className="hidden lg:grid lg:grid-cols-3 lg:gap-4">
              {desktopProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  hideImage
                  iconFor={(type: string) => (
                    <svg data-testid={`icon-${type}`} />
                  )}
                />
              ))}
            </div>

            {/* Fallback ticker for when carousel is not preferred */}
            <div className="mt-8 lg:hidden">
              {carouselProjects.length > 0 && (
                <FeaturedProjectsTicker projects={carouselProjects} />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
