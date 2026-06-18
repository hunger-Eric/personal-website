"use client";

import { Cpu } from "lucide-react";

import type { CaseDemo as CaseDemoData, CaseItem, CustomerStory } from "@/config/cases";
import { CaseFilmStage } from "./CaseFilmStage";
import { DemoTimeline } from "./DemoTimeline";

type CaseDemoProps = {
  caseItem?: CaseItem;
  demo?: CaseDemoData;
  story?: CustomerStory;
  projectName?: string;
};

export function CaseDemo({ caseItem, demo, story, projectName }: CaseDemoProps) {
  const filmCase =
    caseItem ??
    (story && projectName
      ? ({
          id: projectName.toLowerCase().replace(/\s+/g, "-"),
          name: projectName,
          summary: story.shortPromise || story.publicScenario,
          start: "",
          end: "",
          customerStory: story,
        } satisfies CaseItem)
      : undefined);

  if (filmCase?.customerStory) {
    return (
      <section className="border-t border-[#d9cfbf] py-8">
        <CaseFilmStage
          cases={[filmCase]}
          initialCaseId={filmCase.id}
          singleCase
          className="shadow-none"
        />
      </section>
    );
  }

  if (!demo) return null;

  return (
    <section className="border-t border-[#d9cfbf] py-8">
      <div className="grid gap-5 md:grid-cols-[240px_minmax(0,1fr)]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#817565]">
            <Cpu className="h-4 w-4" />
            <span>Interactive demo</span>
          </div>
          <h2 className="mt-3 text-xl font-semibold tracking-tight text-[#1f2420]">
            系统流程演示
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#6f6659]">
            查看输入、处理、日志和输出如何一步步推进。
          </p>
        </div>
        <DemoTimeline demo={demo} />
      </div>
    </section>
  );
}
