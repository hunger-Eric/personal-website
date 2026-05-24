"use client";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminEditor } from "@/components/admin/AdminEditor";

const PRESET_LABELS: Record<string, string> = {
  indigo: "Indigo",
  emerald: "Emerald",
  rose: "Rose",
  amber: "Amber",
  cyan: "Cyan",
  violet: "Violet",
  sky: "Sky",
};

export default function ThemeEditorPage() {
  return (
    <div className="min-h-screen bg-background pl-64">
      <AdminSidebar />
      <AdminEditor
        title="Theme"
        description="Choose your accent palette and default theme mode."
        configKey="theme"
      >
        {(data, setData) => (
          <div className="space-y-6">
            <section className="rounded-2xl border border-white/10 bg-card p-5">
              <h2 className="mb-4 text-sm font-semibold">Display Mode</h2>
              <div className="flex gap-4">
                {["light", "dark"].map((mode) => (
                  <label
                    key={mode}
                    className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 text-sm transition-all ${
                      data.defaultMode === mode
                        ? "border-[color:var(--accent)] bg-[color:var(--accent)]/10 text-[color:var(--accent-light)]"
                        : "border-white/10 hover:bg-white/5"
                    }`}
                  >
                    <input
                      type="radio"
                      name="mode"
                      value={mode}
                      checked={data.defaultMode === mode}
                      onChange={() => setData({ ...data, defaultMode: mode })}
                      className="text-[color:var(--accent)]"
                    />
                    {mode === "light" ? "Light" : "Dark"}
                  </label>
                ))}
              </div>
              <div className="mt-4 space-y-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={data.allowToggle !== false}
                    onChange={(e) =>
                      setData({ ...data, allowToggle: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-white/20 text-[color:var(--accent)]"
                  />
                  Allow users to toggle theme
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={data.respectSystemPreference !== false}
                    onChange={(e) =>
                      setData({
                        ...data,
                        respectSystemPreference: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded border-white/20 text-[color:var(--accent)]"
                  />
                  Respect system preference
                </label>
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-card p-5">
              <h2 className="mb-4 text-sm font-semibold">Accent Color</h2>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-7">
                {data.presets &&
                  Object.entries(data.presets).map(([key, preset]: [string, any]) => (
                    <button
                      key={key}
                      onClick={() => setData({ ...data, accentColor: key })}
                      className={`rounded-xl border-2 p-3 text-center text-xs transition-all ${
                        data.accentColor === key
                          ? "border-[color:var(--accent)] shadow-md"
                          : "border-transparent hover:border-white/20"
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
