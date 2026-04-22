"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

interface ShareButtonProps {
  title?: string;
  url?: string;
  label?: string;
  className?: string;
}

export function ShareButton({
  title,
  url,
  label = "Share",
  className,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const onClick = async () => {
    const shareUrl =
      url ?? (typeof window !== "undefined" ? window.location.href : "");
    const shareTitle = title ?? (typeof document !== "undefined" ? document.title : "");

    try {
      if (
        typeof navigator !== "undefined" &&
        typeof navigator.share === "function"
      ) {
        await navigator.share({ title: shareTitle, url: shareUrl });
        return;
      }
    } catch {
      // user cancelled or blocked — fall through to copy
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // last resort: no-op
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={copied ? "Link copied" : label}
      className={
        className ??
        "inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-accent hover:text-foreground"
      }
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5" />
          Copied
        </>
      ) : (
        <>
          <Share2 className="h-3.5 w-3.5" />
          {label}
        </>
      )}
    </button>
  );
}
