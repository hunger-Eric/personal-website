"use client";

import { useEffect, useRef, useState } from "react";

import { Eye, Lock, X } from "lucide-react";

import { ActionButton, IconButton, StatusNote, Surface } from "@/components/system";
import { getSiteCopy } from "@/config/contentCopy";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: (tokens: Map<string, string>) => void;
};

const PIN_LENGTH = 6;
const copy = getSiteCopy("zh").photography;

export function PhotoPinModal({ open, onClose, onSuccess }: Props) {
  const [pin, setPin] = useState(Array.from({ length: PIN_LENGTH }, () => ""));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (open) {
      setPin(Array.from({ length: PIN_LENGTH }, () => ""));
      setError(null);
      setLoading(false);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [open]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError(null);

    if (value && index < PIN_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent) => {
    if (event.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (event.key === "Enter") {
      void submitPin();
    }
  };

  const submitPin = async () => {
    const code = pin.join("");
    if (code.length !== PIN_LENGTH) {
      setError(copy.pinLengthError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/photo-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: code }),
      });

      if (!res.ok) {
        if (res.status === 403) {
          setError(copy.pinIncorrectError);
        } else if (res.status === 501) {
          setError(copy.pinDisabledError);
        } else {
          setError(copy.pinGenericError);
        }
        setLoading(false);
        return;
      }

      const data = (await res.json()) as { photos?: Array<{ id: string; token: string }> };
      const tokenMap = new Map<string, string>();
      for (const photo of data.photos ?? []) {
        tokenMap.set(photo.id, photo.token);
      }
      onSuccess(tokenMap);
      onClose();
    } catch {
      setError(copy.pinNetworkError);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-surface-graphite/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <Surface
        tone="paper"
        className="relative w-full max-w-sm p-8 shadow-panel"
        onClick={(event) => event.stopPropagation()}
      >
        <IconButton
          onClick={onClose}
          label={copy.close}
          icon={<X className="h-5 w-5" aria-hidden="true" />}
          className="absolute right-4 top-4 h-9 w-9"
        />

        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-control border border-warning bg-warning/10 text-warning">
          <Lock className="h-7 w-7" aria-hidden="true" />
        </div>

        <h2 className="mb-2 text-center text-xl font-semibold text-foreground">
          {copy.pinTitle}
        </h2>
        <p className="mb-6 text-center text-sm leading-6 text-muted-foreground">
          {copy.pinDescription}
        </p>

        <div className="mb-4 flex justify-center gap-3">
          {pin.map((digit, index) => (
            <input
              key={index}
              ref={(element) => {
                inputRefs.current[index] = element;
              }}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              aria-label={`PIN ${index + 1}`}
              onChange={(event) => handleChange(index, event.target.value)}
              onKeyDown={(event) => handleKeyDown(index, event)}
              className={[
                "h-12 w-11 rounded-control border bg-surface-paper text-center text-xl font-bold text-foreground outline-none transition-colors focus:ring-2 focus:ring-accent/20",
                error
                  ? "border-destructive bg-destructive/10"
                  : "border-border focus:border-accent",
              ].join(" ")}
            />
          ))}
        </div>

        {error ? (
          <StatusNote tone="danger" className="mb-4 justify-center text-center">
            {error}
          </StatusNote>
        ) : null}

        <ActionButton
          type="button"
          tone="primary"
          onClick={() => void submitPin()}
          disabled={loading}
          icon={
            loading ? (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-accent-foreground/30 border-t-accent-foreground" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )
          }
          className="w-full"
        >
          {copy.pinSubmit}
        </ActionButton>

        <p className="mt-4 text-center text-[11px] leading-5 text-muted-foreground">
          {copy.pinFootnote}
        </p>
      </Surface>
    </div>
  );
}
