"use client";

import { useLocale } from "@/components/LocaleProvider";
import { getSiteCopy } from "@/config/contentCopy";
import type { CaseItem } from "../../config/cases";
import { CasesBrowser } from "./CasesBrowser";

type Props = {
  cases: CaseItem[];
};

export function CasesPageClient({ cases }: Props) {
  const { locale } = useLocale();
  const copy = getSiteCopy(locale);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <header className="mb-14 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
          {copy.cases.heading}
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          {locale === "zh"
            ? "我会把自己做过的工作、实验和持续维护的案例放在这里。"
            : "A compact index of the work, experiments, and cases I keep maintaining."}
        </p>
      </header>

      <CasesBrowser cases={cases} />
    </div>
  );
}
