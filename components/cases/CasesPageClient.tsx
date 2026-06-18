"use client";

import { useLocale } from "@/components/LocaleProvider";
import { selectLocalized } from "@/config/locale-utils";
import type { CaseItem } from "../../config/cases";
import { ProjectsFilmLayout } from "./ProjectsFilmLayout";

type Props = {
  casesZh: CaseItem[];
  casesEn: CaseItem[];
};

export function CasesPageClient({ casesZh, casesEn }: Props) {
  const { locale } = useLocale();
  const cases = selectLocalized(locale, { zh: casesZh, en: casesEn });

  return <ProjectsFilmLayout cases={cases} />;
}
