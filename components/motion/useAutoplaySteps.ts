"use client";

import { useEffect, useMemo, useState } from "react";

type UseAutoplayStepsOptions = {
  length: number;
  intervalMs: number;
  enabled?: boolean;
  reducedMotion?: boolean;
  onLoop?: () => boolean | void;
};

export function useAutoplaySteps({
  length,
  intervalMs,
  enabled = true,
  reducedMotion = false,
  onLoop,
}: UseAutoplayStepsOptions) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [playing, setPlaying] = useState(!reducedMotion);
  const effectivePlaying = playing && !reducedMotion;

  useEffect(() => {
    if (!enabled || !effectivePlaying || reducedMotion || length <= 1) return;

    const timer = window.setTimeout(() => {
      setActiveIndex((index) => {
        if (index < length - 1) return index + 1;
        const handled = onLoop?.();
        return handled ? index : 0;
      });
    }, intervalMs);

    return () => window.clearTimeout(timer);
  }, [effectivePlaying, enabled, intervalMs, length, onLoop, reducedMotion]);

  const progress = useMemo(() => {
    if (!length) return 0;
    return ((activeIndex + 1) / length) * 100;
  }, [activeIndex, length]);

  function next() {
    if (!length) return;
    setActiveIndex((index) => (index + 1) % length);
  }

  function replay() {
    setActiveIndex(0);
    if (!reducedMotion) setPlaying(true);
  }

  return {
    activeIndex,
    setActiveIndex,
    playing: effectivePlaying,
    setPlaying,
    progress,
    next,
    replay,
  };
}
