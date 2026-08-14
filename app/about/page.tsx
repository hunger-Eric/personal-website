import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { getLocalizedPublicContent } from "@/config/public-content";

export const metadata: Metadata = {
  title: "关于",
  description: "了解实解智能适合处理的问题、项目负责人和具体合作方式。",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  const content = getLocalizedPublicContent("zh");

  return (
    <div className="min-h-screen bg-surface-paper pb-20 pt-28 text-surface-paper-foreground sm:pt-32">
      <div className="mx-auto max-w-6xl px-4">
        <header className="max-w-4xl">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            实解智能 · 企业 AI 系统设计与交付
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.045em] text-foreground sm:text-6xl">
            让 AI 真正在企业里跑起来。
          </h1>
          <p className="mt-6 text-lg leading-9 text-muted-foreground">{content.identity.description}</p>
        </header>

        <div className="mt-14 grid gap-12 border-y border-hairline py-12 lg:grid-cols-2">
          <section>
            <h2 className="text-2xl font-semibold text-foreground">适合处理的问题</h2>
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
            <h2 className="text-2xl font-semibold text-foreground">不会模糊的边界</h2>
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
              <h2 id="project-owner-title" className="text-2xl font-semibold text-foreground">谁来负责项目</h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                实解智能目前由 fengc 负责。前期沟通、流程梳理、系统设计和交付协调由同一负责人推进。你不需要先准备一份完整需求书，只要把正在消耗人力的流程、现有工具和遇到的问题讲清楚。
              </p>
              <Link href="/projects" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent">
                查看项目案例 <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
            <div className="bg-surface-paper p-7 sm:p-8">
              <h2 className="text-2xl font-semibold text-foreground">合作从哪里开始</h2>
              <ol className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
                <li>先确认问题是否值得做。我们会看流程发生频率、人工投入和出错后的影响。</li>
                <li>再划分系统与人工的职责。AI 接管稳定步骤，关键判断保留人工确认。</li>
                <li>最后用真实数据验证。通过后再部署，并根据实际使用继续调整。</li>
              </ol>
              <Link href="/contact" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent">
                提交一个业务问题 <ArrowRight className="h-4 w-4" aria-hidden />
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
          <h2 className="text-3xl font-semibold">先从一个具体业务问题开始</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-surface-graphite-foreground/70">
            提交当前流程、频率和人工投入。我们会先判断是否适合改造，再决定是否进入初步诊断。
          </p>
          <Link href="/contact" className="mt-6 inline-flex min-h-11 items-center gap-2 bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground">
            提交业务问题 <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}
