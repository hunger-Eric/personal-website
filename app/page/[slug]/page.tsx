// app/page/[slug]/page.tsx
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { siteConfig } from "@/config/siteConfig";
import pagesData from "@/config/pages.json";
import { PageBlocks } from "@/components/PageBlocks";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return pagesData.pages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = pagesData.pages.find((p) => p.slug === slug);
  if (!page) return {};

  return {
    title: `${page.title} | ${siteConfig.name}`,
    description: page.description,
    alternates: { canonical: `/page/${slug}` },
  };
}

export default async function PageRenderer({ params }: Props) {
  const { slug } = await params;
  const page = pagesData.pages.find((p) => p.slug === slug);
  if (!page) notFound();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <Link
        href="/"
        className="group mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        首页
      </Link>

      <header className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {page.title}
        </h1>
        {page.description && (
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
            {page.description}
          </p>
        )}
      </header>

      <PageBlocks blocks={page.blocks} />
    </div>
  );
}