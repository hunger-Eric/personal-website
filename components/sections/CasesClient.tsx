"use client";

import Link from "next/link";
import { useMemo, type ReactNode } from "react";
import { ArrowRight, FolderOpen, ChevronRight } from "lucide-react";
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
import {
  formatCaseDisplayMode,
  getCaseDisplaySettings,
  resolveCaseDisplayMode,
} from "@/config/caseDisplay";
import type { ProjectItem } from "../../config/projects";
import { CaseCard } from "../cases/CaseCard";

interface CasesSectionClientProps {
  projects: ProjectItem[];
}

function projectFormatLabel(project: ProjectItem, locale: "zh" | "en") {
  if (project.format) return project.format;
  if (project.badges?.length) return project.badges[0];
  return locale === "zh" ? "案例" : "Case";
}

function CompactCaseCard({
  project,
  locale,
}: {
  project: ProjectItem;
  locale: "zh" | "en";
}) {
  const href = `/projects/${encodeURIComponent(project.id)}`;

  return (
    <Link
      href={href}
      className="group flex h-full flex-col justify-between rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-sm"
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-foreground">
              {project.name}
            </h3>
            <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
              {project.description?.[0] ?? project.summary}
            </p>
          </div>
          <span className="inline-flex flex-none items-center rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            {projectFormatLabel(project, locale)}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {project.technologies?.slice(0, 3).map((tech) => (
            <span
              key={`${project.id}-${tech}`}
              className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {project.links?.length
            ? `${project.links.length} ${locale === "zh" ? "个入口" : "links"}`
            : locale === "zh"
              ? "单一案例"
              : "Single case"}
        </span>
        <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

function CaseIndexPanel({
  projects,
  locale,
}: {
  projects: ProjectItem[];
  locale: "zh" | "en";
}) {
  const display = getCaseDisplaySettings();
  const resolvedMode = resolveCaseDisplayMode(projects.length);

  return (
    <div className="rounded-3xl border border-border bg-card/70 p-5 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.18)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {locale === "zh" ? "案例索引" : "Case index"}
          </p>
          <p className="mt-2 text-sm leading-6 text-foreground/80">
            {locale === "zh"
              ? "当案例变多时，这里会自然切成索引视图，方便快速扫过全部内容。"
              : "This panel naturally turns into an index view as more cases are added, making it easy to scan everything."}
          </p>
        </div>
        <span className="rounded-full border border-border bg-background px-3 py-1 text-[11px] font-medium text-muted-foreground">
          {formatCaseDisplayMode(display.mode, locale)}
        </span>
      </div>

      <div className="mt-4 grid gap-3">
        {projects.map((project, index) => (
          <Link
            key={project.id}
            href={`/projects/${encodeURIComponent(project.id)}`}
            className="group flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-sm"
          >
            <span className="flex h-8 w-8 flex-none items-center justify-center rounded-lg border border-border bg-muted/60 text-xs font-semibold text-muted-foreground">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="truncate text-sm font-semibold text-foreground">
                  {project.name}
                </h4>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {projectFormatLabel(project, locale)}
                </span>
              </div>
              <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                {project.description?.[0] ?? project.summary}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 flex-none text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="rounded-full bg-muted px-2.5 py-1 font-medium">
          {projects.length} {locale === "zh" ? "个案例" : "cases"}
        </span>
        {resolvedMode === "catalog" ? (
          <span className="rounded-full bg-muted px-2.5 py-1 font-medium">
            {locale === "zh" ? "索引展示" : "Catalog view"}
          </span>
        ) : (
          <span className="rounded-full bg-muted px-2.5 py-1 font-medium">
            {locale === "zh" ? "精选展示" : "Featured view"}
          </span>
        )}
      </div>
    </div>
  );
}

export function CasesSectionClient({ projects }: CasesSectionClientProps) {
  const { locale } = useLocale();
  const copy = getSiteCopy(locale);
  const display = getCaseDisplaySettings();
  const mode = resolveCaseDisplayMode(projects.length);

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

  const featuredProject = useMemo(
    () => projects.find((project) => project.featured) || projects[0] || null,
    [projects]
  );

  const previewProjects = useMemo(() => {
    if (!projects.length) return [];
    return projects.slice(0, Math.max(1, display.previewLimit));
  }, [projects, display.previewLimit]);

  if (!projects.length || !featuredProject) {
    return null;
  }

  return (
    <section id="projects" className="scroll-mt-12 py-16 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="flex items-center gap-4">
          <h2 className="flex items-center gap-2 font-mono text-[13px] font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:text-lg">
            <FolderOpen className="h-4 w-4" />
            <span>{copy.projects.heading}</span>
          </h2>
          <div className="hidden h-px w-40 bg-border sm:block sm:w-72" aria-hidden />
          <div className="flex-1" />
          <a
            href="/projects"
            className="group inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-muted active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            <span>{copy.projects.viewAll}</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </a>
        </div>

        {mode === "featured" ? (
          <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <CaseCard project={featuredProject} iconFor={iconFor} featured />
            <CaseIndexPanel projects={previewProjects} locale={locale} />
          </div>
        ) : (
          <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
            <div className="rounded-3xl border border-border bg-card/70 p-5 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.18)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {locale === "zh" ? "索引视图" : "Index view"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-foreground/80">
                    {locale === "zh"
                      ? "案例一多，这里就会优先按索引方式展示，减少大封面堆叠。"
                      : "When the number of cases grows, this section shifts into an index-first view so large covers do not overwhelm the page."}
                  </p>
                </div>
                <span className="rounded-full border border-border bg-background px-3 py-1 text-[11px] font-medium text-muted-foreground">
                  {locale === "zh" ? "自动适配" : "Auto"}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div className="rounded-2xl border border-border bg-background px-3 py-3">
                  <div className="text-[11px] uppercase tracking-[0.14em]">
                    {locale === "zh" ? "阈值" : "Threshold"}
                  </div>
                  <div className="mt-1 text-base font-semibold text-foreground">
                    {display.autoCatalogThreshold}
                  </div>
                </div>
                <div className="rounded-2xl border border-border bg-background px-3 py-3">
                  <div className="text-[11px] uppercase tracking-[0.14em]">
                    {locale === "zh" ? "当前数量" : "Now"}
                  </div>
                  <div className="mt-1 text-base font-semibold text-foreground">
                    {projects.length}
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {previewProjects.map((project, index) => (
                  <Link
                    key={project.id}
                    href={`/projects/${encodeURIComponent(project.id)}`}
                    className="group flex items-start gap-3 rounded-2xl border border-border bg-background px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-sm"
                  >
                    <span className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-lg border border-border bg-muted/60 text-xs font-semibold text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="truncate text-sm font-semibold text-foreground">
                          {project.name}
                        </h4>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                          {projectFormatLabel(project, locale)}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                        {project.description?.[0] ?? project.summary}
                      </p>
                    </div>
                    <ChevronRight className="mt-1 h-4 w-4 flex-none text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>

              <Link
                href="/projects"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-accent/40 bg-accent/10 px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-accent hover:bg-accent/15"
              >
                {copy.projects.viewAll}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {previewProjects.map((project) => (
                <CompactCaseCard key={project.id} project={project} locale={locale} />
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-muted px-2.5 py-1 font-medium">
            {mode === "featured"
              ? locale === "zh"
                ? "精选展示"
                : "Featured view"
              : locale === "zh"
                ? "索引展示"
                : "Catalog view"}
          </span>
          <span className="rounded-full bg-muted px-2.5 py-1 font-medium">
            {projects.length} {locale === "zh" ? "个案例" : "cases"}
          </span>
        </div>
      </div>
    </section>
  );
}
