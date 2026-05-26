// components/sections/Projects.tsx
import { loadCases as loadProjects } from "../../config/cases";
import { ProjectsSectionClient } from "./ProjectsClient";

export async function ProjectsSection() {
  const projects = await loadProjects();
  return <ProjectsSectionClient projects={projects} />;
}
