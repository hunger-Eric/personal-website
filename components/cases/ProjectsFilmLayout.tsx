"use client";

import { ArrowDown, FolderOpen } from "lucide-react";

import type { CaseItem } from "@/config/cases";
import { CasesBrowser } from "./CasesBrowser";
import { CaseFilmStage } from "./CaseFilmStage";

type ProjectsFilmLayoutProps = {
  cases: CaseItem[];
};

const FILM_CASE_IDS = ["hermes-notebook", "freight-lead-agent", "element-asset-sdk"];

function getFilmCases(cases: CaseItem[]) {
  const ordered = FILM_CASE_IDS.map((id) => cases.find((caseItem) => caseItem.id === id))
    .filter(Boolean) as CaseItem[];
  const extras = cases.filter(
    (caseItem) => caseItem.customerStory && !FILM_CASE_IDS.includes(caseItem.id)
  );
  return [...ordered, ...extras];
}

export function ProjectsFilmLayout({ cases }: ProjectsFilmLayoutProps) {
  const filmCases = getFilmCases(cases);

  if (!cases.length) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8">
        <FolderOpen className="mb-4 h-12 w-12 text-[#988b76]" />
        <h1 className="text-2xl font-semibold tracking-tight text-[#1f2420]">
          暂无案例记录
        </h1>
        <p className="mt-2 text-sm text-[#6f6659]">案例档案还在整理中。</p>
      </div>
    );
  }

  return (
    <div className="bg-[#f7f1e7] text-[#1f2420]">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <section className="border-y border-[#d9cfbf] py-6 sm:py-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,0.85fr)] lg:items-end">
            <div>
              <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#817565]">
                AI Native Lab / Project Film
              </p>
              <h1 className="max-w-3xl text-4xl font-semibold leading-[0.95] tracking-tight text-[#1f2420] sm:text-6xl">
                看一个系统如何从输入走到交付
              </h1>
            </div>
            <div className="lg:justify-self-end">
              <p className="max-w-xl text-sm leading-7 text-[#6f6659] sm:text-base">
                资料、公开信息、界面元素，是很多业务都会遇到的起点。这里把它们放进同一套可观察的系统流程：输入、判断、证据和交付物一起推进。
              </p>
              <a
                href="#project-archive"
                className="mt-4 inline-flex items-center gap-2 rounded-md border border-[#d9cfbf] bg-[#fffaf1] px-3.5 py-2 text-sm font-semibold text-[#1f2420] transition-colors hover:bg-[#efe4d2] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                查看案例索引
                <ArrowDown className="h-4 w-4" />
              </a>
            </div>
          </div>

          {filmCases.length ? (
            <div className="mt-7">
              <CaseFilmStage cases={filmCases} />
            </div>
          ) : null}
        </section>

        <section id="project-archive" className="scroll-mt-24 py-10 sm:py-12">
          <CasesBrowser cases={cases} />
        </section>
      </div>
    </div>
  );
}
