"use client";

import Link from "next/link";
import { ArrowUpRight, BookOpen, Database, MousePointer2 } from "lucide-react";

import type { CaseItem } from "@/config/cases";

type CaseChapterRailProps = {
  cases: CaseItem[];
  activeCaseId: string;
  onSelect: (caseId: string) => void;
  singleCase?: boolean;
};

function chapterIcon(archetype?: string) {
  if (archetype === "lead-discovery") return Database;
  if (archetype === "ui-asset-runtime") return MousePointer2;
  return BookOpen;
}

export function CaseChapterRail({
  cases,
  activeCaseId,
  onSelect,
  singleCase = false,
}: CaseChapterRailProps) {
  if (!cases.length) return null;

  return (
    <nav aria-label="Project demo chapters" className="space-y-1.5">
      {cases.map((caseItem, index) => {
        const story = caseItem.customerStory;
        const active = caseItem.id === activeCaseId;
        const Icon = chapterIcon(story?.archetype);
        const href = `/projects/${encodeURIComponent(caseItem.id)}`;
        const label = story?.chapterTitle || caseItem.name;

        return (
          <div
            key={caseItem.id}
            className={[
              "group rounded-md border transition-colors",
              active
                ? "border-[#c48a2c]/70 bg-[#c48a2c]/12"
                : "border-white/10 bg-transparent hover:border-white/20 hover:bg-white/[0.045]",
            ].join(" ")}
          >
            <button
              type="button"
              onClick={() => onSelect(caseItem.id)}
              aria-current={active ? "true" : undefined}
              aria-label={label}
              className="grid w-full grid-cols-[34px_minmax(0,1fr)] gap-3 px-2.5 py-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <span
                className={[
                  "mt-0.5 flex h-7 w-7 items-center justify-center rounded border font-mono text-[11px] font-semibold",
                  active
                    ? "border-[#c48a2c]/70 bg-[#c48a2c] text-[#12100b]"
                    : "border-white/10 bg-black/20 text-[#b9ad9c]",
                ].join(" ")}
              >
                {active ? (
                  <Icon className="h-4 w-4" />
                ) : (
                  String(index + 1).padStart(2, "0")
                )}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-[#f7efdf]">
                  {label}
                </span>
                <span className="mt-0.5 block line-clamp-2 text-xs leading-5 text-[#b9ad9c]">
                  {story?.shortPromise || caseItem.summary}
                </span>
              </span>
            </button>
            {!singleCase ? (
              <Link
                href={href}
                className="mx-2.5 mb-2.5 inline-flex items-center gap-1.5 rounded border border-white/10 bg-black/20 px-2 py-1 text-[11px] font-semibold text-[#cfc4b2] transition-colors hover:border-white/20 hover:text-[#f7efdf] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                完整案例
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}
