import type { Metadata } from "next";

import { publicIdentity } from "@/config/public-identity";
import { localizePublicPath, type Locale } from "@/config/locale";

type PublicPageMetadataInput = {
  title: string;
  description: string;
  path: `/${string}`;
  image?: string;
  locale?: Locale;
  hasLanguageAlternate?: boolean;
};

export function buildPublicPageMetadata({
  title,
  description,
  path,
  image = "/images/og/home.png?v=4",
  locale = "zh",
  hasLanguageAlternate = true,
}: PublicPageMetadataInput): Metadata {
  const brandName = publicIdentity.names[locale];
  const localizedPath = localizePublicPath(path, locale);
  const chinesePath = localizePublicPath(path, "zh");
  const socialTitle = `${title} | ${brandName}`;
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
    alternates: {
      canonical: localizedPath,
      ...(hasLanguageAlternate && {
        languages: {
          "zh-CN": chinesePath,
          en: localizePublicPath(chinesePath, "en"),
          "x-default": chinesePath,
        },
      }),
    },
    openGraph: {
      type: "website",
      locale: locale === "zh" ? "zh_CN" : "en_US",
      url: localizedPath,
      siteName: brandName,
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
