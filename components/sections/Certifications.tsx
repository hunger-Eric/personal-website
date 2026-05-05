// components/sections/Certifications.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { certifications } from "../../config/certifications";

export function CertificationsSection() {
  const [showAll, setShowAll] = useState(false);

  const visibleCerts = showAll ? certifications : certifications.slice(0, 3);

  return (
    <section id="certifications" className="py-16 scroll-mt-24">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div>
          <h2 className="text-lg font-semibold uppercase tracking-[0.2em] text-white/60">
            ~/Certifications
          </h2>
          <h3 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            My verified skills and credentials.
          </h3>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleCerts.map((cert) => {
            const targetLink = cert.link;

            return (
              <article
                key={cert.name}
                className="group flex h-full flex-col rounded-xl border border-white/10 bg-white/5/5 bg-gradient-to-br from-white/5 to-white/0 p-4 shadow-sm backdrop-blur-sm sm:p-5"
              >
                <h4 className="text-base font-semibold text-white sm:text-lg">
                  {cert.name}
                </h4>

                <button
                  type="button"
                  onClick={() =>
                    window.open(targetLink, "_blank", "noopener,noreferrer")
                  }
                  className="mt-3 w-full overflow-hidden rounded-lg border border-white/10 bg-black/40 text-left"
                >
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={cert.imageUrl}
                      alt={cert.name}
                      fill
                      className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03] group-hover:-translate-y-0.5"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-70" />
                  </div>
                </button>

                <div className="mt-4 flex flex-col items-center gap-2 text-center sm:items-start sm:text-left">
                  <p className="text-xs text-white/55 sm:text-sm">
                    {cert.issuer} ·{" "}
                    <span className="font-medium">{cert.date}</span>
                  </p>
                  <a
                    href={targetLink}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-2 rounded-md bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-md sm:text-sm"
                  >
                    <span>View credential</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </article>
            );
          })}
        </div>

        {certifications.length > 3 && (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => setShowAll((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white/80 transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              <span>{showAll ? "Show less" : "View more"}</span>
              {showAll ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
