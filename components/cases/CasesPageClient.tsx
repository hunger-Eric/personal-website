"use client";

import { useLocale } from "@/components/LocaleProvider";
import { getSiteCopy } from "@/config/contentCopy";
import type { ProjectItem } from "../../config/projects";
import { CasesBrowser } from "./CasesBrowser";

type Props = {
  projects: ProjectItem[];
};

export function CasesPageClient({ projects }: Props) {
  const { locale } = useLocale();
  const copy = getSiteCopy(locale);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <header className="mb-14 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
          {copy.projects.heading}
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          {locale === "zh"
            ? "我会把自己的工作、实验和持续维护的项目放在这里。"
            : "A compact index of the work, experiments, and projects I keep maintaining."}
        </p>
      </header>

      <CasesBrowser projects={projects} />
    </div>
  );
}
