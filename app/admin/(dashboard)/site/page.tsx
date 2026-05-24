// app/admin/site/page.tsx
"use client";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminEditor } from "@/components/admin/AdminEditor";

export default function SiteEditorPage() {
  return (
    <div className="min-h-screen bg-background pl-64">
      <AdminSidebar />
      <AdminEditor
        title="站点设置"
        description="修改站点名称、标题、简介、社交链接等全局信息"
        configKey="site"
      >
        {(data, setData) => (
          <div className="space-y-6">
            {/* Identity */}
            <section className="rounded-2xl border border-border bg-card p-5">
              <h2 className="mb-4 text-sm font-semibold">基本信息</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="站点名称" value={data.name} onChange={(v) => setData({ ...data, name: v })} />
                <Field label="头衔" value={data.title} onChange={(v) => setData({ ...data, title: v })} />
                <Field label="标语" value={data.tagline} onChange={(v) => setData({ ...data, tagline: v })} className="sm:col-span-2" />
                <Field label="位置" value={data.location} onChange={(v) => setData({ ...data, location: v })} />
                <Field label="基础 URL" value={data.baseUrl} onChange={(v) => setData({ ...data, baseUrl: v })} />
              </div>
            </section>

            {/* Socials */}
            <section className="rounded-2xl border border-border bg-card p-5">
              <h2 className="mb-4 text-sm font-semibold">社交链接</h2>
              {Array.isArray(data.socials) && (
                <div className="space-y-3">
                  {data.socials.map((s: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
                      <span className="w-20 text-xs font-medium text-muted-foreground">{s.key}</span>
                      <input
                        value={s.label || ""}
                        onChange={(e) => {
                          const newSocials = [...data.socials];
                          newSocials[i] = { ...s, label: e.target.value };
                          setData({ ...data, socials: newSocials });
                        }}
                        placeholder="显示名称"
                        className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-amber-400"
                      />
                      <input
                        value={s.href || ""}
                        onChange={(e) => {
                          const newSocials = [...data.socials];
                          newSocials[i] = { ...s, href: e.target.value };
                          setData({ ...data, socials: newSocials });
                        }}
                        placeholder="链接 URL"
                        className="flex-[2] rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-amber-400"
                      />
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Sections Toggle */}
            <section className="rounded-2xl border border-border bg-card p-5">
              <h2 className="mb-4 text-sm font-semibold">页面板块开关</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {data.sections &&
                  Object.entries(data.sections).map(([key, val]) => (
                    <label
                      key={key}
                      className="flex cursor-pointer items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm hover:bg-muted/50"
                    >
                      <input
                        type="checkbox"
                        checked={!!val}
                        onChange={(e) =>
                          setData({
                            ...data,
                            sections: { ...data.sections, [key]: e.target.checked },
                          })
                        }
                        className="h-4 w-4 rounded border-border text-amber-500 focus:ring-amber-400"
                      />
                      {key}
                    </label>
                  ))}
              </div>
            </section>
          </div>
        )}
      </AdminEditor>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <label className={className}>
      <span className="mb-1 block text-xs font-medium text-muted-foreground">
        {label}
      </span>
      <input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
      />
    </label>
  );
}