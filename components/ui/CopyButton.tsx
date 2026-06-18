"use client";

import { useCopyToClipboard } from "./useCopyToClipboard";
import { Check, Copy } from "lucide-react";
import { type ReactNode } from "react";

import { actionCopy } from "@/config/copy/actions";

type Props = {
  text: string;
  className?: string;
  children?: ReactNode; // optional label/content
  iconOnly?: boolean;
  ariaLabel?: string;
};

export function CopyButton({
  text,
  className = "",
  children,
  iconOnly = false,
  ariaLabel = actionCopy.copyToClipboard,
}: Props) {
  const { copied, copy } = useCopyToClipboard();

  return (
    <button
      type="button"
      onClick={() => copy(text)}
      aria-label={ariaLabel}
      className={`inline-flex items-center gap-1.5 rounded-control border border-border bg-surface-paper px-3 py-1.5 text-xs text-foreground transition-colors hover:border-accent hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${className}`}
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {!iconOnly && <span>{copied ? actionCopy.copied : children ?? actionCopy.copy}</span>}
    </button>
  );
}
