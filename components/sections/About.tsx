"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Link2 } from "lucide-react";

import { getSiteCopy } from "@/config/contentCopy";
import { aboutConfig } from "../../config/aboutConfig";
import { siteConfig } from "../../config/siteConfig";
import { useLocale } from "../LocaleProvider";

export function AboutSection() {
  const { locale } = useLocale();
  const copy = getSiteCopy(locale);
  const enabled = (siteConfig as any)?.sections?.about === true;
  if (!enabled) return null;

  const a = aboutConfig;
  const fileLabel = a.readme?.fileLabel || "README.md";
  const mdDotIndex = fileLabel.toLowerCase().lastIndexOf(".md");
  const fileBase = mdDotIndex > 0 ? fileLabel.slice(0, mdDotIndex) : fileLabel;
  const fileExt = mdDotIndex > 0 ? fileLabel.slice(mdDotIndex) : "";

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
            {copy.about.heading}
          </h2>
          <div className="hidden h-px w-40 bg-border sm:block sm:w-72" aria-hidden />
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[290px_1fr] lg:gap-6">
          <aside className="space-y-5">
            <Link
              href="/links"
              className="group inline-flex w-full min-w-0 items-center justify-center gap-2 rounded-md border border-accent/40 bg-accent/10 px-3.5 py-2.5 text-sm font-semibold text-foreground transition-colors duration-150 hover:border-accent hover:bg-accent/15"
            >
              <Link2 className="h-4 w-4 flex-none" />
              <span className="truncate">{copy.about.socialsButton}</span>
            </Link>
          </aside>

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
                {copy.about.paragraphs.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}

                {techList.length ? (
                  <>
                    <p>{copy.about.techIntro}</p>

                    <ul className="grid list-disc grid-cols-2 gap-x-6 gap-y-1.5 pl-5 marker:text-accent/70">
                      {techList.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  </>
                ) : null}

                <p>{copy.about.afterTechParagraph}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
