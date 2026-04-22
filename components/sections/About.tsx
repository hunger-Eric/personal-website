// components/sections/About.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import {
  ExternalLink,
  FileText,
  GraduationCap,
  MapPin,
  Mail,
  Activity,
  GitPullRequest,
  GitCommitHorizontal,
  MessageSquare,
  Bug,
  FolderGit2,
  PenLine,
  BookOpenText,
  Star,
  GitFork,
  Github,
  NotebookPen,
  Folder,
  SquareArrowOutUpRight,
  Code2,
  Wind,
  Database,
} from "lucide-react";

import { siteConfig } from "../../config/siteConfig";
import { aboutConfig } from "../../config/aboutConfig";

/** Filled LinkedIn icon */
function LinkedInFilled(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      <path
        fill="currentColor"
        d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.35V9h3.414v1.561h.047c.476-.9 1.637-1.852 3.37-1.852 3.6 0 4.266 2.368 4.266 5.455v6.288zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.115 20.452H3.558V9h3.557v11.452z"
      />
    </svg>
  );
}

/** Cloudflare logo (simple mono mark) */
function CloudflareLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      <path
        fill="currentColor"
        d="M7.8 18.5h10.1c2 0 3.6-1.4 3.9-3.3.3-2.2-1.3-4.2-3.6-4.5-.6-2.2-2.6-3.7-4.9-3.7-2 0-3.8 1.1-4.6 2.8-2.1.1-3.8 1.9-3.8 4.1 0 1.4.7 2.7 1.9 3.5.3.2.6.3 1 .3z"
      />
    </svg>
  );
}

/** Python logo (clean mono mark) */
function PythonLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      <path
        fill="currentColor"
        d="M12 2c-3.6 0-6 .9-6 4v3.1c0 1 .8 1.9 1.9 1.9H14c1.1 0 2-.9 2-2V6c0-2.8-1.9-4-4-4h0z"
      />
      <circle cx="10" cy="4.9" r="0.9" fill="currentColor" />
      <path
        fill="currentColor"
        d="M12 22c3.6 0 6-.9 6-4v-3.1c0-1-.8-1.9-1.9-1.9H10c-1.1 0-2 .9-2 2V18c0 2.8 1.9 4 4 4h0z"
      />
      <circle cx="14" cy="19.1" r="0.9" fill="currentColor" />
    </svg>
  );
}

/** Ubuntu logo (simple circle + dots) */
function UbuntuLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 256 256" aria-hidden {...props}>
      <path
        fill="currentColor"
        d="M128 20c-59.6 0-108 48.4-108 108s48.4 108 108 108 108-48.4 108-108S187.6 20 128 20Zm0 20c16 0 30.7 5 42.8 13.5-6.6 6.7-10.7 15.9-10.7 26 0 20.3 16.5 36.8 36.8 36.8 7.6 0 14.7-2.3 20.6-6.2 1 5.7 1.5 11.6 1.5 17.7 0 16-5 30.7-13.5 42.8-6.7-6.6-15.9-10.7-26-10.7-20.3 0-36.8 16.5-36.8 36.8 0 7.6 2.3 14.7 6.2 20.6-5.7 1-11.6 1.5-17.7 1.5-16 0-30.7-5-42.8-13.5 6.6-6.7 10.7-15.9 10.7-26 0-20.3-16.5-36.8-36.8-36.8-7.6 0-14.7 2.3-20.6 6.2-1-5.7-1.5-11.6-1.5-17.7 0-16 5-30.7 13.5-42.8 6.7 6.6 15.9 10.7 26 10.7 20.3 0 36.8-16.5 36.8-36.8 0-7.6-2.3-14.7-6.2-20.6 5.7-1 11.6-1.5 17.7-1.5Z"
      />
      <circle fill="currentColor" cx="189" cy="79" r="12" />
      <circle fill="currentColor" cx="189" cy="177" r="12" />
      <circle fill="currentColor" cx="67" cy="128" r="12" />
    </svg>
  );
}

/** C++ icon (text badge style) */
function CppLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden {...props}>
      <rect x="2" y="8" width="60" height="48" rx="10" fill="currentColor" />
      <path
        d="M22 40c-6 0-10-4-10-8s4-8 10-8c3 0 5 .8 7 2.4l-2.5 3c-1-.9-2.4-1.4-4.5-1.4-3.3 0-5.6 2-5.6 4s2.3 4 5.6 4c2 0 3.5-.6 4.6-1.5l2.4 3C27 39.2 25 40 22 40Zm20-5v-3h-2v3h-3v2h3v3h2v-3h3v-2h-3Zm10 0v-3h-2v3h-3v2h3v3h2v-3h3v-2h-3Z"
        fill="#0b0f1a"
      />
    </svg>
  );
}

function isExternalHref(href?: string) {
  if (!href) return false;
  return (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:")
  );
}

