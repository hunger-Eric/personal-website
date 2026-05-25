"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  ArrowUpRight,
  Bot,
  BrainCircuit,
  FileText,
  GitBranch,
  Layers3,
  Link2,
  Network,
  Workflow,
} from "lucide-react";

import { getSiteCopy } from "@/config/contentCopy";
import { aboutConfig } from "../../config/aboutConfig";
import { siteConfig } from "../../config/siteConfig";
import { useLocale } from "../LocaleProvider";

type Capability = {
  title: string;
  description: string;
  Icon: typeof Workflow;
};

function getCapabilities(locale: "zh" | "en"): Capability[] {
  if (locale === "zh") {
    return [
      {
        title: "AI Workflow Engineering",
        description:
          "使用 Codex、Claude Code 与多模型协同，把 AI Native 开发工作流接进原型、产品迭代和内容整理。",
        Icon: GitBranch,
      },
      {
        title: "Automation Systems",
        description:
          "基于 Docker、n8n、API 与自动化流程，搭建长期可维护的业务自动化系统。",
        Icon: Workflow,
      },
      {
        title: "Knowledge & RAG Systems",
        description:
          "构建本地知识库、RAG 与多源检索系统，让 AI 能真正连接业务资料、文档和内容资产。",
        Icon: BrainCircuit,
      },
      {
        title: "AI-assisted Creative Production",
        description:
          "结合 AI 与视觉表达，整理素材、生成内容方案，并把创意流程沉淀成可重复执行的系统。",
        Icon: Layers3,
      },
    ];
  }

  return [
    {
      title: "AI Workflow Engineering",
      description:
        "I connect Codex, Claude Code, and multi-model workflows to prototyping, product iteration, and content operations.",
      Icon: GitBranch,
    },
    {
      title: "Automation Systems",
      description:
        "I build maintainable automation systems with Docker, n8n, APIs, and operational workflows.",
      Icon: Workflow,
    },
    {
      title: "Knowledge & RAG Systems",
      description:
        "I design local knowledge bases, RAG flows, and multi-source retrieval so AI can work with real business context.",
      Icon: BrainCircuit,
    },
    {
      title: "AI-assisted Creative Production",
      description:
        "I connect AI with visual thinking, content structure, and reusable creative production workflows.",
      Icon: Layers3,
    },
  ];
}

function getAudienceCopy(locale: "zh" | "en") {
  if (locale === "zh") {
    return {
      title: "For Startups & Small Teams",
      lead:
        "帮助个人与小团队快速构建 AI Native 工作流，以更低成本完成自动化、知识管理与产品原型开发。",
      points: ["降低重复劳动", "快速验证 idea", "把 AI 接进业务", "整理混乱流程", "沉淀长期系统"],
    };
  }

  return {
    title: "For Startups & Small Teams",
    lead:
      "I help individuals and small teams build AI Native workflows for automation, knowledge management, and product prototyping at lower cost.",
    points: [
      "reduce repetitive work",
      "validate ideas faster",
      "connect AI to operations",
      "organize messy workflows",
      "build long-term systems",
    ],
  };
}

export function AboutSection() {
  const { locale } = useLocale();
  const copy = getSiteCopy(locale);
  const enabled = (siteConfig as any)?.sections?.about === true;
  if (!enabled) return null;

  const capabilities = useMemo(() => getCapabilities(locale), [locale]);
  const audience = useMemo(() => getAudienceCopy(locale), [locale]);
  const caseStudies = useMemo(() => aboutConfig.snapshot.cards.slice(0, 2), []);

  return (
    <section id="about" className="scroll-mt-12 py-16 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="flex items-center gap-4">
          <h2 className="font-mono text-[13px] font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:text-lg">
            {copy.about.heading}
          </h2>
          <div className="hidden h-px w-40 bg-border sm:block sm:w-72" aria-hidden />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_360px]">
          <div className="space-y-6">
            <div className="border-y border-border py-6">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <Bot className="h-4 w-4" />
                <span>{locale === "zh" ? "核心定位" : "Positioning"}</span>
              </div>
              <div className="mt-4 grid gap-5 md:grid-cols-[0.9fr_1.1fr]">
                <p className="text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
                  {locale === "zh"
                    ? "我设计 AI 时代的新型工作方式。"
                    : "I design new working patterns for the AI era."}
                </p>
                <div className="space-y-4 text-sm leading-7 text-foreground/80 sm:text-base">
                  {copy.about.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <Network className="h-4 w-4" />
                <span>{locale === "zh" ? "我构建什么" : "What I Build"}</span>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {capabilities.map(({ title, description, Icon }) => (
                  <article
                    key={title}
                    className="rounded-xl border border-border bg-card/70 p-4"
                  >
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground">
                        <Icon className="h-4 w-4" />
                      </span>
                      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-xl border border-border bg-card/70 p-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <Workflow className="h-4 w-4" />
                <span>{audience.title}</span>
              </div>
              <p className="mt-4 text-sm leading-6 text-foreground/85">{audience.lead}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {audience.points.map((point) => (
                  <span
                    key={point}
                    className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground"
                  >
                    {point}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card/70 p-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>{locale === "zh" ? "案例形式" : "Case formats"}</span>
              </div>
              <p className="mt-4 text-sm leading-6 text-foreground/85">
                {locale === "zh"
                  ? "案例会以网站、PPT、文档、自动化流程和系统档案呈现，重点是说明它解决了什么问题，以及系统如何运转。"
                  : "Cases can appear as websites, decks, documents, automation flows, and system records. The point is what problem they solve and how the system works."}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card/70 p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  <Layers3 className="h-4 w-4" />
                  <span>{locale === "zh" ? "已有方向" : "Existing directions"}</span>
                </div>
                <Link
                  href="/projects"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={locale === "zh" ? "查看案例" : "View cases"}
                >
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="mt-4 space-y-3">
                {caseStudies.map((card) => (
                  <div key={card.title} className="border-t border-border pt-3 first:border-t-0 first:pt-0">
                    <h3 className="text-sm font-semibold text-foreground">{card.title}</h3>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                      {card.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/links"
              className="group inline-flex w-full min-w-0 items-center justify-center gap-2 rounded-md border border-border bg-card px-3.5 py-2.5 text-sm font-semibold text-foreground transition-colors duration-150 hover:bg-muted"
            >
              <Link2 className="h-4 w-4 flex-none" />
              <span className="truncate">{copy.about.socialsButton}</span>
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}
