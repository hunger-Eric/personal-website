import "@/app/globals.css";

import { SiteDocument } from "@/components/SiteDocument";
import { siteViewport } from "@/lib/root-metadata";

export const viewport = siteViewport;

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SiteDocument locale="zh" publicChrome={false}>
      {children}
    </SiteDocument>
  );
}
