// components/sections/Hero.tsx
"use client";

import { siteConfig } from "../../config/siteConfig";
import { FileText, Mail } from "lucide-react";
import { useModalRoute } from "@/components/hooks/useModalRoute";
import { useLocale } from "@/components/LocaleProvider";

export function HeroSection() {
  const { t } = useLocale();
  // Short flag-style link: "/?resume"
  const resumeModal = useModalRoute({
    scheme: "flag",
    key: "resume",
    scroll: false,
  });

  return (
    <section id="top" className="pt-16 pb-20">
      <div className="mx-auto w-full max-w-6xl px-4">
        <p className="text-base text-muted-foreground sm:text-lg">
          {t.hero.greeting}
        </p>

        <h1 className="mt-3 text-5xl font-semibold sm:text-6xl">
          {siteConfig.name}
        </h1>

        <h2 className="mt-3 text-2xl text-muted-foreground sm:text-3xl">
          {siteConfig.title}
        </h2>

        <p className="mt-5 max-w-xl text-sm text-muted-foreground sm:text-base">
          {siteConfig.tagline}
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          {/* Open the resume modal with a shareable SPA URL (/?resume) */}
          <a
            href={resumeModal.href}
            onClick={(e) => {
              e.preventDefault();
              resumeModal.open();
            }}
            className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-transform transition-colors hover:-translate-y-[1px] hover:bg-accent/90"
            title={`Open ${resumeModal.href}`}
          >
            <FileText className="h-4 w-4" />
            <span>{t.hero.resume}</span>
          </a>

          <a
            href="#contact"
            className="inline-flex items-center gap-2 rounded-md border border-white/20 px-4 py-2 text-sm text-foreground transition-transform transition-colors hover:-translate-y-[1px] hover:border-accent hover:bg-white/5"
          >
            <Mail className="h-4 w-4" />
            <span>{t.hero.contact}</span>
          </a>
        </div>
      </div>
    </section>
  );
}
