// components/Typewriter.tsx
"use client";

import { useEffect, useState } from "react";

type Props = {
  /** Text to type, supports a single highlighted segment via {start,end} indices. */
  text: string;
  /** Inclusive start index of the highlighted slice (uses class `accentClassName`). */
  highlightStart?: number;
  /** Exclusive end index of the highlighted slice. */
  highlightEnd?: number;
  /** ms per character. Default 38. */
  speedMs?: number;
  /** ms before typing starts. Default 200. */
  startDelayMs?: number;
  /** Tailwind class applied to the highlighted slice. */
  accentClassName?: string;
  /** Show a blinking caret while typing. Default true. */
  caret?: boolean;
  /** className applied to the wrapper. */
  className?: string;
};

export function Typewriter({
  text,
  highlightStart,
  highlightEnd,
  speedMs = 38,
  startDelayMs = 200,
  accentClassName = "text-accent",
  caret = true,
  className = "",
}: Props) {
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setCount(0);
    setDone(false);

    let cancelled = false;
    let timeoutId: number | undefined;

    const tick = (i: number) => {
      if (cancelled) return;
      if (i >= text.length) {
        setDone(true);
        return;
      }
      setCount(i + 1);
      timeoutId = window.setTimeout(() => tick(i + 1), speedMs);
    };

    timeoutId = window.setTimeout(() => tick(0), startDelayMs);

    return () => {
      cancelled = true;
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [text, speedMs, startDelayMs]);

  const visible = text.slice(0, count);

  // Render with optional highlighted slice. We only highlight chars that are
  // currently visible; once typing reaches the highlight range it shows in accent.
  const hasHighlight =
    typeof highlightStart === "number" &&
    typeof highlightEnd === "number" &&
    highlightStart >= 0 &&
    highlightEnd > highlightStart;

  let body: React.ReactNode;
  if (!hasHighlight) {
    body = visible;
  } else {
    const hs = highlightStart!;
    const he = highlightEnd!;
    const before = visible.slice(0, Math.min(visible.length, hs));
    const inside = visible.slice(Math.min(visible.length, hs), Math.min(visible.length, he));
    const after = visible.slice(Math.min(visible.length, he));
    body = (
      <>
        {before}
        {inside && <span className={accentClassName}>{inside}</span>}
        {after}
      </>
    );
  }

  return (
    <span
      className={className}
      aria-label={text}
      role="text"
    >
      {body}
      {caret && (
        <span
          aria-hidden
          className={[
            "ml-0.5 inline-block w-[4px] -translate-y-[2px] align-middle",
            done ? "opacity-0" : "opacity-100",
            "h-[0.9em] bg-indigo-400",
            "animate-caret-blink",
          ].join(" ")}
        />
      )}
    </span>
  );
}
