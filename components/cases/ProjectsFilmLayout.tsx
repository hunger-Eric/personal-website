"use client";

import { ArrowDown, FolderOpen } from "lucide-react";

import { useLocale } from "@/components/LocaleProvider";
import { ActionButton, EmptyState, PageShell } from "@/components/system";
import type { CaseItem } from "@/config/cases";
import { getSiteCopy } from "@/config/contentCopy";
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
  const { locale } = useLocale();
  const copy = getSiteCopy(locale).cases;
  const filmCases = getFilmCases(cases);

  if (!cases.length) {
    return (
      <PageShell tone="public">
        <div className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <EmptyState
            icon={<FolderOpen className="h-12 w-12" />}
            title={copy.emptyTitle}
            description={copy.emptyDescription}
          />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell tone="public">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <section className="border-y border-hairline py-6 sm:py-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,0.85fr)] lg:items-end">
            <div>
              <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {copy.projectFilmEyebrow}
              </p>
              <h1 className="max-w-3xl text-4xl font-semibold leading-[0.95] tracking-tight text-surface-paper-foreground sm:text-6xl">
                {copy.projectFilmTitle}
              </h1>
            </div>
            <div className="lg:justify-self-end">
              <p className="max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
                {copy.projectFilmDescription}
              </p>
              <ActionButton
                href="#project-archive"
                tone="secondary"
                icon={<ArrowDown className="h-4 w-4" />}
                className="mt-4"
              >
                {copy.viewCaseIndex}
              </ActionButton>
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
    </PageShell>
  );
}
