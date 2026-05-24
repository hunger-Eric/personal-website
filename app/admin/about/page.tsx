// app/admin/about/page.tsx
"use client";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminEditor } from "@/components/admin/AdminEditor";

export default function AboutEditorPage() {
  return (
    <div className="min-h-screen bg-background pl-64">
      <AdminSidebar />
      <AdminEditor
        title="关于我"
        description="编辑个人简介、技术栈、个人故事和其他展示内容"
        configKey="about"
      >
        {(data, setData) => (
          <div className="space-y-6">
            {/* Basic info */}
            <section className="rounded-2xl border border-border bg-card p-5">
              <h2 className="mb-4 text-sm font-semibold">个人信息</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="显示名称" value={data.displayName} onChange={(v) => setData({ ...data, displayName: v })} />
                <Field label="GitHub ID" value={data.handle} onChange={(v) => setData({ ...data, handle: v })} />
                <Field label="角色标签" value={data.roleLine} onChange={(v) => setData({ ...data, roleLine: v })} className="sm:col-span-2" />
              </div>
            </section>

            {/* README / Bio */}
            <section className="rounded-2xl border border-border bg-card p-5">
              <h2 className="mb-4 text-sm font-semibold">个人简介 (README)</h2>
              {Array.isArray(data.readme) && (
                <div className="space-y-3">
                  {data.readme.map((p: string, i: number) => (
                    <textarea
                      key={i}
                      value={p}
                      onChange={(e) => {
                        const newReadme = [...data.readme];
                        newReadme[i] = e.target.value;
                        setData({ ...data, readme: newReadme });
                      }}
                      rows={3}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-amber-400"
                    />
                  ))}
                  {data.afterTechParagraph && (
                    <div>
                      <span className="mb-1 block text-xs text-muted-foreground">技术栈后简介</span>
                      <textarea
                        value={data.afterTechParagraph}
                        onChange={(e) => setData({ ...data, afterTechParagraph: e.target.value })}
                        rows={2}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-amber-400"
                      />
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Tech used */}
            <section className="rounded-2xl border border-border bg-card p-5">
              <h2 className="mb-4 text-sm font-semibold">技术栈</h2>
              {Array.isArray(data.techUsed) && (
                <div className="flex flex-wrap gap-2">
                  {data.techUsed.map((tech: string, i: number) => (
                    <div key={i} className="inline-flex items-center gap-1 rounded-xl bg-muted px-3 py-1.5 text-sm">
                      {tech}
                      <button
                        onClick={() => setData({ ...data, techUsed: data.techUsed.filter((_: any, j: number) => j !== i) })}
                        className="ml-1 text-muted-foreground hover:text-red-500"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <input
                    placeholder="添加技术..."
                    className="rounded-xl border border-dashed border-border bg-transparent px-3 py-1.5 text-sm outline-none focus:border-amber-400"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.currentTarget.value.trim()) {
                        setData({ ...data, techUsed: [...data.techUsed, e.currentTarget.value.trim()] });
                        e.currentTarget.value = "";
                      }
                    }}
                  />
                </div>
              )}
            </section>

            {/* CTA section */}
            <section className="rounded-2xl border border-border bg-card p-5">
              <h2 className="mb-4 text-sm font-semibold">CTA 按钮</h2>
              {data.cta?.primary && (
                <div className="flex items-center gap-3">
                  <Field label="按钮文字" value={data.cta.primary.label} onChange={(v) => setData({ ...data, cta: { ...data.cta, primary: { ...data.cta.primary, label: v } } })} />
                  <Field label="链接" value={data.cta.primary.href} onChange={(v) => setData({ ...data, cta: { ...data.cta, primary: { ...data.cta.primary, href: v } } })} />
                </div>
              )}
              {data.cta?.secondary && (
                <div className="mt-3 flex items-center gap-3">
                  <Field label="次按钮文字" value={data.cta.secondary.label} onChange={(v) => setData({ ...data, cta: { ...data.cta, secondary: { ...data.cta.secondary, label: v } } })} />
                  <Field label="链接" value={data.cta.secondary.href} onChange={(v) => setData({ ...data, cta: { ...data.cta, secondary: { ...data.cta.secondary, href: v } } })} />
                </div>
              )}
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