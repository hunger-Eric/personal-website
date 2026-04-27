"use client";

import Link from "next/link";
import * as LucideIcons from "lucide-react";
import { ArrowUpRight, Check, Copy } from "lucide-react";

import { useCopyToClipboard } from "../ui/useCopyToClipboard";

export type ConnectRowProps = {
  label: string;
  detail?: string;
  href: string;
  icon?: string;
  /** When true, click copies `copyValue` instead of navigating. */
  isCopy?: boolean;
  copyValue?: string | null;
};

function isExternal(href: string) {
  return /^https?:\/\//i.test(href);
}

export function ConnectRow({
  label,
  detail,
  href,
  icon,
  isCopy,
  copyValue,
}: ConnectRowProps) {
  const Icon =
    icon && (LucideIcons as any)[icon] ? (LucideIcons as any)[icon] : null;
  const { copied, copy } = useCopyToClipboard();

  const innerLeft = (
    <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-white/5 text-slate-100">
      {Icon ? <Icon className="h-4 w-4" aria-hidden /> : null}
    </span>
  );
  const innerMiddle = (
    <span className="flex min-w-0 flex-1 flex-col">
      <span className="truncate text-sm font-semibold">{label}</span>
      {detail && (
        <span className="truncate text-xs text-muted-foreground">{detail}</span>
      )}
    </span>
  );

  const baseClass =
    "group flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-left text-slate-50 transition-all hover:border-accent/60 hover:bg-white/[0.08]";

  if (isCopy && copyValue) {
    return (
      <button
        type="button"
        onClick={() => copy(copyValue)}
        aria-label={`Copy ${label}: ${copyValue}`}
        className={[
          baseClass,
          copied ? "border-accent/80 bg-accent/10" : "",
        ].join(" ")}
      >
        {innerLeft}
        {innerMiddle}
        {copied ? (
          <Check className="h-4 w-4 flex-none text-accent" aria-hidden />
        ) : (
          <Copy className="h-4 w-4 flex-none text-muted-foreground transition-colors group-hover:text-accent" aria-hidden />
        )}
      </button>
    );
  }

  const external = isExternal(href);
  const isMail = href.startsWith("mailto:");

  if (external || isMail) {
    return (
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noreferrer noopener" : undefined}
        className={baseClass}
      >
        {innerLeft}
        {innerMiddle}
        <ArrowUpRight className="h-4 w-4 flex-none text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" aria-hidden />
      </a>
    );
  }

  return (
    <Link href={href} className={baseClass}>
      {innerLeft}
      {innerMiddle}
      <ArrowUpRight className="h-4 w-4 flex-none text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" aria-hidden />
    </Link>
  );
}
