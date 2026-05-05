// app/links/layout.tsx
// /links is a "bare" route (no global navbar/footer) AND uses a light theme.
// This layout overrides the dark body background that the rest of the site
// uses with a soft white -> sky gradient that reads as a clean,
// portfolio-friendly hub page.
import type { ReactNode } from "react";

export default function LinksLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate min-h-[100dvh] text-slate-900">
      {/* Fixed gradient underlay — covers the viewport regardless of scroll
          and defeats overscroll/horizontal-scrollbar gaps showing the site bg. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-20 bg-gradient-to-b from-white via-sky-50 to-sky-100"
      />
      {/* Soft accent glow behind the avatar — pure CSS, GPU-friendly, fixed
          so it stays in place as the user scrolls. */}
      <div
        aria-hidden
        className="pointer-events-none fixed left-1/2 top-0 -z-10 h-72 w-[480px] -translate-x-1/2 rounded-full bg-sky-300/30 blur-3xl"
      />
      {children}
    </div>
  );
}
