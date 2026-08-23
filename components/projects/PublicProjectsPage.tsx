"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import { getPublicWebsiteProjects } from "@/config/website-projects";
const factLabels = {
  zh: {
    problem: "客户原来怎么做",
    solution: "系统怎么完成",
    buyerValue: "购买后得到什么",
    boundary: "使用范围",
  },
  en: {
    problem: "Current workflow",
    solution: "How the system works",
    buyerValue: "What the customer gains",
    boundary: "Usage scope",
  },
} as const;

const factAnchors = {
  problem: "customer-problem",
  solution: "system-workflow",
  buyerValue: "buyer-value",
  boundary: "usage-boundary",
} as const;

export function PublicProjectsPage() {
  const { locale } = useLocale();
  const zh = locale === "zh";
  const projects = getPublicWebsiteProjects(locale);
  const labels = factLabels[locale];

  return (
    <div className="min-h-screen overflow-x-hidden bg-surface-paper pb-20 pt-28 text-surface-paper-foreground sm:pt-32">
      <header className="mx-auto max-w-6xl px-4">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          Project library
        </p>
        <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight tracking-[-0.045em] text-foreground sm:text-6xl">
          {zh
            ? "每个项目解决什么，为什么值得买"
            : "What each project solves and why it is worth buying"}
        </h1>
        <p className="mt-6 max-w-3xl text-base leading-8 text-muted-foreground">
          {zh
            ? "每个案例都从客户原来的工作方式讲起，再说明系统接管哪些步骤，以及采购后能得到什么。"
            : "Each case starts with the customer's current workflow, then shows which steps the system takes over and what the customer gains after buying it."}
        </p>
      </header>
      <section
        className="mx-auto mt-12 grid max-w-6xl gap-px border border-hairline bg-hairline sm:grid-cols-2"
        aria-label={zh ? "项目列表" : "Project list"}
      >
        {projects.map((project, index) => (
          <article
            key={project.id}
            id={project.id}
            className="flex flex-col bg-surface-paper-elevated p-6 sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <span className="font-mono text-xs text-accent">0{index + 1}</span>
              <span className="max-w-[13rem] border border-hairline px-2 py-1 text-right font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                {project.status}
              </span>
            </div>
            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {project.category}
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-foreground">
              {project.name}
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              {project.summary}
            </p>
            <ul className="mt-5">
              {project.facts.map((fact) => (
                <li
                  key={`${fact.kind}-${fact.text}`}
                  id={`${project.id}-${factAnchors[fact.kind]}`}
                  className="grid grid-cols-[6.75rem_minmax(0,1fr)] gap-3 border-t border-hairline py-3 text-sm leading-6"
                >
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-accent">
                    {labels[fact.kind]}
                  </span>
                  <span className="text-foreground/80">{fact.text}</span>
                </li>
              ))}
            </ul>
            <Link
              href={
                project.liveUrl ??
                `/projects/${project.id}${project.interactive ? "#open-geo-demo" : ""}`
              }
              className="mt-8 inline-flex min-h-11 items-center justify-center gap-2 self-start border border-foreground px-4 py-2 text-sm font-semibold text-foreground hover:border-accent hover:text-accent"
            >
              {project.liveUrl
                ? zh
                  ? "了解产品"
                  : "Explore the product"
                : project.interactive
                  ? zh
                    ? "参与体验"
                    : "Try the prototype"
                  : zh
                    ? "查看项目"
                    : "View project"}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </article>
        ))}
      </section>
    </div>
  );
}
