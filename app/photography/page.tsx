import type { Metadata } from "next";

import photographyData from "@/config/photography.json";
import { siteConfig } from "@/config/siteConfig";
import { PhotographyIndexClient } from "@/components/photography/PhotographyIndexClient";

export const metadata: Metadata = {
  title: `Photography | ${siteConfig.name}`,
  description: photographyData.description,
  alternates: { canonical: "/photography" },
  openGraph: {
    type: "website",
    url: "/photography",
    title: `Photography | ${siteConfig.name}`,
    description: photographyData.description,
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
    description: photographyData.description,
    images: ["/images/og/photography.png?v=1"],
  },
};

export default function PhotographyPage() {
  const { projects, description } = photographyData;
  return <PhotographyIndexClient projects={projects} description={description} />;
}
