import "@/app/globals.css";

import { SiteDocument } from "@/components/SiteDocument";
import { buildRootMetadata, siteViewport } from "@/lib/root-metadata";

export const metadata = buildRootMetadata("zh");
export const viewport = siteViewport;

export default function ChineseSiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SiteDocument locale="zh">{children}</SiteDocument>;
}
