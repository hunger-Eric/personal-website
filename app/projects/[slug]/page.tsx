// app/projects/[slug]/page.tsx
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { siteConfig } from "@/config/siteConfig";
import { loadProjects, type ProjectItem } from "@/config/projects";
import { JsonLd } from "@/components/JsonLd";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { generateProjectSchema } from "@/lib/structured-data";
import {
  Github,
  Star,
  GitFork,
  Download,
  ExternalLink,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Scale,
  Tag,
  Clock,
  FileText,
  PlayCircle,
  Globe,
  BookOpen,
} from "lucide-react";

// Revalidate every 3 hours
export const revalidate = 10800; // 3 hours

// Generate static paths for all projects
export async function generateStaticParams() {
  const projects = await loadProjects();
  return projects.map((project) => ({
    slug: project.id,
  }));
}

// Generate metadata for each project
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const projects = await loadProjects();
  const project = projects.find((p) => p.id === slug);

  if (!project) {
    return {
      title: "Project Not Found",
    };
  }

  return {
    title: project.name,
    description: project.summary,
    openGraph: {
      title: `${project.name} | ${siteConfig.name}`,
      description: project.summary,
      type: "article",
      images: project.imageUrl
        ? [{ url: project.imageUrl, alt: project.name }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: project.name,
      description: project.summary,
    },
  };
}

// Link type to icon mapping
function getLinkIcon(type?: string) {
  switch (type) {
    case "github":
      return Github;
    case "live":
      return Globe;
    case "docs":
      return BookOpen;
    case "download":
      return Download;
    case "video":
      return PlayCircle;
    default:
      return ExternalLink;
  }
}

