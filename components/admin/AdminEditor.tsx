// components/admin/AdminEditor.tsx
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
  /** Optional transform before save */
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

  // Load data
  useEffect(() => {
    const url = loadUrl || `/api/admin/${configKey}`;
    fetch(url)
      .then(async (r) => {
        const body = await r.json().catch(() => ({}));
        if (!r.ok) {
          const msg = body?.error || `请求失败 (${r.status})`;
          throw new Error(msg);
        }
        const nextData = body?.config ?? body;
        if (!nextData || typeof nextData !== "object") {
          throw new Error("配置数据格式不正确");
        }
        setData(nextData);
      })
      .catch((e) => setError("加载失败: " + e.message))
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
        throw new Error(errData.error || "保存失败");
      }
      const result = await res.json();
      setMessage(result.message);

      // Poll latest GitHub Actions CI status after save push
      const ciPollInterval = setInterval(async () => {
        try {
          const ciRes = await fetch("/api/admin/ci-status");
          if (!ciRes.ok) {
            return;
          }
          const ciData = await ciRes.json();
          if (ciData.status === "NOT_FOUND") {
            setCiMessage("CI: 尚未检测到 workflow run");
            return;
          }

          if (ciData.status === "queued" || ciData.status === "waiting") {
            setCiMessage(
              `CI #${ciData.runNumber ?? "?"}: 排队中...`
            );
            return;
          }

          if (ciData.status === "in_progress") {
            setCiMessage(
              `CI #${ciData.runNumber ?? "?"}: 运行中...`
            );
            return;
          }

          if (ciData.status === "completed") {
            if (ciData.conclusion === "success") {
              setCiMessage(
                `CI #${ciData.runNumber ?? "?"}: 通过 ✅`
              );
            } else {
              setCiMessage(
                `CI #${ciData.runNumber ?? "?"}: ${ciData.conclusion || "失败"} ⚠️`
              );
            }
            clearInterval(ciPollInterval);
          }
        } catch {
          // Ignore CI polling errors to avoid blocking save UX
        }
      }, 8000);

      // Stop CI polling after 5 minutes
      setTimeout(() => clearInterval(ciPollInterval), 300000);

      // Poll deployment status if deployId was returned
      if (result.deployId) {
        const pollInterval = setInterval(async () => {
          try {
            const statusRes = await fetch(
              `/api/admin/deploy-status?deployId=${result.deployId}`
            );
            if (!statusRes.ok) return;
            const statusData = await statusRes.json();
            if (statusData.status === "READY") {
              setMessage(
                `${configKey} 配置已保存并部署完成 ✅`
              );
              clearInterval(pollInterval);
            } else if (
              statusData.status === "ERROR" ||
              statusData.status === "FAILED"
            ) {
              setMessage(
                `${configKey} 配置已保存，但自动部署失败 ⚠️`
              );
              clearInterval(pollInterval);
            } else {
              setMessage(
                `${configKey} 配置已保存并推送，正在自动部署到 Vercel...`
              );
            }
          } catch {
            // Ignore polling errors
          }
        }, 5000);

        // Stop polling after 3 minutes
        setTimeout(() => clearInterval(pollInterval), 180000);
      }
    } catch (e: any) {
      setError("保存失败: " + e.message);
    } finally {
      setSaving(false);
    }
  }, [data, configKey, transformSave]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pl-64">
      {/* Top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card px-6 py-3">
        <div>
          <Link
            href="/admin"
            className="mb-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" />
            返回仪表盘
          </Link>
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-amber-600 disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              保存中...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              保存到 GitHub
            </>
          )}
        </button>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-4xl px-6 py-8">
        {description && (
          <p className="mb-6 text-sm text-muted-foreground">{description}</p>
        )}

        {/* Messages */}
        {message && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
            {message}
          </div>
        )}
        {ciMessage && (
          <div className="mb-6 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700 dark:border-sky-800 dark:bg-sky-900/30 dark:text-sky-300">
            {ciMessage}
          </div>
        )}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}

        {data && children(data, setData)}
      </div>
    </div>
  );
}
