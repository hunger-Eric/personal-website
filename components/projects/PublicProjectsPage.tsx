"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { useLocale } from "@/components/LocaleProvider";
import { getLocalizedPublicContent } from "@/config/public-content";

export function PublicProjectsPage() {
  const { locale } = useLocale();
  const content = getLocalizedPublicContent(locale);
  const zh = locale === "zh";

  return (
    <div className="min-h-screen bg-surface-paper pb-20 pt-28 text-surface-paper-foreground sm:pt-32">
      <header className="mx-auto max-w-6xl px-4">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent">Reviewed case evidence</p>
        <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight tracking-[-0.04em] text-foreground sm:text-5xl">{zh ? "项目是具体案例，不是要求客户复制同一种业务" : "Projects are evidence, not templates clients must copy"}</h1>
        <p className="mt-6 max-w-3xl text-base leading-8 text-muted-foreground">{zh ? "这里只公开经过审核、允许对外说明的项目事实。每个案例用于展示可迁移的系统能力，同时明确业务边界与限制。" : "Only reviewed and approved project facts are published here. Each case demonstrates transferable system capabilities while making its business boundaries explicit."}</p>
      </header>
      <section className="mx-auto mt-12 max-w-6xl px-4">
        {content.projects.map((project) => (
          <article key={project.id} className="grid overflow-hidden border border-hairline bg-surface-paper-elevated lg:grid-cols-[1.1fr_0.9fr]">
            <div className="p-6 sm:p-9">
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-accent"><CheckCircle2 className="h-4 w-4" aria-hidden />{zh ? "真实付费客户交付" : "Paid client delivery"}</div>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-foreground">{project.name}</h2>
              <p className="mt-4 text-base leading-8 text-muted-foreground">{project.purpose}</p>
              <p className="mt-6 border-l-2 border-accent pl-4 text-sm font-medium leading-7 text-foreground">{project.currentStatus}</p>
              <Link href={`/projects/${project.id}`} className="mt-8 inline-flex items-center gap-2 bg-foreground px-5 py-3 text-sm font-semibold text-surface-paper transition hover:bg-accent">{zh ? "查看完整案例" : "View full case"}<ArrowRight className="h-4 w-4" aria-hidden /></Link>
            </div>
            {project.visual?.animationSrc ? <iframe title={project.visual.alt || project.name} src={project.visual.animationSrc} className="min-h-[360px] w-full border-0 bg-surface-graphite lg:h-full" loading="lazy" /> : null}
          </article>
        ))}
      </section>
    </div>
  );
}
