// app/links/layout.tsx
// /links is a "bare" route (no global navbar/footer) AND uses a light theme.
// This layout overrides the dark body background that the rest of the site
// uses, so the page reads as fully white instead of a white card on a dark
// page.
import type { ReactNode } from "react";

export default function LinksLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate min-h-[100dvh] bg-white text-slate-900">
      {/* Force-paint the body white behind the layout so any gap (e.g.
          horizontal scrollbars, address-bar resize, overscroll) doesn't show
          the dark site bg. The fixed div sits behind everything. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-white"
      />
      {children}
    </div>
  );
}
