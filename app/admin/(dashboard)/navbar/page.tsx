"use client";

import { Plus, Trash2 } from "lucide-react";

import { AdminEditor } from "@/components/admin/AdminEditor";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ActionButton, AdminPanel, EmptyState, FormField, IconButton } from "@/components/system";
import { adminCopy } from "@/config/copy/admin";

type NavLink = {
  id?: string;
  label?: string;
  href?: string;
  show?: boolean;
  external?: boolean;
  children?: NavLink[];
};

type NavbarData = Record<string, unknown> & {
  logo?: {
    label?: string;
    href?: string;
    imageSrc?: string;
    imageAlt?: string;
  };
  center?: {
    items?: NavLink[];
  };
  cta?: {
    primary?: NavLink;
    contact?: NavLink;
  };
};

function fieldClassName(extra = "") {
  return [
    "w-full rounded-control border border-border bg-background px-3 py-2 text-sm outline-none",
    "focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:opacity-50",
    extra,
  ]
    .filter(Boolean)
    .join(" ");
}

function toggleClassName() {
  return [
    "flex cursor-pointer items-center gap-2 rounded-control border border-border px-3 py-2 text-sm",
    "text-muted-foreground transition-colors hover:bg-muted",
  ].join(" ");
}

function createMenuItem(): NavLink {
  return {
    id: `nav-${Date.now()}`,
    label: "",
    href: "/",
    show: true,
  };
}

function createChildItem(): NavLink {
  return {
    label: "",
    href: "/",
    show: true,
  };
}

function getMenuItems(data: NavbarData): NavLink[] {
  return data.center?.items ?? [];
}

function updateMenuItems(data: NavbarData, items: NavLink[]): NavbarData {
  return {
    ...data,
    center: {
      ...(data.center ?? {}),
      items,
    },
  };
}

function updateItem(
  data: NavbarData,
  index: number,
  updates: Partial<NavLink>
): NavbarData {
  const items = [...getMenuItems(data)];
  items[index] = { ...items[index], ...updates };
  return updateMenuItems(data, items);
}

function removeItem(data: NavbarData, index: number): NavbarData {
  return updateMenuItems(
    data,
    getMenuItems(data).filter((_, itemIndex) => itemIndex !== index)
  );
}

function addChild(data: NavbarData, index: number): NavbarData {
  const items = [...getMenuItems(data)];
  const item = items[index] ?? {};
  items[index] = {
    ...item,
    children: [...(item.children ?? []), createChildItem()],
  };
  return updateMenuItems(data, items);
}

function updateChild(
  data: NavbarData,
  itemIndex: number,
  childIndex: number,
  updates: Partial<NavLink>
): NavbarData {
  const items = [...getMenuItems(data)];
  const item = items[itemIndex] ?? {};
  const children = [...(item.children ?? [])];
  children[childIndex] = { ...children[childIndex], ...updates };
  items[itemIndex] = { ...item, children };
  return updateMenuItems(data, items);
}

function removeChild(
  data: NavbarData,
  itemIndex: number,
  childIndex: number
): NavbarData {
  const items = [...getMenuItems(data)];
  const item = items[itemIndex] ?? {};
  const children = (item.children ?? []).filter(
    (_, currentIndex) => currentIndex !== childIndex
  );
  items[itemIndex] = {
    ...item,
    children: children.length > 0 ? children : undefined,
  };
  return updateMenuItems(data, items);
}

