import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PublicProjectDetail } from "@/components/projects/PublicProjectDetail";
import { getLocalizedPublicContent } from "@/config/public-content";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return getLocalizedPublicContent("zh").projects.map((project) => ({ id: project.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const project = getLocalizedPublicContent("zh").projects.find((item) => item.id === id);
  if (!project) return {};
  return { title: project.name, description: project.purpose, alternates: { canonical: `/projects/${project.id}` } };
}

export default async function ProjectPage({ params }: Props) {
  const { id } = await params;
  if (!getLocalizedPublicContent("zh").projects.some((project) => project.id === id)) notFound();
  return <PublicProjectDetail id={id} />;
}
