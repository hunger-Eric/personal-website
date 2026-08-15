"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { useLocale } from "@/components/LocaleProvider";
import { getLocalizedPublicContent } from "@/config/public-content";

const pageCopy = {
  zh: {
    eyebrow: "实解智能 · 企业 AI 系统设计与交付",
    heroTitle: "让 AI 真正在企业里跑起来。",
    suitableTitle: "适合处理的问题",
    boundariesTitle: "不会模糊的边界",
    ownerTitle: "谁来负责项目",
    ownerDescription:
      "实解智能目前由 fengc 负责。前期沟通、流程梳理、系统设计和交付协调由同一负责人推进。你不需要先准备一份完整需求书，只要把正在消耗人力的流程、现有工具和遇到的问题讲清楚。",
    projectsLink: "查看项目案例",
    collaborationTitle: "合作从哪里开始",
    collaborationSteps: [
      "先确认问题是否值得做。我们会看流程发生频率、人工投入和出错后的影响。",
      "再划分系统与人工的职责。AI 接管稳定步骤，关键判断保留人工确认。",
      "最后用真实数据验证。通过后再部署，并根据实际使用继续调整。",
    ],
    contactLink: "提交一个业务问题",
    ctaTitle: "先从一个具体业务问题开始",
    ctaDescription:
      "提交当前流程、频率和人工投入。我们会先判断是否适合改造，再决定是否进入初步诊断。",
    ctaLabel: "提交业务问题",
  },
  en: {
    eyebrow: "实解智能 · Enterprise AI system design and delivery",
    heroTitle: "Make AI truly run inside the enterprise.",
    suitableTitle: "Problems we are suited to solve",
    boundariesTitle: "Boundaries we keep clear",
    ownerTitle: "Who leads the project",
    ownerDescription:
      "实解智能 is currently led by fengc. The same owner coordinates early discussions, workflow mapping, system design, and delivery. You do not need a complete requirements document first—just explain the workflow consuming staff time, the tools already in use, and the problems you are encountering.",
    projectsLink: "View project cases",
    collaborationTitle: "How collaboration starts",
    collaborationSteps: [
      "First, we confirm whether the problem is worth solving by reviewing frequency, manual effort, and the impact of errors.",
      "Next, we divide responsibilities between the system and people. AI takes over stable steps while key decisions retain human confirmation.",
      "Finally, we validate with real data. After validation, we deploy and continue improving the system through actual use.",
    ],
    contactLink: "Submit a business problem",
    ctaTitle: "Start with one specific business problem",
    ctaDescription:
      "Submit the current workflow, frequency, and manual effort. We will first assess whether it is suitable for improvement, then decide whether to begin an initial diagnosis.",
    ctaLabel: "Submit a business problem",
  },
} as const;

export function AboutPageClient() {
  const { locale } = useLocale();
  const copy = pageCopy[locale];
  const content = getLocalizedPublicContent(locale);

  return (
    <div className="min-h-screen bg-surface-paper pb-20 pt-28 text-surface-paper-foreground sm:pt-32">
      <div className="mx-auto max-w-6xl px-4">
        <header className="max-w-4xl">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            {copy.eyebrow}
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.045em] text-foreground sm:text-6xl">
            {copy.heroTitle}
          </h1>
          <p className="mt-6 text-lg leading-9 text-muted-foreground">{content.identity.description}</p>
        </header>

        <div className="mt-14 grid gap-12 border-y border-hairline py-12 lg:grid-cols-2">
          <section>
            <h2 className="text-2xl font-semibold text-foreground">{copy.suitableTitle}</h2>
            <ul className="mt-6 space-y-4">
              {content.service.suitableWork.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-7 text-muted-foreground">
                  <CheckCircle2 className="mt-1 h-4 w-4 flex-none text-accent" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-foreground">{copy.boundariesTitle}</h2>
            <ul className="mt-6 space-y-4">
              {content.service.boundaries.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-7 text-muted-foreground">
                  <CheckCircle2 className="mt-1 h-4 w-4 flex-none text-accent" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="mt-14" aria-labelledby="project-owner-title">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">How we work</p>
          <div className="mt-3 grid gap-px border border-hairline bg-hairline lg:grid-cols-[0.9fr_1.1fr]">
            <div className="bg-surface-paper-elevated p-7 sm:p-8">
              <h2 id="project-owner-title" className="text-2xl font-semibold text-foreground">{copy.ownerTitle}</h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">{copy.ownerDescription}</p>
              <Link href="/projects" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent">
                {copy.projectsLink} <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
            <div className="bg-surface-paper p-7 sm:p-8">
              <h2 className="text-2xl font-semibold text-foreground">{copy.collaborationTitle}</h2>
              <ol className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
                {copy.collaborationSteps.map((step) => <li key={step}>{step}</li>)}
              </ol>
              <Link href="/contact" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent">
                {copy.contactLink} <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {content.service.method.map((step, index) => (
            <article key={step.id} className="border-t border-hairline pt-5">
              <span className="font-mono text-xs text-accent">0{index + 1}</span>
              <h2 className="mt-3 text-lg font-semibold text-foreground">{step.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
            </article>
          ))}
        </section>

        <div className="mt-16 bg-surface-graphite p-8 text-surface-graphite-foreground">
          <h2 className="text-3xl font-semibold">{copy.ctaTitle}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-surface-graphite-foreground/70">
            {copy.ctaDescription}
          </p>
          <Link href="/contact" className="mt-6 inline-flex min-h-11 items-center gap-2 bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground">
            {copy.ctaLabel} <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}
