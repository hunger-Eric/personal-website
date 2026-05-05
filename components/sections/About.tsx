// components/sections/About.tsx
"use client";

import Image from "next/image";
import { useMemo } from "react";
import {
  Mail,
  Handshake,
  FileText,
  SquareArrowOutUpRight,
} from "lucide-react";

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

  const emailHref = useMemo(() => {
    const fromProfile = (a.profileLinks || []).find(
      (i: any) => i?.type === "email"
    );
    if (fromProfile?.href) return String(fromProfile.href);
    const socials: any = (siteConfig as any)?.socials ?? {};
    const email = socials.email || socials.mail;
    if (!email) return "";
    return email.startsWith("mailto:") ? email : `mailto:${email}`;
  }, [a.profileLinks]);

  const emailLabel = useMemo(
    () => emailHref.replace(/^mailto:/, ""),
    [emailHref]
  );

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
    <section id="about" className="py-16 scroll-mt-12">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="flex items-center gap-4">
          <h2 className="font-mono text-base font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:text-lg">
            ~/About Me
          </h2>
          <div className="h-px w-24 bg-white/5 sm:w-32" aria-hidden />
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[290px_1fr] lg:gap-6">
          {/* LEFT — mobile = portrait + stats side-by-side; desktop = full-width portrait then stats stacked below */}
          <aside className="space-y-5">
            {/* Portrait + stats container.
                Mobile (default): horizontal — portrait LEFT, stats RIGHT.
                sm+:               vertical — full-width portrait above stats. */}
            <div className="flex flex-row items-start gap-4 sm:flex-col sm:gap-5">
              {/* Portrait — small on mobile, full-width square on sm+ */}
              <div className="group relative h-32 w-32 flex-none overflow-hidden rounded-xl border border-white/10 sm:h-auto sm:w-full">
                <div className="relative aspect-square h-full w-full sm:h-auto">
                  {a.avatarUrl ? (
                    <Image
                      src={a.avatarUrl}
                      alt={a.displayName || siteConfig.name}
                      fill
                      className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.06]"
                      sizes="(min-width: 1024px) 290px, (min-width: 640px) 100vw, 128px"
                      priority={false}
                    />
                  ) : null}
                </div>
              </div>

            </div>

            {/* Action buttons */}
            <div className="space-y-2">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {emailHref ? (
                  <a
                    href={emailHref}
                    title={emailLabel}
                    className="group inline-flex w-full min-w-0 items-center justify-center gap-1.5 rounded-md border border-white/15 px-2.5 py-2 text-[12px] font-semibold text-slate-200/80 transition-colors duration-150 hover:border-indigo-400 hover:bg-white/10 hover:text-slate-50"
                  >
                    <Mail className="h-3.5 w-3.5 flex-none opacity-80" />
                    <span className="truncate">{emailLabel}</span>
                  </a>
                ) : null}

                <a
                  href="/resume"
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-white/15 px-2.5 py-2 text-[12px] font-semibold text-slate-200/80 transition-colors duration-150 hover:border-indigo-400 hover:bg-white/10 hover:text-slate-50"
                >
                  <FileText className="h-3.5 w-3.5 flex-none opacity-80" />
                  <span>My Resume</span>
                </a>
              </div>

              <a
                href="/connect"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-md border border-white/15 px-3.5 py-2 text-sm font-semibold text-slate-200/80 transition-colors duration-150 hover:border-indigo-400 hover:bg-white/10 hover:text-slate-50"
              >
                <Handshake className="h-4 w-4 opacity-80" />
                My Socials
              </a>
            </div>
          </aside>

          {/* RIGHT */}
          <div className="space-y-8">
            <div className="rounded-2xl border border-white/10 bg-transparent">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="text-xs font-semibold text-muted-foreground">
                  <span>{a.handle}</span>
                  <span> / </span>
                  <span>{fileBase}</span>
                  {fileExt ? <span>{fileExt}</span> : null}
                </div>

                <a
                  href="/about"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Open About page in a new tab"
                  title="Open About page"
                  className="group inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:bg-white/5 hover:text-indigo-300"
                >
                  <span>Read more</span>
                  <SquareArrowOutUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              </div>

              <div className="space-y-4 px-4 py-5 text-sm leading-7 text-slate-200/90 sm:px-6 sm:text-base">
                {(a.readme?.paragraphs || []).slice(0, 2).map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}

                {techList.length ? (
                  <>
                    <p>Some of the technologies I work with most often:</p>

                    <ul className="grid list-disc grid-cols-2 gap-x-6 gap-y-1.5 pl-5 marker:text-indigo-400/70">
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
