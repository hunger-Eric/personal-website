import type { ReactNode } from "react";

// /links is a bare route and should still feel like the same public site.
export default function LinksLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate min-h-[100dvh] bg-surface-paper text-surface-paper-foreground">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-20 bg-surface-paper" />
      {children}
    </div>
  );
}
