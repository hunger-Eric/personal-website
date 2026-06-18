"use client";

import { Plus, Trash2 } from "lucide-react";

import { AdminEditor } from "@/components/admin/AdminEditor";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ActionButton, AdminPanel, FormField, IconButton } from "@/components/system";
import { adminCopy } from "@/config/copy/admin";

type LocaleKey = "zh" | "en";

type AboutCta = {
  label?: string;
  href?: string;
  external?: boolean;
};

type LocalizedAbout = {
  roleLine?: string;
  cta?: {
    primary?: AboutCta;
    secondary?: AboutCta;
  };
  readme?: {
    fileLabel?: string;
    paragraphs?: string[];
    afterTechParagraph?: string;
  };
};

type AboutData = Record<string, unknown> & {
  handle?: string;
  displayName?: string;
  avatarUrl?: string;
  techUsed?: string[];
  zh?: LocalizedAbout;
  en?: LocalizedAbout;
};

const locales: LocaleKey[] = ["zh", "en"];

function fieldClassName(extra = "") {
  return [
    "w-full rounded-control border border-border bg-background px-3 py-2 text-sm outline-none",
    "focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:opacity-50",
    extra,
  ]
    .filter(Boolean)
    .join(" ");
}

function updateLocale(
  data: AboutData,
  locale: LocaleKey,
  updater: (current: LocalizedAbout) => LocalizedAbout
): AboutData {
  return {
    ...data,
    [locale]: updater(data[locale] ?? {}),
  };
}

function updateReadmeParagraph(
  data: AboutData,
  locale: LocaleKey,
  index: number,
  value: string
): AboutData {
  return updateLocale(data, locale, (current) => {
    const readme = current.readme ?? {};
    const paragraphs = [...(readme.paragraphs ?? [])];
    paragraphs[index] = value;
    return {
      ...current,
      readme: {
        ...readme,
        paragraphs,
      },
    };
  });
}

function removeReadmeParagraph(
  data: AboutData,
  locale: LocaleKey,
  index: number
): AboutData {
  return updateLocale(data, locale, (current) => {
    const readme = current.readme ?? {};
    return {
      ...current,
      readme: {
        ...readme,
        paragraphs: (readme.paragraphs ?? []).filter(
          (_, paragraphIndex) => paragraphIndex !== index
        ),
      },
    };
  });
}

function addReadmeParagraph(data: AboutData, locale: LocaleKey): AboutData {
  return updateLocale(data, locale, (current) => {
    const readme = current.readme ?? {};
    return {
      ...current,
      readme: {
        ...readme,
        paragraphs: [...(readme.paragraphs ?? []), ""],
      },
    };
  });
}

function updateCta(
  data: AboutData,
  locale: LocaleKey,
  slot: "primary" | "secondary",
  updates: Partial<AboutCta>
): AboutData {
  return updateLocale(data, locale, (current) => ({
    ...current,
    cta: {
      ...(current.cta ?? {}),
      [slot]: {
        ...(current.cta?.[slot] ?? {}),
        ...updates,
      },
    },
  }));
}

function updateTech(data: AboutData, items: string[]): AboutData {
  return {
    ...data,
    techUsed: items,
  };
}

