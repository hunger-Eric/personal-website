"use client";

import { useMemo } from "react";
import { ArrowRight } from "lucide-react";

import { useLocale } from "@/components/LocaleProvider";
import { getSiteCopy } from "@/config/contentCopy";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ActionButton, SectionHeader } from "@/components/system";
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
  links?: Array<{ label: string; href: string; type?: string }>;
  featured?: boolean;
  imageUrl?: string;
  githubStars?: number;
  githubForks?: number;
  downloads?: number;
  start?: string;
  end?: string;
}

interface ProjectsSectionClientProps {
  projectsZh: Project[];
  projectsEn: Project[];
}

const DESKTOP_VISIBLE = 3;
const MOBILE_VISIBLE = 6;
const CAROUSEL_CAP = 8;

export function ProjectsSectionClient({
  projectsZh,
  projectsEn,
}: ProjectsSectionClientProps) {
  const { locale } = useLocale();
  const copy = getSiteCopy(locale);
  const projectsByLocale = { zh: projectsZh, en: projectsEn };
  const projects = projectsByLocale[locale] ?? projectsZh;

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
    <section id="projects" className="scroll-mt-12 bg-surface-paper py-16 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-4">
        <SectionHeader
          eyebrow={copy.projects.heading}
          title={copy.projects.indexTitle}
          description={copy.projects.sectionDescription}
          actions={
            <ActionButton href="/projects" tone="primary" icon={<ArrowRight className="h-4 w-4" />}>
              {copy.projects.viewAll}
            </ActionButton>
          }
        />

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)]">
          <div>
            <div className="hidden lg:block">
              {carouselProjects.length > 0 && (
                <FeaturedProjectsCarousel projects={carouselProjects} />
              )}
            </div>

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
