// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

import { siteConfig } from "@/config/siteConfig";
import { Analytics } from "@vercel/analytics/next";

import { NavbarCentered } from "@/components/NavbarCenteredDesktop";
import NavbarCenteredMobile from "@/components/NavbarCenteredMobile";
import { Footer } from "@/components/Footer";
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
      { url: "/images/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/images/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/images/apple-touch-icon.png", sizes: "180x180" }],
  },

  // Manifest for PWA
  manifest: "/manifest.json",

  // Open Graph
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: `${siteConfig.name} Portfolio`,
    title: `${siteConfig.name} – ${siteConfig.title}`,
    description: siteConfig.tagline,
    images: [
      {
        url: `/api/og?title=${encodeURIComponent(siteConfig.name)}&subtitle=${encodeURIComponent(siteConfig.title)}`,
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
    images: [
      `/api/og?title=${encodeURIComponent(siteConfig.name)}&subtitle=${encodeURIComponent(siteConfig.title)}`,
    ],
    creator: "@kevintrinh1227", // Update with your Twitter handle
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

  // Alternate languages (if you have translations)
  // alternates: {
  //   canonical: BASE_URL,
  //   languages: {
  //     'en-US': BASE_URL,
  //   },
  // },

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
          <Analytics />

          {/* Skip to content link for accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-white"
          >
            Skip to content
          </a>

          {/* Global nav */}
          <NavbarCenteredMobile />
          <NavbarCentered />

          <main id="main-content">
            <PageTransition>{children}</PageTransition>
          </main>

          {/* Global footer */}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
