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
  GripVertical,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

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

export default function AdminPhotographyPage() {
  const [config, setConfig] = useState<Config | null>(null);
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newPhotos, setNewPhotos] = useState<
    Array<{ file: File; preview: string; meta: Partial<Photo> }>
  >([]);

  // Load config
  useEffect(() => {
    fetch("/api/admin/photography")
      .then((r) => r.json())
      .then((data) => {
        setConfig(data.config);
        if (data.config.projects.length > 0) {
          setActiveProject(data.config.projects[0].id);
        }
      })
      .catch((e) => setError("加载失败: " + e.message))
      .finally(() => setLoading(false));
  }, []);

  const activeProjectData = config?.projects.find(
    (p) => p.id === activeProject
  );

  /** Add new photos from file picker */
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0 || !activeProjectData) return;

      const entries = files.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        meta: {
          id: `${activeProjectData.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          title: file.name.replace(/\.[^/.]+$/, ""),
          description: "",
          width: 16,
          height: 9,
          date: new Date().toISOString().slice(0, 7),
          private: false,
        },
      }));
      setNewPhotos((prev) => [...prev, ...entries]);
    },
    [activeProjectData]
  );

  /** Save all changes */
  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      // 1. Upload new photos and update config
      const formData = new FormData();
      formData.append("config", JSON.stringify(config));

      for (const np of newPhotos) {
        formData.append("photo", np.file);
        formData.append(
          "photo_meta",
          JSON.stringify({ id: np.meta.id, private: np.meta.private })
        );
      }

      // Save via form data (handles both photos + config)
      const res = await fetch("/api/admin/photography", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "保存失败");
      }

      const result = await res.json();
      setMessage(result.message);
      setNewPhotos([]); // Clear uploaded photos
    } catch (e: any) {
      setError("保存失败: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  /** Update a photo in the active project */
  const updatePhoto = (photoIndex: number, updates: Partial<Photo>) => {
    if (!config || !activeProject) return;
    setConfig({
      ...config,
      projects: config.projects.map((p) => {
        if (p.id !== activeProject) return p;
        const newPhotos = [...p.photos];
        newPhotos[photoIndex] = { ...newPhotos[photoIndex], ...updates };
        // Update photoCount
        return { ...p, photos: newPhotos, photoCount: newPhotos.length };
      }),
    });
  };

  /** Remove a photo (marks for deletion) */
  const removePhoto = (photoIndex: number) => {
    if (!config || !activeProject) return;
    setConfig({
      ...config,
      projects: config.projects.map((p) => {
        if (p.id !== activeProject) return p;
        const newPhotos = p.photos.filter((_, i) => i !== photoIndex);
        return { ...p, photos: newPhotos, photoCount: newPhotos.length };
      }),
    });
  };

  /** Move a photo up/down */
  const movePhoto = (photoIndex: number, direction: "up" | "down") => {
    if (!config || !activeProject) return;
    setConfig({
      ...config,
      projects: config.projects.map((p) => {
        if (p.id !== activeProject) return p;
        const newPhotos = [...p.photos];
        const targetIndex = direction === "up" ? photoIndex - 1 : photoIndex + 1;
        if (targetIndex < 0 || targetIndex >= newPhotos.length) return p;
        [newPhotos[photoIndex], newPhotos[targetIndex]] = [
          newPhotos[targetIndex],
          newPhotos[photoIndex],
        ];
        return { ...p, photos: newPhotos };
      }),
    });
  };

  /** Add a new empty photo entry */
  const addEmptyPhoto = () => {
    if (!config || !activeProject) return;
    const newPhoto: Photo = {
      id: `${activeProject}-new-${Date.now()}`,
      title: "新照片",
      description: "",
      src: "",
      width: 16,
      height: 9,
      date: new Date().toISOString().slice(0, 7),
      private: false,
    };
    setConfig({
      ...config,
      projects: config.projects.map((p) => {
        if (p.id !== activeProject) return p;
        return {
          ...p,
          photos: [...p.photos, newPhoto],
          photoCount: p.photos.length + 1,
        };
      }),
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link
            href="/photography"
            className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            返回摄影页面
          </Link>
          <h1 className="text-2xl font-bold">照片管理后台</h1>
          <p className="text-sm text-muted-foreground">
            编辑摄影项目与照片 · 保存后自动推送到 GitHub
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-amber-600 disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              保存中...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              保存到 GitHub
            </>
          )}
        </button>
      </div>

      {/* Messages */}
      {message && (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
          {message}
        </div>
      )}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        {/* Sidebar: Project list */}
        <aside className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            项目列表
          </h2>
          <div className="space-y-1">
            {config?.projects.map((p) => (
              <button
                key={p.id}
                onClick={() => setActiveProject(p.id)}
                className={`w-full rounded-xl px-4 py-3 text-left text-sm transition-colors ${
                  activeProject === p.id
                    ? "bg-amber-50 font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <div className="font-medium">{p.title}</div>
                <div className="mt-0.5 text-xs opacity-60">{p.photos.length} 张照片</div>
              </button>
            ))}
          </div>
        </aside>

        {/* Main: Photo grid */}
        <main>
          {activeProjectData ? (
            <div className="space-y-6">
              {/* Project info */}
              <div className="rounded-2xl border border-border bg-card p-5">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  项目名称
                </label>
                <input
                  value={activeProjectData.title}
                  onChange={(e) =>
                    setConfig(
                      config
                        ? {
                            ...config,
                            projects: config.projects.map((p) =>
                              p.id === activeProject
                                ? { ...p, title: e.target.value }
                                : p
                            ),
                          }
                        : config
                    )
                  }
                  className="mb-3 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                />
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  项目描述
                </label>
                <textarea
                  value={activeProjectData.description}
                  onChange={(e) =>
                    setConfig(
                      config
                        ? {
                            ...config,
                            projects: config.projects.map((p) =>
                              p.id === activeProject
                                ? { ...p, description: e.target.value }
                                : p
                            ),
                          }
                        : config
                    )
                  }
                  rows={2}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                />
              </div>

              {/* Upload area */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-xl border border-dashed border-border bg-card px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:border-amber-300 hover:text-foreground"
                >
                  <Upload className="h-4 w-4" />
                  上传照片
                </button>
                <button
                  onClick={addEmptyPhoto}
                  className="inline-flex items-center gap-2 rounded-xl border border-dashed border-border bg-card px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:border-amber-300 hover:text-foreground"
                >
                  <Plus className="h-4 w-4" />
                  手动添加条目
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>

              {/* Pending uploads */}
              {newPhotos.length > 0 && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-800 dark:bg-amber-900/10">
                  <h3 className="mb-3 text-sm font-medium text-amber-700 dark:text-amber-300">
                    待上传 ({newPhotos.length} 张)
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {newPhotos.map((np, i) => (
                      <div key={i} className="relative h-20 w-20 overflow-hidden rounded-lg">
                        <Image
                          src={np.preview}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Photo grid */}
              {activeProjectData.photos.length === 0 &&
              newPhotos.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
                  <ImageIcon className="mb-3 h-10 w-10 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    暂无照片，拖入照片或点击上传
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeProjectData.photos.map((photo, i) => (
                    <div
                      key={photo.id}
                      className="flex gap-4 rounded-2xl border border-border bg-card p-4"
                    >
                      {/* Thumbnail */}
                      <div className="relative h-24 w-24 flex-none overflow-hidden rounded-xl bg-muted sm:h-28 sm:w-28">
                        {photo.src ? (
                          <Image
                            src={photo.src}
                            alt={photo.title}
                            fill
                            className="object-cover"
                            sizes="112px"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-muted-foreground/50">
                            <ImageIcon className="h-8 w-8" />
                          </div>
                        )}
                      </div>

                      {/* Edit fields */}
                      <div className="flex flex-1 flex-col gap-2">
                        <div className="flex items-start gap-2">
                          <input
                            value={photo.title}
                            onChange={(e) =>
                              updatePhoto(i, { title: e.target.value })
                            }
                            placeholder="照片标题"
                            className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                          />
                          <input
                            value={photo.date}
                            onChange={(e) =>
                              updatePhoto(i, { date: e.target.value })
                            }
                            placeholder="YYYY-MM"
                            className="w-24 rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                          />
                        </div>
                        <input
                          value={photo.description}
                          onChange={(e) =>
                            updatePhoto(i, { description: e.target.value })
                          }
                          placeholder="照片描述"
                          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                        />

                        {/* Aspect ratio */}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <label className="flex items-center gap-1">
                            宽:
                            <input
                              type="number"
                              value={photo.width}
                              onChange={(e) =>
                                updatePhoto(i, {
                                  width: parseInt(e.target.value) || 16,
                                })
                              }
                              className="w-12 rounded border border-border bg-background px-1.5 py-0.5 text-center text-xs outline-none"
                            />
                          </label>
                          <label className="flex items-center gap-1">
                            高:
                            <input
                              type="number"
                              value={photo.height}
                              onChange={(e) =>
                                updatePhoto(i, {
                                  height: parseInt(e.target.value) || 9,
                                })
                              }
                              className="w-12 rounded border border-border bg-background px-1.5 py-0.5 text-center text-xs outline-none"
                            />
                          </label>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-none flex-col items-center gap-1">
                        <button
                          onClick={() => updatePhoto(i, { private: !photo.private })}
                          className={`rounded-lg p-2 transition-colors ${
                            photo.private
                              ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                          title={photo.private ? "设为公开" : "设为私密"}
                        >
                          {photo.private ? (
                            <Lock className="h-4 w-4" />
                          ) : (
                            <Unlock className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => movePhoto(i, "up")}
                          disabled={i === 0}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => movePhoto(i, "down")}
                          disabled={i === activeProjectData.photos.length - 1}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => removePhoto(i)}
                          className="rounded-lg p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-muted-foreground">选择一个项目开始编辑</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}