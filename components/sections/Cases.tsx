// components/sections/Cases.tsx
import { loadCases } from "../../config/cases";
import { CasesSectionClient } from "./CasesClient";

export async function CasesSection() {
  const cases = await loadCases();
  return <CasesSectionClient cases={cases} />;
}


