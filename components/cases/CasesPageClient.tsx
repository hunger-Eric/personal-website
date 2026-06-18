"use client";

import { useLocale } from "@/components/LocaleProvider";
import type { CaseItem } from "../../config/cases";
import { ProjectsFilmLayout } from "./ProjectsFilmLayout";

type Props = {
  casesZh: CaseItem[];
  casesEn: CaseItem[];
};

export function CasesPageClient({ casesZh, casesEn }: Props) {
  const { locale } = useLocale();
  const cases = locale === "en" ? casesEn : casesZh;

  return <ProjectsFilmLayout cases={cases} />;
}
