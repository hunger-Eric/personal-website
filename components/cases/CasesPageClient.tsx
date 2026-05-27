"use client";

import { useLocale } from "@/components/LocaleProvider";
import { getSiteCopy } from "@/config/contentCopy";
import type { CaseItem } from "../../config/cases";
import { CasesBrowser } from "./CasesBrowser";

type Props = {
  casesZh: CaseItem[];
  casesEn: CaseItem[];
};

export function CasesPageClient({ casesZh, casesEn }: Props) {
  const { locale } = useLocale();
  const copy = getSiteCopy(locale);
  const cases = locale === "en" ? casesEn : casesZh;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <header className="mb-14 border-y border-border py-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {locale === "zh" ? "Casebook / System Archive" : "Casebook / System Archive"}
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
          {copy.cases.heading}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
          {locale === "zh"
            ? "这里记录我做过和持续维护的 AI Native 系统实验：问题、workflow、AI 协作、自动化、架构和结果。"
            : "A compact archive of AI Native system experiments: problems, workflows, AI collaboration, automation, architecture, and outcomes."}
        </p>
      </header>

      <CasesBrowser cases={cases} />
    </div>
  );
}
