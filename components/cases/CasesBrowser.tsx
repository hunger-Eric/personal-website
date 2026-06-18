"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Filter, FolderOpen } from "lucide-react";

import { useLocale } from "@/components/LocaleProvider";
import type { CaseItem } from "../../config/cases";

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
  const [activeCapability, setActiveCapability] = useState("All");

  const filteredCases = useMemo(
    () => cases.filter((caseItem) => matchesCapability(caseItem, activeCapability)),
    [activeCapability, cases]
  );

  if (!cases.length) {
    return (
      <div className="flex flex-col items-center justify-center border-y border-[#d9cfbf] py-20 text-center">
        <FolderOpen className="mb-4 h-12 w-12 text-[#988b76]" />
        <h3 className="mb-1 text-lg font-semibold text-[#1f2420]">
          {locale === "zh" ? "暂无案例记录" : "No system records yet"}
        </h3>
        <p className="text-sm text-[#6f6659]">
          {locale === "zh" ? "案例档案还在整理中。" : "Case records are still being organized."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <header className="grid gap-4 border-y border-[#d9cfbf] py-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:items-end">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#817565]">
            <FolderOpen className="h-4 w-4" />
            <span>{locale === "zh" ? "案例索引" : "Case index"}</span>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-[#1f2420]">
            {locale === "zh" ? "更多系统记录" : "More system records"}
          </h2>
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#817565]">
            <Filter className="h-4 w-4" />
            <span>{locale === "zh" ? "能力筛选" : "Capability filter"}</span>
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
                    "rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                    active
                      ? "border-[#b87922] bg-[#b87922] text-white"
                      : "border-[#d9cfbf] bg-[#f7f1e7] text-[#6f6659] hover:border-[#c8b99f] hover:text-[#1f2420]",
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
        <div className="border-y border-[#d9cfbf] py-16 text-center">
          <FolderOpen className="mx-auto mb-4 h-10 w-10 text-[#988b76]" />
          <h3 className="text-lg font-semibold text-[#1f2420]">
            {locale === "zh" ? "没有匹配案例" : "No matching records"}
          </h3>
          <p className="mt-2 text-sm text-[#6f6659]">
            {locale === "zh" ? "换一个能力筛选看看。" : "Try another capability filter."}
          </p>
        </div>
      ) : (
        <div>
          <p className="mb-3 text-xs font-medium text-[#817565]">
            {filteredCases.length} {locale === "zh" ? "个匹配案例" : "matching records"}
          </p>
          <div className="divide-y divide-[#d9cfbf] border-y border-[#d9cfbf]">
            {filteredCases.map((caseItem, index) => (
              <Link
                key={caseItem.id}
                href={`/projects/${encodeURIComponent(caseItem.id)}`}
                className="group grid gap-4 py-4 transition-colors hover:bg-[#efe4d2]/45 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent md:grid-cols-[52px_minmax(0,1.2fr)_minmax(220px,0.8fr)_32px]"
              >
                <span className="font-mono text-sm text-[#817565]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-[#1f2420]">
                      {caseItem.name}
                    </h3>
                    <span className="rounded border border-[#d9cfbf] bg-[#f7f1e7] px-2 py-0.5 text-[11px] font-medium text-[#6f6659]">
                      {caseItem.caseType || caseItem.format || "Archive"}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#6f6659]">
                    {firstLine(caseItem)}
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#817565]">
                    Artifact
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#1f2420]">
                    {artifactLine(caseItem)}
                  </p>
                </div>
                <ArrowUpRight className="hidden h-5 w-5 self-center text-[#817565] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 md:block" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
