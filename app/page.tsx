// app/page.tsx
import { Suspense } from "react";
import { redirect } from "next/navigation";

import { HeroShowcaseSection } from "@/components/sections/HeroShowcaseSection";
import { AboutSection } from "../components/sections/About";
import { EducationSection } from "../components/sections/Education";
import { ExperienceSection } from "../components/sections/Experience";
import { ProjectsSection } from "../components/sections/Projects";
import { ContentMediaSection } from "../components/sections/ContentMedia";
import { YouTubeSection } from "../components/sections/YouTube";
import { CertificationsSection } from "../components/sections/Certifications";

import { siteConfig } from "@/config/siteConfig";

// utm_source values that mean "user clicked a link-in-bio / social link"
// — when present, send them to /links instead of the homepage.
const BIO_UTM_SOURCES = new Set([
  "instagram",
  "ig",
  "tiktok",
  "tt",
  "youtube",
  "yt",
  "twitter",
  "x",
  "linkedin",
  "li",
  "threads",
  "facebook",
  "fb",
  "snapchat",
  "snap",
  "pinterest",
  "bio",
  "linkinbio",
  "link_in_bio",
  "linktree",
]);

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const raw = params.utm_source;
  const utm = String(Array.isArray(raw) ? raw[0] : raw || "")
    .trim()
    .toLowerCase();
  if (utm && BIO_UTM_SOURCES.has(utm)) {
    redirect("/links");
  }

  const { sections } = siteConfig;

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero/About/Education/Experience render server-side normally — only
          ProjectsSection needs a Suspense boundary because ProjectsClient
          uses useSearchParams. Wrapping the whole stack used to bail every
          section out to client-side rendering, which made fresh loads briefly
          show only the Content section before snapping back to the top. */}
      {sections.hero && <HeroShowcaseSection />}
      {sections.about && <AboutSection />}
      {sections.education && <EducationSection />}
      {sections.experience && <ExperienceSection />}

      <Suspense fallback={null}>
        {sections.projects && <ProjectsSection />}
      </Suspense>

      <ContentMediaSection />

      {sections.youtube && <YouTubeSection />}
      {sections.certifications && <CertificationsSection />}
    </main>
  );
}
