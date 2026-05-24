import type { Metadata } from "next";

import { ProjectsPageClient } from "@/components/projects/ProjectsPageClient";
import { siteConfig } from "@/config/siteConfig";
import { loadProjects } from "@/config/projects";

export const metadata: Metadata = {
  title: `Projects | ${siteConfig.name}`,
  description: "Selected projects and open-source work.",
  alternates: { canonical: "/projects" },
};

export const revalidate = 3600;

export default async function ProjectsPage() {
  const projects = await loadProjects();

  return <ProjectsPageClient projects={projects} />;
}
