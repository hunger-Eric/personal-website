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

  // Load data
  useEffect(() => {
    const url = loadUrl || `/api/admin/${configKey}`;
    fetch(url)
      .then((r) => r.json())
      .then((d) => setData(d.config || d))
      .catch((e) => setError("加载失败: " + e.message))
      .finally(() => setLoading(false));
  }, [configKey, loadUrl]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setMessage(null);
    setError(null);

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