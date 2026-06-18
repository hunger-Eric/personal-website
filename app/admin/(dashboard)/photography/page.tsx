// app/admin/photography/page.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Save,
  Lock,
  Unlock,
  Upload,
  ImageIcon,
  ArrowLeft,
} from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import {
  ActionButton,
  AdminPanel,
  EmptyState,
  FormField,
  IconButton,
  StatusNote,
} from "@/components/system";
import { adminCopy } from "@/config/copy/admin";

type Photo = {
  id: string;
  title: string;
  description: string;
  src: string;
  width: number;
  height: number;
  date: string;
  private: boolean;
};

type Project = {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverImage: string;
  coverWidth: number;
  coverHeight: number;
  date: string;
  status: string;
  photoCount: number;
  photos: Photo[];
};

type Config = {
  description: string;
  projects: Project[];
};

type NewPhoto = {
  file: File;
  preview: string;
  meta: Partial<Photo>;
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function fieldClassName(extra = "") {
  return [
    "w-full rounded-control border border-border bg-background px-3 py-2 text-sm outline-none",
    "focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:opacity-50",
    extra,
  ]
    .filter(Boolean)
    .join(" ");
}

export default function AdminPhotographyPage() {
  const [config, setConfig] = useState<Config | null>(null);
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newPhotos, setNewPhotos] = useState<NewPhoto[]>([]);
  const copy = adminCopy.photography;

  useEffect(() => {
    fetch("/api/admin/photography")
      .then((response) => response.json())
      .then((data: { config: Config }) => {
        setConfig(data.config);
        if (data.config.projects.length > 0) {
          setActiveProject(data.config.projects[0].id);
        }
      })
      .catch((loadError: unknown) =>
        setError(`${copy.messages.loadFailed}: ${getErrorMessage(loadError)}`)
      )
      .finally(() => setLoading(false));
  }, [copy.messages.loadFailed]);

  const activeProjectData = config?.projects.find(
    (project) => project.id === activeProject
  );

  const updateActiveProject = (updates: Partial<Project>) => {
    if (!config || !activeProject) return;

    setConfig({
      ...config,
      projects: config.projects.map((project) =>
        project.id === activeProject ? { ...project, ...updates } : project
      ),
    });
  };

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      if (files.length === 0 || !activeProjectData) return;

      const entries = files.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        meta: {
          id: `${activeProjectData.id}-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 6)}`,
          title: file.name.replace(/\.[^/.]+$/, ""),
          description: "",
          width: 16,
          height: 9,
          date: new Date().toISOString().slice(0, 7),
          private: false,
        },
      }));

      setNewPhotos((previous) => [...previous, ...entries]);
    },
    [activeProjectData]
  );

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("config", JSON.stringify(config));

      for (const newPhoto of newPhotos) {
        formData.append("photo", newPhoto.file);
        formData.append(
          "photo_meta",
          JSON.stringify({
            id: newPhoto.meta.id,
            private: newPhoto.meta.private,
          })
        );
      }

      const response = await fetch("/api/admin/photography", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string };
        throw new Error(errorData.error || copy.messages.saveFailed);
      }

      const result = (await response.json()) as { message?: string };
      setMessage(result.message || copy.messages.saveFallback);
      setNewPhotos([]);
    } catch (saveError: unknown) {
      setError(`${copy.messages.saveFailed}: ${getErrorMessage(saveError)}`);
    } finally {
      setSaving(false);
    }
  };

  const updatePhoto = (photoIndex: number, updates: Partial<Photo>) => {
    if (!config || !activeProject) return;

    setConfig({
      ...config,
      projects: config.projects.map((project) => {
        if (project.id !== activeProject) return project;
        const photos = [...project.photos];
        photos[photoIndex] = { ...photos[photoIndex], ...updates };
        return { ...project, photos, photoCount: photos.length };
      }),
    });
  };

  const removePhoto = (photoIndex: number) => {
    if (!config || !activeProject) return;

    setConfig({
      ...config,
      projects: config.projects.map((project) => {
        if (project.id !== activeProject) return project;
        const photos = project.photos.filter((_, index) => index !== photoIndex);
        return { ...project, photos, photoCount: photos.length };
      }),
    });
  };

  const movePhoto = (photoIndex: number, direction: "up" | "down") => {
    if (!config || !activeProject) return;

    setConfig({
      ...config,
      projects: config.projects.map((project) => {
        if (project.id !== activeProject) return project;
        const photos = [...project.photos];
        const targetIndex = direction === "up" ? photoIndex - 1 : photoIndex + 1;
        if (targetIndex < 0 || targetIndex >= photos.length) return project;
        [photos[photoIndex], photos[targetIndex]] = [
          photos[targetIndex],
          photos[photoIndex],
        ];
        return { ...project, photos };
      }),
    });
  };

  const addEmptyPhoto = () => {
    if (!config || !activeProject) return;

    const newPhoto: Photo = {
      id: `${activeProject}-new-${Date.now()}`,
      title: copy.newPhotoTitle,
      description: "",
      src: "",
      width: 16,
      height: 9,
      date: new Date().toISOString().slice(0, 7),
      private: false,
    };

    setConfig({
      ...config,
      projects: config.projects.map((project) => {
        if (project.id !== activeProject) return project;
        return {
          ...project,
          photos: [...project.photos, newPhoto],
          photoCount: project.photos.length + 1,
        };
      }),
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pl-64">
        <AdminSidebar />
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pl-64">
      <AdminSidebar />
      <main className="mx-auto max-w-7xl px-6 py-10">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <ActionButton
              href="/photography"
              tone="ghost"
              icon={<ArrowLeft className="h-4 w-4" />}
              className="mb-3 px-0"
            >
              {copy.backToPublic}
            </ActionButton>
            <h1 className="text-2xl font-bold tracking-tight">{copy.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {copy.description}
            </p>
          </div>
          <ActionButton
            type="button"
            onClick={handleSave}
            disabled={saving}
            tone="primary"
            icon={
              saving ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Save className="h-4 w-4" />
              )
            }
          >
            {saving ? adminCopy.common.saving : adminCopy.common.saveToGitHub}
          </ActionButton>
        </header>

        <div className="mb-6 space-y-3">
          {message ? <StatusNote tone="success">{message}</StatusNote> : null}
          {error ? <StatusNote tone="danger">{error}</StatusNote> : null}
        </div>

        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {copy.projectList}
            </h2>
            <div className="space-y-1">
              {config?.projects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => setActiveProject(project.id)}
                  className={`w-full rounded-control px-4 py-3 text-left text-sm transition-colors ${
                    activeProject === project.id
                      ? "bg-accent/10 font-medium text-accent"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <span className="block font-medium">{project.title}</span>
                  <span className="mt-0.5 block text-xs opacity-70">
                    {project.photos.length} {copy.photoCountSuffix}
                  </span>
                </button>
              ))}
            </div>
          </aside>

          <section>
            {activeProjectData ? (
              <div className="space-y-6">
                <AdminPanel
                  title={copy.projectInfoTitle}
                  description={copy.projectInfoDescription}
                >
                  <div className="grid gap-4">
                    <FormField label={copy.projectTitleLabel}>
                      <input
                        value={activeProjectData.title}
                        onChange={(event) =>
                          updateActiveProject({ title: event.target.value })
                        }
                        className={fieldClassName()}
                      />
                    </FormField>
                    <FormField label={copy.projectDescriptionLabel}>
                      <textarea
                        value={activeProjectData.description}
                        onChange={(event) =>
                          updateActiveProject({
                            description: event.target.value,
                          })
                        }
                        rows={2}
                        className={fieldClassName()}
                      />
                    </FormField>
                  </div>
                </AdminPanel>

                <div className="flex flex-wrap items-center gap-3">
                  <ActionButton
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    icon={<Upload className="h-4 w-4" />}
                  >
                    {copy.uploadPhotos}
                  </ActionButton>
                  <ActionButton
                    type="button"
                    onClick={addEmptyPhoto}
                    icon={<Plus className="h-4 w-4" />}
                  >
                    {copy.addManualPhoto}
                  </ActionButton>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </div>

                {newPhotos.length > 0 ? (
                  <AdminPanel
                    title={`${copy.pendingUploads} (${newPhotos.length} ${copy.pendingSuffix})`}
                  >
                    <div className="flex flex-wrap gap-3">
                      {newPhotos.map((newPhoto) => (
                        <div
                          key={newPhoto.meta.id}
                          className="relative h-20 w-20 overflow-hidden rounded-card border border-border bg-muted"
                        >
                          <Image
                            src={newPhoto.preview}
                            alt=""
                            fill
                            unoptimized
                            className="object-cover"
                            sizes="80px"
                          />
                        </div>
                      ))}
                    </div>
                  </AdminPanel>
                ) : null}

                {activeProjectData.photos.length === 0 &&
                newPhotos.length === 0 ? (
                  <EmptyState
                    icon={<ImageIcon className="h-10 w-10" />}
                    title={copy.emptyProjectTitle}
                    description={copy.emptyProjectDescription}
                  />
                ) : (
                  <div className="space-y-3">
                    {activeProjectData.photos.map((photo, index) => (
                      <article
                        key={photo.id}
                        className="flex gap-4 rounded-card border border-border bg-surface-admin p-4"
                      >
                        <div className="relative h-24 w-24 flex-none overflow-hidden rounded-card bg-muted sm:h-28 sm:w-28">
                          {photo.src ? (
                            <Image
                              src={photo.src}
                              alt={photo.title}
                              fill
                              unoptimized
                              className="object-cover"
                              sizes="112px"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-muted-foreground/50">
                              <ImageIcon className="h-8 w-8" />
                              <span className="sr-only">{copy.noPreview}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-1 flex-col gap-2">
                          <div className="flex flex-wrap items-start gap-2">
                            <input
                              value={photo.title}
                              onChange={(event) =>
                                updatePhoto(index, {
                                  title: event.target.value,
                                })
                              }
                              placeholder={copy.photoTitlePlaceholder}
                              className={fieldClassName("min-w-52 flex-1 py-1.5")}
                            />
                            <input
                              value={photo.date}
                              onChange={(event) =>
                                updatePhoto(index, { date: event.target.value })
                              }
                              placeholder={copy.datePlaceholder}
                              className={fieldClassName("w-28 py-1.5")}
                            />
                          </div>
                          <input
                            value={photo.description}
                            onChange={(event) =>
                              updatePhoto(index, {
                                description: event.target.value,
                              })
                            }
                            placeholder={copy.photoDescriptionPlaceholder}
                            className={fieldClassName("py-1.5")}
                          />

                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <label className="flex items-center gap-1">
                              {copy.widthLabel}
                              <input
                                type="number"
                                value={photo.width}
                                onChange={(event) =>
                                  updatePhoto(index, {
                                    width: parseInt(event.target.value, 10) || 16,
                                  })
                                }
                                className={fieldClassName("w-14 px-1.5 py-0.5 text-center text-xs")}
                              />
                            </label>
                            <label className="flex items-center gap-1">
                              {copy.heightLabel}
                              <input
                                type="number"
                                value={photo.height}
                                onChange={(event) =>
                                  updatePhoto(index, {
                                    height: parseInt(event.target.value, 10) || 9,
                                  })
                                }
                                className={fieldClassName("w-14 px-1.5 py-0.5 text-center text-xs")}
                              />
                            </label>
                          </div>
                        </div>

                        <div className="flex flex-none flex-col items-center gap-1">
                          <IconButton
                            icon={
                              photo.private ? (
                                <Lock className="h-4 w-4" />
                              ) : (
                                <Unlock className="h-4 w-4" />
                              )
                            }
                            label={photo.private ? copy.makePublic : copy.makePrivate}
                            onClick={() =>
                              updatePhoto(index, { private: !photo.private })
                            }
                            className={
                              photo.private
                                ? "border-warning/40 bg-warning/10 text-warning"
                                : ""
                            }
                          />
                          <IconButton
                            icon={<ChevronUp className="h-4 w-4" />}
                            label={copy.moveUp}
                            onClick={() => movePhoto(index, "up")}
                            disabled={index === 0}
                          />
                          <IconButton
                            icon={<ChevronDown className="h-4 w-4" />}
                            label={copy.moveDown}
                            onClick={() => movePhoto(index, "down")}
                            disabled={index === activeProjectData.photos.length - 1}
                          />
                          <IconButton
                            icon={<Trash2 className="h-4 w-4" />}
                            label={copy.deletePhoto}
                            onClick={() => removePhoto(index)}
                            className="text-destructive hover:bg-destructive/10"
                          />
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <EmptyState title={copy.selectProject} />
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
