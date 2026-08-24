import "@/app/globals.css";

import { SiteDocument } from "@/components/SiteDocument";
import { buildRootMetadata, siteViewport } from "@/lib/root-metadata";

export const metadata = buildRootMetadata("en");
export const viewport = siteViewport;

export default function EnglishSiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SiteDocument locale="en">{children}</SiteDocument>;
}
