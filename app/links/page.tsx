import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Globe, Mail } from "lucide-react";

import { ContactQrCard } from "@/components/contact/ContactQrCard";
import { CopyContactButton } from "@/components/contact/CopyContactButton";
import { GithubGlyph } from "@/components/BrandGlyphs";
import { JsonLd } from "@/components/JsonLd";
import { ShareButton } from "@/components/ShareButton";
import { siteConfig } from "@/config/siteConfig";
import { SITE_URL } from "@/lib/site-url";

const LINKS_DESCRIPTION = `${siteConfig.name} 的联系入口：GitHub、邮箱、微信公众号和个人微信。`;

export const metadata: Metadata = {
  title: `Links | ${siteConfig.name}`,
  description: LINKS_DESCRIPTION,
  alternates: { canonical: "/links" },
  openGraph: {
    type: "profile",
    url: "/links",
    title: `${siteConfig.name} · Links`,
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
    title: `${siteConfig.name} · Links`,
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

export default function LinksPage() {
  const links = (siteConfig.socialsList ?? []).filter(
    (item) => item.showIn?.links !== false
  );
  const qrLinks = links.filter((item) => item.qrImage);
  const actionLinks = links.filter((item) => !item.qrImage);
  const sameAs = links
    .map((item) => item.href)
    .filter((href): href is string => typeof href === "string" && /^https?:\/\//i.test(href));
  const email = links.find((item) => item.key === "email")?.copyValue;
  const year = new Date().getFullYear();

  const profileJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: `${SITE_URL}/links`,
    name: `${siteConfig.name} · Links`,
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

  return (
    <main className="relative mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col bg-[#f7f1e7] px-4 pb-10 pt-10 text-[#1f2420] sm:px-6 sm:pt-14 lg:px-8">
      <JsonLd data={profileJsonLd} />

      <div className="absolute right-4 top-4 sm:right-6 sm:top-6 lg:right-8">
        <ShareButton
          label="Share"
          showLabel={false}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#d9cfbf] bg-[#fffaf1] text-[#1f2420] transition-colors hover:bg-[#efe4d2]"
        />
      </div>

      <section className="border-y border-[#d9cfbf] py-7 lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end lg:gap-12 lg:py-10">
        <div className="max-w-3xl">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#817565]">
            AI Native Builder
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#1f2420] sm:text-5xl">
            {siteConfig.name}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#6f6659]">
            把 AI、自动化、知识系统和业务流程组织成可运行的系统。这里是公开联系方式和内容入口。
          </p>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 border-t border-[#d9cfbf] pt-5 text-sm lg:mt-0 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#817565]">
              Mode
            </p>
            <p className="mt-1 font-semibold text-[#1f2420]">Public</p>
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#817565]">
              Entry
            </p>
            <p className="mt-1 font-semibold text-[#1f2420]">Links</p>
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#817565]">
              Scan
            </p>
            <p className="mt-1 font-semibold text-[#1f2420]">WeChat</p>
          </div>
        </div>
      </section>

      <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
        <section className="order-2 grid gap-3 sm:grid-cols-2 lg:order-1">
          <Link
            href="/"
            className="group inline-flex w-full items-center justify-between gap-3 rounded-md border border-[#d9cfbf] bg-[#fffaf1] px-4 py-4 text-sm font-semibold text-[#1f2420] shadow-sm shadow-[#d3c3a8]/30 transition-colors hover:bg-[#efe4d2]"
          >
            <span className="inline-flex min-w-0 items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#d9cfbf] bg-[#f7f1e7]">
                <Globe className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block">个人网站</span>
                <span className="mt-0.5 block text-xs font-normal text-[#6f6659]">
                  AI Native Lab / system archive
                </span>
              </span>
            </span>
            <ArrowUpRight className="h-4 w-4 text-[#817565] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>

          {actionLinks.map((item) => {
            const content = (
              <>
                <span className="inline-flex min-w-0 items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#d9cfbf] bg-[#f7f1e7]">
                    {iconFor(item.key)}
                  </span>
                  <span className="min-w-0">
                    <span className="block">{item.label || item.key}</span>
                    {item.description && (
                      <span className="mt-0.5 block text-xs font-normal leading-5 text-[#6f6659]">
                        {item.description}
                      </span>
                    )}
                  </span>
                </span>
                <ArrowUpRight className="h-4 w-4 flex-none text-[#817565] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </>
            );

            const className =
              "group inline-flex w-full items-center justify-between gap-3 rounded-md border border-[#d9cfbf] bg-[#fffaf1] px-4 py-4 text-sm font-semibold text-[#1f2420] shadow-sm shadow-[#d3c3a8]/30 transition-colors hover:bg-[#efe4d2]";

            if (item.href.startsWith("mailto:")) {
              return (
                <a key={item.key} href={item.href} className={className}>
                  {content}
                </a>
              );
            }

            if (isExternal(item.href)) {
              return (
                <a
                  key={item.key}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={className}
                >
                  {content}
                </a>
              );
            }

            return (
              <Link key={item.key} href={item.href} className={className}>
                {content}
              </Link>
            );
          })}

          {email && (
            <div className="flex items-center justify-between gap-3 rounded-md border border-[#d9cfbf] bg-[#efe4d2]/50 px-4 py-4 shadow-sm shadow-[#d3c3a8]/30 sm:col-span-2">
              <span className="min-w-0 text-sm">
                <span className="block font-semibold text-[#1f2420]">Copy email</span>
                <span className="block truncate text-xs text-[#6f6659]">{email}</span>
              </span>
              <CopyContactButton value={email} label="Copy email" />
            </div>
          )}
        </section>

        {qrLinks.length ? (
          <section className="order-1 space-y-3 rounded-lg border border-[#d9cfbf] bg-[#fffaf1]/82 p-4 shadow-sm shadow-[#d3c3a8]/40 lg:sticky lg:top-8 lg:order-2">
            <div className="flex items-center justify-between border-b border-[#d9cfbf] pb-4">
              <div>
                <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#817565]">
                  Scan channels
                </h2>
                <p className="mt-1 text-sm font-semibold text-[#1f2420]">
                  WeChat / 公众号
                </p>
              </div>
              <span className="rounded border border-[#d9cfbf] bg-[#f7f1e7] px-2.5 py-1 text-xs text-[#6f6659]">
                QR
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
          </section>
        ) : null}
      </div>

      <footer className="mt-auto flex flex-col items-center gap-1 pt-10 text-center text-xs text-[#817565]">
        <span>Built by {siteConfig.name}</span>
        <span>© {year} All rights reserved</span>
      </footer>
    </main>
  );
}
