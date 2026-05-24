"use client";

import { useCallback, useEffect, useState } from "react";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Eye, EyeOff, Lock, X } from "lucide-react";

import { PhotoPinModal } from "./PhotoPinModal";

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

const SESSION_STORAGE_KEY = "photography_session_token";
const TOKENS_STORAGE_KEY = "photography_photo_tokens";

export function PhotographyGallery({ photos }: Props) {
  const [mounted, setMounted] = useState(false);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [photoTokens, setPhotoTokens] = useState<Map<string, string>>(new Map());
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const sessionToken = sessionStorage.getItem(SESSION_STORAGE_KEY);
      const stored = sessionStorage.getItem(TOKENS_STORAGE_KEY);
      if (sessionToken && stored) {
        const parsed: [string, string][] = JSON.parse(stored);
        setPhotoTokens(new Map(parsed));
      }
    } catch {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      sessionStorage.removeItem(TOKENS_STORAGE_KEY);
    }
  }, []);

  const handlePinSuccess = useCallback((tokens: Map<string, string>) => {
    setPhotoTokens(tokens);
    sessionStorage.setItem(TOKENS_STORAGE_KEY, JSON.stringify(Array.from(tokens.entries())));
    sessionStorage.setItem(SESSION_STORAGE_KEY, "true");
  }, []);

  const resetPrivateAccess = useCallback(() => {
    setPhotoTokens(new Map());
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    sessionStorage.removeItem(TOKENS_STORAGE_KEY);
  }, []);

  const hasPrivate = photos.some((p) => p.private);
  const isPrivateVisible = photoTokens.size > 0;
  const visiblePhotos = isPrivateVisible ? photos : photos.filter((p) => !p.private);

  const selectedPhoto =
    selectedIndex !== null ? visiblePhotos[selectedIndex] ?? null : null;

  const getPhotoSrc = useCallback(
    (photo: Photo) => {
      if (!photo.private) return photo.src;
      const token = photoTokens.get(photo.id);
      if (token) {
        return `/api/photo/${photo.id}?token=${encodeURIComponent(token)}`;
      }
      return photo.src;
    },
    [photoTokens]
  );

  const openPhoto = useCallback(
    (index: number) => {
      if (visiblePhotos.length === 0) return;
      const normalized =
        ((index % visiblePhotos.length) + visiblePhotos.length) % visiblePhotos.length;
      setSelectedIndex(normalized);
    },
    [visiblePhotos.length]
  );

  const closeLightbox = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  const goPrev = useCallback(() => {
    if (selectedIndex === null) return;
    openPhoto(selectedIndex - 1);
  }, [openPhoto, selectedIndex]);

  const goNext = useCallback(() => {
    if (selectedIndex === null) return;
    openPhoto(selectedIndex + 1);
  }, [openPhoto, selectedIndex]);

  useEffect(() => {
    if (selectedIndex === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeLightbox();
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrev();
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeLightbox, goNext, goPrev, selectedIndex]);

  return (
    <>
      {hasPrivate && (
        <div className="mb-8 flex items-center justify-center gap-4">
          {isPrivateVisible ? (
            <button
              onClick={resetPrivateAccess}
              className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 transition-all hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
            >
              <EyeOff className="h-4 w-4" />
              隐藏私密照片
            </button>
          ) : (
            <button
              onClick={() => setPinModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:text-foreground"
            >
              <Eye className="h-4 w-4" />
              显示私密照片
              <span className="ml-0.5 rounded-full bg-muted px-1.5 py-0.5 text-[11px]">
                {photos.filter((p) => p.private).length}
              </span>
            </button>
          )}
          <PhotoPinModal
            open={pinModalOpen}
            onClose={() => setPinModalOpen(false)}
            onSuccess={handlePinSuccess}
          />
        </div>
      )}

      {visiblePhotos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 text-4xl">📷</div>
          <h2 className="text-xl font-semibold">私密照片已隐藏</h2>
          <p className="mt-2 text-muted-foreground">输入 PIN 码查看内容</p>
        </div>
      ) : (
        <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
          {visiblePhotos.map((photo, index) => {
            const src = getPhotoSrc(photo);

            return (
              <div
                key={photo.id}
                className="group relative mb-6 break-inside-avoid overflow-hidden rounded-2xl border border-border bg-card"
              >
                <button
                  onClick={() => openPhoto(index)}
                  className="relative block w-full overflow-hidden"
                  style={{
                    aspectRatio: `${photo.width}/${photo.height}`,
                  }}
                >
                  <div
                    className={`relative h-full w-full ${
                      photo.private && !mounted ? "blur-xl" : ""
                    }`}
                  >
                    <Image
                      src={src}
                      alt={photo.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      unoptimized
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  {photo.private && !isPrivateVisible && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-lg">
                      <div className="flex flex-col items-center gap-2 text-white">
                        <Lock className="h-8 w-8" />
                        <span className="text-sm font-medium">私密</span>
                      </div>
                    </div>
                  )}
                </button>

                <div className="p-4">
                  <h3 className="flex items-center gap-2 font-medium">
                    {photo.title}
                    {photo.private && <Lock className="h-3.5 w-3.5 text-amber-500" />}
                  </h3>
                  {photo.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {photo.description}
                    </p>
                  )}
                  <p className="mt-1.5 text-xs text-muted-foreground">{photo.date}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedPhoto && selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-2 backdrop-blur-md sm:p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeLightbox();
            }}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            aria-label="关闭"
          >
            <X className="h-5 w-5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 sm:left-6"
            aria-label="上一张"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 sm:right-6"
            aria-label="下一张"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div
            className="relative flex items-center justify-center overflow-hidden rounded-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(98vw, 1800px)",
              height: "min(94vh, 1200px)",
            }}
          >
            <Image
              src={getPhotoSrc(selectedPhoto)}
              alt={selectedPhoto.title}
              fill
              sizes="98vw"
              unoptimized
              className="object-contain"
            />

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-12">
              <h3 className="text-lg font-semibold text-white">{selectedPhoto.title}</h3>
              {selectedPhoto.description && (
                <p className="text-sm text-white/80">{selectedPhoto.description}</p>
              )}
              <div className="mt-2 flex items-center justify-between text-xs text-white/60">
                <span>{selectedPhoto.date}</span>
                <span>
                  {selectedIndex + 1} / {visiblePhotos.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
