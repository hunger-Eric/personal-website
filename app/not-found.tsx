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
import { ActionButton } from "@/components/system";

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
      <div className="select-none font-mono text-[7rem] font-bold leading-none text-muted-foreground/10 sm:text-[10rem]">
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
        <ActionButton
          href="/"
          tone="primary"
          icon={<ArrowLeft className="h-4 w-4" />}
        >
          Back to home
        </ActionButton>
      </div>

      {/* Suggestions */}
      <div className="mt-10 grid w-full max-w-md grid-cols-2 gap-2 sm:grid-cols-4">
        {suggestions.map((s) => {
          const className =
            "group flex flex-col items-center gap-1.5 rounded-card border border-hairline bg-surface-paper-elevated p-3 text-xs font-medium text-foreground transition-colors hover:border-accent/50 hover:bg-muted";
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
