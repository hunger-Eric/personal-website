// components/PhotographyGallery.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Eye, EyeOff, Lock } from "lucide-react";

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

type Props = {
  photos: Photo[];
  projectTitle: string;
};

const STORAGE_KEY = "photography_show_private";

export function PhotographyGallery({ photos, projectTitle }: Props) {
  const [showPrivate, setShowPrivate] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  // Load preference from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "true") setShowPrivate(true);
  }, []);

  const togglePrivate = () => {
    const next = !showPrivate;
    setShowPrivate(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  };

  const hasPrivate = photos.some((p) => p.private);
  const visiblePhotos = showPrivate
    ? photos
    : photos.filter((p) => !p.private);

  return (
    <>
      {/* Controls */}
      {hasPrivate && (
        <div className="mb-8 flex items-center justify-center gap-4">
          <button
            onClick={togglePrivate}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
              showPrivate
                ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {showPrivate ? (
              <>
                <EyeOff className="h-4 w-4" />
                隐藏私密照片
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                显示私密照片
                <span className="ml-0.5 rounded-full bg-muted px-1.5 py-0.5 text-[11px]">
                  {photos.filter((p) => p.private).length}
                </span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Photo Grid */}
      {visiblePhotos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 text-4xl">🔒</div>
          <h2 className="text-xl font-semibold">私密照片已隐藏</h2>
          <p className="mt-2 text-muted-foreground">
            点击上方按钮查看
          </p>
        </div>
      ) : (
        <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
          {visiblePhotos.map((photo) => (
            <div
              key={photo.id}
              className="group relative mb-6 break-inside-avoid overflow-hidden rounded-2xl border border-border bg-card"
            >
              <button
                onClick={() => setSelectedPhoto(photo)}
                className="relative block w-full overflow-hidden"
                style={{
                  aspectRatio: `${photo.width}/${photo.height}`,
                }}
              >
                <Image
                  src={photo.src}
                  alt={photo.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className={`object-cover transition-transform duration-500 group-hover:scale-105 ${
                    photo.private && !mounted
                      ? "blur-xl"
                      : ""
                  }`}
                />
                {/* Private overlay */}
                {photo.private && !showPrivate && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-lg">
                    <div className="flex flex-col items-center gap-2 text-white">
                      <Lock className="h-8 w-8" />
                      <span className="text-sm font-medium">私密</span>
                    </div>
                  </div>
                )}
              </button>

              {/* Photo info */}
              <div className="p-4">
                <h3 className="flex items-center gap-2 font-medium">
                  {photo.title}
                  {photo.private && (
                    <Lock className="h-3.5 w-3.5 text-amber-500" />
                  )}
                </h3>
                {photo.description && (
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {photo.description}
                  </p>
                )}
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {photo.date}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
          <div
            className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={selectedPhoto.src}
              alt={selectedPhoto.title}
              width={1200}
              height={900}
              className="h-auto w-auto max-h-[85vh] object-contain"
              style={{
                aspectRatio: `${selectedPhoto.width}/${selectedPhoto.height}`,
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-12">
              <h3 className="text-lg font-semibold text-white">
                {selectedPhoto.title}
              </h3>
              {selectedPhoto.description && (
                <p className="text-sm text-white/80">
                  {selectedPhoto.description}
                </p>
              )}
              <p className="mt-1 text-xs text-white/60">{selectedPhoto.date}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}