import type { Metadata } from "next";

import photographyData from "@/config/photography.json";
import { siteConfig } from "@/config/siteConfig";
import { JsonLd } from "@/components/JsonLd";
import { PhotographyIndexClient } from "@/components/photography/PhotographyIndexClient";
import { SITE_URL } from "@/lib/site-url";

const zhData = photographyData.zh;
const enData = photographyData.en;

export const metadata: Metadata = {
  title: `Photography | ${siteConfig.name}`,
  description: enData?.description || zhData?.description,
  alternates: { canonical: "/photography" },
  openGraph: {
    type: "website",
    url: "/photography",
    title: `Photography | ${siteConfig.name}`,
    description: enData?.description || zhData?.description,
    images: [
      {
        url: "/images/og/photography.png?v=1",
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} - photography`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Photography | ${siteConfig.name}`,
    description: enData?.description || zhData?.description,
    images: ["/images/og/photography.png?v=1"],
  },
};

export default function PhotographyPage() {
  const projects = (enData?.projects || zhData?.projects || []).map((project) => ({
    "@type": "CollectionPage",
    name: project.title,
    description: project.description,
    url: `${SITE_URL}/photography/${project.slug}`,
  }));

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `Photography | ${siteConfig.name}`,
          description: enData?.description || zhData?.description,
          url: `${SITE_URL}/photography`,
          hasPart: projects,
        }}
      />
      <PhotographyIndexClient
        projectsZh={zhData?.projects || []}
        projectsEn={enData?.projects || []}
        descriptionZh={zhData?.description || ""}
        descriptionEn={enData?.description || ""}
      />
    </>
  );
}
