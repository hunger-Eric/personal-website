// app/layout.tsx
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { GeistSans } from "geist/font/sans";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

import { publicIdentity } from "@/config/public-identity";
import { viewportThemeColors } from "@/config/visualTokens";

import { NavbarCentered } from "@/components/NavbarCenteredDesktop";
import NavbarCenteredMobile from "@/components/NavbarCenteredMobile";
import { Footer } from "@/components/Footer";
import { ConditionalChrome } from "@/components/ConditionalChrome";
import { JsonLd } from "@/components/JsonLd";
import { PageTransition } from "@/components/PageTransition";
import { ThemeProvider, ThemeScript } from "@/components/ThemeProvider";
import { LocaleProvider } from "@/components/LocaleProvider";
import {
  generateProfessionalServiceSchema,
  generatePublicPersonSchema,
  generatePublicWebSiteSchema,
} from "@/lib/structured-data";
import { SITE_URL } from "@/lib/site-url";

// Configure fonts with display: swap to prevent FOUT
const geistSans = GeistSans;

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

// Base URL for canonical URLs and OG images
// Cloudflare Web Analytics token (privacy-friendly, no cookies). Optional —
// the beacon is only injected when the env var is present so previews and
// local dev stay quiet.
const CF_ANALYTICS_TOKEN = process.env.NEXT_PUBLIC_CF_ANALYTICS_TOKEN;

// Viewport configuration
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: viewportThemeColors.light },
    { media: "(prefers-color-scheme: dark)", color: viewportThemeColors.dark },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// Enhanced metadata
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  // Basic metadata
  title: {
    default: `${publicIdentity.canonicalName} — ${publicIdentity.category.zh}`,
    template: `%s | ${publicIdentity.canonicalName}`,
  },
  description: publicIdentity.positioning.zh,
  keywords: [
    publicIdentity.canonicalName,
    "企业 AI 自动化",
    "业务流程自动化",
    "AI 工作流诊断",
    "人工审核自动化",
    "中小企业自动化改造",
  ],
  authors: [{ name: publicIdentity.canonicalName, url: SITE_URL }],
  creator: publicIdentity.canonicalName,
  publisher: publicIdentity.canonicalName,

  // Icons
  icons: {
    icon: [
      { url: "/images/favicon.ico" },
      { url: "/images/favicon.png", type: "image/png" },
    ],
    apple: [{ url: "/images/favicon.png", sizes: "180x180" }],
    shortcut: ["/images/favicon.ico"],
  },

  // Manifest for PWA
  manifest: "/manifest.json",

  // Open Graph — use a static image (dynamic next/og doesn't work reliably
  // on Cloudflare Workers via OpenNext).
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: SITE_URL,
    siteName: `${publicIdentity.canonicalName} — AI Automation`,
    title: `${publicIdentity.canonicalName} — ${publicIdentity.category.zh}`,
    description: publicIdentity.positioning.zh,
    images: [
      {
        url: "/images/og/home.png?v=4",
        width: 1200,
        height: 630,
        alt: `${publicIdentity.canonicalName} — ${publicIdentity.category.zh}`,
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: `${publicIdentity.canonicalName} — ${publicIdentity.category.zh}`,
    description: publicIdentity.positioning.zh,
    images: ["/images/og/home.png?v=4"],
  },

  // Robots
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

  // Verification (add your verification codes)
  // verification: {
  //   google: 'your-google-verification-code',
  //   yandex: 'your-yandex-verification-code',
  // },

  // Alternates: feeds + canonical
  alternates: {
    canonical: SITE_URL,
    types: {
      "application/rss+xml": [
        { url: `${SITE_URL}/feed.xml`, title: `${publicIdentity.canonicalName} — Articles` },
      ],
      "application/feed+json": [
        { url: `${SITE_URL}/feed.json`, title: `${publicIdentity.canonicalName} — Articles` },
      ],
    },
  },

  // Category
  category: "technology",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.className} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Theme script - prevents flash of wrong theme */}
        <ThemeScript />

        {/*
          Disable native browser scroll restoration BEFORE the browser tries to
          jump back to the previously-saved scroll position on refresh. Without
          this, refreshing a long page (e.g. /) made the screen flash to where
          the user was scrolled, then JS would snap back to the top — visually
          a jarring jump. Setting this to "manual" makes refreshes always land
          at the top, no flicker.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if('scrollRestoration' in history){history.scrollRestoration='manual';}}catch(e){}`,
          }}
        />

        {/* Preconnect to external domains for faster loading */}
        <link rel="preconnect" href="https://api.github.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="https://api.github.com" />
        <link rel="dns-prefetch" href="https://avatars.githubusercontent.com" />

        {/* JSON-LD Structured Data */}
        <JsonLd
          data={[
            generatePublicPersonSchema(),
            generatePublicWebSiteSchema(),
            generateProfessionalServiceSchema(),
          ]}
        />
      </head>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <ThemeProvider>
          <LocaleProvider>
          {/* Cloudflare Web Analytics — privacy-friendly, no cookies. Replaces
              @vercel/analytics, whose beacon doesn't reliably reach Vercel from
              Cloudflare Workers. */}
          {CF_ANALYTICS_TOKEN && (
            <Script
              src="https://static.cloudflareinsights.com/beacon.min.js"
              data-cf-beacon={`{"token":"${CF_ANALYTICS_TOKEN}"}`}
              strategy="afterInteractive"
            />
          )}

          {/* Umami Analytics — self-hosted privacy-friendly analytics */}
          <Script
            src="https://cloud.umami.is/script.js"
            data-website-id="1de589b4-ac08-45ab-a92c-b69e24fa3419"
            data-domains="me.itheheda.online"
            strategy="afterInteractive"
          />

          {/* Skip to content link for accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-foreground"
          >
            Skip to content
          </a>

          {/* Global nav (hidden on bare routes like /connect) */}
          <ConditionalChrome>
            <NavbarCenteredMobile />
            <NavbarCentered />
          </ConditionalChrome>

          <main id="main-content">
            <PageTransition>{children}</PageTransition>
          </main>

          {/* Global footer (hidden on bare routes like /connect) */}
          <ConditionalChrome>
            <Footer />
          </ConditionalChrome>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
