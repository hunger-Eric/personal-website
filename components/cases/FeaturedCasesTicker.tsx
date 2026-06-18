// components/cases/FeaturedCasesTicker.tsx
"use client";

import { useMemo, useRef, useState, type TouchEventHandler } from "react";
import { ChevronLeft, ChevronRight, FolderOpen } from "lucide-react";
import {
  FilledGithub,
  FilledGlobe,
  FilledFileText,
  FilledDownload,
  FilledPlay,
  FilledArrowUpRight,
} from "@/components/FilledIcons";
import { useLocale } from "@/components/LocaleProvider";
import { useAutoplaySteps, usePrefersReducedMotion } from "@/components/motion";
import { ActionButton, IconButton, Surface } from "@/components/system";
import type { CaseItem } from "../../config/cases";
import { getSiteCopy } from "@/config/contentCopy";

interface FeaturedCasesTickerProps {
  cases: CaseItem[];
}

function iconForLink(type?: string) {
  switch (type) {
    case "github":
      return FilledGithub;
    case "live":
      return FilledGlobe;
    case "docs":
      return FilledFileText;
    case "download":
      return FilledDownload;
    case "video":
      return FilledPlay;
    default:
      return FilledArrowUpRight;
  }
}

function getBlurb(project: CaseItem) {
  return (
    project.description?.[0] ??
    project.summary ??
    "A featured project built to solve a real problem."
  );
}

function getTools(project: CaseItem) {
  const techs = project.technologies ?? [];
  return techs.slice(0, 8);
}

