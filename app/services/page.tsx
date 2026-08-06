import type { Metadata } from "next";
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
import { getLocalizedPublicContent } from "@/config/public-content";
import { publicIdentity } from "@/config/public-identity";
import { SITE_URL } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "企业 AI 工作流系统设计与交付",
  description:
    "说明实解智能适合处理的流程、客户需要提供的输入、人机审核边界、交付结果与失败恢复原则。",
  alternates: { canonical: "/services" },
};

const requiredInputs = [
  "当前流程的真实步骤、频率与责任人",
  "可用于验证的输入、输出与异常样本",
  "必须保留人工确认的关键决策或高风险动作",
];

const deliveryFacts = [
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
] as const;

export default function ServicesPage() {
  const content = getLocalizedPublicContent("zh");

  return (
    <div className="min-h-screen bg-surface-paper pb-20 pt-28 text-surface-paper-foreground sm:pt-32">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: "企业 AI 工作流系统设计与交付",
          serviceType: publicIdentity.category.zh,
          description: publicIdentity.description.zh,
          provider: {
            "@type": "Organization",
            name: publicIdentity.canonicalName,
            url: SITE_URL,
          },
          audience: {
            "@type": "Audience",
            audienceType: publicIdentity.audience.zh,
          },
          url: `${SITE_URL}/services`,
        }}
      />

      <div className="mx-auto max-w-6xl px-4">
        <header className="max-w-4xl">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            Service facts · 可引用服务事实
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.045em] text-foreground sm:text-6xl">
            企业 AI 工作流系统设计与交付
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-9 text-muted-foreground">
            {content.identity.description}
          </p>
        </header>

        <section className="mt-14 border-y border-hairline py-12" aria-labelledby="fit-title">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 id="fit-title" className="text-2xl font-semibold text-foreground">
                什么情况适合先诊断
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
              <h2 className="text-2xl font-semibold text-foreground">开始前需要什么</h2>
              <ul className="mt-6 space-y-4">
                {requiredInputs.map((item) => (
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
            系统处理什么，人工保留什么
          </h2>
          <div className="mt-8 grid gap-px border border-hairline bg-hairline md:grid-cols-3">
            {deliveryFacts.map(({ title, description, icon: Icon }) => (
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
              从真实流程到可运行交付
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              具体功能、周期和交付物由流程诊断与真实样本验证决定；初步提交不是自动报价。
            </p>
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
              <h2 id="limits-title" className="text-2xl font-semibold text-foreground">明确边界</h2>
            </div>
            <ul className="mt-6 space-y-4">
              {content.service.boundaries.map((item) => (
                <li key={item} className="text-sm leading-7 text-muted-foreground">{item}</li>
              ))}
            </ul>
          </div>
          <div className="bg-surface-graphite p-7 text-surface-graphite-foreground sm:p-8">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent-light">Reviewed evidence</p>
            <h2 className="mt-3 text-2xl font-semibold">先看已审核事实，再判断是否适合</h2>
            <p className="mt-4 text-sm leading-7 text-surface-graphite-foreground/70">
              项目库只公开已审核事实，或明确标注为模拟体验的内容；未完成公开审核的项目不会作为销售证明。
            </p>
            <Link href="/projects" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent-light">
              查看项目证据 <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </section>

        <section className="border-t border-hairline pt-14">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-3xl font-semibold tracking-[-0.035em] text-foreground">从一个具体流程开始</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                提交当前流程、频率、人工投入和异常样本。只有适合继续诊断时，才会通过工作邮箱联系。
              </p>
            </div>
            <Link href="/contact" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground hover:bg-accent-hover">
              提交业务问题 <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
