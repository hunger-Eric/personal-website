"use client";

import { useEffect, useState } from "react";
import { ArrowRight, MessageCircle, X } from "lucide-react";

type ContactQrCardProps = {
  label: string;
  description?: string;
  actionLabel?: string;
  qrImage: string;
  qrAlt: string;
};

export function ContactQrCard({
  label,
  description,
  actionLabel = "查看二维码",
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
        className="group grid w-full grid-cols-[48px_minmax(0,1fr)] items-center gap-4 border-b border-hairline py-5 text-left transition-colors hover:bg-surface-paper-elevated focus:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:grid-cols-[48px_minmax(0,1fr)_auto_80px]"
      >
        <span className="flex h-12 w-12 items-center justify-center bg-surface-paper-elevated text-accent" aria-hidden>
          <MessageCircle className="h-5 w-5" />
        </span>
        <span className="min-w-0">
          <span className="block text-xs font-medium text-muted-foreground">
            {label}
          </span>
          {description ? (
            <span className="mt-1 block text-base font-medium text-foreground">
              {description}
            </span>
          ) : null}
        </span>
        <span className="col-start-2 inline-flex items-center gap-2 text-sm font-semibold text-accent transition-colors group-hover:text-accent-hover sm:col-start-auto">
          {actionLabel}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrImage}
          alt={qrAlt}
          className="hidden h-20 w-20 border border-hairline bg-white object-cover sm:block"
        />
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
                  使用微信扫描二维码添加好友
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