export function FeaturedCasesCarousel({
  cases,
}: FeaturedCasesTickerProps) {
  const { locale } = useLocale();
  const copy = getSiteCopy(locale).cases;
  const slides = useMemo(() => cases.slice(0, 8), [cases]);
  const total = slides.length;

  const [paused, setPaused] = useState(false);
  const reduceMotion = usePrefersReducedMotion();
  const { activeIndex, setActiveIndex, next: goNext } = useAutoplaySteps({
    length: total,
    intervalMs: 5000,
    enabled: !paused,
    reducedMotion: reduceMotion,
  });

  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef<number>(0);

  const goPrev = () => {
    if (total <= 1) return;
    setActiveIndex((i) => (i - 1 + total) % total);
  };

  const goTo = (i: number) => {
    if (total <= 1) return;
    setActiveIndex(((i % total) + total) % total);
  };

  const onTouchStart: TouchEventHandler<HTMLDivElement> = (e) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
    touchDeltaX.current = 0;
  };
  const onTouchMove: TouchEventHandler<HTMLDivElement> = (e) => {
    if (touchStartX.current == null) return;
    const x = e.touches[0]?.clientX ?? 0;
    touchDeltaX.current = x - touchStartX.current;
  };
  const onTouchEnd: TouchEventHandler<HTMLDivElement> = () => {
    const dx = touchDeltaX.current;
    touchStartX.current = null;
    touchDeltaX.current = 0;
    if (Math.abs(dx) < 45) return;
    if (dx < 0) goNext();
    else goPrev();
  };

  if (!total) return null;

  const safeActiveIndex = activeIndex % total;
  const current = slides[safeActiveIndex];
  if (!current) return null;

  const blurb = getBlurb(current);
  const tools = getTools(current);
  const links = (current.links ?? []).slice(0, 4);

  const openHref = (href?: string | null) => {
    if (!href) return;
    window.open(href, "_blank", "noopener,noreferrer");
  };

  const linkLabel = (type?: string) => {
    switch (type) {
      case "live":
        return copy.linkLive;
      case "github":
        return copy.linkGithub;
      case "docs":
        return copy.linkDocs;
      case "download":
        return copy.linkDownload;
      case "video":
        return copy.linkVideo;
      default:
        return copy.linkOpen;
    }
  };

  return (
    <div
      className="w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <Surface
        tone="paper"
        className="relative overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        aria-label={copy.featuredBadge}
      >
        <div className="relative h-[240px] w-full sm:h-[280px] md:h-[320px]">
          <div className="absolute inset-0">
            {slides.map((project, idx) => {
              const image = project.imageUrl;
              const isActive = idx === safeActiveIndex;
              return (
                <div
                  key={`${project.id}-${idx}`}
                  className={[
                    "absolute inset-0",
                    reduceMotion
                      ? "transition-none"
                      : "transition-opacity duration-700 ease-out",
                    isActive ? "opacity-100" : "opacity-0",
                  ].join(" ")}
                  aria-hidden={!isActive}
                >
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={image}
                      alt={project.name}
                      className="absolute inset-0 h-full w-full object-cover object-center"
                      loading={isActive ? "eager" : "lazy"}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-surface-paper-elevated" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="pointer-events-none absolute inset-0 bg-surface-paper/75" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-surface-paper via-transparent to-surface-paper" />

          <div className="relative z-10 flex h-full w-full items-center justify-center px-5 py-6 sm:px-8">
            <div className="w-full max-w-xl text-center">
              <div className="mb-3 inline-flex items-center gap-2 rounded-control border border-border bg-surface-paper px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground backdrop-blur-sm sm:text-[12px]">
                <FolderOpen className="h-3.5 w-3.5" />
                <span>{copy.featuredBadge}</span>
              </div>

              <h4 className="text-xl font-semibold leading-tight text-foreground sm:text-2xl md:text-[2rem]">
                {current.name}
              </h4>

              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-foreground/82 sm:text-[15px] sm:leading-7 line-clamp-2">
                {blurb}
              </p>

              {tools.length ? (
                <p className="mt-2 text-[12px] font-medium text-accent sm:text-sm">
                  {tools.join(", ")}
                </p>
              ) : null}

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <ActionButton
                  href={`/projects/${encodeURIComponent(current.id)}`}
                  className="px-3 py-1.5 backdrop-blur-md"
                  icon={<FilledArrowUpRight className="h-4 w-4 opacity-90" />}
                >
                  {copy.viewDetails}
                </ActionButton>

                {links
                  .filter((l) => !!l.href)
                  .map((l) => {
                    const Ico = iconForLink(l.type);
                    return (
                      <ActionButton
                        key={`${current.id}-${l.type}-${l.href}`}
                        type="button"
                        onClick={() => openHref(l.href)}
                        className="px-3 py-1.5 backdrop-blur-md"
                        icon={<Ico className="h-4 w-4 opacity-90" />}
                      >
                        {l.label || linkLabel(l.type)}
                      </ActionButton>
                    );
                  })}
              </div>
            </div>
          </div>

          {total > 1 ? (
            <>
              <IconButton
                onClick={goPrev}
                label={copy.previousProject}
                icon={<ChevronLeft className="h-5 w-5" strokeWidth={2.4} />}
                className="absolute left-3 top-1/2 z-20 -translate-y-1/2 bg-surface-paper/90 backdrop-blur-md active:scale-95 sm:left-5"
              />
              <IconButton
                onClick={goNext}
                label={copy.nextProject}
                icon={<ChevronRight className="h-5 w-5" strokeWidth={2.4} />}
                className="absolute right-3 top-1/2 z-20 -translate-y-1/2 bg-surface-paper/90 backdrop-blur-md active:scale-95 sm:right-5"
              />
            </>
          ) : null}
        </div>
      </Surface>

      {total > 1 ? (
        <div className="mt-4 flex items-center justify-center gap-2">
          {Array.from({ length: total }).map((_, i) => {
            const isActive = i === safeActiveIndex;
            return (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`${copy.goToSlidePrefix} ${i + 1}`}
                className="group py-1"
              >
                <span
                  className={[
                    "block h-[5px] rounded-control transition-all duration-300",
                    isActive
                      ? "w-12 bg-accent"
                      : "w-8 bg-muted group-hover:bg-border",
                  ].join(" ")}
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export const FeaturedCasesTicker = FeaturedCasesCarousel;
