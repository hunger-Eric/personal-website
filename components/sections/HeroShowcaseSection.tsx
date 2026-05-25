"use client";

import Link from "next/link";
import {
  ArrowRight,
  Blocks,
  Bot,
  BrainCircuit,
  FileText,
  GitBranch,
  Workflow,
} from "lucide-react";

import { ContributionGraphCard } from "../ContributionGraphCard";
import { useLocale } from "@/components/LocaleProvider";
import { getSiteCopy } from "@/config/contentCopy";

type LabSignal = {
  label: string;
  value: string;
};

type Capability = {
  title: string;
  description: string;
  Icon: typeof Workflow;
};

function getLabSignals(locale: "zh" | "en"): LabSignal[] {
  if (locale === "zh") {
    return [
      { label: "方向", value: "AI Native Lab" },
      { label: "方法", value: "workflow first" },
      { label: "输出", value: "可运行系统" },
    ];
  }

  return [
    { label: "Mode", value: "AI Native Lab" },
    { label: "Method", value: "workflow first" },
    { label: "Output", value: "runnable systems" },
  ];
}

function getCapabilities(locale: "zh" | "en"): Capability[] {
  if (locale === "zh") {
    return [
      {
        title: "AI Workflow Engineering",
        description: "多模型协同、AI-assisted development、原型迭代流程。",
        Icon: GitBranch,
      },
      {
        title: "Automation Systems",
        description: "Docker、n8n、API、影刀与长期可维护自动化。",
        Icon: Workflow,
      },
      {
        title: "Knowledge & RAG Systems",
        description: "本地知识库、多源检索、业务资料和内容资产接入。",
        Icon: BrainCircuit,
      },
      {
        title: "Creative Production",
        description: "AI 内容创作、视觉表达、素材整理和数字叙事。",
        Icon: Blocks,
      },
    ];
  }

  return [
    {
      title: "AI Workflow Engineering",
      description: "multi-model collaboration, AI-assisted development, prototyping loops",
      Icon: GitBranch,
    },
    {
      title: "Automation Systems",
      description: "Docker, n8n, APIs, Yingdao, and maintainable automation",
      Icon: Workflow,
    },
    {
      title: "Knowledge & RAG Systems",
      description: "local knowledge bases, retrieval, business context, content assets",
      Icon: BrainCircuit,
    },
    {
      title: "Creative Production",
      description: "AI content production, visual thinking, asset systems, narrative design",
      Icon: Blocks,
    },
  ];
}

export function HeroShowcaseSection() {
  const { locale } = useLocale();
  const copy = getSiteCopy(locale);
  const labSignals = getLabSignals(locale);
  const capabilities = getCapabilities(locale);

  return (
    <section
      id="top"
      className="flex min-h-[76dvh] flex-col justify-center py-16 sm:min-h-0 lg:py-28"
    >
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.12fr)_minmax(360px,0.88fr)] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 border-y border-border py-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <Bot className="h-4 w-4" />
              <span>{locale === "zh" ? "AI Native System Builder" : "AI Native Lab"}</span>
            </div>

            <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {copy.hero.line}
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
              {copy.hero.description}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              >
                <FileText className="h-4 w-4" />
                <span>{locale === "zh" ? "进入案例档案" : "Open case archive"}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/#about"
                className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                <span>{locale === "zh" ? "查看工作方式" : "View working method"}</span>
              </Link>
            </div>
          </div>

          <aside className="border-y border-border py-5">
            <div className="grid grid-cols-3 divide-x divide-border">
              {labSignals.map((signal) => (
                <div key={signal.label} className="px-3 first:pl-0 last:pr-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {signal.label}
                  </p>
                  <p className="mt-2 text-sm font-semibold leading-5 text-foreground">
                    {signal.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3">
              {capabilities.map(({ title, description, Icon }) => (
                <div key={title} className="grid grid-cols-[32px_minmax(0,1fr)] gap-3 border-t border-border pt-3 first:border-t-0 first:pt-0">
                  <span className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card text-muted-foreground">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">{title}</h2>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>

        <div className="mt-20 hidden md:block">
          <ContributionGraphCard title={locale === "zh" ? "工作节奏" : "Work Rhythm"} />
        </div>
      </div>
    </section>
  );
}
