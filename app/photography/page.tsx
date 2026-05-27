import type { Metadata } from "next";

import photographyData from "@/config/photography.json";
import { siteConfig } from "@/config/siteConfig";
import { PhotographyIndexClient } from "@/components/photography/PhotographyIndexClient";

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
  return (
    <PhotographyIndexClient
      projectsZh={zhData?.projects || []}
      projectsEn={enData?.projects || []}
      descriptionZh={zhData?.description || ""}
      descriptionEn={enData?.description || ""}
    />
  );
}
