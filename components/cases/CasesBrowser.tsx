"use client";

import { useMemo, type ReactNode } from "react";
import { FolderOpen } from "lucide-react";
import {
  FilledGithub,
  FilledGlobe,
  FilledFileText,
  FilledDownload,
  FilledPlay,
  FilledArrowUpRight,
} from "@/components/FilledIcons";
import { useLocale } from "@/components/LocaleProvider";
import { getSiteCopy } from "@/config/contentCopy";
import type { ProjectItem } from "../../config/projects";
import { CaseCard } from "./CaseCard";

type Props = {
  projects: ProjectItem[];
};

export function CasesBrowser({ projects }: Props) {
  const { locale } = useLocale();
  const copy = getSiteCopy(locale);

  const iconFor = (type?: string): ReactNode => {
    switch (type) {
      case "github":
        return <FilledGithub className="h-4 w-4" />;
      case "live":
        return <FilledGlobe className="h-4 w-4" />;
      case "docs":
        return <FilledFileText className="h-4 w-4" />;
      case "download":
        return <FilledDownload className="h-4 w-4" />;
      case "video":
        return <FilledPlay className="h-4 w-4" />;
      default:
        return <FilledArrowUpRight className="h-4 w-4" />;
    }
  };

  const groups = useMemo(() => {
    const featured = projects.find((project) => project.featured) || projects[0] || null;
    const rest = featured
      ? projects.filter((project) => project.id !== featured.id)
      : projects.slice(1);
    return { featured, rest };
  }, [projects]);

  if (!projects.length || !groups.featured) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <FolderOpen className="mb-4 h-12 w-12 text-muted-foreground/50" />
        <h3 className="mb-1 text-lg font-semibold">{copy.projects.emptyTitle}</h3>
        <p className="text-sm text-muted-foreground">{copy.projects.emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold sm:text-2xl">{copy.projects.featuredBadge}</h2>
          <span className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            1
          </span>
        </div>

        <div className="grid gap-4">
          <CaseCard project={groups.featured} iconFor={iconFor} featured />
        </div>
      </section>

      {groups.rest.length ? (
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold sm:text-2xl">
              {locale === "zh" ? "更多案例" : "More cases"}
            </h2>
            <span className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              {groups.rest.length}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {groups.rest.map((project) => (
              <CaseCard key={project.id} project={project} iconFor={iconFor} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