// Format date for display
function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  if (dateStr.toLowerCase() === "present") return "Present";

  try {
    // Handle various formats
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const projects = await loadProjects();
  const projectIndex = projects.findIndex((p) => p.id === slug);

  if (projectIndex === -1) {
    notFound();
  }

  const project = projects[projectIndex];
  const prevProject = projectIndex > 0 ? projects[projectIndex - 1] : null;
  const nextProject =
    projectIndex < projects.length - 1 ? projects[projectIndex + 1] : null;

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Projects", url: "/projects" },
    { name: project.name, url: `/projects/${project.id}` },
  ];

  const hasStats =
    project.githubStars !== undefined ||
    project.githubForks !== undefined ||
    project.downloads !== undefined;

  return (
    <>
      {/* Structured Data */}
      <JsonLd
        data={generateProjectSchema({
          id: project.id,
          name: project.name,
          summary: project.summary,
          repoUrl: project.githubRepoUrl,
          liveUrl: project.links?.find((l) => l.type === "live")?.href,
          imageSrc: project.imageUrl,
          technologies: project.technologies,
          stars: project.githubStars,
          dateCreated: project.repoCreatedAt,
        })}
      />

      <article className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <Breadcrumbs items={breadcrumbs} className="mb-6" />


        {/* Header */}
        <header className="mb-8">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            {/* Featured badge */}
            {project.featured && (
              <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                Featured Project
              </span>
            )}

            {/* Date range */}
            {project.start && (
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {formatDate(project.start)}
                {project.end && ` – ${formatDate(project.end)}`}
              </span>
            )}
          </div>

          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            {project.name}
          </h1>

          <p className="text-lg text-muted-foreground">{project.summary}</p>
        </header>

        {/* Stats row */}
        {hasStats && (
          <div className="mb-8 flex flex-wrap gap-4">
            {project.githubStars !== undefined && (
              <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="font-medium">
                  {project.githubStars.toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground">stars</span>
              </div>
            )}
            {project.githubForks !== undefined && (
              <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2">
                <GitFork className="h-4 w-4 text-blue-500" />
                <span className="font-medium">
                  {project.githubForks.toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground">forks</span>
              </div>
            )}
            {project.downloads !== undefined && (
              <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2">
                <Download className="h-4 w-4 text-green-500" />
                <span className="font-medium">
                  {project.downloads.toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground">downloads</span>
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        {project.links && project.links.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-3">
            {project.links.map((link, idx) => {
              const Icon = getLinkIcon(link.type);
              const isPrimary =
                link.type === "live" ||
                link.type === "github" ||
                (idx === 0 && !link.type);

              return (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all hover:-translate-y-0.5 ${
                    isPrimary
                      ? "bg-accent text-white hover:bg-accent/90"
                      : "border border-white/10 bg-white/5 text-foreground hover:border-accent hover:bg-white/10"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </a>
              );
            })}
          </div>
        )}

        {/* Technologies */}
        {project.technologies && project.technologies.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-muted-foreground">
              <Tag className="h-4 w-4" />
              Technologies
            </h2>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <span
                  key={tech}
                  className="rounded-lg bg-white/5 px-3 py-1.5 text-sm text-foreground"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {project.description && project.description.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-muted-foreground">
              <FileText className="h-4 w-4" />
              About
            </h2>
            <div className="prose prose-invert max-w-none">
              {project.description.map((paragraph, idx) => (
                <p key={idx} className="text-muted-foreground">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* README content */}
        {project.readmeHtmlFull && (
          <div className="mb-8">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              Documentation
            </h2>
            <div
              className="prose prose-invert max-w-none rounded-xl border border-white/10 bg-white/[0.02] p-6"
              dangerouslySetInnerHTML={{ __html: project.readmeHtmlFull }}
            />
          </div>
        )}

        {/* Repo metadata */}
        {(project.repoLicense ||
          project.repoTopics?.length ||
          project.repoPushedAt) && (
          <div className="mb-8 rounded-xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-muted-foreground">
              <Github className="h-4 w-4" />
              Repository Info
            </h2>

            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {project.repoLicense && (
                <div>
                  <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Scale className="h-3.5 w-3.5" />
                    License
                  </dt>
                  <dd className="mt-1 font-medium">{project.repoLicense}</dd>
                </div>
              )}

              {project.repoPushedAt && (
                <div>
                  <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    Last Updated
                  </dt>
                  <dd className="mt-1 font-medium">
                    {new Date(project.repoPushedAt).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </dd>
                </div>
              )}

              {project.githubLatestReleaseName && (
                <div>
                  <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Tag className="h-3.5 w-3.5" />
                    Latest Release
                  </dt>
                  <dd className="mt-1 font-medium">
                    {project.githubLatestReleaseName}
                  </dd>
                </div>
              )}
            </dl>

            {/* Topics */}
            {project.repoTopics && project.repoTopics.length > 0 && (
              <div className="mt-4 border-t border-white/5 pt-4">
                <dt className="mb-2 text-xs text-muted-foreground">Topics</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {project.repoTopics.map((topic) => (
                    <span
                      key={topic}
                      className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs text-accent"
                    >
                      {topic}
                    </span>
                  ))}
                </dd>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className="mt-12 flex items-center justify-between border-t border-white/10 pt-8">
          {prevProject ? (
            <Link
              href={`/projects/${prevProject.id}`}
              className="group flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-accent"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span>
                <span className="block text-xs uppercase tracking-wider">
                  Previous
                </span>
                <span className="font-medium text-foreground">
                  {prevProject.name}
                </span>
              </span>
            </Link>
          ) : (
            <div />
          )}

          <Link
            href="/projects"
            className="rounded-lg border border-white/10 px-4 py-2 text-sm transition-colors hover:border-accent hover:bg-white/5"
          >
            All Projects
          </Link>

          {nextProject ? (
            <Link
              href={`/projects/${nextProject.id}`}
              className="group flex items-center gap-2 text-right text-sm text-muted-foreground transition-colors hover:text-accent"
            >
              <span>
                <span className="block text-xs uppercase tracking-wider">
                  Next
                </span>
                <span className="font-medium text-foreground">
                  {nextProject.name}
                </span>
              </span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          ) : (
            <div />
          )}
        </nav>
      </article>
    </>
  );
}
