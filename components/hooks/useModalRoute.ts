// components/hooks/useModalRoute.ts

"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Scheme = "kv" | "flag";
type UseModalRouteOpts =
  | {
      scheme?: "kv";
      key?: string; // e.g. "modal"
      value?: string; // e.g. "resume"
      scroll?: boolean;
    }
  | {
      scheme: "flag";
      key: string; // e.g. "resume" -> /?resume
      scroll?: boolean;
    };

// Build a querystring string that includes a *flag* param (no value).
function buildFlagQuery(
  pathname: string,
  sp: URLSearchParams,
  flagKey: string
) {
  // Clone so we don't mutate the original instance
  const nextSP = new URLSearchParams(sp.toString());
  // URLSearchParams can't truly represent "no value", so we handle it manually.
  // We'll remove any existing key (with or without value), then manually append.
  nextSP.delete(flagKey);

  const base = nextSP.toString();
  // Compose the final query string manually to ensure `?resume` instead of `?resume=`
  if (!base) return `${pathname}?${flagKey}`;
  return `${pathname}?${base}&${flagKey}`;
}

export function useModalRoute(opts: UseModalRouteOpts = {}) {
  const scheme: Scheme = opts.scheme ?? "kv";
  const key = opts.key ?? (scheme === "kv" ? "modal" : "resume");
  const value = opts.scheme === "flag" ? "resume" : (opts.value ?? "resume");
  const scroll = opts.scroll ?? false;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Active?
  const isActive = useMemo(() => {
    if (scheme === "flag") {
      // present regardless of value
      return searchParams.has(key);
    }
    // kv
    return (searchParams.get(key) || "") === value;
  }, [scheme, key, value, searchParams]);

  // HREF to show in <a href=...>
  const href = useMemo(() => {
    if (scheme === "flag") {
      return buildFlagQuery(pathname, searchParams, key);
    }
    const sp = new URLSearchParams(searchParams.toString());
    sp.set(key, value);
    return `${pathname}?${sp.toString()}`;
  }, [scheme, pathname, searchParams, key, value]);

  // Open/Close mutate URL without scrolling
  const open = useCallback(() => {
    if (scheme === "flag") {
      const nextUrl = buildFlagQuery(pathname, searchParams, key);
      router.replace(nextUrl, { scroll });
      return;
    }
    const sp = new URLSearchParams(searchParams.toString());
    sp.set(key, value);
    router.replace(`${pathname}?${sp.toString()}`, { scroll });
  }, [scheme, pathname, searchParams, key, value, router, scroll]);

  const close = useCallback(() => {
    if (scheme === "flag") {
      // Remove the flag cleanly
      const sp = new URLSearchParams(searchParams.toString());
      sp.delete(key); // remove any existing key=value forms
      // Also remove the no-value flag if present by reconstructing without it
      // (buildFlagQuery never gets called here; we want the variant *without* the flag)
      const nextUrl = sp.toString() ? `${pathname}?${sp.toString()}` : pathname;
      router.replace(nextUrl, { scroll });
      return;
    }
    const sp = new URLSearchParams(searchParams.toString());
    sp.delete(key);
    const nextUrl = sp.toString() ? `${pathname}?${sp.toString()}` : pathname;
    router.replace(nextUrl, { scroll });
  }, [scheme, pathname, searchParams, key, router, scroll]);

  return useMemo(
    () => ({ isActive, href, open, close }),
    [isActive, href, open, close]
  );
}
