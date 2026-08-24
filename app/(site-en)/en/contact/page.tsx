import { Suspense } from "react";
import { ArrowRight, Mail } from "lucide-react";

import { ContactQrCard } from "@/components/contact/ContactQrCard";
import { WorkflowInquiryForm } from "@/components/contact/WorkflowInquiryForm";
import { siteConfig } from "@/config/siteConfig";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";

export const metadata = buildPublicPageMetadata({
  title: "Submit a business workflow",
  description:
    "Describe a real workflow problem and ask SolveReal Systems for an initial fit assessment.",
  path: "/contact",
  locale: "en",
});

const emailContact = siteConfig.socialsList.find((contact) => contact.key === "email");
const publicEmail = emailContact?.copyValue || emailContact?.href.replace(/^mailto:/, "");
const wechatContact = siteConfig.socialsList.find((contact) => contact.key === "wechat");

export default function EnglishContactPage() {
  return (
    <div className="min-h-screen bg-surface-paper pb-20 pt-28 text-surface-paper-foreground sm:pt-32">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
        <section>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent">Workflow diagnosis</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.045em] text-foreground sm:text-5xl">Start with a real business problem</h1>
          <p className="mt-6 text-base leading-8 text-muted-foreground">This is not an automatic quote. Your information is reviewed by a person before we decide where AI should take part.</p>
          <section className="mt-12" aria-labelledby="direct-contact-heading">
            <h2 id="direct-contact-heading" className="text-2xl font-semibold tracking-[-0.025em] text-foreground">Contact directly</h2>
            <div className="mt-4 border-t border-hairline">
              {emailContact && publicEmail ? (
                <div className="grid grid-cols-[48px_minmax(0,1fr)] items-center gap-4 border-b border-hairline py-5 sm:grid-cols-[48px_minmax(0,1fr)_auto]">
                  <span className="flex h-12 w-12 items-center justify-center bg-surface-paper-elevated text-accent" aria-hidden><Mail className="h-5 w-5" /></span>
                  <span className="min-w-0"><span className="block text-xs font-medium text-muted-foreground">Email</span><a href={emailContact.href} className="mt-1 block truncate text-base font-medium text-foreground hover:text-accent">{publicEmail}</a></span>
                  <a href={emailContact.href} className="col-start-2 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent-hover sm:col-start-auto">Send email<ArrowRight className="h-4 w-4" aria-hidden /></a>
                </div>
              ) : null}
              {wechatContact?.qrImage && wechatContact.qrAlt ? (
                <ContactQrCard label="WeChat" description={wechatContact.copyValue || "404"} actionLabel="View QR code" qrImage={wechatContact.qrImage} qrAlt={wechatContact.qrAlt} />
              ) : null}
            </div>
          </section>
        </section>
        <section className="border border-hairline bg-surface-paper-elevated p-5 shadow-card sm:p-8">
          <h2 className="text-2xl font-semibold tracking-[-0.025em] text-foreground">Submit your business problem</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Describe the current workflow, manual effort, and where errors happen most often.</p>
          <div className="mt-7"><Suspense fallback={<p className="text-sm text-muted-foreground">Preparing the form…</p>}><WorkflowInquiryForm /></Suspense></div>
        </section>
      </div>
    </div>
  );
}