function iconForProfileLink(type: string) {
  switch (type) {
    case "school":
      return GraduationCap;
    case "email":
      return Mail;
    case "linkedin":
      return LinkedInFilled;
    case "github":
      return Github;
    default:
      return MapPin;
  }
}

function iconForName(name?: string) {
  switch (name) {
    case "Star":
      return Star;
    case "GitFork":
      return GitFork;
    case "Activity":
      return Activity;
    case "GitPullRequest":
      return GitPullRequest;
    case "GitCommitHorizontal":
      return GitCommitHorizontal;
    case "MessageSquare":
      return MessageSquare;
    case "Bug":
      return Bug;
    case "FolderGit2":
      return FolderGit2;
    case "PenLine":
      return PenLine;
    case "BookOpenText":
      return BookOpenText;
    case "Github":
      return Github;
    case "NotebookPen":
      return NotebookPen;
    case "Folder":
      return Folder;
    case "FileText":
      return FileText;
    default:
      return Activity;
  }
}

function iconForTech(label: string) {
  const t = label.toLowerCase();

  if (t === "python" || t.includes("python")) return PythonLogo;
  if (t.includes("cloudflare")) return CloudflareLogo;
  if (t.includes("google cloud") || t.includes("gcp")) return CloudflareLogo;

  if (t.includes("ubuntu") || t.includes("linux")) return UbuntuLogo;
  if (t.includes("c++")) return CppLogo;

  if (t.includes("next")) return Code2;
  if (t.includes("postgres")) return Database;
  if (t.includes("tailwind")) return Wind;
  if (t.includes("git")) return GitFork;

  return Code2;
}

function TechPill({ label }: { label: string }) {
  const Icon = iconForTech(label);
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-semibold text-slate-50/90">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      <span>{label}</span>
    </span>
  );
}

