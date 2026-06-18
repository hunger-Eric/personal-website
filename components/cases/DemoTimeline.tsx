"use client";

import { useEffect } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Pause,
  Play,
  RotateCcw,
  StepForward,
  TerminalSquare,
} from "lucide-react";

import type { CaseDemo } from "@/config/cases";
import { MotionProgress, useAutoplaySteps, usePrefersReducedMotion } from "@/components/motion";
import { IconButton, Surface } from "@/components/system";
import { getSiteCopy } from "@/config/contentCopy";

type DemoTimelineProps = {
  demo: CaseDemo;
  compact?: boolean;
};

function statusLabel(status: string) {
  return status.replace(/-/g, " ");
}

export function DemoTimeline({ demo, compact = false }: DemoTimelineProps) {
  const copy = getSiteCopy("zh").cases;
  const reducedMotion = usePrefersReducedMotion();
  const steps = demo.steps;
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
    intervalMs: compact ? 2200 : 2800,
    reducedMotion,
  });
  const activeStep = steps[activeIndex] ?? steps[0];

  useEffect(() => {
    if (activeIndex >= steps.length) setActiveIndex(0);
  }, [activeIndex, setActiveIndex, steps.length]);

  if (!activeStep) return null;

  return (
    <Surface className="overflow-hidden" tone="paper">
      <div className="border-b border-border p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {demo.type}
            </p>
            <h3 className="mt-2 text-lg font-semibold tracking-tight text-foreground sm:text-xl">
              {demo.title}
            </h3>
            {!compact && (
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                {demo.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <IconButton
              onClick={() => setPlaying((value) => !value)}
              className="h-9 w-9 bg-surface-paper-elevated text-muted-foreground hover:text-foreground"
              icon={playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              label={playing ? copy.pauseDemo : copy.playDemo}
            />
            <IconButton
              onClick={goNext}
              className="h-9 w-9 bg-surface-paper-elevated text-muted-foreground hover:text-foreground"
              icon={<StepForward className="h-4 w-4" />}
              label={copy.nextDemoStep}
            />
            <IconButton
              onClick={replay}
              className="h-9 w-9 bg-surface-paper-elevated text-muted-foreground hover:text-foreground"
              icon={<RotateCcw className="h-4 w-4" />}
              label={copy.replayDemo}
            />
          </div>
        </div>

        <MotionProgress value={progress} className="mt-5 bg-muted/20" />
      </div>

      <div className="grid gap-0 lg:grid-cols-[260px_minmax(0,1fr)]">
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
                    "grid grid-cols-[28px_minmax(0,1fr)] gap-3 rounded-control px-2.5 py-2 text-left transition-colors",
                    active
                      ? "bg-accent/15 text-foreground"
                      : "text-muted-foreground hover:bg-muted/30 hover:text-foreground",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-semibold",
                      active
                        ? "border-accent bg-accent text-white"
                        : complete
                          ? "border-accent/60 text-accent"
                          : "border-border",
                    ].join(" ")}
                  >
                    {complete ? <CheckCircle2 className="h-3.5 w-3.5" /> : index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{step.title}</span>
                    <span className="mt-0.5 block truncate font-mono text-[11px] uppercase tracking-[0.12em] opacity-70">
                      {statusLabel(step.status)}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <TerminalSquare className="h-4 w-4" />
            <span>{statusLabel(activeStep.status)}</span>
          </div>

            <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_32px_minmax(0,1fr)] md:items-stretch">
            <div className="rounded-control border border-border bg-surface-paper-elevated p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {copy.demoInputLabel}
              </p>
              <p className="mt-2 text-sm font-medium leading-6 text-foreground">
                {activeStep.input}
              </p>
            </div>
            <div className="hidden items-center justify-center text-muted-foreground md:flex">
              <ArrowRight className="h-4 w-4" />
            </div>
            <div className="rounded-control border border-border bg-surface-paper-elevated p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {copy.demoOutputLabel}
              </p>
              <p className="mt-2 text-sm font-medium leading-6 text-foreground">
                {activeStep.output}
              </p>
            </div>
          </div>

          {activeStep.metric && (
            <div className="mt-3 inline-flex rounded-control border border-border bg-surface-paper-elevated px-3 py-1.5 font-mono text-xs font-semibold text-accent">
              {activeStep.metric}
            </div>
          )}

          {activeStep.logs?.length ? (
            <div className="mt-4 overflow-hidden rounded-control border border-inverse bg-surface-graphite text-surface-graphite-foreground">
              <div className="border-b border-inverse px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-surface-graphite-foreground/60">
                {copy.demoLiveTrace}
              </div>
              <div className="space-y-1.5 p-3 font-mono text-xs leading-5">
                {activeStep.logs.map((log, index) => (
                  <p
                      key={`${activeStep.title}-${log}`}
                      className={[
                        "transition-opacity duration-300 motion-reduce:transition-none",
                      index === activeStep.logs!.length - 1
                        ? "text-accent"
                        : "text-surface-graphite-foreground/80",
                      ].join(" ")}
                    >
                    <span className="text-surface-graphite-foreground/45">
                      {String(index + 1).padStart(2, "0")}
                    </span>{" "}
                    {log}
                  </p>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {copy.demoResultLabel}
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">{demo.result.label}</p>
            </div>
            <span className="text-sm font-semibold text-muted-foreground">
              {demo.result.cta}
            </span>
          </div>
        </div>
      </div>
    </Surface>
  );
}
