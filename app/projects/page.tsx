import type { Metadata } from "next";

import { CasesPageClient } from "@/components/cases/CasesPageClient";
import { siteConfig } from "@/config/siteConfig";
import { loadCases } from "@/config/cases";

export const metadata: Metadata = {
  title: `Cases | ${siteConfig.name}`,
  description: "Selected cases and ongoing work.",
  alternates: { canonical: "/projects" },
};

export const revalidate = 3600;

export default async function CasesPage() {
  const cases = await loadCases();

  return <CasesPageClient cases={cases} />;
}


