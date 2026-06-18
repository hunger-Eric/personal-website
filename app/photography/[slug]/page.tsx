import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { JsonLd } from "@/components/JsonLd";
import { PhotographyGallery } from "@/components/PhotographyGallery";
import { ActionButton, PageShell, SectionHeader, Surface } from "@/components/system";
import { getSiteCopy } from "@/config/contentCopy";
import photographyData from "@/config/photography.json";
import { siteConfig } from "@/config/siteConfig";
import { SITE_URL } from "@/lib/site-url";

type SourcePhoto = {
  id: string;
  title?: string;
  description?: string;
  src?: string;
  width?: number;
  height?: number;
  date?: string;
  private?: boolean;
};

type GalleryPhoto = {
  id: string;
  title: string;
  description: string;
  src: string;
  width: number;
  height: number;
  date: string;
  private: boolean;
};

type PhotographyProject = {
  slug: string;
  title: string;
  description: string;
  coverImage: string;
  coverWidth: number;
  coverHeight: number;
  date: string;
  status?: string;
  photos: SourcePhoto[];
};

type PhotographyData = {
  zh?: { projects?: PhotographyProject[] };
  projects?: PhotographyProject[];
};

type Props = {
  params: Promise<{ slug: string }>;
};

const typedPhotographyData = photographyData as PhotographyData;
const projects = typedPhotographyData.zh?.projects ?? typedPhotographyData.projects ?? [];
const copy = getSiteCopy("zh").photography;

function normalizePhotos(project: PhotographyProject): GalleryPhoto[] {
  return project.photos
    .filter((photo) => photo.id && photo.src)
    .map((photo) => ({
      id: photo.id,
      title: photo.title || project.title,
      description: photo.description || project.description,
      src: photo.src || project.coverImage,
      width: photo.width || project.coverWidth || 1,
      height: photo.height || project.coverHeight || 1,
      date: photo.date || project.date,
      private: Boolean(photo.private),
    }));
}

export async function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) return {};

  return {
    title: `${project.title} - Photography`,
    description: project.description,
    alternates: { canonical: `/photography/${slug}` },
    openGraph: {
      type: "website",
      url: `/photography/${slug}`,
      title: `${project.title} | ${siteConfig.name}`,
      description: project.description,
      images: [
        {
          url: project.coverImage,
          width: project.coverWidth * 100,
          height: project.coverHeight * 100,
          alt: project.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.title} | ${siteConfig.name}`,
      description: project.description,
      images: [project.coverImage],
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) notFound();

  const photos = normalizePhotos(project);
  const publicCount = photos.filter((photo) => !photo.private).length;
  const privateCount = photos.filter((photo) => photo.private).length;
  const publicPhotos = photos.filter((photo) => !photo.private);
  const statusLabel = project.status === "ongoing" ? copy.ongoing : copy.completed;

  return (
    <PageShell tone="public" className="min-h-screen">
      <main className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "ImageGallery",
            name: project.title,
            description: project.description,
            url: `${SITE_URL}/photography/${slug}`,
            image: publicPhotos.map((photo) => ({
              "@type": "ImageObject",
              name: photo.title,
              description: photo.description,
              contentUrl: photo.src.startsWith("http")
                ? photo.src
                : `${SITE_URL}${photo.src}`,
            })),
          }}
        />

        <ActionButton
          href="/photography"
          tone="ghost"
          icon={<ArrowLeft className="h-4 w-4" aria-hidden="true" />}
          className="mb-8"
        >
          {copy.detailBack}
        </ActionButton>

        <SectionHeader
          eyebrow={copy.detailEyebrow}
          title={project.title}
          description={project.description}
          actions={
            <Surface
              as="section"
              tone="paper"
              aria-label={copy.metadataLabel}
              className="grid min-w-56 gap-2 p-4 text-sm text-muted-foreground"
            >
              <span>
                {copy.metaStarted} {project.date}
              </span>
              <span>
                {publicCount} {copy.publicCount}
              </span>
              {privateCount > 0 ? (
                <span>
                  {privateCount} {copy.privateCount}
                </span>
              ) : null}
              <span className="inline-flex w-fit items-center gap-1.5 rounded-control border border-hairline bg-surface-paper px-2.5 py-1 text-xs font-semibold text-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                {statusLabel}
              </span>
            </Surface>
          }
        />

        <div className="mt-10">
          <PhotographyGallery photos={photos} projectTitle={project.title} />
        </div>
      </main>
    </PageShell>
  );
}
