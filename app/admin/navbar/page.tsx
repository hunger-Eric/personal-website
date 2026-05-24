// app/admin/navbar/page.tsx
"use client";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminEditor } from "@/components/admin/AdminEditor";

export default function NavbarEditorPage() {
  return (
    <div className="min-h-screen bg-background pl-64">
      <AdminSidebar />
      <AdminEditor
        title="导航栏"
        description="编辑顶部导航菜单项、下拉菜单和 CTA 按钮"
        configKey="navbar"
      >
        {(data, setData) => (
          <div className="space-y-6">
            {/* Logo */}
            <section className="rounded-2xl border border-border bg-card p-5">
              <h2 className="mb-4 text-sm font-semibold">Logo</h2>
              <div className="flex items-center gap-3">
                <label className="flex-1">
                  <span className="mb-1 block text-xs text-muted-foreground">显示文字</span>
                  <input
                    value={data.logo?.label || ""}
                    onChange={(e) =>
                      setData({
                        ...data,
                        logo: { ...data.logo, label: e.target.value },
                      })
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-amber-400"
                  />
                </label>
                <label className="flex-1">
                  <span className="mb-1 block text-xs text-muted-foreground">链接到</span>
                  <input
                    value={data.logo?.href || ""}
                    onChange={(e) =>
                      setData({
                        ...data,
                        logo: { ...data.logo, href: e.target.value },
                      })
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-amber-400"
                  />
                </label>
              </div>
            </section>

            {/* Menu items */}
            <section className="rounded-2xl border border-border bg-card p-5">
              <h2 className="mb-4 text-sm font-semibold">菜单项</h2>
              {data.center?.items?.map((item: any, i: number) => (
                <div key={i} className="mb-3 rounded-xl border border-border bg-muted/30 p-4">
                  <div className="flex items-center gap-3">
                    <input
                      value={item.label}
                      onChange={(e) => {
                        const newItems = [...data.center.items];
                        newItems[i] = { ...item, label: e.target.value };
                        setData({ ...data, center: { ...data.center, items: newItems } });
                      }}
                      className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-amber-400"
                    />
                    <input
                      value={item.href}
                      onChange={(e) => {
                        const newItems = [...data.center.items];
                        newItems[i] = { ...item, href: e.target.value };
                        setData({ ...data, center: { ...data.center, items: newItems } });
                      }}
                      className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-amber-400"
                    />
                    <label className="flex items-center gap-1 text-xs text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={item.show !== false}
                        onChange={(e) => {
                          const newItems = [...data.center.items];
                          newItems[i] = { ...item, show: e.target.checked };
                          setData({ ...data, center: { ...data.center, items: newItems } });
                        }}
                        className="h-3.5 w-3.5"
                      />
                      显示
                    </label>
                  </div>

                  {/* Dropdown children */}
                  {item.children && (
                    <div className="mt-3 space-y-2 pl-4 border-l-2 border-border">
                      {item.children.map((child: any, j: number) => (
                        <div key={j} className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-4">{j + 1}</span>
                          <input
                            value={child.label}
                            onChange={(e) => {
                              const newItems = [...data.center.items];
                              newItems[i] = {
                                ...item,
                                children: item.children.map((c: any, k: number) =>
                                  k === j ? { ...c, label: e.target.value } : c
                                ),
                              };
                              setData({ ...data, center: { ...data.center, items: newItems } });
                            }}
                            className="flex-1 rounded-lg border border-border bg-background px-2.5 py-1 text-sm outline-none focus:border-amber-400"
                          />
                          <input
                            value={child.href}
                            onChange={(e) => {
                              const newItems = [...data.center.items];
                              newItems[i] = {
                                ...item,
                                children: item.children.map((c: any, k: number) =>
                                  k === j ? { ...c, href: e.target.value } : c
                                ),
                              };
                              setData({ ...data, center: { ...data.center, items: newItems } });
                            }}
                            className="flex-1 rounded-lg border border-border bg-background px-2.5 py-1 text-sm outline-none focus:border-amber-400"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </section>

            {/* CTA */}
            <section className="rounded-2xl border border-border bg-card p-5">
              <h2 className="mb-4 text-sm font-semibold">CTA 按钮</h2>
              {data.cta?.primary && (
                <div className="flex items-center gap-3">
                  <label className="flex-1">
                    <span className="mb-1 block text-xs text-muted-foreground">文字</span>
                    <input
                      value={data.cta.primary.label}
                      onChange={(e) =>
                        setData({
                          ...data,
                          cta: { ...data.cta, primary: { ...data.cta.primary, label: e.target.value } },
                        })
                      }
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-amber-400"
                    />
                  </label>
                  <label className="flex-1">
                    <span className="mb-1 block text-xs text-muted-foreground">链接</span>
                    <input
                      value={data.cta.primary.href}
                      onChange={(e) =>
                        setData({
                          ...data,
                          cta: { ...data.cta, primary: { ...data.cta.primary, href: e.target.value } },
                        })
                      }
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-amber-400"
                    />
                  </label>
                  <label className="flex items-center gap-1 pt-5 text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={data.cta.primary.show !== false}
                      onChange={(e) =>
                        setData({
                          ...data,
                          cta: { ...data.cta, primary: { ...data.cta.primary, show: e.target.checked } },
                        })
                      }
                      className="h-3.5 w-3.5"
                    />
                    显示
                  </label>
                </div>
              )}
            </section>
          </div>
        )}
      </AdminEditor>
    </div>
  );
}