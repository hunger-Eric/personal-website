"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  CircleSlash2,
  FileInput,
  RotateCcw,
  UserRoundCheck,
} from "lucide-react";

import { JsonLd } from "@/components/JsonLd";
import { useLocale } from "@/components/LocaleProvider";
import { getLocalizedPublicContent } from "@/config/public-content";
import { publicIdentity } from "@/config/public-identity";
import { SITE_URL } from "@/lib/site-url";

const pageCopy = {
  zh: {
    eyebrow: "Service facts · 可引用服务事实",
    title: "企业 AI 工作流系统设计与交付",
    fitTitle: "什么情况适合先诊断",
    inputsTitle: "开始前需要什么",
    requiredInputs: [
      "当前流程的真实步骤、频率与责任人",
      "可用于验证的输入、输出与异常样本",
      "必须保留人工确认的关键决策或高风险动作",
    ],
    operatingTitle: "系统处理什么，人工保留什么",
    deliveryFacts: [
      {
        title: "系统处理",
        description: "让规则相对稳定、可重复验证的整理、判断与跨系统流转由系统执行。",
        icon: RotateCcw,
      },
      {
        title: "人工审核",
        description: "关键决策、高风险动作和异常情况保留明确的人工确认与接管入口。",
        icon: UserRoundCheck,
      },
      {
        title: "交付证据",
        description: "交付可运行系统、操作边界，以及状态、异常、恢复和输出的可追踪记录。",
        icon: CheckCircle2,
      },
    ],
    methodTitle: "从真实流程到可运行交付",
    methodDescription: "具体功能、周期和交付物由流程诊断与真实样本验证决定；初步提交不是自动报价。",
    boundariesTitle: "明确边界",
    reviewedTitle: "先看已审核事实，再判断是否适合",
    reviewedDescription:
      "项目库只公开已审核事实，或明确标注为模拟体验的内容；未完成公开审核的项目不会作为销售证明。",
    reviewedLink: "查看项目证据",
    ctaTitle: "从一个具体流程开始",
    ctaDescription:
      "提交当前流程、频率、人工投入和异常样本。只有适合继续诊断时，才会通过工作邮箱联系。",
    ctaLabel: "提交业务问题",
  },
  en: {
    eyebrow: "Service facts · Citable service facts",
    title: "Enterprise AI Workflow System Design and Delivery",
    fitTitle: "When an initial diagnosis makes sense",
    inputsTitle: "What we need before starting",
    requiredInputs: [
      "The actual workflow steps, frequency, and owners",
      "Input, output, and exception samples available for validation",
      "Key decisions or high-risk actions that must remain under human confirmation",
    ],
    operatingTitle: "What the system handles, what people retain",
    deliveryFacts: [
      {
        title: "System execution",
        description:
          "The system handles organization, decisions, and cross-system handoffs when rules are relatively stable and repeatably testable.",
        icon: RotateCcw,
      },
      {
        title: "Human review",
        description:
          "Key decisions, high-risk actions, and exceptions retain explicit human confirmation and takeover points.",
        icon: UserRoundCheck,
      },
      {
        title: "Delivery evidence",
        description:
          "Delivery includes a working system, operating boundaries, and traceable records for status, exceptions, recovery, and outputs.",
        icon: CheckCircle2,
      },
    ],
    methodTitle: "From a real workflow to a working delivery",
    methodDescription:
      "Features, schedule, and deliverables are determined through workflow diagnosis and validation with real samples; an initial submission is not an automatic quote.",
    boundariesTitle: "Clear boundaries",
    reviewedTitle: "Review verified facts before deciding whether it fits",
    reviewedDescription:
      "The project library only publishes reviewed facts or content explicitly labeled as a simulation. Projects without public review are not used as sales proof.",
    reviewedLink: "View project evidence",
    ctaTitle: "Start with one specific workflow",
    ctaDescription:
      "Submit the current workflow, frequency, manual effort, and exception samples. We will contact you by work email only when further diagnosis makes sense.",
    ctaLabel: "Submit a business problem",
  },
} as const;

