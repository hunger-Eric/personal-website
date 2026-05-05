// components/sections/Experience.tsx
"use client";

import { useState } from "react";
import { History } from "lucide-react";
import { experience } from "../../config/experience";

function formatCompany(name: string): string {
  // "VisibleSeed LLC" -> "VisibleSeed, LLC"; same for Inc, Inc., Co., Corp., Ltd.
  return name.replace(
    /\s+(LLC|L\.L\.C\.|Inc\.?|Co\.?|Corp\.?|Ltd\.?)$/i,
    ", $1"
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

  const btnBase =
    "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-xs sm:text-sm font-medium transition border border-white/15 text-white/90 hover:text-white hover:border-accent hover:bg-white/5";

  // ✅ Left menu typography (increased)
  // ✅ Left menu typography (slightly reduced)
  const roleCompanyClass = "text-lg font-semibold";

  // ✅ Details typography (slightly reduced)
  const detailsTitleClass = "text-xl font-semibold sm:text-2xl";

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
    <section id="experience" className="py-16 scroll-mt-12">
      <div className="mx-auto w-full max-w-6xl px-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          ~/Experience
        </h2>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          {/* stacked on mobile, inline on sm+ */}
          <div className="grid grid-cols-1 gap-2 text-xs sm:flex sm:flex-wrap sm:gap-3 sm:text-sm">
            {/* All Experience (dedicated page) */}
            <a href="/experience" className={btnBase}>
              <History className="h-4 w-4" />
              <span>All Experience</span>
            </a>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-start">
          {/* Left: roles list (wider) */}
          <div className="w-full border-b border-white/10 pb-4 md:w-72 md:border-b-0 md:pb-0 md:pr-6">
            <ul className="space-y-1">
              {experience.map((item) => {
                const isActive = item.id === activeItem.id;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(item.id)}
                      className={[
                        "group w-full rounded-md px-3 py-3 text-left transition-colors hover:bg-white/5",
                        isActive ? "bg-white/5" : "",
                      ].join(" ")}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <p
                            className={
                              isActive
                                ? `${roleCompanyClass} text-indigo-300`
                                : `${roleCompanyClass} text-foreground group-hover:text-accent/60`
                            }
                          >
                            {formatCompany(item.company)}
                          </p>
                        </div>

                        <div
                          className={`h-12 w-[2px] rounded-full transition-all duration-200 ${
                            isActive
                              ? "bg-accent"
                              : "bg-transparent group-hover:bg-accent/40"
                          }`}
                        />
                      </div>
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
                <ul className={bulletClass}>
                  {activeItem.description.map((line, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 leading-relaxed"
                    >
                      <span
                        className="
                          mt-[7px]
                          inline-block
                          h-0
                          w-0
                          border-y-[4px]
                          border-y-transparent
                          border-l-[7px]
                          border-l-accent
                        "
                        aria-hidden="true"
                      />
                      <span>{line}</span>
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
