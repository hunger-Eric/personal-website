// components/projects/FeaturedProjectsTicker.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  FilledGithub,
  FilledGlobe,
  FilledFileText,
  FilledDownload,
  FilledPlay,
  FilledArrowUpRight,
} from "@/components/FilledIcons";
import type { ProjectItem } from "../../config/projects";

interface FeaturedProjectsTickerProps {
  projects: ProjectItem[];
}

type ProjectLink = NonNullable<ProjectItem["links"]>[number];

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

function pickPrimary(project: ProjectItem): ProjectLink | null {
  return (
    project.links?.find((l) => l.type === "live") ??
    project.links?.find((l) => l.type === "github") ??
    project.links?.[0] ??
    null
  );
}

function getBlurb(project: ProjectItem) {
  return (
    project.description?.[0] ??
    project.summary ??
    "A featured project built to solve a real problem."
  );
}

function getTools(project: ProjectItem) {
  const techs = project.technologies ?? [];
  return techs.slice(0, 8);
}

export function FeaturedProjectsCarousel({
  projects,
}: FeaturedProjectsTickerProps) {
  const slides = useMemo(() => projects.slice(0, 8), [projects]);
  const total = slides.length;

  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return;
    const apply = () => setReduceMotion(Boolean(mq.matches));
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  const [paused, setPaused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef<number>(0);

  useEffect(() => {
    if (!total) return;
    setActiveIndex(0);
  }, [total]);

  const goNext = () => {
    if (total <= 1) return;
    setActiveIndex((i) => (i + 1) % total);
  };

  const goPrev = () => {
    if (total <= 1) return;
    setActiveIndex((i) => (i - 1 + total) % total);
  };

  const goTo = (i: number) => {
    if (total <= 1) return;
    setActiveIndex(((i % total) + total) % total);
  };

  useEffect(() => {
    if (total <= 1 || reduceMotion || paused) return;
    const t = window.setTimeout(goNext, 5000);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, total, reduceMotion, paused]);

  const onTouchStart: React.TouchEventHandler<HTMLDivElement> = (e) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
    touchDeltaX.current = 0;
  };
  const onTouchMove: React.TouchEventHandler<HTMLDivElement> = (e) => {
    if (touchStartX.current == null) return;
    const x = e.touches[0]?.clientX ?? 0;
    touchDeltaX.current = x - touchStartX.current;
  };
  const onTouchEnd: React.TouchEventHandler<HTMLDivElement> = () => {
    const dx = touchDeltaX.current;
    touchStartX.current = null;
    touchDeltaX.current = 0;
    if (Math.abs(dx) < 45) return;
    if (dx < 0) goNext();
    else goPrev();
  };

  if (!total) return null;

  const current = slides[activeIndex];
  if (!current) return null;

  const blurb = getBlurb(current);
  const tools = getTools(current);
  const links = (current.links ?? []).slice(0, 4);
  const primary = pickPrimary(current);

  const openHref = (href?: string | null) => {
    if (!href) return;
    window.open(href, "_blank", "noopener,noreferrer");
  };

  const navBtnClass =
    "inline-flex items-center justify-center rounded-md border border-white/15 bg-black/40 p-2.5 text-slate-50/95 backdrop-blur-md transition-all duration-200 hover:bg-black/55 hover:border-white/30 active:scale-95";

  const actionBtnClass =
    "inline-flex items-center gap-1.5 rounded-md border border-white/20 bg-black/30 px-3.5 py-2 text-[13px] font-medium text-slate-50 backdrop-blur-md transition-all duration-200 hover:border-white/40 hover:bg-black/50 sm:text-sm";

  return (
    <div
      className="w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        aria-label="Featured projects carousel"
      >
        {/* Fixed, modest height so the carousel stays compact */}
        <div className="relative h-[300px] w-full sm:h-[360px] md:h-[420px]">
          {/* Image stack — full bleed, crossfade */}
          <div className="absolute inset-0">
            {slides.map((project, idx) => {
              const image = project.imageUrl;
              const isActive = idx === activeIndex;
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
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/35 via-violet-500/20 to-sky-500/20" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Dark overlay so text always reads. Flat scrim + a subtle gradient at the edges. */}
          <div className="pointer-events-none absolute inset-0 bg-black/55" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />

          {/* Centered content */}
          <div className="relative z-10 flex h-full w-full items-center justify-center px-6 py-8 sm:px-10">
            <div className="w-full max-w-2xl text-center">
              <h4 className="text-2xl font-semibold leading-tight text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.85)] sm:text-3xl md:text-4xl">
                {current.name}
              </h4>

              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-50/95 drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)] sm:text-[15px] sm:leading-7 md:text-base md:leading-7 line-clamp-3">
                {blurb}
              </p>

              {tools.length ? (
                <p className="mt-3 text-[13px] font-medium text-indigo-200 drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)] sm:text-sm">
                  {tools.join(", ")}
                </p>
              ) : null}

              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {primary?.href ? (
                  <button
                    type="button"
                    onClick={() => openHref(primary.href)}
                    className={actionBtnClass}
                  >
                    <FilledArrowUpRight className="h-4 w-4 opacity-90" />
                    <span>View Project</span>
                  </button>
                ) : null}

                {links
                  .filter((l) => l.href !== primary?.href)
                  .map((l) => {
                    const Ico = iconForLink(l.type);
                    return (
                      <button
                        key={`${current.id}-${l.type}-${l.href}`}
                        type="button"
                        onClick={() => openHref(l.href)}
                        className={actionBtnClass}
                      >
                        <Ico className="h-4 w-4 opacity-90" />
                        <span>
                          {l.label ||
                            (l.type === "live"
                              ? "Live"
                              : l.type === "github"
                              ? "GitHub"
                              : l.type === "docs"
                              ? "Docs"
                              : l.type === "download"
                              ? "Download"
                              : l.type === "video"
                              ? "Video"
                              : "Open")}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Side arrows */}
          {total > 1 ? (
            <>
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous project"
                className={`absolute left-3 top-1/2 z-20 -translate-y-1/2 ${navBtnClass} sm:left-5`}
              >
                <ChevronLeft className="h-5 w-5" strokeWidth={2.4} />
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="Next project"
                className={`absolute right-3 top-1/2 z-20 -translate-y-1/2 ${navBtnClass} sm:right-5`}
              >
                <ChevronRight className="h-5 w-5" strokeWidth={2.4} />
              </button>
            </>
          ) : null}
        </div>
      </div>

      {/* Indicators — rectangles, outside the card */}
      {total > 1 ? (
        <div className="mt-4 flex items-center justify-center gap-2">
          {Array.from({ length: total }).map((_, i) => {
            const isActive = i === activeIndex;
            return (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className="group py-1"
              >
                <span
                  className={[
                    "block h-[5px] rounded-[1px] transition-all duration-300",
                    isActive
                      ? "w-12 bg-indigo-400"
                      : "w-8 bg-white/25 group-hover:bg-white/40",
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

export const FeaturedProjectsTicker = FeaturedProjectsCarousel;
