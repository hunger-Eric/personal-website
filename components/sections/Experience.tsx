// components/sections/Experience.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { experience } from "../../config/experience";

function formatCompany(name: string): string {
  // "VisibleSeed LLC" -> "VisibleSeed, LLC"; same for Inc, Inc., Co., Corp., Ltd.
  return name.replace(
    /\s+(LLC|L\.L\.C\.|Inc\.?|Co\.?|Corp\.?|Ltd\.?)$/i,
    ", $1"
  );
}

function companyInitials(name: string): string {
  // "St. Mary's University" -> "SM", "VisibleSeed LLC" -> "VL", single word -> first 2 letters
  const cleaned = name.replace(/[^a-zA-Z\s]/g, "").trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (parts[0]?.slice(0, 2) || "·").toUpperCase();
}

function CompanyAvatar({
  logoUrl,
  company,
}: {
  logoUrl?: string;
  company: string;
}) {
  if (logoUrl) {
    return (
      <div className="relative h-8 w-8 flex-none overflow-hidden rounded-md border border-white/10 bg-white/5">
        <Image
          src={logoUrl}
          alt={`${company} logo`}
          fill
          sizes="32px"
          className="object-cover"
        />
      </div>
    );
  }
  return (
    <div className="flex h-8 w-8 flex-none items-center justify-center rounded-md border border-white/10 bg-indigo-500/15 text-[11px] font-bold text-indigo-200">
      {companyInitials(company)}
    </div>
  );
}

export function ExperienceSection() {
  if (!experience.length) return null;

  const defaultActiveId = experience[0]?.id;
  const [activeId, setActiveId] = useState<string>(defaultActiveId);
  const activeItem =
    experience.find((item) => item.id === activeId) ?? experience[0];

  // ✅ subtle "Apple-like" fade when switching roles
  const [detailsKey, setDetailsKey] = useState(0);

  // ✅ Left menu typography — smaller on mobile
  const roleCompanyClass = "text-sm font-semibold sm:text-lg";

  // ✅ Details typography — smaller on mobile
  const detailsTitleClass = "text-base font-semibold sm:text-2xl";

  const detailsMetaClass = "mt-1 text-[15px] sm:text-[16px]";

  // ✅ Bullets/paragraphs: decreased slightly
  const bulletClass = "mt-5 space-y-2 text-[15px] sm:text-[16px]";

  // ✅ light-weight fade for details panel using key + CSS animation
  const detailsFadeClass =
    "animate-in fade-in-0 duration-200 ease-out motion-reduce:animate-none";

  const handleSelect = (id: string) => {
    setActiveId(id);
    setDetailsKey((k) => k + 1);
  };

  return (
    <section id="experience" className="py-16 scroll-mt-12 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="flex items-center gap-4">
          <h2 className="font-mono text-[13px] font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:text-lg">
            ~/Experience
          </h2>
          <div className="hidden h-px w-40 bg-white/15 sm:block sm:w-72" aria-hidden />
        </div>

        <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-start">
          {/* Left: roles list — horizontal scroll on mobile, vertical on md+ */}
          <div className="w-full border-b border-white/10 pb-4 md:w-72 md:border-b-0 md:pb-0 md:pr-6">
            <ul className="-mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-col md:gap-0 md:space-y-1 md:overflow-visible md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
              {experience.map((item) => {
                const isActive = item.id === activeItem.id;
                return (
                  <li key={item.id} className="flex-none snap-start md:flex-auto md:snap-align-none">
                    <button
                      type="button"
                      onClick={() => handleSelect(item.id)}
                      className={[
                        "group flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-left transition-colors hover:bg-white/5",
                        "md:w-full md:border-0 md:px-3 md:py-3",
                        isActive ? "bg-white/5 border-accent/40 md:border-0" : "",
                      ].join(" ")}
                    >
                      <CompanyAvatar
                        logoUrl={item.logoUrl}
                        company={item.company}
                      />

                      <div className="min-w-0 md:flex-1">
                        <p
                          className={
                            isActive
                              ? `${roleCompanyClass} text-indigo-300 whitespace-nowrap md:whitespace-normal`
                              : `${roleCompanyClass} text-foreground group-hover:text-accent/60 whitespace-nowrap md:whitespace-normal`
                          }
                        >
                          {formatCompany(item.company)}
                        </p>
                      </div>

                      <div
                        className={`hidden h-12 w-[2px] rounded-full transition-all duration-200 md:block ${
                          isActive
                            ? "bg-accent"
                            : "bg-transparent group-hover:bg-accent/40"
                        }`}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Right: details */}
          <article
            className="
              flex-1
              border-t-0
              pt-0
              text-muted-foreground
              md:border-t-0
              md:border-l
              md:border-white/10
              md:pl-6
              md:pt-0
            "
          >
            <div key={detailsKey} className={detailsFadeClass}>
              <div className="flex flex-col justify-between gap-2 sm:flex-row">
                <div>
                  <h4 className={`${detailsTitleClass} text-foreground`}>
                    {activeItem.role} @ {formatCompany(activeItem.company)}
                  </h4>

                  {/* ✅ Removed city/location + removed job type */}
                  <p className={`${detailsMetaClass} text-muted-foreground`}>
                    {activeItem.start} - {activeItem.end}
                  </p>
                </div>
              </div>

              {activeItem.description?.length > 0 && (
                <ul
                  className={`${bulletClass} list-disc pl-5 marker:text-indigo-400/70`}
                >
                  {activeItem.description.slice(0, 3).map((line, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {line}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </article>
        </div>
      </div>

    </section>
  );
}
