import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Bot,
  Boxes,
  BrainCircuit,
  FileOutput,
  GitBranch,
  Layers3,
  Network,
  Workflow,
} from "lucide-react";

import { CaseDemo } from "@/components/cases/CaseDemo";
import { JsonLd } from "@/components/JsonLd";
import { ActionButton, PageShell, Surface } from "@/components/system";
import { loadCases, type CaseArchitectureItem, type CaseItem } from "@/config/cases";
import { getSiteCopy } from "@/config/contentCopy";
import { siteConfig } from "@/config/siteConfig";
import { generateProjectSchema } from "@/lib/structured-data";

type Props = {
  params: Promise<{ id: string }>;
};

type NarrativeSectionProps = {
  eyebrow: string;
  title: string;
  body: string[];
  Icon: typeof Workflow;
};

const copy = getSiteCopy("zh").cases;

export async function generateStaticParams() {
  const cases = await loadCases();
  return cases.map((caseItem) => ({ id: caseItem.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const cases = await loadCases();
  const caseItem = cases.find((item) => item.id === id);
  if (!caseItem) return {};

  const description =
    caseItem.customerStory?.shortPromise ||
    caseItem.customerStory?.publicScenario ||
    caseItem.summary;

  return {
    title: `${caseItem.name} | AI Native Lab`,
    description,
    alternates: { canonical: `/projects/${caseItem.id}` },
    openGraph: {
      type: "website",
      url: `/projects/${caseItem.id}`,
      title: `${caseItem.name} | ${siteConfig.name}`,
      description,
      images: caseItem.imageUrl
        ? [{ url: caseItem.imageUrl, alt: caseItem.name }]
        : undefined,
    },
  };
}

function firstAvailable(...values: Array<string | undefined>) {
  return values.find((value) => value && value.trim()) || "";
}

function asLines(...values: Array<string | string[] | undefined>) {
  return values
    .flatMap((value) => {
      if (!value) return [];
      return Array.isArray(value) ? value : [value];
    })
    .filter((value) => value.trim());
}

function NarrativeSection({ eyebrow, title, body, Icon }: NarrativeSectionProps) {
  if (!body.length) return null;

  return (
    <section className="border-t border-hairline py-8">
      <div className="grid gap-5 md:grid-cols-[220px_minmax(0,1fr)]">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <Icon className="h-4 w-4" aria-hidden />
            <span>{eyebrow}</span>
          </div>
          <h2 className="mt-3 text-xl font-semibold tracking-tight text-foreground">
            {title}
          </h2>
        </div>
        <div className="space-y-4 text-sm leading-7 text-foreground sm:text-base">
          {body.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </div>
    </section>
  );
}

function ArchitectureSection({
  architecture,
}: {
  architecture?: CaseArchitectureItem[];
}) {
  if (!architecture?.length) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {architecture.map((item) => (
        <Surface key={item.label} tone="paper" className="p-4">
          <h3 className="text-sm font-semibold text-foreground">{item.label}</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {item.detail}
          </p>
        </Surface>
      ))}
    </div>
  );
}

function MetaRail({ caseItem }: { caseItem: CaseItem }) {
  const rows = [
    [
      copy.systemType,
      caseItem.customerStory?.chapterTitle || caseItem.caseType || caseItem.format,
    ],
    [copy.deliverable, caseItem.customerStory?.artifactLabel || caseItem.demo?.result.label],
    [copy.projectStatus, caseItem.status],
  ].filter(([, value]) => value);

  return (
    <aside className="space-y-5">
      <div className="border-y border-hairline py-4">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="grid grid-cols-[96px_minmax(0,1fr)] gap-3 border-t border-hairline py-3 first:border-t-0 first:pt-0 last:pb-0"
          >
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {label}
            </span>
            <span className="text-sm font-medium text-foreground">{value}</span>
          </div>
        ))}
      </div>

      {caseItem.customerStory?.proofPoints?.length ? (
        <div>
          <h3 className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {copy.proofPoints}
          </h3>
          <div className="space-y-2">
            {caseItem.customerStory.proofPoints.map((point) => (
              <Surface key={point} tone="paper" className="px-3 py-2">
                <p className="text-xs leading-5 text-muted-foreground">{point}</p>
              </Surface>
            ))}
          </div>
        </div>
      ) : null}

      {caseItem.links?.length ? (
        <div>
          <h3 className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {copy.links}
          </h3>
          <div className="space-y-2">
            {caseItem.links.map((link) => (
              <a
                key={`${link.label}-${link.href}`}
                href={link.href}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex w-full items-center justify-between rounded-control border border-hairline bg-surface-paper-elevated px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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

function ImplementationAppendix({ caseItem }: { caseItem: CaseItem }) {
  const workflowLines = asLines(caseItem.aiOrchestration, caseItem.automation);
  const resultLines = asLines(caseItem.results, caseItem.repoDescription);
  const learningLines = asLines(caseItem.learnings);

  if (
    !caseItem.architecture?.length &&
    !workflowLines.length &&
    !resultLines.length &&
    !learningLines.length &&
    !caseItem.readmeHtmlFull
  ) {
    return null;
  }

  return (
    <section className="border-t border-hairline py-8">
      <details className="group rounded-card border border-hairline bg-surface-paper-elevated p-4">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
          <span>
            <span className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <Layers3 className="h-4 w-4" aria-hidden />
              {copy.implementationAppendix}
            </span>
            <span className="mt-2 block text-lg font-semibold text-foreground">
              {copy.implementationTitle}
            </span>
          </span>
          <span className="rounded-control border border-hairline px-2 py-1 text-xs font-semibold text-muted-foreground">
            {copy.expand}
          </span>
        </summary>

        <div className="mt-6 space-y-8">
          <ArchitectureSection architecture={caseItem.architecture} />

          {workflowLines.length ? (
            <NarrativeSection
              eyebrow="Workflow"
              title={copy.workflowTitle}
              body={workflowLines}
              Icon={Workflow}
            />
          ) : null}

          {resultLines.length ? (
            <NarrativeSection
              eyebrow="Results"
              title={copy.resultsTitle}
              body={resultLines}
              Icon={GitBranch}
            />
          ) : null}

          {learningLines.length ? (
            <NarrativeSection
              eyebrow="Learnings"
              title={copy.learningsTitle}
              body={learningLines}
              Icon={BrainCircuit}
            />
          ) : null}

          {caseItem.readmeHtmlFull ? (
            <article
              className="prose prose-slate max-w-none border-t border-hairline pt-8"
              dangerouslySetInnerHTML={{ __html: caseItem.readmeHtmlFull }}
            />
          ) : null}
        </div>
      </details>
    </section>
  );
}

export default async function CaseDetailPage({ params }: Props) {
  const { id } = await params;
  const cases = await loadCases();
  const caseItem = cases.find((item) => item.id === id);

  if (!caseItem) notFound();

  const story = caseItem.customerStory;
  const fallbackProblem = firstAvailable(
    story?.publicScenario,
    caseItem.problem?.[0],
    caseItem.description?.[0],
    caseItem.summary,
    caseItem.repoDescription
  );
  const systemTakeover = asLines(
    story
      ? `系统把这些输入整理成可验证的流程：${story.steps
          .map((step) => step.title)
          .join(" -> ")}。`
      : undefined,
    caseItem.systemOverview?.[0],
    caseItem.aiOrchestration?.[0]
  );
  const artifactLines = asLines(
    story
      ? `客户最终拿到的是「${story.artifactLabel}」，而不是一段无法复查的演示。`
      : undefined,
    story?.proofPoints,
    caseItem.results?.[0]
  );
  const transferLines = asLines(story?.transferableValue, caseItem.learnings?.[0]);

  return (
    <PageShell tone="public" className="min-h-screen">
      <JsonLd
        data={generateProjectSchema({
          id: caseItem.id,
          name: caseItem.name,
          summary:
            story?.shortPromise ||
            story?.publicScenario ||
            caseItem.summary ||
            caseItem.repoDescription,
          description: caseItem.description?.join(" "),
          repoUrl: caseItem.githubRepoUrl,
          liveUrl: caseItem.links?.find((link) => link.type === "live")?.href,
          imageSrc: caseItem.imageUrl,
          technologies: caseItem.technologies || caseItem.aiStack,
          stars: caseItem.githubStars,
          dateCreated: caseItem.start,
        })}
      />
      <main className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <ActionButton
          href="/projects"
          tone="ghost"
          icon={<ArrowLeft className="h-4 w-4" aria-hidden />}
          className="mb-10"
        >
          {copy.detailBack}
        </ActionButton>

        <header className="border-y border-hairline py-8">
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <Bot className="h-4 w-4" aria-hidden />
            <span>{copy.detailEyebrow}</span>
            <span className="text-border">/</span>
            <span>{caseItem.status || "Archive"}</span>
          </div>
          <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div>
              <h1 className="max-w-4xl text-4xl font-semibold leading-[1.02] tracking-tight text-foreground sm:text-5xl">
                {story?.headline || caseItem.name}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
                {story?.shortPromise || story?.publicScenario || caseItem.summary}
              </p>
              <p className="mt-4 text-sm font-semibold text-muted-foreground">
                {copy.sourceProject}: {caseItem.name}
              </p>
            </div>
            <MetaRail caseItem={caseItem} />
          </div>
        </header>

        <CaseDemo caseItem={caseItem} demo={caseItem.demo} />

        <NarrativeSection
          eyebrow="Scenario"
          title={copy.scenarioTitle}
          body={asLines(fallbackProblem)}
          Icon={Network}
        />

        <NarrativeSection
          eyebrow="System"
          title={copy.systemTitle}
          body={systemTakeover}
          Icon={Boxes}
        />

        <NarrativeSection
          eyebrow="Artifact"
          title={copy.artifactTitle}
          body={artifactLines}
          Icon={FileOutput}
        />

        <NarrativeSection
          eyebrow="Transfer"
          title={copy.transferTitle}
          body={transferLines}
          Icon={Workflow}
        />

        <ImplementationAppendix caseItem={caseItem} />
      </main>
    </PageShell>
  );
}