export function AboutSection() {
  const enabled = (siteConfig as any)?.sections?.about === true;
  if (!enabled) return null;

  const a = aboutConfig;

  const fileLabel = a.readme?.fileLabel || "README.md";
  const mdDotIndex = fileLabel.toLowerCase().lastIndexOf(".md");
  const fileBase = mdDotIndex > 0 ? fileLabel.slice(0, mdDotIndex) : fileLabel;
  const fileExt = mdDotIndex > 0 ? fileLabel.slice(mdDotIndex) : "";

  const leftLinks = useMemo(() => {
    const filtered = (a.profileLinks || []).filter((item: any) => {
      const t = String(item?.type || "");
      return t !== "location";
    });

    const byType = new Map<string, any>();
    for (const item of filtered) byType.set(String(item.type || ""), item);

    const socials: any = (siteConfig as any)?.socials ?? {};

    const school = byType.get("school") ?? {
      type: "school",
      label: a.schoolName || "University",
    };

    const email = byType.get("email") ?? {
      type: "email",
      label: socials.email || socials.mail || "",
      href: socials.email
        ? socials.email.startsWith("mailto:")
          ? socials.email
          : `mailto:${socials.email}`
        : undefined,
    };

    const linkedin = byType.get("linkedin") ?? {
      type: "linkedin",
      label: "LinkedIn",
      href: socials.linkedin,
    };

    const github = byType.get("github") ?? {
      type: "github",
      label: "GitHub",
      href: socials.github,
    };

    const extras = filtered.filter((x: any) => {
      const t = String(x?.type || "");
      return !["school", "email", "linkedin", "github"].includes(t);
    });

    return [school, email, linkedin, github, ...extras];
  }, [a.profileLinks, a.schoolName]);

  // ✅ exact list/order requested (ignores config)
  const techList = useMemo(
    () => [
      "Next.js",
      "Tailwind CSS",
      "PostgresSQL",
      "Git",
      "Python",
      "C++",
      "Cloudflare",
      "Google Cloud",
    ],
    []
  );

  const metricCards = useMemo(() => {
    const keep = new Set([
      "Projects & Repositories",
      "GitHub activity overview",
    ]);
    const cards = (a.snapshot?.cards || []).filter((c: any) =>
      keep.has(String(c?.title || ""))
    );
    return cards.slice(0, 2);
  }, [a.snapshot?.cards]);

  return (
    <section id="about" className="py-16 scroll-mt-12">
      <div className="mx-auto w-full max-w-6xl px-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          ~/About
        </h2>

        <h3 className="mt-3 text-2xl font-semibold sm:text-3xl">
          An overview of who I am.
        </h3>

        <div className="mt-8 grid gap-5 lg:grid-cols-[290px_1fr] lg:gap-6">
          {/* LEFT */}
          <aside className="space-y-5">
            <div className="group relative w-full overflow-hidden rounded-xl border border-white/10 shadow-[0_10px_30px_-18px_rgba(99,102,241,0.45)]">
              <div className="relative aspect-square w-full">
                {a.avatarUrl ? (
                  <Image
                    src={a.avatarUrl}
                    alt={a.displayName || siteConfig.name}
                    fill
                    className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.06]"
                    sizes="(min-width: 1024px) 290px, 100vw"
                    priority={false}
                  />
                ) : null}
              </div>
            </div>

            {/* ✅ tighter spacing to links */}
            <div className="pt-1 pb-0">
              <div className="grid grid-cols-1 gap-2">
                <a
                  href={a.cta.secondary.href}
                  target={a.cta.secondary.external ? "_blank" : undefined}
                  rel={a.cta.secondary.external ? "noreferrer" : undefined}
                  className="group inline-flex items-center justify-center gap-2 rounded-md border border-white/20 px-3.5 py-2 text-sm font-semibold text-slate-200/80 transition-colors duration-150 hover:border-indigo-400 hover:bg-white/10 hover:text-slate-50"
                >
                  {a.cta.secondary.label ?? "Read more about me"}
                  <SquareArrowOutUpRight className="h-4 w-4 opacity-80 transition-colors group-hover:opacity-100 group-hover:text-slate-50" />
                </a>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:gap-3">
              <div className="space-y-2 pt-0 text-sm">
                {leftLinks.map((item: any) => {
                  const type = String(item.type || "");
                  const Icon = iconForProfileLink(type);

                  const isBrightText = type === "school";

                  const content = item.href ? (
                    <a
                      href={item.href}
                      target={isExternalHref(item.href) ? "_blank" : undefined}
                      rel={isExternalHref(item.href) ? "noreferrer" : undefined}
                      className="truncate text-slate-200/90 transition-colors hover:text-indigo-300 hover:underline"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <span
                      className={
                        isBrightText
                          ? "text-slate-200/90"
                          : "text-muted-foreground"
                      }
                    >
                      {item.label}
                    </span>
                  );

                  return (
                    <div
                      key={`${type}-${item.label}`}
                      className="flex items-center gap-2"
                    >
                      <Icon className="h-4 w-4 text-slate-200/90 opacity-80" />
                      {content}
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* RIGHT */}
          <div className="space-y-8">
            <Link
              href="/about"
              className="group/readme block rounded-2xl border border-white/10 bg-transparent transition-colors duration-200 hover:border-white/20"
              aria-label="Open About page"
            >
              <div className="flex items-center justify-between px-4 py-3">
                <div className="text-xs font-semibold text-muted-foreground">
                  <span>{a.handle}</span>
                  <span> / </span>
                  <span>{fileBase}</span>
                  {fileExt ? <span>{fileExt}</span> : null}
                </div>

                <div className="inline-flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground opacity-0 transition-opacity duration-200 group-hover/readme:opacity-100 group-hover/readme:text-indigo-300">
                    Read more
                  </span>
                  <ExternalLink className="h-4 w-4 text-muted-foreground transition-colors duration-200 group-hover/readme:text-indigo-300" />
                </div>
              </div>

              <div className="px-4 py-5 sm:px-6">
                <div className="space-y-4 text-sm leading-7 text-slate-200/90 sm:text-base">
                  {(a.readme?.paragraphs || []).slice(0, 2).map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>

                {techList.length ? (
                  <div className="mt-6">
                    <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                      Recent technologies I&apos;ve worked with
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {techList.map((t) => (
                        <TechPill key={t} label={t} />
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </Link>

            {/* ✅ Metric cards: hidden on mobile (issue #8) */}
            <div className="hidden sm:grid sm:grid-cols-2 gap-3">
              {metricCards.map((card: any) => {
                const CardIcon = iconForName(card.icon);
                const stats = card.stats as
                  | { icon: string; label: string; value: string }[]
                  | undefined;

                return (
                  <Link
                    key={card.title}
                    href="/stats"
                    className="group/metric block rounded-xl border border-white/10 bg-transparent p-4 transition-colors duration-200 hover:border-white/20 hover:bg-white/5"
                    aria-label="Open stats"
                  >
                    <div className="min-w-0">
                      <div className="inline-flex items-center gap-2">
                        <CardIcon className="h-4 w-4 text-slate-200/80" />

                        <span
                          className="
                            relative inline-block text-sm font-semibold text-indigo-300
                            after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-0 after:bg-indigo-300
                            after:transition-all after:duration-300
                            group-hover/metric:after:w-full
                          "
                        >
                          {card.title}
                        </span>
                      </div>

                      {card.description ? (
                        <div className="mt-2 text-[13px] leading-5 text-muted-foreground">
                          {card.description}
                        </div>
                      ) : null}
                    </div>

                    {stats?.length ? (
                      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-muted-foreground">
                        {stats.slice(0, 4).map((st) => {
                          const StatIcon = iconForName(st.icon);
                          return (
                            <span
                              key={`${card.title}-${st.label}`}
                              className="group inline-flex items-center gap-1.5"
                            >
                              <StatIcon className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-indigo-300" />
                              <span className="text-slate-200/80 transition-colors group-hover:text-indigo-300">
                                {st.value}
                              </span>
                              <span className="transition-colors group-hover:text-indigo-300">
                                {st.label}
                              </span>
                            </span>
                          );
                        })}
                      </div>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
