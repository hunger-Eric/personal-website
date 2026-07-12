"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { FilledGithub, FilledGlobe, FilledFileText, FilledDownload, FilledPlay, FilledArrowUpRight } from "@/components/FilledIcons";

export interface Project {
  id: string;
  name: string;
  summary?: string;
  description?: string[];
  technologies?: string[];
  links?: Array<{ label: string; href: string; type?: string }>;
  featured?: boolean;
  imageUrl?: string;
  githubStars?: number;
  githubForks?: number;
  downloads?: number;
  start?: string;
  end?: string;
}

interface FeaturedProjectsTickerProps {
  projects: Project[];
  autoAdvanceMs?: number;
}

const CAROUSEL_CAP = 8;
const TECH_CAP = 8;
const DEFAULT_AUTO_ADVANCE_MS = 4000;
const SWIPE_THRESHOLD = 45;
const FALLBACK_BLURB = "A featured project built to solve a real problem.";

function getProjectBlurb(project: Project): string {
  return project.description?.[0] || project.summary || FALLBACK_BLURB;
}

function IconWrapper({ type }: { type: string }) {
  switch (type) {
    case "github":
      return <FilledGithub className="h-4 w-4" />;
    case "live":
      return <FilledGlobe className="h-4 w-4" />;
    case "docs":
      return <FilledFileText className="h-4 w-4" />;
    case "download":
      return <FilledDownload className="h-4 w-4" />;
    case "play":
      return <FilledPlay className="h-4 w-4" />;
    default:
      return <FilledArrowUpRight className="h-4 w-4" />;
  }
}

export function FeaturedProjectsTicker({
  projects,
  autoAdvanceMs = DEFAULT_AUTO_ADVANCE_MS,
}: FeaturedProjectsTickerProps) {
  const cappedProjects = projects.slice(0, CAROUSEL_CAP);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef<number>(0);
  const outerRef = useRef<HTMLDivElement>(null);

  // Auto-advance
  useEffect(() => {
    if (cappedProjects.length <= 1 || isHovered) return;

    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % cappedProjects.length);
    }, autoAdvanceMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [cappedProjects.length, isHovered, autoAdvanceMs]);

  const goToSlide = useCallback((index: number) => {
    setActiveIndex(((index % cappedProjects.length) + cappedProjects.length) % cappedProjects.length);
  }, [cappedProjects.length]);

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % cappedProjects.length);
  }, [cappedProjects.length]);

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + cappedProjects.length) % cappedProjects.length);
  }, [cappedProjects.length]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Prevent default scroll for horizontal swipes
    const deltaX = e.touches[0].clientX - touchStartX.current;
    if (Math.abs(deltaX) > 10) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
      if (deltaX < 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  };

  if (cappedProjects.length === 0) return null;

  const safeActiveIndex = Math.min(activeIndex, cappedProjects.length - 1);
  const current = cappedProjects[safeActiveIndex];

  return (
    <div
      ref={outerRef}
      className="relative overflow-hidden rounded-card border border-hairline bg-surface-paper-elevated shadow-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        role="region"
        aria-label="Featured projects carousel"
        className="relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Slide content */}
        <div className="p-6">
          {/* Header with name and featured badge */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-xl font-semibold text-foreground">{current.name}</h3>
            {current.featured && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                Featured
              </span>
            )}
          </div>

          {/* Blurb */}
          <p className="mt-3 text-sm text-muted-foreground">
            {getProjectBlurb(current)}
          </p>

          {/* Technologies */}
          {current.technologies && current.technologies.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {current.technologies.slice(0, TECH_CAP).map((tech) => (
                <span
                  key={tech}
                  className="rounded-control bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}

          {/* Links */}
          {current.links && current.links.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {current.links.slice(0, 3).map((link) => (
                <button
                  key={link.href}
                  onClick={() => window.open(link.href, "_blank", "noopener,noreferrer")}
                  className="inline-flex items-center gap-1 rounded-control border border-border bg-surface-paper px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <IconWrapper type={link.type} />
                  <span>{link.label}</span>
                </button>
              ))}
              <button
                onClick={() => window.open(current.links?.[0]?.href || "#", "_blank", "noopener,noreferrer")}
                className="inline-flex items-center gap-1 rounded bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <span>View Details</span>
              </button>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        {cappedProjects.length > 1 && (
          <>
            <button
              aria-label="Previous project"
              onClick={prevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 text-foreground backdrop-blur hover:bg-background"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              aria-label="Next project"
              onClick={nextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 text-foreground backdrop-blur hover:bg-background"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Slide indicators */}
        {cappedProjects.length > 1 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {cappedProjects.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => goToSlide(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === safeActiveIndex
                    ? "w-6 bg-primary"
                    : "w-1.5 bg-muted-foreground/40"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Alias for FeaturedProjectsCarousel (used by tests)
export const FeaturedProjectsCarousel = FeaturedProjectsTicker;
