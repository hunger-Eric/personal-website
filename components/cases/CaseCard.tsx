"use client";

import Link from "next/link";
import { ArrowUpRight, FileOutput, GitBranch, Workflow } from "lucide-react";

import { useLocale } from "@/components/LocaleProvider";
import { Surface } from "@/components/system";
import { getSiteCopy } from "@/config/contentCopy";
import type { CaseItem } from "@/config/cases";

interface CaseCardProps {
  caseItem: CaseItem;
}

function firstLine(caseItem: CaseItem) {
  return (
    caseItem.customerStory?.publicScenario ||
    caseItem.problem?.[0] ||
    caseItem.description?.[0] ||
    caseItem.summary
  );
}

function resultLine(caseItem: CaseItem) {
  return (
    caseItem.customerStory?.artifactLabel ||
    caseItem.results?.[0] ||
    caseItem.demo?.result.label ||
    caseItem.format ||
    "Case result"
  );
}

export function CaseCard({ caseItem }: CaseCardProps) {
  const { locale } = useLocale();
  const copy = getSiteCopy(locale);
  const href = `/projects/${encodeURIComponent(caseItem.id)}`;
  const tags = (caseItem.tags ?? [caseItem.caseType ?? "case"]).slice(0, 3);

  return (
    <Surface tone="paper" className="h-full p-5 transition-colors hover:border-foreground/30">
      <Link
        href={href}
        className="group flex h-full flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          <GitBranch className="h-4 w-4" />
          <span>{copy.cases.caseRecord}</span>
          <span className="text-border">/</span>
          <span>{caseItem.status || "Archive"}</span>
        </div>

        <h3 className="mt-4 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {caseItem.name}
        </h3>
        <p className="mt-3 line-clamp-3 text-sm leading-7 text-muted-foreground">
          {firstLine(caseItem)}
        </p>

        <div className="mt-5 grid gap-2 border-t border-hairline pt-4 text-xs text-muted-foreground sm:grid-cols-2">
          <div className="rounded-control border border-hairline bg-surface-paper p-3">
            <span className="mb-1 flex items-center gap-1.5 font-semibold uppercase tracking-[0.14em] text-foreground">
              <Workflow className="h-3.5 w-3.5 text-accent" />
              {copy.cases.problemLabel}
            </span>
            <p className="line-clamp-2 leading-5">
              {caseItem.caseType || caseItem.format}
            </p>
          </div>
          <div className="rounded-control border border-hairline bg-surface-paper p-3">
            <span className="mb-1 flex items-center gap-1.5 font-semibold uppercase tracking-[0.14em] text-foreground">
              <FileOutput className="h-3.5 w-3.5 text-accent" />
              {copy.cases.outcomeLabel}
            </span>
            <p className="line-clamp-2 leading-5">{resultLine(caseItem)}</p>
          </div>
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5">
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-control border border-hairline bg-surface-paper px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-foreground">
            {copy.cases.viewFullCase}
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>
    </Surface>
  );
}
