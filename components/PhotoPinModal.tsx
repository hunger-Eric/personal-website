// components/PhotoPinModal.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Lock, Eye, X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: (tokens: Map<string, string>) => void;
};

export function PhotoPinModal({ open, onClose, onSuccess }: Props) {
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on open
  useEffect(() => {
    if (open) {
      setPin(["", "", "", "", "", ""]);
      setError(null);
      setLoading(false);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [open]);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (!/^\d?$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError(null);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter") {
      submitPin();
    }
  };

  const submitPin = async () => {
    const code = pin.join("");
    if (code.length !== 6) {
      setError("请输入6位PIN码");
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
          setError("PIN码错误，请重试");
        } else if (res.status === 501) {
          setError("私密照片功能未启用");
        } else {
          setError("验证失败，请重试");
        }
        setLoading(false);
        return;
      }

      const data = await res.json();
      const tokenMap = new Map<string, string>();
      for (const p of data.photos) {
        tokenMap.set(p.id, p.token);
      }
      onSuccess(tokenMap);
      onClose();
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Icon */}
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
          <Lock className="h-7 w-7 text-amber-600 dark:text-amber-400" />
        </div>

        <h2 className="mb-2 text-center text-xl font-semibold">私密照片</h2>
        <p className="mb-6 text-center text-sm text-muted-foreground">
          请输入PIN码查看私密照片
        </p>

        {/* PIN input */}
        <div className="mb-4 flex justify-center gap-3">
          {pin.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`h-12 w-11 rounded-xl border text-center text-xl font-bold outline-none transition-all
                ${
                  error
                    ? "border-red-400 bg-red-50 dark:border-red-600 dark:bg-red-900/20"
                    : "border-border bg-background focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                }`}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <p className="mb-4 text-center text-sm text-red-500">{error}</p>
        )}

        {/* Submit */}
        <button
          onClick={submitPin}
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-amber-600 disabled:opacity-50"
        >
          {loading ? (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <>
              <Eye className="h-4 w-4" />
              查看私密照片
            </>
          )}
        </button>

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          PIN码由网站所有者设置 · 照片仅限本次会话访问
        </p>
      </div>
    </div>
  );
}