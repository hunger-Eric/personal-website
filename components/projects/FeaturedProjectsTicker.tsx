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
    "inline-flex items-center justify-center rounded-md border border-white/15 bg-white/5 p-2.5 text-slate-200 transition-all duration-200 hover:border-white/30 hover:bg-white/10 hover:text-white active:scale-95";

  const actionBtnClass =
    "inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-transparent px-3.5 py-2 text-[13px] font-medium text-slate-200 transition-all duration-200 hover:border-accent hover:text-foreground sm:text-sm";

  return (
    <div
      className="w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        aria-label="Featured projects carousel"
      >
        {/* Slide content: vertical stack — title, image, description, tools, buttons */}
        <div
          key={`slide-${activeIndex}`}
          className={[
            "flex flex-col gap-4 px-6 py-6 sm:gap-5 sm:px-8 sm:py-8",
            reduceMotion ? "" : "animate-in fade-in-0 duration-300 ease-out",
          ].join(" ")}
        >
          <h4 className="text-center text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
            {current.name}
          </h4>

          {/* Cover image — sits between title and description */}
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-white/10 bg-white/5">
            {current.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={current.imageUrl}
                alt={current.name}
                className="absolute inset-0 h-full w-full object-cover object-center"
                loading="eager"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/35 via-violet-500/20 to-sky-500/20" />
            )}
          </div>

          <p className="mx-auto max-w-2xl text-center text-sm leading-6 text-muted-foreground sm:text-[15px] sm:leading-7 line-clamp-3">
            {blurb}
          </p>

          {tools.length ? (
            <p className="text-center text-[13px] font-medium text-indigo-300 sm:text-sm">
              {tools.join(", ")}
            </p>
          ) : null}

          <div className="flex flex-wrap justify-center gap-2">
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
