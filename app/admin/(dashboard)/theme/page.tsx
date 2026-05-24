// app/admin/theme/page.tsx
"use client";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminEditor } from "@/components/admin/AdminEditor";

const PRESET_LABELS: Record<string, string> = {
  indigo: "靛蓝",
  emerald: "翡翠绿",
  rose: "玫瑰红",
  amber: "琥珀",
  cyan: "青色",
  violet: "紫罗兰",
  sky: "天蓝",
};

export default function ThemeEditorPage() {
  return (
    <div className="min-h-screen bg-background pl-64">
      <AdminSidebar />
      <AdminEditor
        title="主题配色"
        description="切换配色方案、调整明暗模式设置"
        configKey="theme"
      >
        {(data, setData) => (
          <div className="space-y-6">
            {/* Mode */}
            <section className="rounded-2xl border border-border bg-card p-5">
              <h2 className="mb-4 text-sm font-semibold">显示模式</h2>
              <div className="flex gap-4">
                {["light", "dark"].map((mode) => (
                  <label
                    key={mode}
                    className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 text-sm transition-all ${
                      data.defaultMode === mode
                        ? "border-amber-300 bg-amber-50 font-medium dark:bg-amber-900/30"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    <input
                      type="radio"
                      name="mode"
                      value={mode}
                      checked={data.defaultMode === mode}
                      onChange={() => setData({ ...data, defaultMode: mode })}
                      className="text-amber-500 focus:ring-amber-400"
                    />
                    {mode === "light" ? "浅色" : "深色"}
                  </label>
                ))}
              </div>
              <div className="mt-4 space-y-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={data.allowToggle !== false}
                    onChange={(e) => setData({ ...data, allowToggle: e.target.checked })}
                    className="h-4 w-4 rounded border-border text-amber-500"
                  />
                  允许用户切换主题
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={data.respectSystemPreference !== false}
                    onChange={(e) => setData({ ...data, respectSystemPreference: e.target.checked })}
                    className="h-4 w-4 rounded border-border text-amber-500"
                  />
                  跟随系统偏好
                </label>
              </div>
            </section>

            {/* Accent color */}
            <section className="rounded-2xl border border-border bg-card p-5">
              <h2 className="mb-4 text-sm font-semibold">强调色</h2>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-7">
                {data.presets &&
                  Object.entries(data.presets).map(([key, preset]: [string, any]) => (
                    <button
                      key={key}
                      onClick={() => setData({ ...data, accentColor: key })}
                      className={`rounded-xl border-2 p-3 text-center text-xs transition-all ${
                        data.accentColor === key
                          ? "border-amber-400 shadow-md"
                          : "border-transparent hover:border-border"
                      }`}
                    >
                      <div
                        className="mx-auto mb-1.5 h-8 w-8 rounded-lg"
                        style={{ backgroundColor: preset.accent }}
                      />
                      {PRESET_LABELS[key] || key}
                    </button>
                  ))}
              </div>
            </section>
          </div>
        )}
      </AdminEditor>
    </div>
  );
}