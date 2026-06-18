"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Filter, FolderOpen } from "lucide-react";

import { useLocale } from "@/components/LocaleProvider";
import { EmptyState, Surface } from "@/components/system";
import { getSiteCopy } from "@/config/contentCopy";
import type { CaseItem } from "@/config/cases";

type Props = {
  cases: CaseItem[];
};

const CAPABILITIES = [
  "All",
  "Knowledge/RAG",
  "Automation",
  "Agent Runtime",
  "Business Validation",
  "Content/Media",
];

function matchesCapability(caseItem: CaseItem, capability: string) {
  if (capability === "All") return true;
  const haystack = [
    caseItem.caseType,
    caseItem.format,
    caseItem.customerStory?.archetype,
    ...(caseItem.tags ?? []),
    ...(caseItem.workflows ?? []),
    ...(caseItem.aiStack ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(capability.toLowerCase());
}

function firstLine(caseItem: CaseItem) {
  return (
    caseItem.customerStory?.shortPromise ||
    caseItem.problem?.[0] ||
    caseItem.description?.[0] ||
    caseItem.summary
  );
}

function artifactLine(caseItem: CaseItem) {
  return (
    caseItem.customerStory?.artifactLabel ||
    caseItem.results?.[0] ||
    caseItem.demo?.result.label ||
    caseItem.format ||
    "System artifact"
  );
}

export function CasesBrowser({ cases }: Props) {
  const { locale } = useLocale();
  const copy = getSiteCopy(locale);
  const [activeCapability, setActiveCapability] = useState("All");

  const filteredCases = useMemo(
    () =>
      cases.filter((caseItem) =>
        matchesCapability(caseItem, activeCapability)
      ),
    [activeCapability, cases]
  );

  if (!cases.length) {
    return (
      <EmptyState
        icon={<FolderOpen className="h-12 w-12" aria-hidden />}
        title={copy.cases.emptyTitle}
        description={copy.cases.emptyDescription}
      />
    );
  }

  return (
    <div className="space-y-5">
      <header className="grid gap-4 border-y border-hairline py-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:items-end">
        <div>
          <div className="mb-3 flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <FolderOpen className="h-4 w-4" aria-hidden />
            <span>{copy.cases.indexEyebrow}</span>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            {copy.cases.indexTitle}
          </h2>
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <Filter className="h-4 w-4" aria-hidden />
            <span>{copy.cases.filterLabel}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {CAPABILITIES.map((capability) => {
              const active = capability === activeCapability;
              return (
                <button
                  key={capability}
                  type="button"
                  onClick={() => setActiveCapability(capability)}
                  className={[
                    "rounded-control border px-3 py-1.5 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                    active
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-hairline bg-surface-paper text-muted-foreground hover:bg-muted hover:text-foreground",
                  ].join(" ")}
                >
                  {capability}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {!filteredCases.length ? (
        <EmptyState
          icon={<FolderOpen className="h-10 w-10" aria-hidden />}
          title={copy.cases.noMatchesTitle}
          description={copy.cases.noMatchesDescription}
        />
      ) : (
        <div>
          <p className="mb-3 text-xs font-medium text-muted-foreground">
            {filteredCases.length} {copy.cases.matchingSuffix}
          </p>
          <Surface tone="paper" className="divide-y divide-hairline">
            {filteredCases.map((caseItem, index) => (
              <Link
                key={caseItem.id}
                href={`/projects/${encodeURIComponent(caseItem.id)}`}
                className="group grid gap-4 px-4 py-4 transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-accent md:grid-cols-[52px_minmax(0,1.2fr)_minmax(220px,0.8fr)_32px]"
              >
                <span className="font-mono text-sm text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-foreground">
                      {caseItem.name}
                    </h3>
                    <span className="rounded-control border border-hairline bg-surface-paper px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      {caseItem.caseType || caseItem.format || "Archive"}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                    {firstLine(caseItem)}
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    {copy.cases.artifactLabel}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-foreground">
                    {artifactLine(caseItem)}
                  </p>
                </div>
                <ArrowUpRight className="hidden h-5 w-5 self-center text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 md:block" />
              </Link>
            ))}
          </Surface>
        </div>
      )}
    </div>
  );
}
