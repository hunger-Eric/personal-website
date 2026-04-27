// app/projects/page.tsx
import { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/siteConfig";
import { loadProjects, type ProjectItem } from "@/config/projects";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  Github,
  Star,
  GitFork,
  Download,
  ExternalLink,
  ArrowRight,
  Calendar,
  Folder,
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

function ProjectCard({ project }: { project: ProjectItem }) {
  const hasStats =
    project.githubStars || project.githubForks || project.downloads;

  return (
    <Link
      href={`/projects/${project.id}`}
      className="group relative flex flex-col rounded-xl border border-white/10 bg-white/5 p-6 transition-all hover:border-accent/50 hover:bg-white/[0.07]"
    >
      {/* Featured badge */}
      {project.featured && (
        <span className="absolute -top-2 right-4 rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-white">
          Featured
        </span>
      )}

      {/* Project icon/image */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
          <Folder className="h-6 w-6" />
        </div>
        {project.githubRepoUrl && (
          <span
            className="text-muted-foreground transition-colors hover:text-accent"
            title="View on GitHub"
          >
            <Github className="h-5 w-5" />
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="mb-2 text-lg font-semibold text-foreground group-hover:text-accent">
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

      {/* Stats & Date */}
      <div className="flex items-center justify-between border-t border-white/5 pt-4 text-xs text-muted-foreground">
        {/* Stats */}
        {hasStats && (
          <div className="flex items-center gap-3">
            {project.githubStars !== undefined && (
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5" />
                {project.githubStars.toLocaleString()}
              </span>
            )}
            {project.githubForks !== undefined && (
              <span className="flex items-center gap-1">
                <GitFork className="h-3.5 w-3.5" />
                {project.githubForks.toLocaleString()}
              </span>
            )}
            {project.downloads !== undefined && (
              <span className="flex items-center gap-1">
                <Download className="h-3.5 w-3.5" />
                {project.downloads.toLocaleString()}
              </span>
            )}
          </div>
        )}

        {/* Date */}
        {project.start && (
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {project.start}
          </span>
        )}

        {/* View arrow */}
        <ArrowRight className="ml-auto h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
    </Link>
  );
}

export default async function ProjectsPage() {
  const projects = await loadProjects();

  // Separate featured and regular projects
  const featuredProjects = projects.filter((p) => p.featured);
  const regularProjects = projects.filter((p) => !p.featured);

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Projects", url: "/projects" },
  ];

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <Breadcrumbs items={breadcrumbs} />

          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Projects
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            A collection of projects I&apos;ve built, from open-source tools to
            full-stack applications. Click on any project to learn more.
          </p>
        </div>

        {/* Featured Projects */}
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

        {/* All Projects */}
        <section>
          <h2 className="mb-6 text-xl font-semibold">
            {featuredProjects.length > 0 ? "All Projects" : "Projects"}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {regularProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>

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
    </>
  );
}
