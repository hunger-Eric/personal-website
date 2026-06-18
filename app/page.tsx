import { Suspense } from "react";

import { HeroShowcaseSection } from "@/components/sections/HeroShowcaseSection";
import { SystemDemoConsole } from "@/components/sections/SystemDemoConsole";
import { AboutSection } from "../components/sections/About";
import { EducationSection } from "../components/sections/Education";
import { ExperienceSection } from "../components/sections/Experience";
import { CasesSection } from "../components/sections/Cases";
import { ContentMediaSection } from "../components/sections/ContentMedia";
import { YouTubeSection } from "../components/sections/YouTube";
import { CertificationsSection } from "../components/sections/Certifications";

import { siteConfig } from "@/config/siteConfig";
import { loadCases } from "@/config/cases";

export default async function Page() {
  const { sections } = siteConfig;
  const cases = await loadCases("zh");

  return (
    <main className="min-h-screen bg-[#f7f1e7] text-[#1f2420]">
      {sections.hero && <HeroShowcaseSection />}
      <SystemDemoConsole cases={cases} />
      {sections.about && <AboutSection />}
      {sections.education && <EducationSection />}
      {sections.experience && <ExperienceSection />}

      <Suspense fallback={null}>
        {sections.projects && <CasesSection />}
      </Suspense>

      <ContentMediaSection />

      {sections.youtube && <YouTubeSection />}
      {sections.certifications && <CertificationsSection />}
    </main>
  );
}
