"use client";

import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Cpu, FileOutput, Route } from "lucide-react";

import { useLocale } from "@/components/LocaleProvider";
import { ActionButton } from "@/components/system";
import { getSiteCopy } from "@/config/contentCopy";
import type { CaseItem } from "../../config/cases";

type FlagshipCaseCardProps = {
  caseItem: CaseItem;
  prominent?: boolean;
  active?: boolean;
  onOpenStory?: (caseId: string) => void;
};

function firstLine(caseItem: CaseItem) {
  return caseItem.problem?.[0] || caseItem.description?.[0] || caseItem.summary;
}

function storyLabel(caseItem: CaseItem) {
  return (
    caseItem.customerStory?.archetype.replace(/-/g, " ") ||
    caseItem.caseType ||
    "system"
  );
}

export function FlagshipCaseCard({
  caseItem,
  prominent = false,
  active = false,
  onOpenStory,
}: FlagshipCaseCardProps) {
  const { locale } = useLocale();
  const copy = getSiteCopy(locale).cases;
  const href = `/projects/${encodeURIComponent(caseItem.id)}`;
  const story = caseItem.customerStory;
  const proofPoints = story?.proofPoints.slice(0, prominent ? 3 : 2) ?? [];
  const fallbackWorkflow = (caseItem.workflows ?? []).slice(
    0,
    prominent ? 4 : 3
  );

  return (
    <article
      className={[
        "group flex min-w-0 flex-col overflow-hidden rounded-card border bg-surface-paper-elevated p-4 shadow-card transition-colors sm:p-5",
        active
          ? "border-accent bg-accent/10"
          : "border-border hover:border-accent/70 hover:bg-muted",
        prominent ? "lg:min-h-[430px]" : "",
      ].join(" ")}
    >
      <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        <Cpu className="h-3.5 w-3.5" />
        <span>{storyLabel(caseItem)}</span>
        <span className="text-border">/</span>
        <span>{copy.capabilityDemo}</span>
      </div>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2
            className={[
              "font-semibold tracking-tight text-foreground",
              prominent ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl",
            ].join(" ")}
          >
            {story?.headline || caseItem.name}
          </h2>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {caseItem.name}
          </p>
        </div>
        <span className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-control border border-border bg-background text-muted-foreground transition-colors group-hover:text-foreground">
          <Route className="h-4 w-4" />
        </span>
      </div>

      <p
        className={[
          "mt-4 text-sm leading-7 text-muted-foreground",
          prominent ? "line-clamp-4" : "line-clamp-3",
        ].join(" ")}
      >
        {story?.publicScenario || firstLine(caseItem)}
      </p>

      <div className="mt-5 grid gap-3">
        <div className="rounded-card border border-border bg-background/70 p-3">
          <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            <FileOutput className="h-3.5 w-3.5" />
            <span>{copy.reusableArtifact}</span>
          </div>
          <p className="text-sm font-semibold leading-6 text-foreground">
            {story?.artifactLabel || caseItem.demo?.result.label || caseItem.format}
          </p>
          {story?.transferableValue ? (
            <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
              {story.transferableValue}
            </p>
          ) : null}
        </div>

        {proofPoints.length ? (
          <div className="grid gap-2">
            {proofPoints.map((point) => (
              <div
                key={point}
                className="flex items-start gap-2 text-xs leading-5 text-muted-foreground"
              >
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-none text-accent" />
                <span>{point}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {fallbackWorkflow.map((item) => (
              <span
                key={item}
                className="rounded-control border border-border bg-background px-2 py-1 text-[11px] font-medium text-muted-foreground"
              >
                {item}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5">
        {story && onOpenStory ? (
          <ActionButton
            href="#case-story-demo"
            tone="primary"
            onClick={(event) => {
              event.preventDefault();
              onOpenStory(caseItem.id);
              window.requestAnimationFrame(() => {
                document
                  .getElementById("case-story-demo")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              });
            }}
            aria-label={`${copy.tryFlowLabelPrefix}: ${caseItem.name}`}
            icon={<ArrowUpRight className="h-4 w-4" />}
          >
            {copy.tryFlow}
          </ActionButton>
        ) : null}
        <Link
          href={href}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground transition-colors hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {copy.fullCase}
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
