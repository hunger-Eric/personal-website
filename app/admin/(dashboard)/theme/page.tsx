"use client";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminEditor } from "@/components/admin/AdminEditor";
import { AdminPanel } from "@/components/system";
import { adminCopy } from "@/config/copy/admin";
import type { ThemeMode, AccentPreset } from "@/config/theme";

type ThemeData = Record<string, unknown> & {
  defaultMode?: ThemeMode;
  allowToggle?: boolean;
  respectSystemPreference?: boolean;
  accentColor?: string;
  presets?: Record<string, AccentPreset>;
};

const THEME_MODES: ThemeMode[] = ["light", "dark"];

export default function ThemeEditorPage() {
  const copy = adminCopy.theme;

  return (
    <div className="min-h-screen bg-background pl-64">
      <AdminSidebar />
      <main className="px-6 py-8">
        <AdminEditor<ThemeData>
          title={copy.title}
          description={copy.description}
          configKey="theme"
        >
          {(data, setData) => (
            <div className="space-y-6">
              <AdminPanel title={copy.displayModeTitle}>
                <div className="flex flex-wrap gap-4">
                  {THEME_MODES.map((mode) => (
                    <label
                      key={mode}
                      className={`flex cursor-pointer items-center gap-2 rounded-control border px-4 py-3 text-sm transition-colors ${
                        data.defaultMode === mode
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      <input
                        type="radio"
                        name="mode"
                        value={mode}
                        checked={data.defaultMode === mode}
                        onChange={() => setData({ ...data, defaultMode: mode })}
                        className="text-accent"
                      />
                      {mode === "light" ? copy.lightMode : copy.darkMode}
                    </label>
                  ))}
                </div>

                <div className="mt-4 space-y-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={data.allowToggle !== false}
                      onChange={(event) =>
                        setData({ ...data, allowToggle: event.target.checked })
                      }
                      className="h-4 w-4 rounded border-border text-accent"
                    />
                    {copy.allowToggle}
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={data.respectSystemPreference !== false}
                      onChange={(event) =>
                        setData({
                          ...data,
                          respectSystemPreference: event.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded border-border text-accent"
                    />
                    {copy.respectSystemPreference}
                  </label>
                </div>
              </AdminPanel>

              <AdminPanel title={copy.accentColorTitle}>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-7">
                  {Object.entries(data.presets ?? {}).map(([key, preset]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setData({ ...data, accentColor: key })}
                      className={`rounded-control border-2 p-3 text-center text-xs transition-colors ${
                        data.accentColor === key
                          ? "border-accent shadow-card"
                          : "border-transparent hover:border-border"
                      }`}
                    >
                      <span
                        className="mx-auto mb-1.5 block h-8 w-8 rounded-control"
                        style={{ backgroundColor: preset.accent }}
                      />
                      {copy.presetLabels[
                        key as keyof typeof copy.presetLabels
                      ] || key}
                    </button>
                  ))}
                </div>
              </AdminPanel>
            </div>
          )}
        </AdminEditor>
      </main>
    </div>
  );
}
