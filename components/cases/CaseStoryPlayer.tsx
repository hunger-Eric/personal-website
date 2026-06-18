"use client";

import { useEffect } from "react";
import {
  ArrowRight,
  CheckCircle2,
  FileOutput,
  Pause,
  Play,
  RotateCcw,
  StepForward,
} from "lucide-react";

import { useLocale } from "@/components/LocaleProvider";
import {
  MotionProgress,
  useAutoplaySteps,
  usePrefersReducedMotion,
} from "@/components/motion";
import { ActionButton, IconButton, Surface } from "@/components/system";
import type { CustomerStory } from "@/config/cases";
import { getSiteCopy } from "@/config/contentCopy";

type CaseStoryPlayerProps = {
  story: CustomerStory;
  projectName?: string;
  caseHref?: string;
  compact?: boolean;
};

function archetypeLabel(archetype: string) {
  return archetype.replace(/-/g, " ");
}

export function CaseStoryPlayer({
  story,
  projectName,
  caseHref,
  compact = false,
}: CaseStoryPlayerProps) {
  const { locale } = useLocale();
  const copy = getSiteCopy(locale).cases;
  const reducedMotion = usePrefersReducedMotion();
  const steps = story.steps;
  const {
    activeIndex,
    setActiveIndex,
    playing,
    setPlaying,
    progress,
    next: goNext,
    replay,
  } = useAutoplaySteps({
    length: steps.length,
    intervalMs: compact ? 3600 : 4200,
    reducedMotion,
  });
  const activeStep = steps[activeIndex] ?? steps[0];

  useEffect(() => {
    if (activeIndex >= steps.length) setActiveIndex(0);
  }, [activeIndex, setActiveIndex, steps.length]);

  if (!activeStep) return null;

  return (
    <Surface className="overflow-hidden p-0">
      <div className="border-b border-border p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {projectName ? <span>{projectName}</span> : null}
              {projectName ? <span className="text-border">/</span> : null}
              <span>{archetypeLabel(story.archetype)}</span>
            </div>
            <h3 className="mt-2 max-w-3xl text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              {story.headline}
            </h3>
            {!compact && (
              <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
                {story.publicScenario}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <IconButton
              onClick={() => setPlaying((value) => !value)}
              icon={
                playing ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )
              }
              label={playing ? copy.pauseStory : copy.playStory}
              className="h-9 w-9 bg-background text-muted-foreground hover:text-foreground"
            />
            <IconButton
              onClick={goNext}
              icon={<StepForward className="h-4 w-4" />}
              label={copy.nextStoryStep}
              className="h-9 w-9 bg-background text-muted-foreground hover:text-foreground"
            />
            <IconButton
              onClick={replay}
              icon={<RotateCcw className="h-4 w-4" />}
              label={copy.replayStory}
              className="h-9 w-9 bg-background text-muted-foreground hover:text-foreground"
            />
          </div>
        </div>

        <MotionProgress value={progress} className="mt-5" />
      </div>

      <div className="grid lg:grid-cols-[260px_minmax(0,1fr)]">
        <div className="border-b border-border p-3 lg:border-b-0 lg:border-r">
          <div className="grid gap-2">
            {steps.map((step, index) => {
              const active = index === activeIndex;
              const complete = index < activeIndex;
              return (
                <button
                  key={step.title}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={[
                    "grid grid-cols-[28px_minmax(0,1fr)] gap-3 rounded-control px-2.5 py-2 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                    active
                      ? "bg-accent/15 text-foreground"
                      : "text-muted-foreground hover:bg-muted/30 hover:text-foreground",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-semibold",
                      active
                        ? "border-accent bg-accent text-accent-foreground"
                        : complete
                          ? "border-accent/60 text-accent"
                          : "border-border",
                    ].join(" ")}
                  >
                    {complete ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">
                      {step.title}
                    </span>
                    {step.metric ? (
                      <span className="mt-0.5 block truncate font-mono text-[11px] uppercase tracking-[0.12em] opacity-70">
                        {step.metric}
                      </span>
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 rounded-card border border-border bg-background/70 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {copy.storyExampleInput}
            </p>
            <p className="mt-2 text-sm leading-6 text-foreground">
              {story.exampleInput}
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_32px_minmax(0,1fr)] xl:items-stretch">
            <div className="rounded-card border border-border bg-background/70 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {copy.storyCustomerAction}
              </p>
              <p className="mt-2 text-sm font-medium leading-6 text-foreground">
                {activeStep.customerAction}
              </p>
            </div>
            <div className="hidden items-center justify-center text-muted-foreground xl:flex">
              <ArrowRight className="h-4 w-4" />
            </div>
            <div className="rounded-card border border-border bg-background/70 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {copy.storySystemAction}
              </p>
              <p className="mt-2 text-sm font-medium leading-6 text-foreground">
                {activeStep.systemAction}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.8fr)]">
            <div className="rounded-card border border-border bg-background/70 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {copy.storyVisibleOutput}
              </p>
              <p className="mt-2 text-sm leading-7 text-foreground">
                {activeStep.visibleOutput}
              </p>
              {activeStep.proof ? (
                <div className="mt-3 rounded-card border border-accent/35 bg-accent/10 px-3 py-2 text-xs leading-5 text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {copy.storyProofPrefix}
                  </span>
                  {activeStep.proof}
                </div>
              ) : null}
            </div>

            <div className="rounded-card border border-inverse bg-surface-graphite p-4 text-surface-graphite-foreground">
              <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                <FileOutput className="h-4 w-4" />
                <span>{story.artifactLabel}</span>
              </div>
              <p className="font-mono text-xs leading-6 text-surface-graphite-foreground">
                {activeStep.artifactPreview}
              </p>
              {activeStep.metric ? (
                <div className="mt-4 inline-flex rounded-control border border-inverse bg-white/10 px-2.5 py-1 font-mono text-[11px] text-slate-200">
                  {activeStep.metric}
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {copy.transferableValue}
              </p>
              <p className="mt-1 text-sm leading-6 text-foreground">
                {story.transferableValue}
              </p>
            </div>
            {caseHref ? (
              <ActionButton
                href={caseHref}
                tone="secondary"
                icon={<ArrowRight className="h-4 w-4" />}
              >
                {copy.fullCase}
              </ActionButton>
            ) : null}
          </div>
        </div>
      </div>
    </Surface>
  );
}
