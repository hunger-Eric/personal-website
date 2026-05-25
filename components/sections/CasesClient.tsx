"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  ArrowRight,
  Bot,
  Boxes,
  BrainCircuit,
  ChevronRight,
  FolderOpen,
  GitBranch,
  Workflow,
} from "lucide-react";

import { useLocale } from "@/components/LocaleProvider";
import { getSiteCopy } from "@/config/contentCopy";
import {
  formatCaseDisplayMode,
  getCaseDisplaySettings,
  resolveCaseDisplayMode,
} from "@/config/caseDisplay";
import type { CaseItem } from "../../config/cases";

interface CasesSectionClientProps {
  cases: CaseItem[];
}

function metadataLabel(value?: string) {
  return value?.trim() || "Archive";
}

function getPrimaryProblem(caseItem: CaseItem) {
  return caseItem.problem?.[0] || caseItem.description?.[0] || caseItem.summary;
}

function getPrimaryWorkflow(caseItem: CaseItem, locale: "zh" | "en") {
  return (
    caseItem.workflows?.[0] ||
    caseItem.aiOrchestration?.[0] ||
    (locale === "zh" ? "AI workflow" : "AI workflow")
  );
}

function TagRow({ items, empty }: { items?: string[]; empty: string }) {
  const values = items?.length ? items.slice(0, 4) : [empty];
  return (
    <div className="flex flex-wrap gap-2">
      {values.map((item) => (
        <span
          key={item}
          className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function FeaturedLabRecord({
  caseItem,
  locale,
}: {
  caseItem: CaseItem;
  locale: "zh" | "en";
}) {
  return (
    <Link
      href={`/projects/${encodeURIComponent(caseItem.id)}`}
      className="group block border-y border-border py-5 transition-colors hover:border-foreground/30"
    >
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        <Bot className="h-4 w-4" />
        <span>{locale === "zh" ? "Featured Lab Note" : "Featured Lab Note"}</span>
        <span className="text-border">/</span>
        <span>{metadataLabel(caseItem.status)}</span>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <h3 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {caseItem.name}
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            {getPrimaryProblem(caseItem)}
          </p>
        </div>

        <div className="grid gap-3 text-sm">
          <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-3 border-t border-border pt-3">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Role
            </span>
            <span className="text-foreground">{metadataLabel(caseItem.role)}</span>
          </div>
          <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-3 border-t border-border pt-3">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Workflow
            </span>
            <span className="text-foreground">{getPrimaryWorkflow(caseItem, locale)}</span>
          </div>
          <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-3 border-t border-border pt-3">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              AI Stack
            </span>
            <span className="text-foreground">
              {(caseItem.aiStack ?? caseItem.technologies ?? []).slice(0, 3).join(", ") ||
                "AI-assisted workflow"}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <TagRow
          items={caseItem.tags}
          empty={locale === "zh" ? "系统档案" : "system archive"}
        />
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-foreground">
          {locale === "zh" ? "查看记录" : "View record"}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

function LabIndexRow({
  caseItem,
  index,
  locale,
}: {
  caseItem: CaseItem;
  index: number;
  locale: "zh" | "en";
}) {
  return (
    <Link
      href={`/projects/${encodeURIComponent(caseItem.id)}`}
      className="group grid gap-4 border-t border-border py-4 transition-colors hover:border-foreground/30 md:grid-cols-[64px_minmax(0,1fr)_260px_32px]"
    >
      <span className="font-mono text-sm text-muted-foreground">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold text-foreground">{caseItem.name}</h3>
          <span className="rounded-full border border-border bg-card px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            {metadataLabel(caseItem.caseType || caseItem.format)}
          </span>
        </div>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
          {getPrimaryProblem(caseItem)}
        </p>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Workflow className="h-3.5 w-3.5" />
          <span className="truncate">{getPrimaryWorkflow(caseItem, locale)}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <BrainCircuit className="h-3.5 w-3.5" />
          <span className="truncate">
            {(caseItem.aiStack ?? caseItem.technologies ?? []).slice(0, 2).join(", ") ||
              "AI stack"}
          </span>
        </div>
      </div>
      <ChevronRight className="hidden h-5 w-5 self-center text-muted-foreground transition-transform group-hover:translate-x-0.5 md:block" />
    </Link>
  );
}

export function CasesSectionClient({ cases }: CasesSectionClientProps) {
  const { locale } = useLocale();
  const copy = getSiteCopy(locale);
  const display = getCaseDisplaySettings();
  const mode = resolveCaseDisplayMode(cases.length);

  const featuredCase = useMemo(
    () => cases.find((caseItem) => caseItem.featured) || cases[0] || null,
    [cases]
  );
  const previewCases = useMemo(
    () => cases.slice(0, Math.max(1, display.previewLimit)),
    [cases, display.previewLimit]
  );

  if (!cases.length || !featuredCase) return null;

  return (
    <section id="projects" className="scroll-mt-12 py-16 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="grid gap-5 border-t border-border pt-5 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div>
            <h2 className="flex items-center gap-2 font-mono text-[13px] font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:text-lg">
              <FolderOpen className="h-4 w-4" />
              <span>{copy.cases.heading}</span>
            </h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              {locale === "zh"
                ? "这里不是普通作品集，而是系统设计档案。每个案例都记录问题、workflow、AI 参与方式、自动化和可扩展路径。"
                : "This is not a normal portfolio. Each record captures the problem, workflow, AI orchestration, automation, and scaling path."}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
                {formatCaseDisplayMode(display.mode, locale)}
              </span>
              <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
                {cases.length} {locale === "zh" ? "个档案" : "records"}
              </span>
            </div>
          </div>

          <div>
            {mode === "featured" ? (
              <>
                <FeaturedLabRecord caseItem={featuredCase} locale={locale} />
                <div className="mt-8">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    <GitBranch className="h-4 w-4" />
                    <span>{locale === "zh" ? "System Archive" : "System Archive"}</span>
                  </div>
                  {previewCases.map((caseItem, index) => (
                    <LabIndexRow
                      key={caseItem.id}
                      caseItem={caseItem}
                      index={index}
                      locale={locale}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  <Boxes className="h-4 w-4" />
                  <span>{locale === "zh" ? "Catalog Mode" : "Catalog Mode"}</span>
                </div>
                {previewCases.map((caseItem, index) => (
                  <LabIndexRow
                    key={caseItem.id}
                    caseItem={caseItem}
                    index={index}
                    locale={locale}
                  />
                ))}
              </div>
            )}

            <Link
              href="/projects"
              className="mt-6 inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              <span>{copy.cases.viewAll}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