export function ServicesPageClient() {
  const { locale } = useLocale();
  const copy = pageCopy[locale];
  const content = getLocalizedPublicContent(locale);

  return (
    <div className="min-h-screen bg-surface-paper pb-20 pt-28 text-surface-paper-foreground sm:pt-32">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: copy.title,
          serviceType: publicIdentity.category[locale],
          description: publicIdentity.description[locale],
          provider: {
            "@type": "Organization",
            name: publicIdentity.canonicalName,
            url: SITE_URL,
          },
          audience: {
            "@type": "Audience",
            audienceType: publicIdentity.audience[locale],
          },
          url: `${SITE_URL}/services`,
        }}
      />

      <div className="mx-auto max-w-6xl px-4">
        <header className="max-w-4xl">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            {copy.eyebrow}
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.045em] text-foreground sm:text-6xl">
            {copy.title}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-9 text-muted-foreground">
            {content.identity.description}
          </p>
        </header>

        <section className="mt-14 border-y border-hairline py-12" aria-labelledby="fit-title">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 id="fit-title" className="text-2xl font-semibold text-foreground">
                {copy.fitTitle}
              </h2>
              <ul className="mt-6 space-y-4">
                {content.service.suitableWork.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-7 text-muted-foreground">
                    <CheckCircle2 className="mt-1 h-4 w-4 flex-none text-accent" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-foreground">{copy.inputsTitle}</h2>
              <ul className="mt-6 space-y-4">
                {copy.requiredInputs.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-7 text-muted-foreground">
                    <FileInput className="mt-1 h-4 w-4 flex-none text-accent" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="py-14" aria-labelledby="boundary-title">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">01 / Operating model</p>
          <h2 id="boundary-title" className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-foreground">
            {copy.operatingTitle}
          </h2>
          <div className="mt-8 grid gap-px border border-hairline bg-hairline md:grid-cols-3">
            {copy.deliveryFacts.map(({ title, description, icon: Icon }) => (
              <article key={title} className="bg-surface-paper-elevated p-6 sm:p-8">
                <Icon className="h-5 w-5 text-accent" aria-hidden />
                <h3 className="mt-8 text-xl font-semibold text-foreground">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-10 border-t border-hairline py-14 lg:grid-cols-[0.85fr_1.15fr]" aria-labelledby="method-title">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">02 / Delivery method</p>
            <h2 id="method-title" className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-foreground">
              {copy.methodTitle}
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">{copy.methodDescription}</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {content.service.method.map((step, index) => (
              <article key={step.id} className="border-t border-hairline pt-5">
                <span className="font-mono text-xs text-accent">0{index + 1}</span>
                <h3 className="mt-3 text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-10 border-t border-hairline py-14 lg:grid-cols-2" aria-labelledby="limits-title">
          <div>
            <div className="flex items-center gap-3">
              <CircleSlash2 className="h-5 w-5 text-accent" aria-hidden />
              <h2 id="limits-title" className="text-2xl font-semibold text-foreground">{copy.boundariesTitle}</h2>
            </div>
            <ul className="mt-6 space-y-4">
              {content.service.boundaries.map((item) => (
                <li key={item} className="text-sm leading-7 text-muted-foreground">{item}</li>
              ))}
            </ul>
          </div>
          <div className="bg-surface-graphite p-7 text-surface-graphite-foreground sm:p-8">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent-light">Reviewed evidence</p>
            <h2 className="mt-3 text-2xl font-semibold">{copy.reviewedTitle}</h2>
            <p className="mt-4 text-sm leading-7 text-surface-graphite-foreground/70">
              {copy.reviewedDescription}
            </p>
            <Link href="/projects" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent-light">
              {copy.reviewedLink} <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </section>

        <section className="border-t border-hairline pt-14">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-3xl font-semibold tracking-[-0.035em] text-foreground">{copy.ctaTitle}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">{copy.ctaDescription}</p>
            </div>
            <Link href="/contact" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground hover:bg-accent-hover">
              {copy.ctaLabel} <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
