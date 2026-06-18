import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Globe, Mail } from "lucide-react";

import { GithubGlyph } from "@/components/BrandGlyphs";
import { ContactQrCard } from "@/components/contact/ContactQrCard";
import { CopyContactButton } from "@/components/contact/CopyContactButton";
import { JsonLd } from "@/components/JsonLd";
import { ShareButton } from "@/components/ShareButton";
import { PageShell, SectionHeader, Surface } from "@/components/system";
import { getSiteCopy } from "@/config/contentCopy";
import { siteConfig } from "@/config/siteConfig";
import { SITE_URL } from "@/lib/site-url";

const copy = getSiteCopy("en");
const LINKS_DESCRIPTION = copy.links.description;

export const metadata: Metadata = {
  title: `Links | ${siteConfig.name}`,
  description: LINKS_DESCRIPTION,
  alternates: { canonical: "/links" },
  openGraph: {
    type: "profile",
    url: "/links",
    title: `${siteConfig.name} | Links`,
    description: LINKS_DESCRIPTION,
    siteName: `${siteConfig.name} Website`,
    images: [
      {
        url: "/images/og/links.png?v=4",
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} links`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | Links`,
    description: LINKS_DESCRIPTION,
    images: ["/images/og/links.png?v=4"],
  },
  robots: { index: true, follow: true },
};

function isExternal(href: string): boolean {
  if (!href) return false;
  if (href.startsWith("/") && !href.startsWith("//")) return false;
  if (href.startsWith("#")) return false;
  if (href.startsWith("mailto:") || href.startsWith("tel:")) return false;
  try {
    const url = new URL(href, SITE_URL);
    return url.host !== new URL(SITE_URL).host;
  } catch {
    return false;
  }
}

function iconFor(key: string) {
  if (key === "github") return <GithubGlyph className="h-6 w-6" />;
  if (key === "email") return <Mail className="h-5 w-5" />;
  return <Globe className="h-5 w-5" />;
}

function LinkRow({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const className =
    "group inline-flex w-full items-center justify-between gap-3 rounded-card border border-hairline bg-surface-paper-elevated px-4 py-4 text-sm font-semibold text-foreground shadow-card transition-colors hover:bg-muted";

  if (href.startsWith("mailto:")) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }

  if (isExternal(href)) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        className={className}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export default function LinksPage() {
  const links = (siteConfig.socialsList ?? []).filter(
    (item) => item.showIn?.links !== false
  );
  const qrLinks = links.filter((item) => item.qrImage);
  const actionLinks = links.filter((item) => !item.qrImage);
  const sameAs = links
    .map((item) => item.href)
    .filter(
      (href): href is string =>
        typeof href === "string" && /^https?:\/\//i.test(href)
    );
  const email = links.find((item) => item.key === "email")?.copyValue;
  const year = new Date().getFullYear();

  const profileJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: `${SITE_URL}/links`,
    name: `${siteConfig.name} | Links`,
    description: LINKS_DESCRIPTION,
    mainEntity: {
      "@type": "Person",
      name: siteConfig.name,
      url: SITE_URL,
      jobTitle: siteConfig.title,
      sameAs,
      ...(email && { email }),
    },
  };

  const renderLinkContent = (item: (typeof actionLinks)[number]) => (
    <>
      <span className="inline-flex min-w-0 items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-control border border-hairline bg-surface-paper">
          {iconFor(item.key)}
        </span>
        <span className="min-w-0">
          <span className="block">{item.label || item.key}</span>
          {item.description ? (
            <span className="mt-0.5 block text-xs font-normal leading-5 text-muted-foreground">
              {item.description}
            </span>
          ) : null}
        </span>
      </span>
      <ArrowUpRight className="h-4 w-4 flex-none text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </>
  );

  return (
    <PageShell
      tone="public"
      className="min-h-[100dvh] px-4 pb-10 pt-10 sm:px-6 sm:pt-14 lg:px-8"
    >
      <JsonLd data={profileJsonLd} />
      <main className="relative mx-auto flex w-full max-w-6xl flex-col">
        <div className="absolute right-0 top-0">
          <ShareButton label={copy.links.share} showLabel={false} />
        </div>

        <SectionHeader
          eyebrow={copy.links.eyebrow}
          title={siteConfig.name}
          description={copy.links.intro}
          actions={
            <div className="grid grid-cols-3 gap-3 text-sm">
              {[
                [copy.links.stats.mode, copy.links.stats.modeValue],
                [copy.links.stats.entry, copy.links.stats.entryValue],
                [copy.links.stats.scan, copy.links.stats.scanValue],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    {label}
                  </p>
                  <p className="mt-1 font-semibold text-foreground">{value}</p>
                </div>
              ))}
            </div>
          }
          className="pr-14"
        />

        <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
          <section className="order-2 grid gap-3 sm:grid-cols-2 lg:order-1">
            <LinkRow href="/">
              <span className="inline-flex min-w-0 items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-control border border-hairline bg-surface-paper">
                  <Globe className="h-5 w-5" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block">{copy.links.websiteTitle}</span>
                  <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                    {copy.links.websiteDescription}
                  </span>
                </span>
              </span>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </LinkRow>

            {actionLinks.map((item) => (
              <LinkRow key={item.key} href={item.href}>
                {renderLinkContent(item)}
              </LinkRow>
            ))}

            {email ? (
              <Surface
                tone="paper"
                className="flex items-center justify-between gap-3 px-4 py-4 shadow-card sm:col-span-2"
              >
                <span className="min-w-0 text-sm">
                  <span className="block font-semibold text-foreground">
                    {copy.links.copyEmailTitle}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {email}
                  </span>
                </span>
                <CopyContactButton
                  value={email}
                  label={copy.links.copyEmailAction}
                />
              </Surface>
            ) : null}
          </section>

          {qrLinks.length ? (
            <Surface
              tone="paper"
              className="order-1 space-y-3 p-4 shadow-card lg:sticky lg:top-8 lg:order-2"
            >
              <div className="flex items-center justify-between border-b border-hairline pb-4">
                <div>
                  <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {copy.links.scanHeading}
                  </h2>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {copy.links.scanDescription}
                  </p>
                </div>
                <span className="rounded-control border border-hairline bg-surface-paper px-2.5 py-1 text-xs text-muted-foreground">
                  {copy.links.scanBadge}
                </span>
              </div>
              {qrLinks.map((item) => (
                <ContactQrCard
                  key={item.key}
                  label={item.label || item.key}
                  description={item.description}
                  qrImage={item.qrImage!}
                  qrAlt={item.qrAlt || `${item.label || item.key} QR code`}
                />
              ))}
            </Surface>
          ) : null}
        </div>

        <footer className="mt-auto flex flex-col items-center gap-1 pt-10 text-center text-xs text-muted-foreground">
          <span>
            {copy.links.footerBuiltByPrefix} {siteConfig.name}
          </span>
          <span>
            © {year} {copy.links.footerRights}
          </span>
        </footer>
      </main>
    </PageShell>
  );
}
