import type { Metadata } from "next";

import { publicIdentity } from "@/config/public-identity";

type PublicPageMetadataInput = {
  title: string;
  description: string;
  path: `/${string}`;
  image?: string;
};

export function buildPublicPageMetadata({
  title,
  description,
  path,
  image = "/images/og/home.png?v=4",
}: PublicPageMetadataInput): Metadata {
  const socialTitle = `${title} | ${publicIdentity.canonicalName}`;
  const images = [
    {
      url: image,
      width: 1200,
      height: 630,
      alt: socialTitle,
    },
  ];

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "zh_CN",
      url: path,
      siteName: publicIdentity.canonicalName,
      title: socialTitle,
      description,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [image],
    },
  };
}
