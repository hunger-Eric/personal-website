"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

import { ActionButton, SectionHeader, Surface } from "@/components/system";
import { certifications } from "@/config/certifications";
import { getSiteCopy } from "@/config/contentCopy";

const copy = getSiteCopy("zh").certifications;

export function CertificationsSection() {
  const [showAll, setShowAll] = useState(false);
  const visibleCerts = showAll ? certifications : certifications.slice(0, 3);

  return (
    <section id="certifications" className="scroll-mt-24 bg-surface-paper py-16">
      <div className="mx-auto w-full max-w-6xl px-4">
        <SectionHeader eyebrow={copy.eyebrow} title={copy.title} />

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleCerts.map((cert) => (
            <Surface
              key={cert.name}
              tone="paper"
              className="group flex h-full flex-col overflow-hidden"
            >
              <a
                href={cert.link}
                target="_blank"
                rel="noreferrer noopener"
                className="block overflow-hidden border-b border-border"
                aria-label={`${copy.viewCredential}: ${cert.name}`}
              >
                <div className="relative aspect-[4/3] bg-muted">
                  <Image
                    src={cert.imageUrl}
                    alt={cert.name}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                  />
                </div>
              </a>

              <article className="flex flex-1 flex-col p-5">
                <h3 className="text-base font-semibold text-foreground sm:text-lg">
                  {cert.name}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {cert.description}
                </p>
                <p className="mt-4 text-xs text-muted-foreground">
                  {cert.issuer} · <span className="font-medium">{cert.date}</span>
                </p>
                <div className="mt-5">
                  <ActionButton
                    href={cert.link}
                    target="_blank"
                    tone="secondary"
                    icon={<ExternalLink className="h-4 w-4" />}
                  >
                    {copy.viewCredential}
                  </ActionButton>
                </div>
              </article>
            </Surface>
          ))}
        </div>

        {certifications.length > 3 ? (
          <div className="mt-6 flex justify-center">
            <ActionButton
              type="button"
              tone="ghost"
              onClick={() => setShowAll((prev) => !prev)}
              icon={
                showAll ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )
              }
            >
              {showAll ? copy.showLess : copy.viewMore}
            </ActionButton>
          </div>
        ) : null}
      </div>
    </section>
  );
}
