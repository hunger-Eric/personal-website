"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, BrainCircuit, GitBranch, Workflow } from "lucide-react";

import { useLocale } from "@/components/LocaleProvider";
import { getSiteCopy } from "@/config/contentCopy";
import type { CaseItem } from "../../config/cases";

interface CaseCardProps {
  caseItem: CaseItem;
  iconFor?: (type?: string) => ReactNode;
  featured?: boolean;
}

function firstLine(caseItem: CaseItem) {
  return caseItem.problem?.[0] || caseItem.description?.[0] || caseItem.summary;
}

export function CaseCard({ caseItem, featured = false }: CaseCardProps) {
  const { locale } = useLocale();
  const copy = getSiteCopy(locale);
  const href = `/projects/${encodeURIComponent(caseItem.id)}`;
  const aiStack = (caseItem.aiStack ?? caseItem.technologies ?? []).slice(0, 3);

  return (
    <article className="h-full border-y border-border py-5">
      <Link href={href} className="group block">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          <GitBranch className="h-4 w-4" />
          <span>{locale === "zh" ? "系统记录" : "System record"}</span>
          <span className="text-border">/</span>
          <span>{caseItem.status || "Archive"}</span>
        </div>

        <h3 className="mt-4 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {caseItem.name}
        </h3>
        <p className="mt-3 line-clamp-3 text-sm leading-7 text-muted-foreground">
          {firstLine(caseItem)}
        </p>

        <div className="mt-5 grid gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Workflow className="h-4 w-4" />
            <span className="truncate">
              {caseItem.workflows?.[0] || caseItem.aiOrchestration?.[0] || "AI workflow"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-4 w-4" />
            <span className="truncate">{aiStack.join(", ") || "AI-assisted system"}</span>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {(caseItem.tags ?? [caseItem.caseType ?? "case"]).slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-foreground">
            {copy.cases.viewDetails}
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>
    </article>
  );
}
