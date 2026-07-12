"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

import { useLocale } from "@/components/LocaleProvider";
import { getLocalizedPublicContent } from "@/config/public-content";

const sectionCopy = {
  zh: { workflow: "原来的流程", takeover: "系统接管什么", review: "人工保留什么", outputs: "最终交付什么", transfer: "可迁移的系统能力", limits: "公开边界与限制", back: "返回项目案例", contact: "讨论你的流程" },
  en: { workflow: "Previous workflow", takeover: "What the system takes over", review: "What remains human", outputs: "Delivered outputs", transfer: "Transferable capabilities", limits: "Public boundaries and limits", back: "Back to cases", contact: "Discuss your workflow" },
} as const;

export function PublicProjectDetail({ id }: { id: string }) {
  const { locale } = useLocale();
  const project = getLocalizedPublicContent(locale).projects.find((item) => item.id === id);
  const copy = sectionCopy[locale];
  if (!project) return null;

  const sections = [
    [copy.workflow, project.originalWorkflow],
    [copy.takeover, project.processing],
    [copy.review, project.humanReview],
    [copy.outputs, project.outputs],
    [copy.transfer, project.transferableCapabilities],
    [copy.limits, project.limitations],
  ] as const;

  return (
    <div className="min-h-screen bg-surface-paper pb-20 pt-28 text-surface-paper-foreground sm:pt-32">
      <div className="mx-auto max-w-6xl px-4">
        <Link href="/projects" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" aria-hidden />{copy.back}</Link>
        <header className="mt-8 grid gap-8 border-y border-hairline py-9 lg:grid-cols-[1fr_0.8fr] lg:items-end">
          <div><p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent">Public case · reviewed</p><h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-6xl">{project.name}</h1><p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground">{project.purpose}</p></div>
          <p className="border-l-2 border-accent pl-5 text-sm font-medium leading-7 text-foreground">{project.currentStatus}</p>
        </header>
        {project.visual?.animationSrc ? <div className="mt-10 overflow-hidden border border-hairline bg-surface-graphite"><iframe title={project.visual.alt || project.name} src={project.visual.animationSrc} className="h-[480px] w-full border-0" /></div> : null}
        <div className="mt-12 grid gap-x-12 gap-y-10 lg:grid-cols-2">
          {sections.map(([title, items]) => <section key={title} className="border-t border-hairline pt-5"><h2 className="text-xl font-semibold text-foreground">{title}</h2><ul className="mt-5 space-y-3">{items.map((item) => <li key={item} className="flex gap-3 text-sm leading-7 text-muted-foreground"><CheckCircle2 className="mt-1 h-4 w-4 flex-none text-accent" aria-hidden /><span>{item}</span></li>)}</ul></section>)}
        </div>
        <div className="mt-14 flex flex-col items-start justify-between gap-5 bg-surface-graphite p-7 text-surface-graphite-foreground sm:flex-row sm:items-center"><p className="max-w-2xl text-lg font-semibold">{locale === "zh" ? "你的业务不需要和这个案例相同；我们从你的实际流程重新诊断。" : "Your business does not need to match this case; diagnosis starts again from your actual workflow."}</p><Link href="/contact" className="inline-flex items-center gap-2 bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground">{copy.contact}<ArrowRight className="h-4 w-4" aria-hidden /></Link></div>
      </div>
    </div>
  );
}
