// app/layout.tsx
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

import { siteConfig } from "@/config/siteConfig";

import { NavbarCentered } from "@/components/NavbarCenteredDesktop";
import NavbarCenteredMobile from "@/components/NavbarCenteredMobile";
import { Footer } from "@/components/Footer";
import { ConditionalChrome } from "@/components/ConditionalChrome";
import { JsonLd } from "@/components/JsonLd";
import { PageTransition } from "@/components/PageTransition";
import { ThemeProvider, ThemeScript } from "@/components/ThemeProvider";
import {
  generatePersonSchema,
  generateWebSiteSchema,
  generateProfilePageSchema,
} from "@/lib/structured-data";

// Configure fonts with display: swap to prevent FOUT
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

// Base URL for canonical URLs and OG images
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://kevintrinh.dev";

// Cloudflare Web Analytics token (privacy-friendly, no cookies). Optional —
// the beacon is only injected when the env var is present so previews and
// local dev stay quiet.
const CF_ANALYTICS_TOKEN = process.env.NEXT_PUBLIC_CF_ANALYTICS_TOKEN;

// Viewport configuration
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#050816" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// Enhanced metadata
export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  // Basic metadata
  title: {
    default: `${siteConfig.name} – ${siteConfig.title}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.tagline,
  keywords: [
    siteConfig.name,
    "portfolio",
    "developer",
    "software engineer",
    "full stack",
    "web development",
    "React",
    "Next.js",
    "TypeScript",
  ],
  authors: [{ name: siteConfig.name, url: BASE_URL }],
  creator: siteConfig.name,
  publisher: siteConfig.name,

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
    locale: "en_US",
    url: BASE_URL,
    siteName: `${siteConfig.name} Website`,
    title: `${siteConfig.name} – ${siteConfig.title}`,
    description: siteConfig.tagline,
    images: [
      {
        url: "/images/og/home.png?v=4",
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} - ${siteConfig.title}`,
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} – ${siteConfig.title}`,
    description: siteConfig.tagline,
    images: ["/images/og/home.png?v=4"],
    creator: "@KevinTrinhDev",
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
    canonical: BASE_URL,
    types: {
      "application/rss+xml": [
        { url: `${BASE_URL}/feed.xml`, title: `${siteConfig.name} — Articles` },
      ],
      "application/feed+json": [
        { url: `${BASE_URL}/feed.json`, title: `${siteConfig.name} — Articles` },
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
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
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
            generatePersonSchema(),
            generateWebSiteSchema(),
            generateProfilePageSchema(),
          ]}
        />
      </head>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <ThemeProvider>
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

          {/* Skip to content link for accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-white"
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
        </ThemeProvider>
      </body>
    </html>
  );
}
