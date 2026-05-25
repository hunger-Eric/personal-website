import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Bot,
  Boxes,
  BrainCircuit,
  GitBranch,
  Layers3,
  Network,
  Workflow,
} from "lucide-react";

import { loadCases, type CaseArchitectureItem, type CaseItem } from "@/config/cases";
import { siteConfig } from "@/config/siteConfig";

type Props = {
  params: Promise<{ id: string }>;
};

type SectionProps = {
  eyebrow: string;
  title: string;
  items?: string[];
  fallback?: string;
  Icon: typeof Workflow;
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
    title: `${caseItem.name} | AI Native Lab`,
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

function firstAvailable(...values: Array<string | undefined>) {
  return values.find((value) => value && value.trim()) || "";
}

function listOrFallback(items?: string[], fallback?: string) {
  if (items?.length) return items;
  return fallback ? [fallback] : [];
}

function DossierSection({ eyebrow, title, items, fallback, Icon }: SectionProps) {
  const lines = listOrFallback(items, fallback);
  if (!lines.length) return null;

  return (
    <section className="border-t border-border py-8">
      <div className="grid gap-5 md:grid-cols-[240px_minmax(0,1fr)]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <Icon className="h-4 w-4" />
            <span>{eyebrow}</span>
          </div>
          <h2 className="mt-3 text-xl font-semibold tracking-tight text-foreground">
            {title}
          </h2>
        </div>
        <div className="space-y-4 text-sm leading-7 text-foreground/82 sm:text-base">
          {lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </div>
    </section>
  );
}

function ArchitectureSection({ architecture }: { architecture?: CaseArchitectureItem[] }) {
  if (!architecture?.length) return null;

  return (
    <section className="border-t border-border py-8">
      <div className="grid gap-5 md:grid-cols-[240px_minmax(0,1fr)]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <Layers3 className="h-4 w-4" />
            <span>Architecture</span>
          </div>
          <h2 className="mt-3 text-xl font-semibold tracking-tight text-foreground">
            System structure
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {architecture.map((item) => (
            <div key={item.label} className="rounded-xl border border-border bg-card/70 p-4">
              <h3 className="text-sm font-semibold text-foreground">{item.label}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MetaRail({ caseItem }: { caseItem: CaseItem }) {
  const stack = caseItem.aiStack ?? caseItem.technologies ?? [];
  const rows = [
    ["Role", caseItem.role],
    ["Status", caseItem.status],
    ["Type", caseItem.caseType || caseItem.format],
    ["AI Stack", stack.slice(0, 4).join(", ")],
  ].filter(([, value]) => value);

  return (
    <aside className="space-y-5">
      <div className="border-y border-border py-4">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="grid grid-cols-[88px_minmax(0,1fr)] gap-3 border-t border-border py-3 first:border-t-0 first:pt-0 last:pb-0"
          >
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {label}
            </span>
            <span className="text-sm font-medium text-foreground">{value}</span>
          </div>
        ))}
      </div>

      {caseItem.tags?.length ? (
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {caseItem.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {caseItem.links?.length ? (
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Links
          </h3>
          <div className="space-y-2">
            {caseItem.links.map((link) => (
              <a
                key={`${link.label}-${link.href}`}
                href={link.href}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex w-full items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
              >
                <span>{link.label}</span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </aside>
  );
}

export default async function CaseDetailPage({ params }: Props) {
  const { id } = await params;
  const cases = await loadCases();
  const caseItem = cases.find((item) => item.id === id);

  if (!caseItem) notFound();

  const fallbackProblem = firstAvailable(
    caseItem.description?.[0],
    caseItem.summary,
    caseItem.repoDescription
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <Link
        href="/projects"
        className="group mb-10 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        返回系统档案
      </Link>

      <header className="border-y border-border py-8">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          <Bot className="h-4 w-4" />
          <span>AI Native Lab Record</span>
          <span className="text-border">/</span>
          <span>{caseItem.status || "Archive"}</span>
        </div>
        <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {caseItem.name}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
              {caseItem.summary}
            </p>
          </div>
          <MetaRail caseItem={caseItem} />
        </div>
      </header>

      <DossierSection
        eyebrow="Problem"
        title="What needed to change"
        items={caseItem.problem}
        fallback={fallbackProblem}
        Icon={Network}
      />

      <DossierSection
        eyebrow="System Overview"
        title="How the system is framed"
        items={caseItem.systemOverview}
        fallback={caseItem.readmePlainExcerpt}
        Icon={Boxes}
      />

      <DossierSection
        eyebrow="Workflow"
        title="AI orchestration and automation flow"
        items={[...(caseItem.aiOrchestration ?? []), ...(caseItem.automation ?? [])]}
        fallback={caseItem.workflows?.join(", ")}
        Icon={Workflow}
      />

      <ArchitectureSection architecture={caseItem.architecture} />

      <DossierSection
        eyebrow="Results"
        title="What became reusable"
        items={caseItem.results}
        fallback={caseItem.repoDescription}
        Icon={GitBranch}
      />

      <DossierSection
        eyebrow="Learnings"
        title="AI Native workflow notes"
        items={caseItem.learnings}
        Icon={BrainCircuit}
      />

      {caseItem.readmeHtmlFull && (
        <section className="border-t border-border py-8">
          <div className="grid gap-5 md:grid-cols-[240px_minmax(0,1fr)]">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <BrainCircuit className="h-4 w-4" />
                <span>Source</span>
              </div>
              <h2 className="mt-3 text-xl font-semibold tracking-tight text-foreground">
                README source record
              </h2>
            </div>
            <article
              className="prose prose-slate max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: caseItem.readmeHtmlFull }}
            />
          </div>
        </section>
      )}
    </div>
  );
}
