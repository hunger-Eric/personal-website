"use client";

import { useEffect, useRef, useState } from "react";
import { ListTree } from "lucide-react";

import type { TocEntry } from "@/lib/mdx/toc";

type Props = {
  entries: TocEntry[];
};

export function TableOfContents({ entries }: Props) {
  const [activeId, setActiveId] = useState<string | null>(
    entries[0]?.id ?? null
  );
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!entries.length || typeof window === "undefined") return;

    // Resolve the live heading elements (rehype-slug added these IDs).
    const els = entries
      .map((e) => document.getElementById(e.id))
      .filter((el): el is HTMLElement => !!el);

    if (!els.length) return;

    // Observe each heading; the topmost one currently in (or just past) the
    // viewport top is "active".
    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(
      (records) => {
        // Pick the first heading whose top is at-or-above 30% of viewport
        const visible = records
          .filter((r) => r.isIntersecting)
          .map((r) => r.target as HTMLElement);

        if (visible.length) {
          // Sort by document order
          visible.sort(
            (a, b) =>
              a.compareDocumentPosition(b) &
              Node.DOCUMENT_POSITION_FOLLOWING
                ? -1
                : 1
          );
          setActiveId(visible[0].id);
        }
      },
      {
        // Trigger when heading enters the upper third of the viewport
        rootMargin: "-10% 0px -65% 0px",
        threshold: [0, 1],
      }
    );

    for (const el of els) observerRef.current.observe(el);
    return () => observerRef.current?.disconnect();
  }, [entries]);

  if (!entries.length) return null;

  const handleClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: "smooth" });
    setActiveId(id);
    // Update hash without triggering a jump
    try {
      history.replaceState(null, "", `#${encodeURIComponent(id)}`);
    } catch {
      // ignore
    }
  };

  return (
    <nav aria-label="Table of contents" className="text-sm">
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        <ListTree className="h-4 w-4" aria-hidden />
        On this page
      </div>
      <ul className="space-y-1.5 border-l border-white/10">
        {entries.map((e) => {
          const isActive = e.id === activeId;
          return (
            <li key={e.id}>
              <a
                href={`#${e.id}`}
                onClick={(ev) => handleClick(ev, e.id)}
                className={[
                  "block border-l-2 -ml-px py-1 pr-2 transition-colors",
                  e.level === 3 ? "pl-7" : "pl-3",
                  isActive
                    ? "border-accent text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                {e.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
