"use client";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminEditor } from "@/components/admin/AdminEditor";
import { AdminPanel, EmptyState, FormField } from "@/components/system";
import { adminCopy } from "@/config/copy/admin";

type SocialVisibility = {
  footer?: boolean;
  about?: boolean;
  contact?: boolean;
  links?: boolean;
};

type SocialEntry = {
  key: string;
  label?: string;
  href?: string;
  icon?: string;
  description?: string;
  showIn?: SocialVisibility;
};

type SiteData = Record<string, unknown> & {
  name?: string;
  title?: string;
  tagline?: string;
  location?: string;
  baseUrl?: string;
  socials?: SocialEntry[];
  sections?: Record<string, boolean>;
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

function updateSocial(
  data: SiteData,
  index: number,
  updates: Partial<SocialEntry>
): SiteData {
  const socials = [...(data.socials ?? [])];
  socials[index] = { ...socials[index], ...updates };
  return { ...data, socials };
}

export default function SiteEditorPage() {
  const copy = adminCopy.site;

  return (
    <div className="min-h-screen bg-background pl-64">
      <AdminSidebar />
      <main className="px-6 py-8">
        <AdminEditor<SiteData>
          title={copy.title}
          description={copy.description}
          configKey="site"
        >
          {(data, setData) => (
            <div className="space-y-6">
              <AdminPanel
                title={copy.identityTitle}
                description={copy.identityDescription}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label={copy.nameLabel}>
                    <input
                      value={data.name || ""}
                      onChange={(event) =>
                        setData({ ...data, name: event.target.value })
                      }
                      className={fieldClassName()}
                    />
                  </FormField>
                  <FormField label={copy.titleLabel}>
                    <input
                      value={data.title || ""}
                      onChange={(event) =>
                        setData({ ...data, title: event.target.value })
                      }
                      className={fieldClassName()}
                    />
                  </FormField>
                  <FormField label={copy.taglineLabel} className="sm:col-span-2">
                    <input
                      value={data.tagline || ""}
                      onChange={(event) =>
                        setData({ ...data, tagline: event.target.value })
                      }
                      className={fieldClassName()}
                    />
                  </FormField>
                  <FormField label={copy.locationLabel}>
                    <input
                      value={data.location || ""}
                      onChange={(event) =>
                        setData({ ...data, location: event.target.value })
                      }
                      className={fieldClassName()}
                    />
                  </FormField>
                  <FormField label={copy.baseUrlLabel}>
                    <input
                      value={data.baseUrl || ""}
                      onChange={(event) =>
                        setData({ ...data, baseUrl: event.target.value })
                      }
                      className={fieldClassName()}
                    />
                  </FormField>
                </div>
              </AdminPanel>

              <AdminPanel
                title={copy.socialsTitle}
                description={copy.socialsDescription}
              >
                {Array.isArray(data.socials) && data.socials.length > 0 ? (
                  <div className="space-y-3">
                    {data.socials.map((social, index) => (
                      <div
                        key={`${social.key}-${index}`}
                        className="grid gap-3 rounded-card border border-border bg-muted/30 p-3 sm:grid-cols-[5rem_1fr_2fr]"
                      >
                        <span className="pt-2 text-xs font-medium text-muted-foreground">
                          {social.key || copy.socialKeyLabel}
                        </span>
                        <input
                          value={social.label || ""}
                          onChange={(event) =>
                            setData(
                              updateSocial(data, index, {
                                label: event.target.value,
                              })
                            )
                          }
                          placeholder={copy.socialLabelPlaceholder}
                          className={fieldClassName("py-1.5")}
                        />
                        <input
                          value={social.href || ""}
                          onChange={(event) =>
                            setData(
                              updateSocial(data, index, {
                                href: event.target.value,
                              })
                            )
                          }
                          placeholder={copy.socialHrefPlaceholder}
                          className={fieldClassName("py-1.5")}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState title={copy.noSocials} />
                )}
              </AdminPanel>

              <AdminPanel
                title={copy.sectionsTitle}
                description={copy.sectionsDescription}
              >
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {Object.entries(data.sections ?? {}).map(([key, enabled]) => (
                    <label
                      key={key}
                      className="flex cursor-pointer items-center gap-2 rounded-control border border-border px-3 py-2 text-sm transition-colors hover:bg-muted"
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(enabled)}
                        onChange={(event) =>
                          setData({
                            ...data,
                            sections: {
                              ...(data.sections ?? {}),
                              [key]: event.target.checked,
                            },
                          })
                        }
                        className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
                      />
                      {key}
                    </label>
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
