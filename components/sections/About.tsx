"use client";

import {
  ArrowUpRight,
  Bot,
  BrainCircuit,
  GitBranch,
  Layers3,
  Link2,
  Network,
  Workflow,
} from "lucide-react";

import { ActionButton, Surface } from "@/components/system";
import { getSiteCopy } from "@/config/contentCopy";
import { getAboutConfig } from "../../config/aboutConfig";
import { siteConfig } from "../../config/siteConfig";
import { useLocale } from "../LocaleProvider";

const capabilityIcon = {
  gitBranch: GitBranch,
  workflow: Workflow,
  brainCircuit: BrainCircuit,
  layers: Layers3,
};

export function AboutSection() {
  const { locale } = useLocale();
  const copy = getSiteCopy(locale).about;
  const enabled = siteConfig.sections.about === true;
  const localizedAbout = getAboutConfig(locale);
  const caseStudies = localizedAbout.snapshot.cards.slice(0, 2);

  if (!enabled) return null;

  return (
    <section id="about" className="scroll-mt-12 py-16 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="flex items-center gap-4">
          <h2 className="font-mono text-[13px] font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:text-lg">
            {copy.heading}
          </h2>
          <div className="hidden h-px w-40 bg-border sm:block sm:w-72" aria-hidden />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_360px]">
          <div className="space-y-6">
            <div className="border-y border-border py-6">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <Bot className="h-4 w-4" />
                <span>{copy.positioningLabel}</span>
              </div>
              <div className="mt-4 grid gap-5 md:grid-cols-[0.9fr_1.1fr]">
                <p className="text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
                  {copy.positioningStatement}
                </p>
                <div className="space-y-4 text-sm leading-7 text-foreground/80 sm:text-base">
                  {copy.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <Network className="h-4 w-4" />
                <span>{copy.buildLabel}</span>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {copy.capabilities.map(({ title, description, icon }) => {
                  const Icon = capabilityIcon[icon];
                  return (
                  <Surface key={title} className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-control border border-border bg-background text-muted-foreground">
                        <Icon className="h-4 w-4" />
                      </span>
                      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
                  </Surface>
                  );
                })}
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <Surface className="p-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <Workflow className="h-4 w-4" />
                <span>{copy.audience.title}</span>
              </div>
              <p className="mt-4 text-sm leading-6 text-foreground/85">{copy.audience.lead}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {copy.audience.points.map((point) => (
                  <span
                    key={point}
                    className="rounded-control border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground"
                  >
                    {point}
                  </span>
                ))}
              </div>
            </Surface>

            <Surface className="p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  <Layers3 className="h-4 w-4" />
                  <span>{copy.directionsLabel}</span>
                </div>
                <ActionButton
                  href="/projects"
                  tone="ghost"
                  aria-label={copy.viewCasesLabel}
                  className="h-8 w-8 px-0 py-0"
                >
                  <ArrowUpRight className="h-4 w-4" />
                </ActionButton>
              </div>
              <div className="mt-4 space-y-3">
                {caseStudies.map((card) => (
                  <div key={card.title} className="border-t border-border pt-3 first:border-t-0 first:pt-0">
                    <h3 className="text-sm font-semibold text-foreground">{card.title}</h3>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                      {card.description}
                    </p>
                  </div>
                ))}
              </div>
            </Surface>

            <ActionButton
              href="/links"
              tone="secondary"
              icon={<Link2 className="h-4 w-4 flex-none" />}
              className="w-full min-w-0"
            >
              {copy.socialsButton}
            </ActionButton>
          </aside>
        </div>
      </div>
    </section>
  );
}
