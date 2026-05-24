"use client";

import { useState, useEffect, useCallback, ReactNode } from "react";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

type Props = {
  title: string;
  description: string;
  configKey: string;
  loadUrl?: string;
  children: (data: any, setData: (d: any) => void) => ReactNode;
  transformSave?: (data: any) => any;
};

export function AdminEditor({
  title,
  description,
  configKey,
  loadUrl,
  children,
  transformSave,
}: Props) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ciMessage, setCiMessage] = useState<string | null>(null);

  useEffect(() => {
    const url = loadUrl || `/api/admin/${configKey}`;
    fetch(url)
      .then(async (r) => {
        const body = await r.json().catch(() => ({}));
        if (!r.ok) {
          const msg = body?.error || `Request failed (${r.status})`;
          throw new Error(msg);
        }
        const nextData = body?.config ?? body;
        if (!nextData || typeof nextData !== "object") {
          throw new Error("Invalid config payload");
        }
        setData(nextData);
      })
      .catch((e) => setError(`Load failed: ${e.message}`))
      .finally(() => setLoading(false));
  }, [configKey, loadUrl]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setMessage(null);
    setError(null);
    setCiMessage(null);

    try {
      const payload = transformSave ? transformSave(data) : data;
      const res = await fetch("/api/admin/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: configKey,
          content: payload,
          message: `feat: update ${configKey} via admin`,
        }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Save failed");
      }
      const result = await res.json();
      setMessage(result.message);

      const ciPollInterval = setInterval(async () => {
        try {
          const ciRes = await fetch("/api/admin/ci-status");
          if (!ciRes.ok) return;
          const ciData = await ciRes.json();
          if (ciData.status === "NOT_FOUND") {
            setCiMessage("CI: workflow run not found yet");
            return;
          }

          if (ciData.status === "queued" || ciData.status === "waiting") {
            setCiMessage(`CI #${ciData.runNumber ?? "?"}: queued...`);
            return;
          }

          if (ciData.status === "in_progress") {
            setCiMessage(`CI #${ciData.runNumber ?? "?"}: running...`);
            return;
          }

          if (ciData.status === "completed") {
            if (ciData.conclusion === "success") {
              setCiMessage(`CI #${ciData.runNumber ?? "?"}: passed`);
            } else {
              setCiMessage(
                `CI #${ciData.runNumber ?? "?"}: ${ciData.conclusion || "failed"}`
              );
            }
            clearInterval(ciPollInterval);
          }
        } catch {
          // keep save flow unaffected
        }
      }, 8000);

      setTimeout(() => clearInterval(ciPollInterval), 300000);

      if (result.deployId) {
        const pollInterval = setInterval(async () => {
          try {
            const statusRes = await fetch(
              `/api/admin/deploy-status?deployId=${result.deployId}`
            );
            if (!statusRes.ok) return;
            const statusData = await statusRes.json();
            if (statusData.status === "READY") {
              setMessage(`${configKey} saved and deployed`);
              clearInterval(pollInterval);
            } else if (
              statusData.status === "ERROR" ||
              statusData.status === "FAILED"
            ) {
              setMessage(`${configKey} saved, but auto-deploy failed`);
              clearInterval(pollInterval);
            } else {
              setMessage(`${configKey} saved. Deploying to Vercel...`);
            }
          } catch {
            // ignore polling errors
          }
        }, 5000);

        setTimeout(() => clearInterval(pollInterval), 180000);
      }
    } catch (e: any) {
      setError(`Save failed: ${e.message}`);
    } finally {
      setSaving(false);
    }
  }, [data, configKey, transformSave]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[color:var(--accent)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pl-64">
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-card px-6 py-3">
        <div>
          <Link
            href="/admin"
            className="mb-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to dashboard
          </Link>
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[color:var(--accent-hover)] disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save to GitHub
            </>
          )}
        </button>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-8">
        {description && (
          <p className="mb-6 text-sm text-muted-foreground">{description}</p>
        )}

        {message && (
          <div className="mb-6 rounded-xl border border-emerald-300/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            {message}
          </div>
        )}
        {ciMessage && (
          <div className="mb-6 rounded-xl border border-[color:var(--accent)]/40 bg-[color:var(--accent)]/10 px-4 py-3 text-sm text-[color:var(--accent-light)]">
            {ciMessage}
          </div>
        )}
        {error && (
          <div className="mb-6 rounded-xl border border-red-300/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {data && children(data, setData)}
      </div>
    </div>
  );
}
