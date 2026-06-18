"use client";

import Image from "next/image";
import Link from "next/link";
import { Camera, Lock } from "lucide-react";

import { useLocale } from "@/components/LocaleProvider";
import { EmptyState, PageShell, SectionHeader, Surface } from "@/components/system";
import { getSiteCopy } from "@/config/contentCopy";
import { selectLocalized } from "@/config/locale-utils";

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
  projectsZh: Project[];
  projectsEn: Project[];
  descriptionZh: string;
  descriptionEn: string;
};

function getCoverPhotos(project: Project) {
  const publicPhotos = project.photos
    .filter((photo) => !photo.private)
    .slice(0, 4);
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
            <div key={photo.id} className="relative overflow-hidden rounded-control">
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

      <div className="absolute left-3 top-3 rounded-full bg-surface-graphite/75 px-3 py-1 text-xs font-medium text-surface-graphite-foreground backdrop-blur-sm">
        {project.status === "ongoing"
          ? copy.photography.ongoing
          : copy.photography.completed}
      </div>

      <div className="absolute bottom-3 right-3 flex gap-1.5">
        {project.photos.some((photo) => photo.private) ? (
          <div className="rounded-full bg-warning px-2.5 py-1 text-xs font-medium text-warning-foreground backdrop-blur-sm">
            <span className="inline-flex items-center gap-1">
              <Lock className="h-3.5 w-3.5" aria-hidden />
              <span>{copy.photography.private}</span>
            </span>
          </div>
        ) : null}
        <div className="rounded-full bg-surface-graphite/75 px-3 py-1 text-xs font-medium text-surface-graphite-foreground backdrop-blur-sm">
          {project.photoCount} {copy.photography.photosSuffix}
        </div>
      </div>
    </div>
  );
}

export function PhotographyIndexClient({
  projectsZh,
  projectsEn,
  descriptionZh,
  descriptionEn,
}: Props) {
  const { locale } = useLocale();
  const copy = getSiteCopy(locale);
  const projects = selectLocalized(locale, { zh: projectsZh, en: projectsEn });
  const description = selectLocalized(locale, { zh: descriptionZh, en: descriptionEn });
  const pageDescription = description || copy.photography.description;

  return (
    <PageShell tone="public" className="min-h-screen px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <main className="mx-auto w-full max-w-7xl">
        <SectionHeader
          eyebrow="Visual Archive"
          title={copy.photography.heading}
          description={pageDescription}
          className="mb-10"
        />

        {projects.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/photography/${project.slug}`}
                className="group block"
              >
                <Surface
                  tone="paper"
                  className="flex h-full flex-col overflow-hidden shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-overlay"
                >
                  <ProjectCover project={project} />

                  <div className="flex flex-1 flex-col p-5">
                    <h2 className="text-xl font-semibold tracking-tight text-foreground">
                      {project.title}
                    </h2>
                    <p className="mt-2 line-clamp-2 flex-1 text-sm leading-6 text-muted-foreground">
                      {project.description}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{project.date}</span>
                      <span aria-hidden className="text-border">
                        /
                      </span>
                      <span>
                        {project.photoCount} {copy.photography.photosSuffix}
                      </span>
                    </div>
                  </div>
                </Surface>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Camera className="h-12 w-12" aria-hidden />}
            title={copy.photography.emptyTitle}
            description={copy.photography.emptyDescription}
          />
        )}
      </main>
    </PageShell>
  );
}
