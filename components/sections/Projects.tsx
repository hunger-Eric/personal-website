// components/sections/Projects.tsx
import { loadCases as loadProjects } from "../../config/cases";
import { ProjectsSectionClient } from "./ProjectsClient";

export async function ProjectsSection() {
  const [projectsZh, projectsEn] = await Promise.all([
    loadProjects("zh"),
    loadProjects("en"),
  ]);
  return <ProjectsSectionClient projectsZh={projectsZh} projectsEn={projectsEn} />;
}
