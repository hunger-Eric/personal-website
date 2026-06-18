"use client";

import type { CSSProperties } from "react";
import { FileOutput, ShieldCheck } from "lucide-react";

import type { CustomerStory, CustomerStoryStep } from "@/config/cases";

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
  accent = "#c48a2c",
}: ArtifactPreviewPanelProps) {
  return (
    <aside
      className="flex min-h-[340px] flex-col rounded-md border border-white/10 bg-[#12130f] p-4 text-[#f3eadb] shadow-[0_18px_55px_rgba(0,0,0,0.22)]"
      style={{ "--film-accent": accent } as CSSProperties}
    >
      <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-start gap-2">
          <span
            className="mt-0.5 flex h-8 w-8 items-center justify-center rounded border border-white/10 bg-white/[0.04]"
            style={{ color: accent }}
          >
            <FileOutput className="h-4 w-4" />
          </span>
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a69b8a]">
              Client artifact
            </p>
            <h3 className="mt-1 text-base font-semibold leading-5 text-[#f7efdf]">
              {story.artifactLabel}
            </h3>
          </div>
        </div>
        {step.metric ? (
          <span className="rounded border border-white/10 bg-white/[0.05] px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[#d9c79f]">
            {step.metric}
          </span>
        ) : null}
      </div>

      <div className="mt-4">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a69b8a]">
          What changes on screen
        </p>
        <p className="mt-2 text-sm leading-6 text-[#f5eddf]">{step.visibleOutput}</p>
      </div>

      <div className="mt-4 rounded-md border border-[#c48a2c]/30 bg-[#21190f] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
        <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#d8c7a6]">
          Artifact preview
        </p>
        <p className="font-mono text-xs leading-6 text-[#f7dca5]">
          {step.artifactPreview}
        </p>
      </div>

      {step.proof ? (
        <div className="mt-4 flex gap-3 rounded-md border border-white/10 bg-white/[0.04] p-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 flex-none" style={{ color: accent }} />
          <p className="text-xs leading-5 text-[#cfc4b2]">{step.proof}</p>
        </div>
      ) : null}

      <div className="mt-auto pt-5">
        <div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-[#a69b8a]">
          <span>Flow progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none"
            style={{ width: `${progress}%`, backgroundColor: accent }}
          />
        </div>
      </div>
    </aside>
  );
}
