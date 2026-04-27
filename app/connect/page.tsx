// app/connect/page.tsx
import type { Metadata } from "next";
import Image from "next/image";

import { siteConfig } from "@/config/siteConfig";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ConnectRow } from "@/components/connect/ConnectRow";

export const metadata: Metadata = {
  title: `Connect | ${siteConfig.name}`,
  description: `Reach me directly — every place I'm active online. ${siteConfig.name}.`,
  openGraph: {
    title: `Connect with ${siteConfig.name}`,
    description: "All my socials and ways to reach me, in one place.",
  },
};

export default function ConnectPage() {
  const items = (siteConfig.socialsList ?? []).filter((s) => {
    const href = (s.href || "").trim();
    return href && href !== "null";
  });

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-24 pt-16 sm:pt-24">
      <Breadcrumbs
        items={[
          { name: "Home", url: "/" },
          { name: "Connect", url: "/connect" },
        ]}
        className="mb-8"
      />

      <header className="mb-10 flex flex-col items-center text-center">
        <div className="relative mb-5 h-24 w-24 overflow-hidden rounded-full ring-2 ring-white/10">
          <Image
            src="/images/avatar.jpg"
            alt={siteConfig.name}
            fill
            sizes="96px"
            className="object-cover"
            priority
          />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
          {siteConfig.name}
        </h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground sm:text-base">
          {siteConfig.title}. {siteConfig.location}.
        </p>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Every place I&apos;m active online — pick whichever works for you.
        </p>
      </header>

      <ul className="flex flex-col gap-3">
        {items.map((s) => (
          <li key={s.key}>
            <ConnectRow
              label={s.label || s.key}
              detail={s.detail}
              href={s.href}
              icon={s.icon}
              isCopy={s.isCopy}
              copyValue={s.copyValue}
            />
          </li>
        ))}
      </ul>
    </main>
  );
}
