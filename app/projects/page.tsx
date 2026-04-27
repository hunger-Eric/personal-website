// app/projects/page.tsx
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

import { siteConfig } from "@/config/siteConfig";
import { loadProjects, type ProjectItem } from "@/config/projects";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProjectsCarousel } from "@/components/projects/ProjectsCarousel";
import {
  Github,
  Star,
  GitFork,
  Download,
  ArrowRight,
  Calendar,
  Folder,
  FolderGit2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Projects",
  description: `Explore ${siteConfig.name}'s portfolio of software projects, including open-source tools, web applications, and more.`,
  openGraph: {
    title: `Projects | ${siteConfig.name}`,
    description: `Explore ${siteConfig.name}'s portfolio of software projects.`,
  },
};

// Revalidate every 3 hours
export const revalidate = 10800; // 3 hours

const FALLBACK_IMG = "/images/demo_1.png";

function ProjectCard({ project }: { project: ProjectItem }) {
  const hasStats =
    project.githubStars !== undefined ||
    project.githubForks !== undefined ||
    project.downloads !== undefined;
  const img = project.imageUrl || FALLBACK_IMG;

  return (
    <Link
      href={`/projects/${project.id}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-all hover:-translate-y-0.5 hover:border-accent/50 hover:bg-white/[0.07] hover:shadow-[0_8px_30px_-12px_rgba(99,102,241,0.45)]"
    >
      {/* Image */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-white/5">
        <Image
          src={img}
          alt={project.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />

        {/* Featured badge */}
        {project.featured && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-accent/90 px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-sm">
            <Star className="h-3 w-3" />
            Featured
          </span>
        )}

        {/* GitHub corner */}
        {project.githubRepoUrl && (
          <span className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-950/70 text-white/85 backdrop-blur transition-colors group-hover:text-white">
            <Github className="h-3.5 w-3.5" />
          </span>
        )}

        {/* Gradient fade */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-slate-950/40 to-transparent" />
      </div>

      <div className="flex flex-1 flex-col p-5">
        {/* Title */}
        <h3 className="mb-2 text-lg font-semibold text-foreground transition-colors group-hover:text-accent">
          {project.name}
        </h3>

        {/* Summary */}
        <p className="mb-4 line-clamp-2 flex-1 text-sm text-muted-foreground">
          {project.summary}
        </p>

        {/* Technologies */}
        {project.technologies && project.technologies.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {project.technologies.slice(0, 4).map((tech) => (
              <span
                key={tech}
                className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-muted-foreground"
              >
                {tech}
              </span>
            ))}
            {project.technologies.length > 4 && (
              <span className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-muted-foreground">
                +{project.technologies.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Stats / date */}
        <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-3 text-xs text-muted-foreground">
          {hasStats ? (
            <div className="flex items-center gap-3">
              {project.githubStars !== undefined && (
                <span className="inline-flex items-center gap-1">
                  <Star className="h-3.5 w-3.5" />
                  {project.githubStars.toLocaleString()}
                </span>
              )}
              {project.githubForks !== undefined && (
                <span className="inline-flex items-center gap-1">
                  <GitFork className="h-3.5 w-3.5" />
                  {project.githubForks.toLocaleString()}
                </span>
              )}
              {project.downloads !== undefined && (
                <span className="inline-flex items-center gap-1">
                  <Download className="h-3.5 w-3.5" />
                  {project.downloads.toLocaleString()}
                </span>
              )}
            </div>
          ) : project.start ? (
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {project.start}
            </span>
          ) : (
            <span />
          )}

          <ArrowRight className="h-4 w-4 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
        </div>
      </div>
    </Link>
  );
}

function StatCard({
  Icon,
  label,
  value,
}: {
  Icon: typeof Star;
  label: string;
  value: number | string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3.5">
      <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-accent/10 text-accent">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <div className="text-lg font-semibold leading-tight text-foreground">
          {value}
        </div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

export default async function ProjectsPage() {
  const projects = await loadProjects();

  // Featured come first in the ordered list. The carousel uses a curated subset.
  const featuredProjects = projects.filter((p) => p.featured);
  const regularProjects = projects.filter((p) => !p.featured);

  // Carousel uses up to the first 5 featured (or the first 5 overall if no
  // featured exist). Each must have an image to look right.
  const carouselSource = (
    featuredProjects.length > 0 ? featuredProjects : projects
  ).slice(0, 5);

  // Aggregate stats across ALL projects.
  const totalStars = projects.reduce(
    (sum, p) => sum + (p.githubStars ?? 0),
    0
  );
  const totalForks = projects.reduce(
    (sum, p) => sum + (p.githubForks ?? 0),
    0
  );
  const totalDownloads = projects.reduce(
    (sum, p) => sum + (p.downloads ?? 0),
    0
  );

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Projects", url: "/projects" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Breadcrumbs items={breadcrumbs} />
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Projects
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          A collection of projects I&apos;ve built — open-source tools, web
          apps, and experiments. Click any project to learn more.
        </p>
      </div>

      {/* Carousel */}
      {carouselSource.length > 0 && (
        <section className="mb-8">
          <ProjectsCarousel projects={carouselSource} />
        </section>
      )}

      {/* Stats */}
      {projects.length > 0 && (
        <section className="mb-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            Icon={FolderGit2}
            label="Projects"
            value={projects.length}
          />
          <StatCard
            Icon={Star}
            label="GitHub stars"
            value={totalStars.toLocaleString()}
          />
          <StatCard
            Icon={GitFork}
            label="Forks"
            value={totalForks.toLocaleString()}
          />
          <StatCard
            Icon={Download}
            label="Downloads"
            value={totalDownloads.toLocaleString()}
          />
        </section>
      )}

      {/* Featured */}
      {featuredProjects.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-6 text-xl font-semibold">Featured Projects</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      )}

      {/* All / Other */}
      {regularProjects.length > 0 && (
        <section>
          <h2 className="mb-6 text-xl font-semibold">
            {featuredProjects.length > 0 ? "More Projects" : "Projects"}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {regularProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {projects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Folder className="mb-4 h-16 w-16 text-muted-foreground/50" />
          <h2 className="mb-2 text-xl font-semibold">No projects yet</h2>
          <p className="text-muted-foreground">
            Projects will appear here once they&apos;re added to the
            configuration.
          </p>
        </div>
      )}
    </div>
  );
}
