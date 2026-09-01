import type { Metadata, Viewport } from "next";

import type { Locale } from "@/config/locale";
import { localizePublicPath } from "@/config/locale";
import { publicIdentity } from "@/config/public-identity";
import { SITE_URL } from "@/lib/site-url";

export const siteViewport: Viewport = {
  themeColor: "#f3efe6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const otherWebmasterVerification = {
  BING_SITE_VERIFICATION: "msvalidate.01",
  NAVER_SITE_VERIFICATION: "naver-site-verification",
  BAIDU_SITE_VERIFICATION: "baidu-site-verification",
  SO360_SITE_VERIFICATION: "360-site-verification",
  SOGOU_SITE_VERIFICATION: "sogou_site_verification",
  SHENMA_SITE_VERIFICATION: "shenma-site-verification",
  TOUTIAO_SITE_VERIFICATION: "bytedance-verification-code",
} as const;

function buildWebmasterVerification(): Metadata["verification"] {
  const google = process.env.GOOGLE_SITE_VERIFICATION?.trim();
  const yandex = process.env.YANDEX_SITE_VERIFICATION?.trim();
  const other = Object.fromEntries(
    Object.entries(otherWebmasterVerification).flatMap(([environmentName, metaName]) => {
      const value = process.env[environmentName]?.trim();
      return value ? [[metaName, value]] : [];
    })
  );

  if (!google && !yandex && Object.keys(other).length === 0) return undefined;

  return {
    ...(google ? { google } : {}),
    ...(yandex ? { yandex } : {}),
    ...(Object.keys(other).length > 0 ? { other } : {}),
  };
}

export function buildRootMetadata(locale: Locale): Metadata {
  const brandName = publicIdentity.names[locale];
  const category = publicIdentity.category[locale];
  const description = publicIdentity.positioning[locale];
  const canonical = localizePublicPath("/", locale);
  const title = `${brandName} — ${category}`;
  const verification = buildWebmasterVerification();

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: `%s | ${brandName}` },
    description,
    keywords:
      locale === "zh"
        ? [
            brandName,
            "企业 AI 自动化",
            "业务流程自动化",
            "AI 工作流诊断",
            "人工审核自动化",
            "中小企业自动化改造",
          ]
        : [
            brandName,
            "enterprise AI systems",
            "business workflow automation",
            "AI workflow design",
            "human review automation",
            "custom AI systems",
          ],
    authors: [{ name: brandName, url: SITE_URL }],
    creator: brandName,
    publisher: brandName,
    icons: {
      icon: [
        { url: "/images/favicon.ico" },
        { url: "/images/favicon.png", type: "image/png" },
      ],
      apple: [{ url: "/images/favicon.png", sizes: "180x180" }],
      shortcut: ["/images/favicon.ico"],
    },
    manifest: "/manifest.json",
    openGraph: {
      type: "website",
      locale: locale === "zh" ? "zh_CN" : "en_US",
      url: canonical,
      siteName: brandName,
      title,
      description,
      images: [
        {
          url: "/images/og/home.png?v=4",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/images/og/home.png?v=4"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical,
      languages: {
        "zh-CN": "/",
        en: "/en",
        "x-default": "/",
      },
      types: {
        "application/rss+xml": [
          { url: `${SITE_URL}/feed.xml`, title: `${brandName} — Articles` },
        ],
        "application/feed+json": [
          { url: `${SITE_URL}/feed.json`, title: `${brandName} — Articles` },
        ],
      },
    },
    category: "technology",
    verification,
  };
}
