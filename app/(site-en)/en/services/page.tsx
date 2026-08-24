import { ServicesPageClient } from "@/components/services/ServicesPageClient";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";

export const metadata = buildPublicPageMetadata({
  title: "Enterprise AI workflow systems",
  description:
    "How SolveReal Systems diagnoses workflows, defines human-review boundaries, and delivers auditable AI systems with recovery paths.",
  path: "/services",
  locale: "en",
});

export default function EnglishServicesPage() {
  return <ServicesPageClient />;
}
