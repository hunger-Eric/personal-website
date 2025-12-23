import type { Metadata } from "next";
import "./globals.css";
import { siteConfig } from "../config/siteConfig";
import { Analytics } from "@vercel/analytics/next";

import { NavbarCentered } from "../components/NavbarCenteredDesktop";
import NavbarCenteredMobile from "../components/NavbarCenteredMobile";

export const metadata: Metadata = {
  title: `${siteConfig.name} – ${siteConfig.title}`,
  description: siteConfig.tagline,
  icons: { icon: "/images/favicon.ico" },
  openGraph: {
    title: `${siteConfig.name} – ${siteConfig.title}`,
    description: siteConfig.tagline,
    url: "https://kevintrinh.dev",
    siteName: siteConfig.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} – ${siteConfig.title}`,
    description: siteConfig.tagline,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Analytics />
        <NavbarCenteredMobile />
        <NavbarCentered />
        {children}
      </body>
    </html>
  );
}
