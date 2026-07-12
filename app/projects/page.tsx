import type { Metadata } from "next";

import { PublicProjectsPage } from "@/components/projects/PublicProjectsPage";

export const metadata: Metadata = { title: "项目案例", description: "经过公开审核的企业 AI 自动化项目事实、系统边界与可迁移能力。", alternates: { canonical: "/projects" } };

export default function ProjectsPage() {
  return <PublicProjectsPage />;
}
