import { JsonLd } from "@/components/JsonLd";
import { PublicProjectsPage } from "@/components/projects/PublicProjectsPage";
import { getPublicWebsiteProjects } from "@/config/website-projects";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";
import { generateProjectCollectionSchema } from "@/lib/structured-data";

export const metadata = buildPublicPageMetadata({
  title: "Enterprise AI systems and projects",
  description:
    "Reviewed enterprise AI systems from SolveReal Systems, with their operating boundaries and public evidence.",
  path: "/projects",
  locale: "en",
});

export default function EnglishProjectsPage() {
  const projects = getPublicWebsiteProjects("en");
  return (
    <>
      <JsonLd data={generateProjectCollectionSchema(projects, "en")} />
      <PublicProjectsPage />
    </>
  );
}
