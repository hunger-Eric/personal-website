"use client";

import Link from "next/link";
import { useMemo } from "react";
import { BriefcaseBusiness, FileText, Link2, Sparkles, Workflow } from "lucide-react";

import { getSiteCopy } from "@/config/contentCopy";
import { aboutConfig } from "../../config/aboutConfig";
import { siteConfig } from "../../config/siteConfig";
import { useLocale } from "../LocaleProvider";

type LocaleCopy = {
  capabilitiesTitle: string;
  capabilitiesLead: string;
  capabilityItems: string[];
  caseStudiesTitle: string;
  caseStudiesLead: string;
  workflowTitle: string;
  workflowItems: string[];
  stackIntro: string;
  closing: string;
};

function getLocaleCopy(locale: "zh" | "en"): LocaleCopy {
  if (locale === "zh") {
    return {
      capabilitiesTitle: "我能帮客户做什么",
      capabilitiesLead:
        "我把网站、PPT、文档和自动化流程放在同一套交付里，尤其擅长面向企业的流程自动化、智能体联动和落地执行。",
      capabilityItems: [
        "影刀、n8n 等工作流自动化搭建",
        "Codex、Hermes、OpenClaw 等智能体联动",
        "企业流程自动化与效率工具落地",
        "品牌站、个人站、产品介绍页与落地页",
        "PPT、提案页、长文档与内容整理",
      ],
      caseStudiesTitle: "代表案例",
      caseStudiesLead: "这些是我已经在做、也能继续扩展的方向。",
      workflowTitle: "合作方式",
      workflowItems: ["先梳理结构", "再补内容", "最后上线交付"],
      stackIntro: "常用技术和工具：",
      closing:
        "如果项目里还包括资料、图文或照片，我也会一起把信息结构和展示节奏收好。",
    };
  }

  return {
    capabilitiesTitle: "What I can deliver for clients",
    capabilitiesLead:
      "I keep websites, decks, documents, automation flows, and agent orchestration in one delivery track, with a strong focus on enterprise automation delivery.",
    capabilityItems: [
      "Workflow automation with Yingdao, n8n, and similar tools",
      "Agent orchestration across Codex, Hermes, OpenClaw, and related systems",
      "Enterprise process automation and productivity tooling",
      "Brand sites, personal sites, product pages, and landing pages",
      "PPT decks, proposal pages, long-form documents, and content cleanup",
    ],
    caseStudiesTitle: "Selected cases",
    caseStudiesLead: "These are directions I already work on and can extend further.",
    workflowTitle: "How I work",
    workflowItems: ["Map the structure first", "Fill in the content second", "Ship it cleanly"],
    stackIntro: "Main stack and tools:",
    closing:
      "If the project also includes documents, imagery, or photo assets, I help shape the information flow as part of the delivery.",
  };
}

