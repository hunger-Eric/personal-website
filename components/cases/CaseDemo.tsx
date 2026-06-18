"use client";

import { Cpu } from "lucide-react";

import { useLocale } from "@/components/LocaleProvider";
import type { CaseDemo as CaseDemoData, CaseItem, CustomerStory } from "@/config/cases";
import { getSiteCopy } from "@/config/contentCopy";
import { CaseFilmStage } from "./CaseFilmStage";
import { DemoTimeline } from "./DemoTimeline";

type CaseDemoProps = {
  caseItem?: CaseItem;
  demo?: CaseDemoData;
  story?: CustomerStory;
  projectName?: string;
};

export function CaseDemo({ caseItem, demo, story, projectName }: CaseDemoProps) {
  const { locale } = useLocale();
  const copy = getSiteCopy(locale).cases;
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
      <section className="border-t border-hairline py-8">
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
    <section className="border-t border-hairline py-8">
      <div className="grid gap-5 md:grid-cols-[240px_minmax(0,1fr)]">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <Cpu className="h-4 w-4" aria-hidden />
            <span>Interactive demo</span>
          </div>
          <h2 className="mt-3 text-xl font-semibold tracking-tight text-foreground">
            {copy.demoTitle}
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {copy.demoDescription}
          </p>
        </div>
        <DemoTimeline demo={demo} />
      </div>
    </section>
  );
}
