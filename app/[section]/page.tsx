// app/[section]/page.tsx
"use client";

import { use, useEffect } from "react";
import { notFound } from "next/navigation";
import { siteConfig } from "../../config/siteConfig";

import { Navbar } from "../../components/OLD-Navbar";
import { Footer } from "../../components/Footer";
import { HeroSection } from "../../components/sections/Hero";
import { AboutSection } from "../../components/sections/About";
import { EducationSection } from "../../components/sections/Education";
import { ExperienceSection } from "../../components/sections/Experience";
import { ProjectsSection } from "../../components/sections/Projects";
import { BlogSection } from "../../components/sections/Articles";
import { YouTubeSection } from "../../components/sections/YouTube";
import { CertificationsSection } from "../../components/sections/Certifications";
import { ContactSection } from "../../components/sections/Contact";

const VALID_SECTIONS = [
  "about",
  "education",
  "experience",
  "projects",
  "blog",
  "youtube",
  "certifications",
  "contact",
  "resume",
].filter((id) => {
  const sections = siteConfig.sections as Record<string, boolean | undefined>;
  return sections?.[id] ?? true;
});

export default function SectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  // Unwrap the promise using React.use (required in Next 16 for client components)
  const { section } = use(params);

  if (!VALID_SECTIONS.includes(section)) {
    notFound();
  }

  useEffect(() => {
    const el = document.getElementById(section);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [section]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <EducationSection />
      <ExperienceSection />
      <ProjectsSection />
      <BlogSection />
      <YouTubeSection />
      <CertificationsSection />
      <ContactSection />
      <Footer />
    </main>
  );
}
