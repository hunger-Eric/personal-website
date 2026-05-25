import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Star, GitFork, Download } from "lucide-react";

import { loadCases } from "@/config/cases";
import { siteConfig } from "@/config/siteConfig";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  const cases = await loadCases();
  return cases.map((caseItem) => ({ id: caseItem.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const cases = await loadCases();
  const caseItem = cases.find((item) => item.id === id);
  if (!caseItem) return {};

  return {
    title: `${caseItem.name} | Cases`,
    description: caseItem.summary,
    alternates: { canonical: `/projects/${caseItem.id}` },
    openGraph: {
      type: "website",
      url: `/projects/${caseItem.id}`,
      title: `${caseItem.name} | ${siteConfig.name}`,
      description: caseItem.summary,
      images: caseItem.imageUrl
        ? [{ url: caseItem.imageUrl, alt: caseItem.name }]
        : undefined,
    },
  };
}

export default async function CaseDetailPage({ params }: Props) {
  const { id } = await params;
  const cases = await loadCases();
  const caseItem = cases.find((item) => item.id === id);

  if (!caseItem) notFound();

  const descriptionLines =
    caseItem.description?.filter(Boolean) ?? (caseItem.summary ? [caseItem.summary] : []);

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
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{caseItem.name}</h1>
        {caseItem.summary && (
          <p className="mt-3 max-w-3xl text-lg text-muted-foreground">{caseItem.summary}</p>
        )}
      </header>

      {caseItem.imageUrl && (
        <div className="mb-8 overflow-hidden rounded-2xl border border-border bg-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={caseItem.imageUrl}
            alt={caseItem.name}
            className="h-auto w-full object-cover"
            loading="eager"
          />
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <main className="space-y-6">
          {descriptionLines.length > 0 && (
            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="mb-3 text-lg font-semibold">案例介绍</h2>
              <div className="space-y-3 text-sm leading-7 text-muted-foreground">
                {descriptionLines.map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
            </section>
          )}

          {caseItem.readmeHtmlFull && (
            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold">README</h2>
              <article
                className="prose prose-slate max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: caseItem.readmeHtmlFull }}
              />
            </section>
          )}
        </main>

        <aside className="space-y-4">
          {caseItem.technologies && caseItem.technologies.length > 0 && (
            <section className="rounded-2xl border border-border bg-card p-5">
              <h3 className="mb-3 text-sm font-semibold">技术栈</h3>
              <div className="flex flex-wrap gap-2">
                {caseItem.technologies.map((tech) => (
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

          {(caseItem.githubStars !== undefined ||
            caseItem.githubForks !== undefined ||
            caseItem.downloads !== undefined) && (
            <section className="rounded-2xl border border-border bg-card p-5">
              <h3 className="mb-3 text-sm font-semibold">仓库指标</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                {caseItem.githubStars !== undefined && (
                  <p className="inline-flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    <span>{caseItem.githubStars} Stars</span>
                  </p>
                )}
                {caseItem.githubForks !== undefined && (
                  <p className="inline-flex items-center gap-2">
                    <GitFork className="h-4 w-4" />
                    <span>{caseItem.githubForks} Forks</span>
                  </p>
                )}
                {caseItem.downloads !== undefined && (
                  <p className="inline-flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    <span>{caseItem.downloads} Downloads</span>
                  </p>
                )}
              </div>
            </section>
          )}

          {caseItem.links && caseItem.links.length > 0 && (
            <section className="rounded-2xl border border-border bg-card p-5">
              <h3 className="mb-3 text-sm font-semibold">相关链接</h3>
              <div className="space-y-2">
                {caseItem.links.map((link) => (
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
