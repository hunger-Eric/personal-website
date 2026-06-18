"use client";

import { useCallback, useEffect, useState } from "react";

import Image from "next/image";
import { Camera, ChevronLeft, ChevronRight, Eye, EyeOff, Lock, X } from "lucide-react";

import { EmptyState, IconButton, Surface } from "@/components/system";
import { getSiteCopy } from "@/config/contentCopy";

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
const copy = getSiteCopy("zh").photography;

function loadStoredPhotoTokens() {
  if (typeof window === "undefined") return new Map<string, string>();

  try {
    const sessionToken = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    const stored = window.sessionStorage.getItem(TOKENS_STORAGE_KEY);
    if (sessionToken && stored) {
      const parsed = JSON.parse(stored) as [string, string][];
      return new Map(parsed);
    }
  } catch {
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
    window.sessionStorage.removeItem(TOKENS_STORAGE_KEY);
  }

  return new Map<string, string>();
}

export function PhotographyGallery({ photos, projectTitle }: Props) {
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [photoTokens, setPhotoTokens] = useState<Map<string, string>>(loadStoredPhotoTokens);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handlePinSuccess = useCallback((tokens: Map<string, string>) => {
    setPhotoTokens(tokens);
    window.sessionStorage.setItem(TOKENS_STORAGE_KEY, JSON.stringify(Array.from(tokens.entries())));
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, "true");
  }, []);

  const resetPrivateAccess = useCallback(() => {
    setPhotoTokens(new Map());
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
    window.sessionStorage.removeItem(TOKENS_STORAGE_KEY);
  }, []);

  const privateCount = photos.filter((photo) => photo.private).length;
  const hasPrivate = privateCount > 0;
  const isPrivateVisible = photoTokens.size > 0;
  const visiblePhotos = isPrivateVisible ? photos : photos.filter((photo) => !photo.private);

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

  const emptyTitle = hasPrivate ? copy.privateHiddenTitle : copy.noPhotosTitle;
  const emptyDescription = hasPrivate
    ? copy.privateHiddenDescription
    : copy.noPhotosDescription;

  return (
    <>
      {hasPrivate ? (
        <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
          {isPrivateVisible ? (
            <button
              type="button"
              onClick={resetPrivateAccess}
              className="inline-flex items-center gap-2 rounded-control border border-warning bg-warning/10 px-4 py-2 text-sm font-semibold text-warning transition-colors hover:bg-warning/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <EyeOff className="h-4 w-4" aria-hidden="true" />
              {copy.hidePrivate}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setPinModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-control border border-hairline bg-surface-paper-elevated px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Eye className="h-4 w-4" aria-hidden="true" />
              {copy.showPrivate}
              <span className="rounded-control bg-muted px-1.5 py-0.5 text-[11px] text-foreground">
                {privateCount}
              </span>
            </button>
          )}
          <PhotoPinModal
            open={pinModalOpen}
            onClose={() => setPinModalOpen(false)}
            onSuccess={handlePinSuccess}
          />
        </div>
      ) : null}

      {visiblePhotos.length === 0 ? (
        <EmptyState
          icon={<Camera className="h-8 w-8" aria-hidden="true" />}
          title={emptyTitle}
          description={emptyDescription}
        />
      ) : (
        <div
          aria-label={projectTitle}
          className="columns-1 gap-6 sm:columns-2 lg:columns-3"
        >
          {visiblePhotos.map((photo, index) => {
            const src = getPhotoSrc(photo);

            return (
              <Surface
                as="article"
                tone="paper"
                key={photo.id}
                className="group mb-6 break-inside-avoid overflow-hidden shadow-soft transition-colors duration-200 hover:border-accent"
              >
                <button
                  type="button"
                  onClick={() => openPhoto(index)}
                  className="relative block w-full overflow-hidden bg-surface-graphite focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
                  style={{
                    aspectRatio: `${photo.width}/${photo.height}`,
                  }}
                >
                  <div
                    className="relative h-full w-full"
                  >
                    <Image
                      src={src}
                      alt={photo.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      unoptimized
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>

                  {photo.private && !isPrivateVisible ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-surface-graphite/55 backdrop-blur-lg">
                      <div className="flex flex-col items-center gap-2 text-surface-graphite-foreground">
                        <Lock className="h-8 w-8" aria-hidden="true" />
                        <span className="text-sm font-semibold">{copy.private}</span>
                      </div>
                    </div>
                  ) : null}
                </button>

                <div className="p-4">
                  <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                    {photo.title}
                    {photo.private ? (
                      <Lock className="h-3.5 w-3.5 text-warning" aria-hidden="true" />
                    ) : null}
                  </h2>
                  {photo.description ? (
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                      {photo.description}
                    </p>
                  ) : null}
                  <p className="mt-1.5 text-xs text-muted-foreground">{photo.date}</p>
                </div>
              </Surface>
            );
          })}
        </div>
      )}

      {selectedPhoto && selectedIndex !== null ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-surface-graphite/90 p-2 backdrop-blur-md sm:p-4"
          onClick={closeLightbox}
        >
          <IconButton
            onClick={(event) => {
              event.stopPropagation();
              closeLightbox();
            }}
            label={copy.close}
            icon={<X className="h-5 w-5" aria-hidden="true" />}
            className="absolute right-4 top-4 border-inverse bg-surface-graphite/70 text-surface-graphite-foreground hover:bg-surface-graphite"
          />

          <IconButton
            onClick={(event) => {
              event.stopPropagation();
              goPrev();
            }}
            label={copy.previous}
            icon={<ChevronLeft className="h-6 w-6" aria-hidden="true" />}
            className="absolute left-3 top-1/2 -translate-y-1/2 border-inverse bg-surface-graphite/70 text-surface-graphite-foreground hover:bg-surface-graphite sm:left-6"
          />

          <IconButton
            onClick={(event) => {
              event.stopPropagation();
              goNext();
            }}
            label={copy.next}
            icon={<ChevronRight className="h-6 w-6" aria-hidden="true" />}
            className="absolute right-3 top-1/2 -translate-y-1/2 border-inverse bg-surface-graphite/70 text-surface-graphite-foreground hover:bg-surface-graphite sm:right-6"
          />

          <div
            className="relative flex items-center justify-center overflow-hidden rounded-card"
            onClick={(event) => event.stopPropagation()}
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

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-surface-graphite/80 to-transparent p-4 pt-12">
              <h2 className="text-lg font-semibold text-surface-graphite-foreground">
                {selectedPhoto.title}
              </h2>
              {selectedPhoto.description ? (
                <p className="text-sm text-surface-graphite-foreground/80">
                  {selectedPhoto.description}
                </p>
              ) : null}
              <div className="mt-2 flex items-center justify-between text-xs text-surface-graphite-foreground/70">
                <span>{selectedPhoto.date}</span>
                <span>
                  {selectedIndex + 1} / {visiblePhotos.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
