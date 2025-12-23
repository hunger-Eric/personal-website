// components/projects/FeaturedProjectsTicker.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ExternalLink,
  Github,
  Globe,
  FileText,
  Download,
  PlayCircle,
  Pin,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  FolderGit2,
} from "lucide-react";
import type { ProjectItem } from "../../config/projects";

interface FeaturedProjectsTickerProps {
  projects: ProjectItem[];
}

type ProjectLink = NonNullable<ProjectItem["links"]>[number];

function iconForLink(type?: string) {
  switch (type) {
    case "github":
      return Github;
    case "live":
      return Globe;
    case "docs":
      return FileText;
    case "download":
      return Download;
    case "video":
      return PlayCircle;
    default:
      return ExternalLink;
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
  return techs.slice(0, 6);
}

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    year: "numeric",
  }).format(d);
}

function parseDateLike(v: unknown): Date | null {
  if (!v) return null;
  if (v instanceof Date && !Number.isNaN(v.getTime())) return v;
  if (typeof v === "number") {
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof v === "string") {
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

/**
 * Best-effort date range extraction.
 * Supports optional fields if you ever add them to ProjectItem:
 * - startDate / endDate
 * - dateRange (string)
 * - date (string)
 */
function getDateRange(project: ProjectItem): string | null {
  const p = project as any;

  if (typeof p?.dateRange === "string" && p.dateRange.trim())
    return p.dateRange;
  if (typeof p?.date === "string" && p.date.trim()) return p.date;

  const start = parseDateLike(p?.startDate ?? p?.from);
  const end = parseDateLike(p?.endDate ?? p?.to);

  if (start && end) return `${fmtDate(start)} – ${fmtDate(end)}`;
  if (start) return fmtDate(start);
  if (end) return fmtDate(end);

  return null;
}

type ContentStage = "in" | "out";

/**
 * Split carousel:
 * - Desktop: CONTENT LEFT (40%), Image RIGHT (60%) sliding track
 * - Mobile: Image ABOVE, Content BELOW (image is large)
 * - Indicators live in the LEFT column, but OUTSIDE the centered content block (bottom)
 * - Controls:
 *    - Top-right of IMAGE (prev/next)
 * - Mobile: description hidden by default; toggle "View description"
 * - Auto-advance every 4s; dots are clickable
 */
export function FeaturedProjectsCarousel({
  projects,
}: FeaturedProjectsTickerProps) {
  const slides = useMemo(() => projects.slice(0, 8), [projects]);
  const total = slides.length;

  // Seamless loop render list: [lastClone, ...realSlides, firstClone]
  const extended = useMemo(() => {
    if (!total) return [];
    const first = slides[0];
    const last = slides[total - 1];
    return [last, ...slides, first];
  }, [slides, total]);

  // pos indexes into extended (0..total+1). Start at 1 for first real slide.
  const [pos, setPos] = useState(1);
  const [animating, setAnimating] = useState(true);

  const trackRef = useRef<HTMLDivElement | null>(null);
  const isTransitioningRef = useRef(false);

  // Reduced motion support
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return;
    const apply = () => setReduceMotion(Boolean(mq.matches));
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  // Pause autoplay on hover/focus (section-level)
  const [paused, setPaused] = useState(false);

  // Touch swipe (image track)
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef<number>(0);

  // Real slide index derived from pos
  const realIndex = total ? (((pos - 1) % total) + total) % total : 0;

  // Content swap state (decoupled)
  const [contentIndex, setContentIndex] = useState(0);
  const [contentStage, setContentStage] = useState<ContentStage>("in");

  // Mobile description toggle (HIDDEN by default)
  const [mobileDescOpen, setMobileDescOpen] = useState(false);

  // Tiny counter bump animation
  const [counterBump, setCounterBump] = useState(false);
  useEffect(() => {
    if (total <= 1) return;
    setCounterBump(true);
    const t = window.setTimeout(() => setCounterBump(false), 220);
    return () => window.clearTimeout(t);
  }, [realIndex, total]);

  // Ensure sane state if slide count changes
  useEffect(() => {
    if (!total) return;
    setAnimating(false);
    setPos(1);
    setContentIndex(0);
    setContentStage("in");
    setMobileDescOpen(false);
    isTransitioningRef.current = false;

    const t = requestAnimationFrame(() => setAnimating(true));
    return () => cancelAnimationFrame(t);
  }, [total]);

  // Reset mobile description when slide changes
  useEffect(() => {
    setMobileDescOpen(false);
  }, [contentIndex]);

  // Snap logic for reduce-motion (no transitionend will fire)
  useEffect(() => {
    if (!total) return;
    if (!reduceMotion) return;

    if (pos === total + 1) {
      setPos(1);
      isTransitioningRef.current = false;
      return;
    }
    if (pos === 0) {
      setPos(total);
      isTransitioningRef.current = false;
    }
  }, [pos, total, reduceMotion]);

  // Transition end snap (image track only)
  useEffect(() => {
    const el = trackRef.current;
    if (!el || !total) return;

    const onEnd = (evt: TransitionEvent) => {
      if (evt.target !== el) return;
      if (evt.propertyName !== "transform") return;

      isTransitioningRef.current = false;

      if (pos === total + 1) {
        setAnimating(false);
        setPos(1);
        requestAnimationFrame(() => setAnimating(true));
        return;
      }

      if (pos === 0) {
        setAnimating(false);
        setPos(total);
        requestAnimationFrame(() => setAnimating(true));
      }
    };

    el.addEventListener("transitionend", onEnd as any);
    return () => el.removeEventListener("transitionend", onEnd as any);
  }, [pos, total]);

  // Smooth content transition (fade/slide)
  useEffect(() => {
    if (!total) return;
    if (realIndex === contentIndex) return;

    if (reduceMotion) {
      setContentIndex(realIndex);
      setContentStage("in");
      return;
    }

    setContentStage("out");
    const t = window.setTimeout(() => {
      setContentIndex(realIndex);
      requestAnimationFrame(() => setContentStage("in"));
    }, 180);

    return () => window.clearTimeout(t);
  }, [realIndex, contentIndex, total, reduceMotion]);

  const goNext = () => {
    if (total <= 1) return;
    if (isTransitioningRef.current) return;

    isTransitioningRef.current = true;
    setPos((p) => p + 1);

    if (reduceMotion) {
      requestAnimationFrame(() => {
        isTransitioningRef.current = false;
      });
    }
  };

  const goPrev = () => {
    if (total <= 1) return;
    if (isTransitioningRef.current) return;

    isTransitioningRef.current = true;
    setPos((p) => p - 1);

    if (reduceMotion) {
      requestAnimationFrame(() => {
        isTransitioningRef.current = false;
      });
    }
  };

  const goTo = (i: number) => {
    if (total <= 1) return;
    if (isTransitioningRef.current) return;

    isTransitioningRef.current = true;
    setPos(i + 1);

    if (reduceMotion) {
      requestAnimationFrame(() => {
        isTransitioningRef.current = false;
      });
    }
  };

  // Autoplay every 4s
  useEffect(() => {
    if (total <= 1) return;
    if (reduceMotion) return;
    if (paused) return;

    const t = window.setTimeout(() => {
      goNext();
    }, 4000);

    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos, total, reduceMotion, paused]);

  // Touch swipe handlers
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

  const current = slides[contentIndex] ?? null;
  if (!current) return null;

  const blurb = getBlurb(current);
  const tools = getTools(current);
  const links = (current.links ?? []).slice(0, 4);
  const primary = pickPrimary(current);
  const primaryHref = primary?.href ?? null;

  const openHref = (href?: string | null) => {
    if (!href) return;
    window.open(href, "_blank", "noopener,noreferrer");
  };

  const openPrimary = () => {
    if (!primaryHref) return;
    openHref(primaryHref);
  };

  // Indicators reflect REAL slide index
  const indicatorIndex = realIndex;

  return (
    <div
      className="w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* FRAME */}
      <div
        className="group relative overflow-hidden rounded-2xl border border-white/10 bg-transparent"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        aria-label="Featured projects carousel"
      >
        {/* Desktop fixed height; mobile can grow via content */}
        <article className="grid w-full grid-cols-1 md:grid-cols-[2fr_3fr] md:h-[420px]">
          {/* IMAGE (mobile: top) / (desktop: right) */}
          <div
            className={[
              "relative overflow-hidden md:order-2 group/image",
              primaryHref ? "cursor-pointer" : "",
            ].join(" ")}
            role={primaryHref ? "button" : undefined}
            tabIndex={primaryHref ? 0 : -1}
            onClick={openPrimary}
            onKeyDown={(e) => {
              if (!primaryHref) return;
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openPrimary();
              }
            }}
          >
            <div className="relative h-[260px] w-full sm:h-[320px] md:h-full">
              {/* TOP-RIGHT: prev/next controls */}
              {total > 1 ? (
                <div className="absolute right-5 top-5 z-30 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      goPrev();
                    }}
                    className="inline-flex items-center justify-center rounded-md bg-slate-950/45 p-2 text-slate-50/90 shadow-sm backdrop-blur-md transition-all duration-200 hover:bg-slate-950/60 hover:scale-[1.06] active:scale-[0.99]"
                    aria-label="Previous project"
                    title="Previous"
                  >
                    <ChevronLeft className="h-4 w-4" strokeWidth={2.6} />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      goNext();
                    }}
                    className="inline-flex items-center justify-center rounded-md bg-slate-950/45 p-2 text-slate-50/90 shadow-sm backdrop-blur-md transition-all duration-200 hover:bg-slate-950/60 hover:scale-[1.06] active:scale-[0.99]"
                    aria-label="Next project"
                    title="Next"
                  >
                    <ChevronRight className="h-4 w-4" strokeWidth={2.6} />
                  </button>
                </div>
              ) : null}

              {/* Track */}
              <div
                ref={trackRef}
                className={[
                  "flex h-full will-change-transform",
                  animating && !reduceMotion
                    ? "transition-transform duration-500 ease-out"
                    : "transition-none",
                ].join(" ")}
                style={{ transform: `translateX(-${pos * 100}%)` }}
              >
                {extended.map((project, idx) => {
                  const image = project.imageUrl;
                  return (
                    <div
                      key={`${project.id}-${idx}`}
                      className="relative h-full w-full shrink-0"
                      aria-hidden={idx !== pos}
                    >
                      {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={image}
                          alt={project.name}
                          className="absolute inset-0 h-full w-full object-cover object-center"
                          loading="lazy"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/35 via-violet-500/20 to-sky-500/20" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* STABLE overlays ABOVE the moving track (fixes fade disappearing during slide) */}
              <div className="pointer-events-none absolute inset-0">
                {/* Base overlay */}
                <div className="absolute inset-0 bg-slate-950/20" />

                {/* Mobile: bottom->up fade */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/20 to-transparent md:hidden" />

                {/* Desktop: bottom fade */}
                <div className="absolute inset-0 hidden bg-gradient-to-t from-slate-950/70 via-slate-950/15 to-transparent md:block" />

                {/* Desktop: side fade (tight + smoother), fades away ONLY on hover of image column */}
                <div
                  className={[
                    "absolute inset-0 hidden opacity-100 transition-opacity duration-300 md:block",
                    // smoother than before, less harsh at the edge
                    "bg-[linear-gradient(to_left,transparent_0%,transparent_80%,rgba(255,255,255,0.04)_92%,rgba(255,255,255,0.06)_100%)]",
                    "group-hover/image:opacity-0",
                  ].join(" ")}
                />

                {/* Desktop hover label (only image hover) */}
                <div className="absolute inset-0 hidden items-center justify-center md:flex">
                  <div
                    className={[
                      "inline-flex items-center gap-2",
                      // subtle readable backing
                      "px-3 py-2 rounded-lg",
                      "bg-slate-950/18 backdrop-blur-[2px]",
                      "opacity-0 translate-y-1 transition-all duration-300 ease-out",
                      "group-hover/image:opacity-100 group-hover/image:translate-y-0",
                    ].join(" ")}
                  >
                    <span className="text-lg font-semibold text-slate-50 drop-shadow-[0_12px_26px_rgba(0,0,0,0.92)] group-hover/image:underline">
                      View Project
                    </span>
                    <ExternalLink className="h-5 w-5 text-slate-50/95 drop-shadow-[0_12px_26px_rgba(0,0,0,0.92)]" />
                  </div>
                </div>

                {/* Desktop bottom-right date (for CURRENT slide only) */}
                {(() => {
                  const dateRange = getDateRange(current);
                  if (!dateRange) return null;
                  return (
                    <div className="absolute bottom-4 right-5 z-20 hidden md:block">
                      <span className="text-[11px] font-medium text-slate-200/55 drop-shadow-[0_10px_24px_rgba(0,0,0,0.85)]">
                        {dateRange}
                      </span>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* CONTENT (mobile: bottom) / (desktop: left) */}
          <div className="relative bg-white/5 md:order-1 md:h-full">
            {/* Desktop top-left pinned label + fraction */}
            <div className="pointer-events-none absolute left-5 top-5 z-20 hidden items-center gap-1 text-xs font-semibold text-slate-200/85 md:inline-flex">
              <Pin className="h-[18px] w-[18px] opacity-90" strokeWidth={2.2} />
              <span className="uppercase tracking-[0.18em]">
                Pinned Project
              </span>

              <span
                className={[
                  "inline-flex items-center rounded-md bg-white/5 px-2 py-0.5 text-[11px] font-semibold text-slate-200/70",
                  "transition-transform duration-200",
                  counterBump ? "scale-[1.06]" : "scale-100",
                ].join(" ")}
              >
                {indicatorIndex + 1} / {total}
              </span>
            </div>

            {/* Centered content block (y-axis centered) */}
            <div className="flex h-full flex-col items-center justify-center px-5 pb-14 pt-10 sm:px-7 sm:pb-16 sm:pt-12 md:pt-16">
              <div
                className={[
                  "w-full max-w-md px-1",
                  reduceMotion ? "" : "transition-all duration-300 ease-out",
                  contentStage === "in"
                    ? "opacity-100 translate-y-0 blur-0"
                    : "opacity-0 translate-y-2 blur-[1px]",
                ].join(" ")}
              >
                <div className="text-center">
                  <h4 className="text-2xl font-semibold text-slate-50 sm:text-3xl line-clamp-1">
                    {current.name}
                  </h4>

                  {/* DESCRIPTION */}
                  <div className="mt-3">
                    {/* Desktop */}
                    <p className="hidden text-[15px] leading-7 text-slate-200/90 sm:text-base md:block line-clamp-5">
                      {blurb}
                    </p>

                    {/* Mobile (toggle only) */}
                    <div className="md:hidden">
                      {!mobileDescOpen ? (
                        <button
                          type="button"
                          onClick={() => setMobileDescOpen(true)}
                          className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-slate-200/80 transition-all hover:opacity-100 hover:scale-[1.01]"
                          aria-label="View description"
                        >
                          <span>View description</span>
                          <ChevronDown className="h-4 w-4 opacity-80" />
                        </button>
                      ) : (
                        <>
                          <p className="mt-2 text-[15px] leading-7 text-slate-200/90">
                            {blurb}
                          </p>
                          <button
                            type="button"
                            onClick={() => setMobileDescOpen(false)}
                            className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-slate-200/80 transition-all hover:opacity-100 hover:scale-[1.01]"
                            aria-label="Hide description"
                          >
                            <span>Hide description</span>
                            <ChevronUp className="h-4 w-4 opacity-80" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Tools (bold) */}
                  {tools.length ? (
                    <p className="mt-4 text-center text-xs font-bold text-muted-foreground">
                      {tools.join(" • ")}
                    </p>
                  ) : null}

                  {/* Quick buttons */}
                  <div className="mt-5 flex flex-wrap justify-center gap-2">
                    {/* View Project ALWAYS FIRST */}
                    {primary?.href ? (
                      <button
                        type="button"
                        onClick={() => openHref(primary.href)}
                        className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-transparent px-2.5 py-1.5 text-[13px] font-medium text-slate-50/90 transition-all duration-200 hover:border-accent/45 hover:bg-white/5 hover:text-slate-50 sm:px-3 sm:py-2 sm:text-sm"
                      >
                        <FolderGit2 className="h-4 w-4 opacity-90" />
                        <span className="truncate">View Project</span>
                      </button>
                    ) : null}

                    {links.map((l) => {
                      const Ico = iconForLink(l.type);
                      return (
                        <button
                          key={`${current.id}-${l.type}-${l.href}`}
                          type="button"
                          onClick={() => openHref(l.href)}
                          className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-transparent px-2.5 py-1.5 text-[13px] font-medium text-slate-50/90 transition-all duration-200 hover:border-accent/45 hover:bg-white/5 hover:text-slate-50 sm:px-3 sm:py-2 sm:text-sm"
                        >
                          <Ico className="h-4 w-4 opacity-90" />
                          <span className="truncate">
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
            </div>

            {/* INDICATORS: bottom of LEFT column, OUTSIDE the centered content block */}
            {total > 1 ? (
              <div className="pointer-events-auto absolute bottom-4 left-0 right-0">
                <div className="flex w-full items-center justify-center">
                  <div className="flex items-center gap-2 px-3">
                    {Array.from({ length: total }).map((_, i) => {
                      const isActive = i === indicatorIndex;

                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => goTo(i)}
                          className="group inline-flex items-center"
                          aria-label={`Go to slide ${i + 1}`}
                        >
                          <span
                            className={[
                              "h-[5px] rounded-full transition-all duration-300",
                              isActive ? "w-9 bg-accent" : "w-6 bg-white/20",
                              isActive
                                ? "group-hover:bg-accent"
                                : "group-hover:bg-white/30",
                            ].join(" ")}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </article>
      </div>
    </div>
  );
}

// Back-compat export so existing imports won’t break
export const FeaturedProjectsTicker = FeaturedProjectsCarousel;
