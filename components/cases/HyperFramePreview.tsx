"use client";

import Image from "next/image";
import type { CSSProperties } from "react";

import { useLocale } from "@/components/LocaleProvider";
import { getSiteCopy } from "@/config/contentCopy";

type HyperFramePreviewProps = {
  projectName: string;
  animationSrc?: string;
  posterSrc?: string;
  accent?: string;
  activeStepTitle?: string;
  reducedMotion?: boolean;
};

export function HyperFramePreview({
  projectName,
  animationSrc,
  posterSrc,
  accent = "var(--accent)",
  activeStepTitle,
  reducedMotion = false,
}: HyperFramePreviewProps) {
  const { locale } = useLocale();
  const copy = getSiteCopy(locale).cases;
  const showAnimation = Boolean(animationSrc && !reducedMotion);
  const fallbackStages = [copy.inputLabel, copy.processLabel, copy.artifactLabel];

  return (
    <div
      className="relative isolate aspect-[16/10] overflow-hidden rounded-card border border-inverse bg-surface-graphite shadow-overlay sm:aspect-video"
      style={{ "--film-accent": accent } as CSSProperties}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(circle at 20% 18%, color-mix(in srgb, var(--film-accent) 28%, transparent), transparent 30%), linear-gradient(135deg, rgba(255,255,255,0.05), transparent 45%)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:42px_42px] opacity-50" />

      {showAnimation ? (
        <iframe
          title={`${projectName} animated system demo`}
          src={animationSrc}
          className="relative z-10 h-full w-full border-0"
          loading="lazy"
          sandbox="allow-scripts"
        />
      ) : posterSrc ? (
        <Image
          src={posterSrc}
          alt={`${projectName} animation poster`}
          fill
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="relative z-10 object-cover"
        />
      ) : (
        <div
          className="relative z-10 grid h-full place-items-center p-6"
          data-testid="animation-fallback"
          role="img"
          aria-label={`${projectName} static system preview`}
        >
          <div className="w-full max-w-[620px] rounded-card border border-inverse bg-surface-graphite-muted p-5 text-surface-graphite-foreground">
            <div className="mb-5 flex items-center justify-between border-b border-inverse pb-3">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {copy.systemPreview}
              </span>
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: accent }}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {fallbackStages.map((label, index) => (
                <div
                  key={label}
                  className="rounded-control border border-inverse bg-surface-graphite p-3"
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    0{index + 1}
                  </span>
                  <p className="mt-2 text-sm font-semibold text-surface-graphite-foreground">{label}</p>
                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-surface-graphite-muted">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${42 + index * 24}%`, backgroundColor: accent }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute left-4 right-4 top-4 z-20 flex items-center justify-between gap-3">
        <div className="rounded-control border border-inverse bg-surface-graphite/80 px-3 py-2 backdrop-blur">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {projectName}
          </p>
          {activeStepTitle ? (
            <p className="mt-0.5 text-xs font-medium text-surface-graphite-foreground">
              {activeStepTitle}
            </p>
          ) : null}
        </div>
        <div className="hidden items-center gap-2 rounded-control border border-inverse bg-surface-graphite/80 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground backdrop-blur sm:flex">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: accent }}
          />
          {copy.liveLoop}
        </div>
      </div>
    </div>
  );
}
