import { AboutPageClient } from "@/components/about/AboutPageClient";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";

export const metadata = buildPublicPageMetadata({
  title: "关于实解智能",
  description: "了解实解智能适合处理的问题、项目负责人和具体合作方式。",
  path: "/about",
});

export default function AboutPage() {
  return <AboutPageClient />;
}
