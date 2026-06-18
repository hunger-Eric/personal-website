"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Cpu, Database, Network, SearchCode } from "lucide-react";

import type { CaseItem } from "@/config/cases";
import { CaseFilmStage } from "@/components/cases/CaseFilmStage";
import { DemoTimeline } from "@/components/cases/DemoTimeline";
import { useLocale } from "@/components/LocaleProvider";

type SystemDemoConsoleProps = {
  cases: CaseItem[];
};

function iconForCase(caseItem: CaseItem) {
  const archetype = caseItem.customerStory?.archetype;
  const demoType = caseItem.demo?.type;
  if (archetype === "knowledge-system" || demoType === "knowledge-flow") return Database;
  if (archetype === "lead-discovery" || demoType === "lead-flow") return Network;
  if (archetype === "ui-asset-runtime" || demoType === "asset-flow") return SearchCode;
  return Cpu;
}

export function SystemDemoConsole({ cases }: SystemDemoConsoleProps) {
  const { locale } = useLocale();
  const storyCases = useMemo(
    () => cases.filter((caseItem) => caseItem.customerStory).slice(0, 3),
    [cases]
  );
  const fallbackDemoCases = useMemo(
    () => cases.filter((caseItem) => caseItem.demo).slice(0, 3),
    [cases]
  );
  const [activeId, setActiveId] = useState(fallbackDemoCases[0]?.id ?? "");
  const activeFallbackCase =
    fallbackDemoCases.find((caseItem) => caseItem.id === activeId) ?? fallbackDemoCases[0];

  if (!storyCases.length && !activeFallbackCase?.demo) return null;

  return (
    <section id="system-demo" className="scroll-mt-12 bg-[#f7f1e7] py-16 text-[#1f2420] lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="border-y border-[#d9cfbf] py-5">
          <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-end">
            <div>
              <h2 className="flex items-center gap-2 font-mono text-[13px] font-semibold uppercase tracking-[0.18em] text-[#817565] sm:text-lg">
                <Cpu className="h-4 w-4" />
                <span>{locale === "zh" ? "~/系统演示" : "~/System Demo"}</span>
              </h2>
              <p className="mt-4 text-sm leading-6 text-[#6f6659]">
                {locale === "zh"
                  ? "从真实项目抽象出三种可迁移能力：资料变知识、公开信息变线索、界面操作变资产。"
                  : "Three transferable systems from real work: knowledge, lead discovery, and UI action assets."}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 lg:justify-end">
              {(storyCases.length ? storyCases : fallbackDemoCases).map((caseItem) => {
                const Icon = iconForCase(caseItem);
                return (
                  <Link
                    key={caseItem.id}
                    href={`/projects/${encodeURIComponent(caseItem.id)}`}
                    onMouseEnter={() => setActiveId(caseItem.id)}
                    onFocus={() => setActiveId(caseItem.id)}
                    className="group inline-flex items-center gap-2 rounded-md border border-[#d9cfbf] bg-[#fffaf1] px-3 py-2 text-sm font-semibold text-[#1f2420] transition-colors hover:bg-[#efe4d2] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <Icon className="h-4 w-4 text-[#b87922]" />
                    <span>{caseItem.name}</span>
                    <ArrowUpRight className="h-4 w-4 text-[#817565] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="mt-6">
            {storyCases.length ? (
              <CaseFilmStage cases={storyCases} />
            ) : activeFallbackCase?.demo ? (
              <div className="rounded-lg border border-[#d9cfbf] bg-[#fffaf1] p-4">
                <DemoTimeline demo={activeFallbackCase.demo} compact />
                <div className="mt-4 grid grid-cols-3 gap-1 rounded-md border border-[#d9cfbf] bg-[#f7f1e7] p-2">
                  {fallbackDemoCases.map((caseItem, index) => {
                    const active = caseItem.id === activeFallbackCase.id;
                    return (
                      <button
                        key={`${caseItem.id}-preview`}
                        type="button"
                        onClick={() => setActiveId(caseItem.id)}
                        className={[
                          "inline-flex h-9 items-center justify-center rounded px-2 font-mono text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                          active
                            ? "bg-[#b87922] text-white"
                            : "text-[#6f6659] hover:bg-[#efe4d2] hover:text-[#1f2420]",
                        ].join(" ")}
                        aria-label={`Preview ${caseItem.name} demo`}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
