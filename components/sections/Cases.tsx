import { loadCases } from "../../config/cases";
import { CasesSectionClient } from "./CasesClient";

export async function CasesSection() {
  // Load both locales so client can switch without re-fetch
  const [casesZh, casesEn] = await Promise.all([
    loadCases("zh"),
    loadCases("en"),
  ]);
  return <CasesSectionClient casesZh={casesZh} casesEn={casesEn} />;
}
