// app/page.tsx
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { HeroShowcaseSection } from "@/components/sections/HeroShowcaseSection";
import { AboutSection } from "../components/sections/About";
import { EducationSection } from "../components/sections/Education";
import { ExperienceSection } from "../components/sections/Experience";
import { CasesSection } from "../components/sections/Cases";
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

// Referer hostnames that count as "came from a social platform" — used as a
// fallback because TikTok / Facebook in-app browsers do NOT append utm_source
// the way Instagram does. They DO leak the referer (and click IDs) for most
// outbound clicks.
const SOCIAL_REFERER_HOSTS = [
  "instagram.com",
  "l.instagram.com",
  "tiktok.com",
  "vm.tiktok.com",
  "facebook.com",
  "l.facebook.com",
  "lm.facebook.com",
  "m.facebook.com",
  "threads.net",
  "threads.com",
  "linkedin.com",
  "lnkd.in",
  "twitter.com",
  "t.co",
  "x.com",
  "youtube.com",
  "youtu.be",
  "snapchat.com",
  "pinterest.com",
];

function refererIsSocial(referer: string | null): boolean {
  if (!referer) return false;
  try {
    const url = new URL(referer);
    const host = url.hostname.toLowerCase();
    return SOCIAL_REFERER_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
  } catch {
    return false;
  }
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const get = (key: string) => {
    const v = params[key];
    return String(Array.isArray(v) ? v[0] : v || "").trim().toLowerCase();
  };

  const utm = get("utm_source");
  const isUtmSocial = !!utm && BIO_UTM_SOURCES.has(utm);
  // Click identifiers — presence alone is enough.
  const hasFbclid = !!get("fbclid");
  const hasTtclid = !!get("ttclid");
  const hasIgshid = !!get("igshid");
  const hasGclid = !!get("gclid"); // intentionally NOT triggered (Google ads)

  let isSocialReferer = false;
  if (!isUtmSocial && !hasFbclid && !hasTtclid && !hasIgshid) {
    try {
      const h = await headers();
      isSocialReferer = refererIsSocial(h.get("referer"));
    } catch {
      // headers() may be unavailable in some build paths
    }
  }

  if (isUtmSocial || hasFbclid || hasTtclid || hasIgshid || isSocialReferer) {
    redirect("/links");
  }
  // gclid intentionally falls through (paid Google traffic stays on home)
  void hasGclid;

  const { sections } = siteConfig;

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero/About/Education/Experience render server-side normally — only
          CasesSection needs a Suspense boundary because CasesClient
          uses useSearchParams. Wrapping the whole stack used to bail every
          section out to client-side rendering, which made fresh loads briefly
          show only the Content section before snapping back to the top. */}
      {sections.hero && <HeroShowcaseSection />}
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
