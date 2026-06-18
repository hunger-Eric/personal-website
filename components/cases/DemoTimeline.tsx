"use client";

import { useEffect, useMemo, useState } from "react";
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

type DemoTimelineProps = {
  demo: CaseDemo;
  compact?: boolean;
};

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!query) return;
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener?.("change", update);
    return () => query.removeEventListener?.("change", update);
  }, []);

  return reduced;
}

function statusLabel(status: string) {
  return status.replace(/-/g, " ");
}

export function DemoTimeline({ demo, compact = false }: DemoTimelineProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [playing, setPlaying] = useState(!reducedMotion);

  const steps = demo.steps;
  const activeStep = steps[activeIndex] ?? steps[0];
  const progress = useMemo(() => {
    if (!steps.length) return 0;
    return ((activeIndex + 1) / steps.length) * 100;
  }, [activeIndex, steps.length]);

  useEffect(() => {
    if (!playing || reducedMotion || steps.length <= 1) return;
    const timer = window.setTimeout(() => {
      setActiveIndex((index) => (index + 1) % steps.length);
    }, compact ? 2200 : 2800);
    return () => window.clearTimeout(timer);
  }, [activeIndex, compact, playing, reducedMotion, steps.length]);

  const goNext = () => {
    setActiveIndex((index) => (index + 1) % steps.length);
  };

  const replay = () => {
    setActiveIndex(0);
    setPlaying(true);
  };

  if (!activeStep) return null;

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card/70">
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
            <button
              type="button"
              onClick={() => setPlaying((value) => !value)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:text-foreground"
              aria-label={playing ? "Pause demo" : "Play demo"}
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={goNext}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Next demo step"
            >
              <StepForward className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={replay}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Replay demo"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-muted/20">
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-500 motion-reduce:transition-none"
            style={{ width: `${progress}%` }}
          />
        </div>
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
                    "grid grid-cols-[28px_minmax(0,1fr)] gap-3 rounded-md px-2.5 py-2 text-left transition-colors",
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
            <div className="rounded-md border border-border bg-background/70 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Input
              </p>
              <p className="mt-2 text-sm font-medium leading-6 text-foreground">
                {activeStep.input}
              </p>
            </div>
            <div className="hidden items-center justify-center text-muted-foreground md:flex">
              <ArrowRight className="h-4 w-4" />
            </div>
            <div className="rounded-md border border-border bg-background/70 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Output
              </p>
              <p className="mt-2 text-sm font-medium leading-6 text-foreground">
                {activeStep.output}
              </p>
            </div>
          </div>

          {activeStep.metric && (
            <div className="mt-3 inline-flex rounded-md border border-border bg-background px-3 py-1.5 font-mono text-xs font-semibold text-accent">
              {activeStep.metric}
            </div>
          )}

          {activeStep.logs?.length ? (
            <div className="mt-4 overflow-hidden rounded-md border border-border bg-[#030712] text-slate-200">
              <div className="border-b border-white/10 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-slate-400">
                live trace
              </div>
              <div className="space-y-1.5 p-3 font-mono text-xs leading-5">
                {activeStep.logs.map((log, index) => (
                  <p
                    key={`${activeStep.title}-${log}`}
                    className={[
                      "transition-opacity duration-300 motion-reduce:transition-none",
                      index === activeStep.logs!.length - 1 ? "text-amber-200" : "text-slate-300",
                    ].join(" ")}
                  >
                    <span className="text-slate-500">{String(index + 1).padStart(2, "0")}</span>{" "}
                    {log}
                  </p>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Result
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">{demo.result.label}</p>
            </div>
            <span className="text-sm font-semibold text-muted-foreground">
              {demo.result.cta}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
