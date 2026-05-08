"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const BARE_ROUTES = ["/links", "/content"];

function isBare(pathname: string | null) {
  if (!pathname) return false;
  return BARE_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(`${r}/`)
  );
}

export function ConditionalChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (isBare(pathname)) return null;
  return <>{children}</>;
}