export default function AboutEditorPage() {
  const copy = adminCopy.about;

  return (
    <div className="min-h-screen bg-background pl-64">
      <AdminSidebar />
      <main className="px-6 py-8">
        <AdminEditor<AboutData>
          title={copy.title}
          description={copy.description}
          configKey="about"
        >
          {(data, setData) => (
            <div className="space-y-6">
              <AdminPanel
                title={copy.profileTitle}
                description={copy.profileDescription}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label={copy.displayNameLabel}>
                    <input
                      value={data.displayName || ""}
                      onChange={(event) =>
                        setData({ ...data, displayName: event.target.value })
                      }
                      className={fieldClassName()}
                    />
                  </FormField>
                  <FormField label={copy.handleLabel}>
                    <input
                      value={data.handle || ""}
                      onChange={(event) =>
                        setData({ ...data, handle: event.target.value })
                      }
                      className={fieldClassName()}
                    />
                  </FormField>
                  <FormField label={copy.avatarLabel} className="sm:col-span-2">
                    <input
                      value={data.avatarUrl || ""}
                      onChange={(event) =>
                        setData({ ...data, avatarUrl: event.target.value })
                      }
                      className={fieldClassName()}
                    />
                  </FormField>
                </div>
              </AdminPanel>

              <AdminPanel
                title={copy.localizedTitle}
                description={copy.localizedDescription}
              >
                <div className="space-y-5">
                  {locales.map((locale) => {
                    const localeData = data[locale] ?? {};
                    const readme = localeData.readme ?? {};
                    const paragraphs = readme.paragraphs ?? [];

                    return (
                      <section
                        key={locale}
                        className="rounded-card border border-border bg-muted/30 p-4"
                      >
                        <h3 className="text-sm font-semibold text-foreground">
                          {copy.localeLabels[locale]}
                        </h3>

                        <div className="mt-4 space-y-4">
                          <FormField label={copy.roleLineLabel}>
                            <input
                              value={localeData.roleLine || ""}
                              onChange={(event) =>
                                setData(
                                  updateLocale(data, locale, (current) => ({
                                    ...current,
                                    roleLine: event.target.value,
                                  }))
                                )
                              }
                              className={fieldClassName()}
                            />
                          </FormField>

                          <div>
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                              <h4 className="text-sm font-semibold text-foreground">
                                {copy.readmeTitle}
                              </h4>
                              <ActionButton
                                type="button"
                                tone="ghost"
                                icon={<Plus className="h-4 w-4" />}
                                onClick={() =>
                                  setData(addReadmeParagraph(data, locale))
                                }
                              >
                                {copy.addParagraph}
                              </ActionButton>
                            </div>
                            <div className="space-y-3">
                              {paragraphs.map((paragraph, index) => (
                                <div
                                  key={`${locale}-paragraph-${index}`}
                                  className="grid gap-2 sm:grid-cols-[1fr_auto]"
                                >
                                  <textarea
                                    value={paragraph}
                                    rows={3}
                                    onChange={(event) =>
                                      setData(
                                        updateReadmeParagraph(
                                          data,
                                          locale,
                                          index,
                                          event.target.value
                                        )
                                      )
                                    }
                                    className={fieldClassName("min-h-24")}
                                  />
                                  <IconButton
                                    icon={<Trash2 className="h-4 w-4" />}
                                    label={copy.removeParagraph}
                                    onClick={() =>
                                      setData(
                                        removeReadmeParagraph(data, locale, index)
                                      )
                                    }
                                  />
                                </div>
                              ))}
                            </div>
                          </div>

                          <FormField label={copy.afterTechLabel}>
                            <textarea
                              value={readme.afterTechParagraph || ""}
                              rows={2}
                              onChange={(event) =>
                                setData(
                                  updateLocale(data, locale, (current) => ({
                                    ...current,
                                    readme: {
                                      ...(current.readme ?? {}),
                                      afterTechParagraph: event.target.value,
                                    },
                                  }))
                                )
                              }
                              className={fieldClassName("min-h-20")}
                            />
                          </FormField>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <FormField label={copy.primaryLabel}>
                              <input
                                value={localeData.cta?.primary?.label || ""}
                                onChange={(event) =>
                                  setData(
                                    updateCta(data, locale, "primary", {
                                      label: event.target.value,
                                    })
                                  )
                                }
                                className={fieldClassName()}
                              />
                            </FormField>
                            <FormField label={copy.primaryHref}>
                              <input
                                value={localeData.cta?.primary?.href || ""}
                                onChange={(event) =>
                                  setData(
                                    updateCta(data, locale, "primary", {
                                      href: event.target.value,
                                    })
                                  )
                                }
                                className={fieldClassName()}
                              />
                            </FormField>
                            <FormField label={copy.secondaryLabel}>
                              <input
                                value={localeData.cta?.secondary?.label || ""}
                                onChange={(event) =>
                                  setData(
                                    updateCta(data, locale, "secondary", {
                                      label: event.target.value,
                                    })
                                  )
                                }
                                className={fieldClassName()}
                              />
                            </FormField>
                            <FormField label={copy.secondaryHref}>
                              <input
                                value={localeData.cta?.secondary?.href || ""}
                                onChange={(event) =>
                                  setData(
                                    updateCta(data, locale, "secondary", {
                                      href: event.target.value,
                                    })
                                  )
                                }
                                className={fieldClassName()}
                              />
                            </FormField>
                          </div>
                        </div>
                      </section>
                    );
                  })}
                </div>
              </AdminPanel>

              <AdminPanel
                title={copy.techTitle}
                description={copy.techDescription}
              >
                <div className="flex flex-wrap gap-2">
                  {(data.techUsed ?? []).map((tech, index) => (
                    <span
                      key={`${tech}-${index}`}
                      className="inline-flex items-center gap-2 rounded-control border border-border bg-surface-paper px-3 py-1.5 text-sm"
                    >
                      {tech}
                      <button
                        type="button"
                        className="text-muted-foreground transition-colors hover:text-destructive"
                        onClick={() =>
                          setData(
                            updateTech(
                              data,
                              (data.techUsed ?? []).filter(
                                (_, itemIndex) => itemIndex !== index
                              )
                            )
                          )
                        }
                      >
                        <span className="sr-only">{copy.removeTech}</span>
                        x
                      </button>
                    </span>
                  ))}
                  <input
                    placeholder={copy.addTechPlaceholder}
                    className={fieldClassName(
                      "w-auto min-w-36 border-dashed bg-transparent py-1.5"
                    )}
                    onKeyDown={(event) => {
                      if (event.key !== "Enter") return;
                      const value = event.currentTarget.value.trim();
                      if (!value) return;
                      event.preventDefault();
                      setData(updateTech(data, [...(data.techUsed ?? []), value]));
                      event.currentTarget.value = "";
                    }}
                  />
                </div>
              </AdminPanel>
            </div>
          )}
        </AdminEditor>
      </main>
    </div>
  );
}