export function AboutSection() {
  const { locale } = useLocale();
  const copy = getSiteCopy(locale);
  const enabled = (siteConfig as any)?.sections?.about === true;
  if (!enabled) return null;

  const a = aboutConfig;
  const fileLabel = a.readme?.fileLabel || "README.md";
  const mdDotIndex = fileLabel.toLowerCase().lastIndexOf(".md");
  const fileBase = mdDotIndex > 0 ? fileLabel.slice(0, mdDotIndex) : fileLabel;
  const fileExt = mdDotIndex > 0 ? fileLabel.slice(mdDotIndex) : "";

  const localeCopy = useMemo(() => getLocaleCopy(locale), [locale]);
  const techList = useMemo(
    () => ["Next.js", "Python", "React.js", "TypeScript", "PostgreSQL", "Tailwind CSS"],
    []
  );
  const caseStudies = useMemo(() => a.snapshot.cards.slice(0, 2), [a.snapshot.cards]);

  return (
    <section id="about" className="py-16 scroll-mt-12 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="flex items-center gap-4">
          <h2 className="font-mono text-[13px] font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:text-lg">
            {copy.about.heading}
          </h2>
          <div className="hidden h-px w-40 bg-border sm:block sm:w-72" aria-hidden />
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-6">
          <aside className="space-y-4">
            <div className="rounded-2xl border border-border bg-card/70 p-5 shadow-[0_16px_32px_-24px_rgba(15,23,42,0.18)]">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <BriefcaseBusiness className="h-4 w-4" />
                <span>{localeCopy.capabilitiesTitle}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-foreground/80">
                {localeCopy.capabilitiesLead}
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-foreground/85">
                {localeCopy.capabilityItems.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-card/60 p-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <Sparkles className="h-4 w-4" />
                <span>{localeCopy.workflowTitle}</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {localeCopy.workflowItems.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground/80"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card/70 p-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <Workflow className="h-4 w-4" />
                <span>{localeCopy.caseStudiesTitle}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-foreground/80">{localeCopy.caseStudiesLead}</p>
              <div className="mt-4 space-y-3">
                {caseStudies.map((card) => (
                  <div
                    key={card.title}
                    className="rounded-xl border border-border bg-background px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 flex-none text-accent" />
                          <h3 className="truncate text-sm font-semibold text-foreground">
                            {card.title}
                          </h3>
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                          {card.description}
                        </p>
                      </div>
                    </div>

                    {card.stats?.length ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {card.stats.slice(0, 2).map((stat) => (
                          <span
                            key={`${card.title}-${stat.label}`}
                            className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
                          >
                            <span>{stat.label}</span>
                            <span className="text-foreground/70">·</span>
                            <span className="text-foreground">{stat.value}</span>
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
                <div className="text-xs text-muted-foreground">
                  {locale === "zh" ? `${caseStudies.length} 个案例` : `${caseStudies.length} cases`}
                </div>
              </div>
            </div>

            <Link
              href="/links"
              className="group inline-flex w-full min-w-0 items-center justify-center gap-2 rounded-md border border-accent/40 bg-accent/10 px-3.5 py-2.5 text-sm font-semibold text-foreground transition-colors duration-150 hover:border-accent hover:bg-accent/15"
            >
              <Link2 className="h-4 w-4 flex-none" />
              <span className="truncate">{copy.about.socialsButton}</span>
            </Link>
          </aside>

          <div className="space-y-8">
            <div className="rounded-2xl border border-border bg-card/60">
              <div className="flex items-center justify-between gap-4 border-b border-border/70 px-4 py-3 sm:px-6">
                <div className="text-xs font-semibold text-muted-foreground">
                  <span>{a.handle}</span>
                  <span> / </span>
                  <span>{fileBase}</span>
                  {fileExt ? <span>{fileExt}</span> : null}
                </div>
              </div>

              <div className="space-y-5 px-4 py-5 text-sm leading-7 text-foreground/85 sm:px-6 sm:text-base">
                <p>
                  {locale === "zh"
                    ? "我会把网站、PPT、文档和自动化流程放在同一套交付节奏里，帮助客户更快看到可以直接使用的结果。"
                    : "I keep websites, decks, documents, and automation flows on the same delivery rhythm so clients can see usable results faster."}
                </p>

                <p>
                  {locale === "zh"
                    ? "更常接的内容包括企业流程自动化、影刀 / n8n 工作流、Codex / Hermes / OpenClaw 等智能体联动、品牌站、产品介绍页和内容整理系统。项目如果需要兼顾照片、资料和文字，我也会一起把结构理顺。"
                    : "I most often work on enterprise process automation, Yingdao / n8n workflows, agent orchestration across Codex / Hermes / OpenClaw, brand sites, product pages, and content systems. If a project also needs photos, assets, and written material, I help shape the structure too."}
                </p>

                <div>
                  <p className="text-sm font-semibold text-foreground/90">{localeCopy.stackIntro}</p>
                  <ul className="mt-3 grid list-disc grid-cols-2 gap-x-6 gap-y-1.5 pl-5 marker:text-accent/70">
                    {techList.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>

                <p>{localeCopy.closing}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
