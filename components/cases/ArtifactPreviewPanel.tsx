"use client";

import type { CSSProperties } from "react";
import { FileOutput, ShieldCheck } from "lucide-react";

import { useLocale } from "@/components/LocaleProvider";
import type { CustomerStory, CustomerStoryStep } from "@/config/cases";
import { getSiteCopy } from "@/config/contentCopy";

type ArtifactPreviewPanelProps = {
  story: CustomerStory;
  step: CustomerStoryStep;
  progress: number;
  accent?: string;
};

export function ArtifactPreviewPanel({
  story,
  step,
  progress,
  accent = "var(--accent)",
}: ArtifactPreviewPanelProps) {
  const { locale } = useLocale();
  const copy = getSiteCopy(locale).cases;

  return (
    <aside
      className="flex min-h-[340px] flex-col rounded-card border border-inverse bg-surface-graphite p-4 text-surface-graphite-foreground shadow-overlay"
      style={{ "--film-accent": accent } as CSSProperties}
    >
      <div className="flex items-start justify-between gap-3 border-b border-inverse pb-3">
        <div className="flex items-start gap-2">
          <span
            className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-control border border-inverse bg-surface-graphite-muted"
            style={{ color: accent }}
          >
            <FileOutput className="h-4 w-4" />
          </span>
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {copy.clientArtifact}
            </p>
            <h3 className="mt-1 text-base font-semibold leading-5 text-surface-graphite-foreground">
              {story.artifactLabel}
            </h3>
          </div>
        </div>
        {step.metric ? (
          <span className="rounded-control border border-inverse bg-surface-graphite-muted px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-accent">
            {step.metric}
          </span>
        ) : null}
      </div>

      <div className="mt-4">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {copy.screenChange}
        </p>
        <p className="mt-2 text-sm leading-6 text-surface-graphite-foreground">
          {step.visibleOutput}
        </p>
      </div>

      <div className="mt-4 rounded-card border border-accent/30 bg-accent/10 p-3 shadow-inner">
        <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {copy.artifactPreview}
        </p>
        <p className="font-mono text-xs leading-6 text-surface-graphite-foreground">
          {step.artifactPreview}
        </p>
      </div>

      {step.proof ? (
        <div className="mt-4 flex gap-3 rounded-card border border-inverse bg-surface-graphite-muted p-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 flex-none" style={{ color: accent }} />
          <p className="text-xs leading-5 text-surface-graphite-foreground/75">{step.proof}</p>
        </div>
      ) : null}

      <div className="mt-auto pt-5">
        <div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          <span>{copy.flowProgress}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-surface-graphite-muted">
          <div
            className="h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none"
            style={{ width: `${progress}%`, backgroundColor: accent }}
          />
        </div>
      </div>
    </aside>
  );
}
