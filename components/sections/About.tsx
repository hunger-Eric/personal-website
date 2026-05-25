"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  BriefcaseBusiness,
  FileText,
  Link2,
  Sparkles,
  Workflow,
  Users,
} from "lucide-react";

import { getSiteCopy } from "@/config/contentCopy";
import { aboutConfig } from "../../config/aboutConfig";
import { siteConfig } from "../../config/siteConfig";
import { useLocale } from "../LocaleProvider";

type LocaleCopy = {
  title: string;
  lead: string;
  personalTitle: string;
  personalLead: string;
  personalItems: string[];
  enterpriseTitle: string;
  enterpriseLead: string;
  enterpriseItems: string[];
  formatTitle: string;
  formatItems: string[];
  closing: string;
};

function getLocaleCopy(locale: "zh" | "en"): LocaleCopy {
  if (locale === "zh") {
    return {
      title: "我做过什么",
      lead:
        "我习惯把过往案例整理成网站、PPT、文档和自动化流程，让别人一眼就能看懂它解决了什么问题。",
      personalTitle: "个人版",
      personalLead: "更像一套顺手的小系统，主要解决表达、整理和持续维护。",
      personalItems: [
        "个人网站、作品集、知识库与内容归档",
        "照片整理、笔记整理、资料收纳",
        "把零散想法变成能长期使用的小工具",
      ],
      enterpriseTitle: "企业版",
      enterpriseLead: "更像一条稳定的交付链路，重点是少返工、少重复、少卡壳。",
      enterpriseItems: [
        "流程自动化、资料整理、内容分发",
        "网站、PPT、文档、演示页的交付整理",
        "影刀、n8n、Codex、Hermes、OpenClaw 的联动落地",
      ],
      formatTitle: "案例通常这样呈现",
      formatItems: ["网站", "PPT", "文档", "自动化流程"],
      closing:
        "AI 更适合放在摘要、起草、整理、检索和提醒这些环节里，像一个安静的助手，帮我把流程理顺，而不是替业务说话。",
    };
  }

  return {
    title: "What I have built",
    lead:
      "I usually package past work as websites, slide decks, documents, or automation flows so the outcome is easy to understand at a glance.",
    personalTitle: "Personal work",
    personalLead: "A small system that keeps ideas, photos, and notes easy to maintain.",
    personalItems: [
      "Personal sites, portfolios, knowledge bases, and content archives",
      "Photo organization, note cleanup, and asset management",
      "Small tools that turn loose ideas into something reusable",
    ],
    enterpriseTitle: "Enterprise work",
    enterpriseLead: "A steadier delivery path that cuts down repeat work and handoffs.",
    enterpriseItems: [
      "Workflow automation, document cleanup, and content delivery",
      "Websites, slide decks, documents, and demo pages prepared for sharing",
      "Yingdao, n8n, Codex, Hermes, and OpenClaw connected in practical workflows",
    ],
    formatTitle: "Common formats",
    formatItems: ["Websites", "PPT decks", "Documents", "Automation flows"],
    closing:
      "AI works best in the background here: summarizing, drafting, organizing, searching, and nudging the workflow forward without taking over the work itself.",
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
    <section id="about" className="scroll-mt-12 py-16 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="flex items-center gap-4">
          <h2 className="font-mono text-[13px] font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:text-lg">
            {copy.about.heading}
          </h2>
          <div className="hidden h-px w-40 bg-border sm:block sm:w-72" aria-hidden />
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[330px_minmax(0,1fr)] lg:gap-6">
          <aside className="space-y-4">
            <div className="rounded-2xl border border-border bg-card/70 p-5 shadow-[0_16px_32px_-24px_rgba(15,23,42,0.18)]">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <BriefcaseBusiness className="h-4 w-4" />
                <span>{localeCopy.title}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-foreground/80">
                {localeCopy.lead}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-2xl border border-border bg-card/70 p-5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{localeCopy.personalTitle}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-foreground/80">
                  {localeCopy.personalLead}
                </p>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-foreground/85">
                  {localeCopy.personalItems.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-border bg-card/70 p-5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  <Workflow className="h-4 w-4" />
                  <span>{localeCopy.enterpriseTitle}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-foreground/80">
                  {localeCopy.enterpriseLead}
                </p>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-foreground/85">
                  {localeCopy.enterpriseItems.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card/60 p-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <Sparkles className="h-4 w-4" />
                <span>{localeCopy.formatTitle}</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {localeCopy.formatItems.map((item) => (
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
                <FileText className="h-4 w-4" />
                <span>{locale === "zh" ? "代表案例" : "Selected cases"}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-foreground/80">
                {locale === "zh"
                  ? "这些是我已经做过、也在持续整理展示的方向。"
                  : "These are directions I have already built and keep presenting clearly."}
              </p>
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
                <div className="hidden text-[11px] font-medium text-muted-foreground sm:block">
                  {localeCopy.closing}
                </div>
              </div>

              <div className="space-y-5 px-4 py-5 text-sm leading-7 text-foreground/85 sm:px-6 sm:text-base">
                <p>
                  {locale === "zh"
                    ? "我会把案例按网站、PPT、文档和自动化流程这些形式整理出来，方便别人快速看懂项目的内容和结果。"
                    : "I organize case studies as websites, slide decks, documents, and automation flows so the shape of the work is easy to understand quickly."}
                </p>

                <p>
                  {locale === "zh"
                    ? "更常处理的内容包括企业流程自动化、影刀 / n8n 工作流、Codex / Hermes / OpenClaw 这些智能体联动，以及品牌站、产品介绍页和内容整理系统。项目如果还包含照片、资料和文字，我也会一起把结构理顺。"
                    : "I most often handle enterprise process automation, Yingdao / n8n workflows, agent orchestration across Codex / Hermes / OpenClaw, plus brand sites, product pages, and content systems. If a project also includes photos, assets, or writing, I help shape the structure too."}
                </p>

                <div>
                  <p className="text-sm font-semibold text-foreground/90">
                    {copy.about.techIntro}
                  </p>
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

