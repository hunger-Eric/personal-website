// components/sections/Hero.tsx
"use client";

import { siteConfig } from "../../config/siteConfig";
import { FileText, Mail } from "lucide-react";
import { useModalRoute } from "@/components/hooks/useModalRoute";
import { useLocale } from "@/components/LocaleProvider";
import { ActionButton } from "@/components/system";

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
          <ActionButton
            href={resumeModal.href}
            onClick={(e) => {
              e.preventDefault();
              resumeModal.open();
            }}
            tone="primary"
            title={`Open ${resumeModal.href}`}
            icon={<FileText className="h-4 w-4" />}
          >
            <span>{t.hero.resume}</span>
          </ActionButton>

          <ActionButton
            href="#contact"
            tone="secondary"
            icon={<Mail className="h-4 w-4" />}
          >
            <span>{t.hero.contact}</span>
          </ActionButton>
        </div>
      </div>
    </section>
  );
}
