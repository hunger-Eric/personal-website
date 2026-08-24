import type { ReactNode } from "react";
import Script from "next/script";
import { GeistSans } from "geist/font/sans";
import { JetBrains_Mono } from "next/font/google";

import { ConditionalChrome } from "@/components/ConditionalChrome";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { LocaleProvider } from "@/components/LocaleProvider";
import { NavbarCentered } from "@/components/NavbarCenteredDesktop";
import NavbarCenteredMobile from "@/components/NavbarCenteredMobile";
import { PageTransition } from "@/components/PageTransition";
import { localeConfig, type Locale } from "@/config/locale";
import {
  generateProfessionalServiceSchema,
  generatePublicPersonSchema,
  generatePublicWebSiteSchema,
} from "@/lib/structured-data";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

const CF_ANALYTICS_TOKEN = process.env.NEXT_PUBLIC_CF_ANALYTICS_TOKEN;

export function SiteDocument({
  children,
  locale,
  publicChrome = true,
}: {
  children: ReactNode;
  locale: Locale;
  publicChrome?: boolean;
}) {
  const skipLabel = locale === "zh" ? "跳到主要内容" : "Skip to content";

  return (
    <html
      lang={localeConfig[locale].htmlLang}
      className={`${GeistSans.className} ${jetbrainsMono.variable}`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if('scrollRestoration' in history){history.scrollRestoration='manual';}}catch(e){}`,
          }}
        />
        {publicChrome ? (
          <JsonLd
            data={[
              generatePublicPersonSchema(locale),
              generatePublicWebSiteSchema(locale),
              generateProfessionalServiceSchema(locale),
            ]}
          />
        ) : null}
        <LocaleProvider initialLocale={locale}>
          {CF_ANALYTICS_TOKEN ? (
            <Script
              src="https://static.cloudflareinsights.com/beacon.min.js"
              data-cf-beacon={`{"token":"${CF_ANALYTICS_TOKEN}"}`}
              strategy="afterInteractive"
            />
          ) : null}
          <Script
            src="https://cloud.umami.is/script.js"
            data-website-id="1de589b4-ac08-45ab-a92c-b69e24fa3419"
            data-domains="me.itheheda.online"
            strategy="afterInteractive"
          />
          {publicChrome ? (
            <>
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-foreground"
              >
                {skipLabel}
              </a>
              <ConditionalChrome>
                <NavbarCenteredMobile />
                <NavbarCentered />
              </ConditionalChrome>
            </>
          ) : null}
          <main id="main-content">
            <PageTransition>{children}</PageTransition>
          </main>
          {publicChrome ? (
            <ConditionalChrome>
              <Footer />
            </ConditionalChrome>
          ) : null}
        </LocaleProvider>
      </body>
    </html>
  );
}
