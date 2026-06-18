"use client";

import { useEffect, useState } from "react";
import { Maximize2, X } from "lucide-react";

type ContactQrCardProps = {
  label: string;
  description?: string;
  qrImage: string;
  qrAlt: string;
};

export function ContactQrCard({
  label,
  description,
  qrImage,
  qrAlt,
}: ContactQrCardProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group grid w-full grid-cols-[128px_minmax(0,1fr)_20px] items-center gap-4 rounded-card border border-hairline bg-surface-paper-elevated p-3 text-left transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:grid-cols-[92px_minmax(0,1fr)_24px]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrImage}
          alt={qrAlt}
          className="h-32 w-32 rounded-control border border-hairline bg-white object-cover sm:h-[92px] sm:w-[92px]"
        />
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-foreground">
            {label}
          </span>
          {description ? (
            <span className="mt-1 block text-xs leading-5 text-muted-foreground">
              {description}
            </span>
          ) : null}
          <span className="mt-2 block text-xs font-semibold text-foreground">
            Tap to enlarge
          </span>
        </span>
        <Maximize2 className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-surface-graphite/85 p-5 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`${label} QR code`}
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-card border border-hairline bg-surface-paper-elevated p-4 shadow-overlay"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  {label}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Scan with WeChat
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-control border border-hairline text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label="Close QR code"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrImage}
              alt={qrAlt}
              className="h-auto w-full rounded-control border border-hairline bg-white"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
