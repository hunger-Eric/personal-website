"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Star, ArrowRight } from "lucide-react";

import type { ProjectItem } from "@/config/projects";

const FALLBACK_IMG = "/images/demo_1.png";
const INTERVAL_MS = 6000;

export function ProjectsCarousel({ projects }: { projects: ProjectItem[] }) {
  const items = projects.filter(Boolean);
  const count = items.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (count <= 1 || paused) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [count, paused]);

  if (count === 0) return null;

  const safe = Math.min(index, count - 1);

  const go = (delta: number) => {
    setIndex((i) => (i + delta + count) % count);
  };

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative aspect-[16/9] w-full sm:aspect-[21/9]">
        {items.map((p, i) => {
          const on = i === safe;
          const img = p.imageUrl || FALLBACK_IMG;
          return (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className={[
                "group absolute inset-0 block",
                "transition-opacity duration-700 ease-in-out",
                on ? "opacity-100" : "pointer-events-none opacity-0",
              ].join(" ")}
              aria-hidden={!on}
              tabIndex={on ? 0 : -1}
              aria-label={`Open ${p.name}`}
            >
              <Image
                src={img}
                alt={p.name}
                fill
                sizes="(max-width: 1024px) 100vw, 1024px"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                priority={i === 0}
              />

              {/* Gradient + content overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-5 sm:p-7">
                <div className="flex flex-wrap items-center gap-2">
                  {p.featured && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent/80 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                      <Star className="h-3 w-3" /> Featured
                    </span>
                  )}
                  {(p.technologies ?? []).slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="rounded-md bg-white/10 px-2 py-0.5 text-[11px] font-medium text-white/85"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <h3 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  {p.name}
                </h3>
                <p className="line-clamp-2 max-w-2xl text-sm text-white/85 sm:text-base">
                  {p.summary}
                </p>
                <div className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-white">
                  View project
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Arrows */}
      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous project"
            onClick={() => go(-1)}
            className="absolute left-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-white/15 bg-slate-950/60 p-2 text-white backdrop-blur transition-colors hover:border-accent hover:bg-slate-950/80 sm:inline-flex"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next project"
            onClick={() => go(1)}
            className="absolute right-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-white/15 bg-slate-950/60 p-2 text-white backdrop-blur transition-colors hover:border-accent hover:bg-slate-950/80 sm:inline-flex"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      {/* Dots */}
      {count > 1 && (
        <div className="absolute inset-x-0 bottom-2.5 z-10 flex items-center justify-center gap-1.5 sm:bottom-3">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={[
                "h-1.5 rounded-full transition-all",
                i === safe ? "w-8 bg-accent" : "w-3 bg-white/40 hover:bg-white/60",
              ].join(" ")}
            />
          ))}
        </div>
      )}
    </div>
  );
}
