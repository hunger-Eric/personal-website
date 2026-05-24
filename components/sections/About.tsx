// components/sections/About.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { Link2 } from "lucide-react";

import { siteConfig } from "../../config/siteConfig";
import { aboutConfig } from "../../config/aboutConfig";

export function AboutSection() {
  const enabled = (siteConfig as any)?.sections?.about === true;
  if (!enabled) return null;

  const a = aboutConfig;

  const fileLabel = a.readme?.fileLabel || "README.md";
  const mdDotIndex = fileLabel.toLowerCase().lastIndexOf(".md");
  const fileBase = mdDotIndex > 0 ? fileLabel.slice(0, mdDotIndex) : fileLabel;
  const fileExt = mdDotIndex > 0 ? fileLabel.slice(mdDotIndex) : "";

  // ✅ exact list/order requested (ignores config)
  const techList = useMemo(
    () => [
      "Python",
      "React.js",
      "C# / ASP.NET",
      "TypeScript",
      "PostgreSQL",
      "Next.js",
    ],
    []
  );

  return (
    <section id="about" className="py-16 scroll-mt-12 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="flex items-center gap-4">
          <h2 className="font-mono text-[13px] font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:text-lg">
            ~/About Me
          </h2>
          <div className="hidden h-px w-40 bg-border sm:block sm:w-72" aria-hidden />
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[290px_1fr] lg:gap-6">
          {/* LEFT — mobile = portrait + stats side-by-side; desktop = full-width portrait then stats stacked below */}
          <aside className="space-y-5">
            {/* Portrait + stats container.
                Mobile (default): horizontal — portrait LEFT, stats RIGHT.
                sm+:               vertical — full-width portrait above stats. */}
            {/* Portrait — sm+ only (mobile shows a small avatar in the hero instead) */}
            {a.avatarUrl ? (
              <div className="group relative hidden aspect-square w-full overflow-hidden rounded-xl border border-border sm:block">
                <Image
                  src={a.avatarUrl}
                  alt={a.displayName || siteConfig.name}
                  fill
                  className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.06]"
                  sizes="(min-width: 1024px) 290px, 100vw"
                  priority={false}
                />
              </div>
            ) : null}

            {/* Action button — opens the /links hub */}
            <Link
              href="/links"
              className="group inline-flex w-full min-w-0 items-center justify-center gap-2 rounded-md border border-accent/40 bg-accent/10 px-3.5 py-2.5 text-sm font-semibold text-foreground transition-colors duration-150 hover:border-accent hover:bg-accent/15"
            >
              <Link2 className="h-4 w-4 flex-none" />
              <span className="truncate">View all my socials</span>
            </Link>
          </aside>

          {/* RIGHT */}
          <div className="space-y-8">
            <div className="rounded-2xl border border-border bg-card/50">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="text-xs font-semibold text-muted-foreground">
                  <span>{a.handle}</span>
                  <span> / </span>
                  <span>{fileBase}</span>
                  {fileExt ? <span>{fileExt}</span> : null}
                </div>
              </div>

              <div className="space-y-4 px-4 py-5 text-sm leading-7 text-foreground/85 sm:px-6 sm:text-base">
                {(a.readme?.paragraphs || []).slice(0, 2).map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}

                {techList.length ? (
                  <>
                    <p>Some of the technologies I work with most often:</p>

                    <ul className="grid list-disc grid-cols-2 gap-x-6 gap-y-1.5 pl-5 marker:text-accent/70">
                      {techList.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  </>
                ) : null}

                {a.readme?.afterTechParagraph ? (
                  <p>{a.readme.afterTechParagraph}</p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
