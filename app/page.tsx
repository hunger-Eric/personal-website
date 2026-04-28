// app/page.tsx
import { Suspense } from "react";

import { HeroShowcaseSection } from "@/components/sections/HeroShowcaseSection";
import { AboutSection } from "../components/sections/About";
import { EducationSection } from "../components/sections/Education";
import { ExperienceSection } from "../components/sections/Experience";
import { ProjectsSection } from "../components/sections/Projects";
import { ArticleSection } from "../components/sections/Articles";
import { YouTubeSection } from "../components/sections/YouTube";
import { CertificationsSection } from "../components/sections/Certifications";
import { ContentSection } from "../components/sections/Content";

import { siteConfig } from "@/config/siteConfig";

export default function Page() {
  const { sections } = siteConfig;

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Any section that (directly or via hooks) uses useSearchParams/usePathname/useRouter
          should live inside a Suspense boundary. */}
      <Suspense fallback={null}>
        {sections.hero && <HeroShowcaseSection />}
        {sections.about && <AboutSection />}
        {sections.education && <EducationSection />}
        {sections.experience && <ExperienceSection />}
        {sections.projects && <ProjectsSection />}
      </Suspense>

      {/* These sections don't use URL hooks, so they can render normally */}
      {sections.articles && <ArticleSection />}
      <ContentSection />
      {sections.youtube && <YouTubeSection />}
      {sections.certifications && <CertificationsSection />}
    </main>
  );
}
