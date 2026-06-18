"use client";

import {
  ArrowRight,
  Blocks,
  Bot,
  BrainCircuit,
  FileText,
  GitBranch,
  Workflow,
} from "lucide-react";

import { ContributionGraphCard } from "../ContributionGraphCard";
import { useLocale } from "@/components/LocaleProvider";
import { ActionButton, Surface } from "@/components/system";
import { getSiteCopy } from "@/config/contentCopy";

type LabSignal = {
  label: string;
  value: string;
};

const capabilityIcon = {
  gitBranch: GitBranch,
  workflow: Workflow,
  brainCircuit: BrainCircuit,
  blocks: Blocks,
};

export function HeroShowcaseSection() {
  const { locale } = useLocale();
  const copy = getSiteCopy(locale).hero;
  const labSignals: LabSignal[] = copy.labSignals;

  return (
    <section
      id="top"
      className="flex min-h-[76dvh] flex-col justify-center py-16 sm:min-h-0 lg:py-28"
    >
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.12fr)_minmax(360px,0.88fr)] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 border-y border-border py-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <Bot className="h-4 w-4" />
              <span>{copy.badge}</span>
            </div>

            <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {copy.line}
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
              {copy.description}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <ActionButton
                href="/projects"
                tone="secondary"
                icon={<FileText className="h-4 w-4" />}
              >
                {copy.primaryCta}
                <ArrowRight className="h-4 w-4" />
              </ActionButton>
              <ActionButton
                href="/#about"
                tone="ghost"
              >
                {copy.secondaryCta}
              </ActionButton>
            </div>
          </div>

          <aside>
            <Surface className="rounded-none border-x-0 px-0 py-5">
              <div className="grid grid-cols-3 divide-x divide-border">
                {labSignals.map((signal) => (
                  <div key={signal.label} className="px-3 first:pl-0 last:pr-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      {signal.label}
                    </p>
                    <p className="mt-2 text-sm font-semibold leading-5 text-foreground">
                      {signal.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-3">
                {copy.capabilities.map(({ title, description, icon }) => {
                  const Icon = capabilityIcon[icon];
                  return (
                    <div
                      key={title}
                      className="grid grid-cols-[32px_minmax(0,1fr)] gap-3 border-t border-border pt-3 first:border-t-0 first:pt-0"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-control border border-border bg-surface-paper-elevated text-muted-foreground">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div>
                        <h2 className="text-sm font-semibold text-foreground">
                          {title}
                        </h2>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                          {description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Surface>
          </aside>
        </div>

        <div className="mt-20 hidden md:block">
          <ContributionGraphCard title={copy.rhythmTitle} />
        </div>
      </div>
    </section>
  );
}
