// app/not-found.tsx
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  FolderGit2,
  Newspaper,
  User,
  Mail,
} from "lucide-react";
import { siteConfig } from "@/config/siteConfig";

export default function NotFound() {
  const emailHref = siteConfig.socialsList.find((s) => s.key === "email")?.href || "";
  const suggestions: {
    label: string;
    href: string;
    Icon: typeof FolderGit2;
    external?: boolean;
  }[] = [
    { label: "About me", href: "/#about", Icon: User },
    { label: "Cases", href: "/projects", Icon: FolderGit2 },
    { label: "Articles", href: "/articles", Icon: Newspaper },
    ...(emailHref
      ? [{ label: "Email me", href: emailHref, Icon: Mail, external: true }]
      : []),
  ];

  return (
    <main className="mx-auto flex min-h-[calc(100dvh-160px)] w-full max-w-2xl flex-col items-center justify-center px-4 pb-16 pt-12 text-center sm:pt-20">
      {/* Big numeric 404 — quiet */}
      <div className="select-none font-mono text-[7rem] font-bold leading-none text-white/[0.04] sm:text-[10rem]">
        404
      </div>

      <p className="-mt-6 text-xs font-semibold uppercase tracking-[0.24em] text-accent sm:-mt-8">
        Page not found
      </p>

      <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
        We couldn&apos;t find that page.
      </h1>

      <p className="mt-4 max-w-md text-balance text-sm text-muted-foreground sm:text-base">
        The link might be broken, or the page may have been moved or renamed.
        Try one of these instead.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent/90"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </div>

      {/* Suggestions */}
      <div className="mt-10 grid w-full max-w-md grid-cols-2 gap-2 sm:grid-cols-4">
        {suggestions.map((s) => {
          const className =
            "group flex flex-col items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs font-medium text-foreground transition-colors hover:border-accent/50 hover:bg-white/[0.07]";
          const inner = (
            <>
              <s.Icon className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-accent" />
              <span className="inline-flex items-center gap-1">
                {s.label}
                <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-70" />
              </span>
            </>
          );
          if (s.external) {
            return (
              <a key={s.href} href={s.href} className={className}>
                {inner}
              </a>
            );
          }
          return (
            <Link key={s.href} href={s.href} className={className}>
              {inner}
            </Link>
          );
        })}
      </div>
    </main>
  );
}
