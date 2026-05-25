import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Star, GitFork, Download } from "lucide-react";

import { loadCases } from "@/config/projects";
import { siteConfig } from "@/config/siteConfig";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  const projects = await loadCases();
  return projects.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const projects = await loadCases();
  const project = projects.find((p) => p.id === id);
  if (!project) return {};

  return {
    title: `${project.name} | Cases`,
    description: project.summary,
    alternates: { canonical: `/projects/${project.id}` },
    openGraph: {
      type: "website",
      url: `/projects/${project.id}`,
      title: `${project.name} | ${siteConfig.name}`,
      description: project.summary,
      images: project.imageUrl
        ? [{ url: project.imageUrl, alt: project.name }]
        : undefined,
    },
  };
}

export default async function CaseDetailPage({ params }: Props) {
  const { id } = await params;
  const projects = await loadCases();
  const project = projects.find((p) => p.id === id);

  if (!project) notFound();

  const desc =
    project.description?.filter(Boolean) ?? (project.summary ? [project.summary] : []);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <Link
        href="/projects"
        className="group mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        返回案例列表
      </Link>

      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{project.name}</h1>
        {project.summary && (
          <p className="mt-3 max-w-3xl text-lg text-muted-foreground">{project.summary}</p>
        )}
      </header>

      {project.imageUrl && (
        <div className="mb-8 overflow-hidden rounded-2xl border border-border bg-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.imageUrl}
            alt={project.name}
            className="h-auto w-full object-cover"
            loading="eager"
          />
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <main className="space-y-6">
          {desc.length > 0 && (
            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="mb-3 text-lg font-semibold">案例介绍</h2>
              <div className="space-y-3 text-sm leading-7 text-muted-foreground">
                {desc.map((line, idx) => (
                  <p key={idx}>{line}</p>
                ))}
              </div>
            </section>
          )}

          {project.readmeHtmlFull && (
            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold">README</h2>
              <article
                className="prose prose-slate max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: project.readmeHtmlFull }}
              />
            </section>
          )}
        </main>

        <aside className="space-y-4">
          {project.technologies && project.technologies.length > 0 && (
            <section className="rounded-2xl border border-border bg-card p-5">
              <h3 className="mb-3 text-sm font-semibold">技术栈</h3>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-md border border-border bg-background px-2.5 py-1 text-xs"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </section>
          )}

          {(project.githubStars !== undefined ||
            project.githubForks !== undefined ||
            project.downloads !== undefined) && (
            <section className="rounded-2xl border border-border bg-card p-5">
              <h3 className="mb-3 text-sm font-semibold">仓库指标</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                {project.githubStars !== undefined && (
                  <p className="inline-flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    <span>{project.githubStars} Stars</span>
                  </p>
                )}
                {project.githubForks !== undefined && (
                  <p className="inline-flex items-center gap-2">
                    <GitFork className="h-4 w-4" />
                    <span>{project.githubForks} Forks</span>
                  </p>
                )}
                {project.downloads !== undefined && (
                  <p className="inline-flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    <span>{project.downloads} Downloads</span>
                  </p>
                )}
              </div>
            </section>
          )}

          {project.links && project.links.length > 0 && (
            <section className="rounded-2xl border border-border bg-card p-5">
              <h3 className="mb-3 text-sm font-semibold">相关链接</h3>
              <div className="space-y-2">
                {project.links.map((link) => (
                  <a
                    key={`${link.label}-${link.href}`}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex w-full items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm transition-colors hover:bg-muted"
                  >
                    <span>{link.label}</span>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </a>
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
