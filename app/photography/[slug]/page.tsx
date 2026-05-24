// app/photography/[slug]/page.tsx
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { siteConfig } from "@/config/siteConfig";
import photographyData from "@/config/photography.json";
import { PhotographyGallery } from "@/components/PhotographyGallery";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return photographyData.projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = photographyData.projects.find((p) => p.slug === slug);
  if (!project) return {};

  return {
    title: `${project.title} — Photography`,
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
  const project = photographyData.projects.find((p) => p.slug === slug);
  if (!project) notFound();

  const publicCount = project.photos.filter((p) => !p.private).length;
  const privateCount = project.photos.filter((p) => p.private).length;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      {/* Back link */}
      <Link
        href="/photography"
        className="group mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        所有项目
      </Link>

      {/* Project header */}
      <header className="mb-12">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {project.title}
            </h1>
            <p className="mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
              {project.description}
            </p>

            {/* Meta */}
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span>始于 {project.date}</span>
              <span className="text-border">·</span>
              <span>{publicCount} 张公开</span>
              {privateCount > 0 && (
                <>
                  <span className="text-border">·</span>
                  <span>{privateCount} 张私密</span>
                </>
              )}
              <span className="text-border">·</span>
              {project.status === "ongoing" ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  持续更新
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  已完成
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Gallery */}
      <PhotographyGallery
        photos={project.photos}
        projectTitle={project.title}
      />
    </div>
  );
}