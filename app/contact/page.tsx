// app/contact/page.tsx
import type { Metadata } from "next";
import { siteConfig } from "@/config/siteConfig";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContactPicker } from "@/components/contact/ContactPicker";

export const metadata: Metadata = {
  title: "Contact",
  description: `The best ways to reach ${siteConfig.name}. Pick what fits and you'll get an email pre-filled with the right subject and address.`,
  openGraph: {
    title: `Contact | ${siteConfig.name}`,
    description: `The best ways to reach ${siteConfig.name}.`,
  },
};

export default function ContactPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-24 pt-16 sm:pt-24">
      <Breadcrumbs
        items={[
          { name: "Home", url: "/" },
          { name: "Contact", url: "/contact" },
        ]}
      />

      <header className="mb-10">
        <h1 className="mb-3 text-4xl font-bold tracking-tight sm:text-5xl">
          Get in touch
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Tell me a bit about what you need and I&apos;ll point you at the
          right inbox. Each option opens your email client with a pre-filled
          subject — no form submission, no webhooks, no bots collecting data.
        </p>
      </header>

      <ContactPicker />
    </main>
  );
}
