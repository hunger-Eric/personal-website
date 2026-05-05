// components/sections/About.tsx
"use client";

import Image from "next/image";
import { useMemo } from "react";
import { Mail } from "lucide-react";

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
    <section id="about" className="py-16 scroll-mt-12 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="flex items-center gap-4">
          <h2 className="font-mono text-[13px] font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:text-lg">
            ~/About Me
          </h2>
          <div className="hidden h-px w-40 bg-white/15 sm:block sm:w-72" aria-hidden />
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

            {/* Action button — email only */}
            {emailHref ? (
              <a
                href={emailHref}
                title={emailLabel}
                className="group inline-flex w-full min-w-0 items-center justify-center gap-2 rounded-md border border-indigo-400/40 bg-indigo-500/10 px-3.5 py-2.5 text-sm font-semibold text-slate-50 transition-colors duration-150 hover:border-indigo-400 hover:bg-indigo-500/20"
              >
                <Mail className="h-4 w-4 flex-none" />
                <span className="truncate">{emailLabel}</span>
              </a>
            ) : null}
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
