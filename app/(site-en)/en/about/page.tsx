import { AboutPageClient } from "@/components/about/AboutPageClient";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";

export const metadata = buildPublicPageMetadata({
  title: "About SolveReal Systems",
  description:
    "Learn how SolveReal Systems approaches enterprise AI workflow diagnosis, system delivery, human review, and operating boundaries.",
  path: "/about",
  locale: "en",
});

export default function EnglishAboutPage() {
  return <AboutPageClient />;
}
