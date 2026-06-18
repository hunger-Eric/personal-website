"use client";

import { useEffect, useState, type RefObject } from "react";

type UseInViewPlaybackOptions = {
  threshold?: number;
};

export function useInViewPlayback<T extends Element>(
  ref: RefObject<T | null>,
  { threshold = 0.35 }: UseInViewPlaybackOptions = {}
) {
  const [inView, setInView] = useState(
    () => typeof IntersectionObserver === "undefined"
  );

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, threshold]);

  return inView;
}

