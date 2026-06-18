import type { Metadata } from "next";
import Link from "next/link";
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
import { loadCases, type CaseArchitectureItem, type CaseItem } from "@/config/cases";
import { siteConfig } from "@/config/siteConfig";

type Props = {
  params: Promise<{ id: string }>;
};

type NarrativeSectionProps = {
  eyebrow: string;
  title: string;
  body: string[];
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
    <section className="border-t border-[#d9cfbf] py-8">
      <div className="grid gap-5 md:grid-cols-[220px_minmax(0,1fr)]">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#817565]">
            <Icon className="h-4 w-4" />
            <span>{eyebrow}</span>
          </div>
          <h2 className="mt-3 text-xl font-semibold tracking-tight text-[#1f2420]">
            {title}
          </h2>
        </div>
        <div className="space-y-4 text-sm leading-7 text-[#3f3a32] sm:text-base">
          {body.map((line) => (
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
    <div className="grid gap-3 sm:grid-cols-2">
      {architecture.map((item) => (
        <div key={item.label} className="rounded-md border border-[#d9cfbf] bg-[#fffaf1] p-4">
          <h3 className="text-sm font-semibold text-[#1f2420]">{item.label}</h3>
          <p className="mt-2 text-sm leading-6 text-[#6f6659]">{item.detail}</p>
        </div>
      ))}
    </div>
  );
}

function MetaRail({ caseItem }: { caseItem: CaseItem }) {
  const rows = [
    [
      "系统类型",
      caseItem.customerStory?.chapterTitle || caseItem.caseType || caseItem.format,
    ],
    ["交付物", caseItem.customerStory?.artifactLabel || caseItem.demo?.result.label],
    ["项目状态", caseItem.status],
  ].filter(([, value]) => value);

  return (
    <aside className="space-y-5">
      <div className="border-y border-[#d9cfbf] py-4">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="grid grid-cols-[88px_minmax(0,1fr)] gap-3 border-t border-[#d9cfbf] py-3 first:border-t-0 first:pt-0 last:pb-0"
          >
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[#817565]">
              {label}
            </span>
            <span className="text-sm font-medium text-[#1f2420]">{value}</span>
          </div>
        ))}
      </div>

      {caseItem.customerStory?.proofPoints.length ? (
        <div>
          <h3 className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#817565]">
            可信交付点
          </h3>
          <div className="space-y-2">
            {caseItem.customerStory.proofPoints.map((point) => (
              <p
                key={point}
                className="rounded-md border border-[#d9cfbf] bg-[#fffaf1] px-3 py-2 text-xs leading-5 text-[#6f6659]"
              >
                {point}
              </p>
            ))}
          </div>
        </div>
      ) : null}

      {caseItem.links?.length ? (
        <div>
          <h3 className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#817565]">
            链接
          </h3>
          <div className="space-y-2">
            {caseItem.links.map((link) => (
              <a
                key={`${link.label}-${link.href}`}
                href={link.href}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex w-full items-center justify-between rounded-md border border-[#d9cfbf] bg-[#fffaf1] px-3 py-2 text-sm font-medium text-[#1f2420] transition-colors hover:bg-[#efe4d2]"
              >
                <span>{link.label}</span>
                <ArrowUpRight className="h-4 w-4 text-[#817565]" />
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
    <section className="border-t border-[#d9cfbf] py-8">
      <details className="group rounded-lg border border-[#d9cfbf] bg-[#fffaf1] p-4">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
          <span>
            <span className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#817565]">
              <Layers3 className="h-4 w-4" />
              Implementation appendix
            </span>
            <span className="mt-2 block text-lg font-semibold text-[#1f2420]">
              实现细节与项目记录
            </span>
          </span>
          <span className="rounded border border-[#d9cfbf] px-2 py-1 text-xs font-semibold text-[#6f6659]">
            展开
          </span>
        </summary>

        <div className="mt-6 space-y-8">
          <ArchitectureSection architecture={caseItem.architecture} />

          {workflowLines.length ? (
            <NarrativeSection
              eyebrow="Workflow"
              title="自动化边界"
              body={workflowLines}
              Icon={Workflow}
            />
          ) : null}

          {resultLines.length ? (
            <NarrativeSection
              eyebrow="Results"
              title="沉淀结果"
              body={resultLines}
              Icon={GitBranch}
            />
          ) : null}

          {learningLines.length ? (
            <NarrativeSection
              eyebrow="Learnings"
              title="项目经验"
              body={learningLines}
              Icon={BrainCircuit}
            />
          ) : null}

          {caseItem.readmeHtmlFull && (
            <article
              className="prose prose-slate max-w-none border-t border-[#d9cfbf] pt-8"
              dangerouslySetInnerHTML={{ __html: caseItem.readmeHtmlFull }}
            />
          )}
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
  const transferLines = asLines(
    story?.transferableValue,
    caseItem.learnings?.[0]
  );

  return (
    <div className="bg-[#f7f1e7] text-[#1f2420]">
      <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <Link
          href="/projects"
          className="group mb-10 inline-flex items-center gap-1.5 text-sm text-[#6f6659] transition-colors hover:text-[#1f2420]"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          返回案例
        </Link>

        <header className="border-y border-[#d9cfbf] py-8">
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#817565]">
            <Bot className="h-4 w-4" />
            <span>AI Native system case</span>
            <span className="text-[#d9cfbf]">/</span>
            <span>{caseItem.status || "Archive"}</span>
          </div>
          <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div>
              <h1 className="max-w-4xl text-4xl font-semibold leading-[1.02] tracking-tight text-[#1f2420] sm:text-5xl">
                {story?.headline || caseItem.name}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-[#6f6659] sm:text-lg">
                {story?.shortPromise || story?.publicScenario || caseItem.summary}
              </p>
              <p className="mt-4 text-sm font-semibold text-[#817565]">
                来源项目：{caseItem.name}
              </p>
            </div>
            <MetaRail caseItem={caseItem} />
          </div>
        </header>

        <CaseDemo caseItem={caseItem} demo={caseItem.demo} />

        <NarrativeSection
          eyebrow="Scenario"
          title="这一类问题是什么"
          body={asLines(fallbackProblem)}
          Icon={Network}
        />

        <NarrativeSection
          eyebrow="System"
          title="系统如何接管"
          body={systemTakeover}
          Icon={Boxes}
        />

        <NarrativeSection
          eyebrow="Artifact"
          title="客户拿走什么"
          body={artifactLines}
          Icon={FileOutput}
        />

        <NarrativeSection
          eyebrow="Transfer"
          title="可以迁移到哪里"
          body={transferLines}
          Icon={Workflow}
        />

        <ImplementationAppendix caseItem={caseItem} />
      </div>
    </div>
  );
}
