// components/sections/Cases.tsx
import { loadCases } from "../../config/projects";
import { CasesSectionClient } from "./CasesClient";

export async function CasesSection() {
  const projects = await loadCases();
  return <CasesSectionClient projects={projects} />;
}
