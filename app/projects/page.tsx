import type { Metadata } from "next";

import { CasesPageClient } from "@/components/cases/CasesPageClient";
import { loadCases } from "@/config/cases";

export const metadata: Metadata = {
  title: "AI Native Lab",
  description: "System records for AI workflow, automation, and AI-assisted development.",
  alternates: { canonical: "/projects" },
};

export const revalidate = 3600;

export default async function CasesPage() {
  const cases = await loadCases();

  return <CasesPageClient cases={cases} />;
}