export default function NavbarEditorPage() {
  const copy = adminCopy.navbar;

  return (
    <div className="min-h-screen bg-background pl-64">
      <AdminSidebar />
      <main className="px-6 py-8">
        <AdminEditor<NavbarData>
          title={copy.title}
          description={copy.description}
          configKey="navbar"
        >
          {(data, setData) => {
            const menuItems = getMenuItems(data);

            return (
              <div className="space-y-6">
                <AdminPanel
                  title={copy.logoTitle}
                  description={copy.logoDescription}
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField label={copy.logoLabel}>
                      <input
                        value={data.logo?.label || ""}
                        onChange={(event) =>
                          setData({
                            ...data,
                            logo: {
                              ...(data.logo ?? {}),
                              label: event.target.value,
                            },
                          })
                        }
                        className={fieldClassName()}
                      />
                    </FormField>
                    <FormField label={copy.logoHref}>
                      <input
                        value={data.logo?.href || ""}
                        onChange={(event) =>
                          setData({
                            ...data,
                            logo: {
                              ...(data.logo ?? {}),
                              href: event.target.value,
                            },
                          })
                        }
                        className={fieldClassName()}
                      />
                    </FormField>
                  </div>
                </AdminPanel>

                <AdminPanel
                  title={copy.menuTitle}
                  description={copy.menuDescription}
                  actions={
                    <ActionButton
                      type="button"
                      tone="secondary"
                      icon={<Plus className="h-4 w-4" />}
                      onClick={() =>
                        setData(updateMenuItems(data, [...menuItems, createMenuItem()]))
                      }
                    >
                      {copy.addItem}
                    </ActionButton>
                  }
                >
                  {menuItems.length > 0 ? (
                    <div className="space-y-4">
                      {menuItems.map((item, index) => (
                        <div
                          key={item.id || `${item.label}-${index}`}
                          className="rounded-card border border-border bg-muted/30 p-4"
                        >
                          <div className="grid gap-3 lg:grid-cols-[1fr_1fr_auto_auto]">
                            <input
                              value={item.label || ""}
                              onChange={(event) =>
                                setData(updateItem(data, index, { label: event.target.value }))
                              }
                              placeholder={copy.itemLabel}
                              className={fieldClassName("py-1.5")}
                            />
                            <input
                              value={item.href || ""}
                              onChange={(event) =>
                                setData(updateItem(data, index, { href: event.target.value }))
                              }
                              placeholder={copy.itemHref}
                              className={fieldClassName("py-1.5")}
                            />
                            <label className={toggleClassName()}>
                              <input
                                type="checkbox"
                                checked={item.show !== false}
                                onChange={(event) =>
                                  setData(
                                    updateItem(data, index, { show: event.target.checked })
                                  )
                                }
                                className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
                              />
                              {copy.showItem}
                            </label>
                            <IconButton
                              icon={<Trash2 className="h-4 w-4" />}
                              label={copy.removeItem}
                              onClick={() => setData(removeItem(data, index))}
                            />
                          </div>

                          <div className="mt-4 border-l border-border pl-4">
                            <div className="mb-3 flex justify-end">
                              <ActionButton
                                type="button"
                                tone="ghost"
                                icon={<Plus className="h-4 w-4" />}
                                onClick={() => setData(addChild(data, index))}
                              >
                                {copy.addChild}
                              </ActionButton>
                            </div>

                            {(item.children ?? []).length > 0 ? (
                              <div className="space-y-2">
                                {(item.children ?? []).map((child, childIndex) => (
                                  <div
                                    key={`${child.label}-${childIndex}`}
                                    className="grid gap-2 sm:grid-cols-[1rem_1fr_1fr_auto]"
                                  >
                                    <span className="pt-2 text-xs text-muted-foreground">
                                      {childIndex + 1}
                                    </span>
                                    <input
                                      value={child.label || ""}
                                      onChange={(event) =>
                                        setData(
                                          updateChild(data, index, childIndex, {
                                            label: event.target.value,
                                          })
                                        )
                                      }
                                      placeholder={copy.childLabel}
                                      className={fieldClassName("py-1")}
                                    />
                                    <input
                                      value={child.href || ""}
                                      onChange={(event) =>
                                        setData(
                                          updateChild(data, index, childIndex, {
                                            href: event.target.value,
                                          })
                                        )
                                      }
                                      placeholder={copy.childHref}
                                      className={fieldClassName("py-1")}
                                    />
                                    <IconButton
                                      icon={<Trash2 className="h-4 w-4" />}
                                      label={copy.removeChild}
                                      className="h-9 w-9"
                                      onClick={() =>
                                        setData(removeChild(data, index, childIndex))
                                      }
                                    />
                                  </div>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState title={copy.noItems} />
                  )}
                </AdminPanel>

                {data.cta?.primary ? (
                  <AdminPanel
                    title={copy.ctaTitle}
                    description={copy.ctaDescription}
                  >
                    <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
                      <FormField label={copy.ctaLabel}>
                        <input
                          value={data.cta.primary.label || ""}
                          onChange={(event) =>
                            setData({
                              ...data,
                              cta: {
                                ...data.cta,
                                primary: {
                                  ...data.cta?.primary,
                                  label: event.target.value,
                                },
                              },
                            })
                          }
                          className={fieldClassName()}
                        />
                      </FormField>
                      <FormField label={copy.ctaHref}>
                        <input
                          value={data.cta.primary.href || ""}
                          onChange={(event) =>
                            setData({
                              ...data,
                              cta: {
                                ...data.cta,
                                primary: {
                                  ...data.cta?.primary,
                                  href: event.target.value,
                                },
                              },
                            })
                          }
                          className={fieldClassName()}
                        />
                      </FormField>
                      <label className={`${toggleClassName()} self-end`}>
                        <input
                          type="checkbox"
                          checked={data.cta.primary.show !== false}
                          onChange={(event) =>
                            setData({
                              ...data,
                              cta: {
                                ...data.cta,
                                primary: {
                                  ...data.cta?.primary,
                                  show: event.target.checked,
                                },
                              },
                            })
                          }
                          className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
                        />
                        {copy.showItem}
                      </label>
                    </div>
                  </AdminPanel>
                ) : null}
              </div>
            );
          }}
        </AdminEditor>
      </main>
    </div>
  );
}
