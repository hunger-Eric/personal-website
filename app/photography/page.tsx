// app/photography/page.tsx
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/siteConfig";
import photographyData from "@/config/photography.json";
import { PageTitle } from "@/components/PageTitle";

export const metadata: Metadata = {
  title: "Photography",
  description: photographyData.description,
  alternates: { canonical: "/photography" },
  openGraph: {
    type: "website",
    url: "/photography",
    title: `Photography | ${siteConfig.name}`,
    description: photographyData.description,
    images: [
      {
        url: "/images/og/photography.png?v=1",
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} — photography`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Photography | ${siteConfig.name}`,
    description: photographyData.description,
    images: ["/images/og/photography.png?v=1"],
  },
};

export default function PhotographyPage() {
  const { projects, description } = photographyData;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      {/* Header — title localized, description from photography.json */}
      <PageTitle pageKey="photography" showDescription={false} />
      <p className="mx-auto mb-14 max-w-2xl text-center text-lg text-muted-foreground">
        {description}
      </p>

      {/* Project Cards Grid */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/photography/${project.slug}`}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
          >
            {/* Cover Image */}
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src={project.coverImage}
                alt={project.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Status badge */}
              <div className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                {project.status === "ongoing" ? "进行中" : "已完成"}
              </div>
              {/* Photo count + private badge */}
              <div className="absolute bottom-3 right-3 flex gap-1.5">
                {project.photos.some((p: any) => p.private) && (
                  <div className="rounded-full bg-amber-500/80 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                    🔒 私密
                  </div>
                )}
                <div className="rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                  {project.photoCount} 张
                </div>
              </div>
            </div>

            {/* Info */}
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
                  {project.photoCount} 张照片
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty state */}
      {projects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 text-4xl">📷</div>
          <h2 className="text-xl font-semibold">暂无项目</h2>
          <p className="mt-2 text-muted-foreground">
            摄影项目正在筹备中，敬请期待
          </p>
        </div>
      )}
    </div>
  );
}