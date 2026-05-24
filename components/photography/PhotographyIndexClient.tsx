"use client";

import Image from "next/image";
import Link from "next/link";
import { Lock } from "lucide-react";

import { useLocale } from "@/components/LocaleProvider";
import { getSiteCopy } from "@/config/contentCopy";

type Project = {
  id: string;
  slug: string;
  title: string;
  description: string;
  date: string;
  status: string;
  coverImage?: string;
  photoCount: number;
  photos: Array<{
    id: string;
    title: string;
    src: string;
    private?: boolean;
  }>;
};

type Props = {
  projects: Project[];
  description: string;
};

function getCoverPhotos(project: Project) {
  const publicPhotos = project.photos.filter((photo) => !photo.private).slice(0, 4);
  return publicPhotos.length > 0 ? publicPhotos : project.photos.slice(0, 4);
}

function ProjectCover({ project }: { project: Project }) {
  const { locale } = useLocale();
  const copy = getSiteCopy(locale);
  const collagePhotos = getCoverPhotos(project);
  const useCollage = collagePhotos.length > 1;

  return (
    <div className="relative aspect-[4/3] overflow-hidden">
      {useCollage ? (
        <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-1 bg-muted p-1">
          {collagePhotos.map((photo) => (
            <div key={photo.id} className="relative overflow-hidden rounded-md">
              <Image
                src={photo.src}
                alt={photo.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                unoptimized
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          ))}
        </div>
      ) : (
        <Image
          src={project.coverImage || collagePhotos[0]?.src || "/images/demo_1.png"}
          alt={project.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          unoptimized
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      )}

      <div className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
        {project.status === "ongoing" ? copy.photography.ongoing : copy.photography.completed}
      </div>

      <div className="absolute bottom-3 right-3 flex gap-1.5">
        {project.photos.some((photo) => photo.private) && (
          <div className="rounded-full bg-amber-500/80 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
            <span className="inline-flex items-center gap-1">
              <Lock className="h-3.5 w-3.5" />
              <span>{copy.photography.private}</span>
            </span>
          </div>
        )}
        <div className="rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
          {project.photoCount} {copy.photography.photosSuffix}
        </div>
      </div>
    </div>
  );
}

export function PhotographyIndexClient({
  projects,
  description,
}: Props) {
  const { locale } = useLocale();
  const copy = getSiteCopy(locale);
  const pageDescription =
    locale === "zh" ? description || copy.photography.description : copy.photography.description;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <header className="mb-14 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
          {copy.photography.heading}
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          {pageDescription}
        </p>
      </header>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/photography/${project.slug}`}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-200 hover:-translate-y-1 hover:shadow-sm"
          >
            <ProjectCover project={project} />

            <div className="flex flex-1 flex-col p-5">
              <h2 className="text-xl font-semibold tracking-tight">
                {project.title}
              </h2>
              <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">
                {project.description}
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <span>{project.date}</span>
                <span className="text-border">·</span>
                <span className="inline-flex items-center gap-1">
                  {project.photoCount} {copy.photography.photosSuffix}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 text-4xl">📷</div>
          <h2 className="text-xl font-semibold">{copy.photography.emptyTitle}</h2>
          <p className="mt-2 text-muted-foreground">
            {copy.photography.emptyDescription}
          </p>
        </div>
      )}
    </div>
  );
}
