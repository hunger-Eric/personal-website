// components/sections/About.tsx

import Image from "next/image";
import Link from "next/link";
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
  Users,
  Github,
  NotebookPen,
  Folder,
} from "lucide-react";

import { siteConfig } from "../../config/siteConfig";
import { aboutConfig } from "../../config/aboutConfig";

/** Filled LinkedIn icon */
function LinkedInFilled(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.35V9h3.414v1.561h.047c.476-.9 1.637-1.852 3.37-1.852 3.6 0 4.266 2.368 4.266 5.455v6.288zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.115 20.452H3.558V9h3.557v11.452z"
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
    case "location":
      return MapPin;
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

export function AboutSection() {
  const enabled = (siteConfig as any)?.sections?.about === true;
  if (!enabled) return null;

  const a = aboutConfig;

  const followerCount = a.followers?.followers ?? 0;
  const followingCount = a.followers?.following ?? 0;

  // README.md split styling
  const fileLabel = a.readme?.fileLabel || "README.md";
  const mdDotIndex = fileLabel.toLowerCase().lastIndexOf(".md");
  const fileBase = mdDotIndex > 0 ? fileLabel.slice(0, mdDotIndex) : fileLabel;
  const fileExt = mdDotIndex > 0 ? fileLabel.slice(mdDotIndex) : "";

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
            {/* Portrait: hover zoom + subtle purple shadow */}
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

            {/* Name + role */}
            <div>
              <div className="text-2xl font-semibold text-slate-50 sm:text-[28px]">
                {a.displayName || siteConfig.name}
              </div>

              <div className="mt-2 text-base font-medium text-slate-200 sm:text-[17px]">
                {a.roleLine}
              </div>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-1 gap-2">
              <Link
                href={a.cta.primary.href}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-indigo-500/90 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
              >
                {a.cta.primary.label}
                <ExternalLink className="h-4 w-4" />
              </Link>

              <a
                href={a.cta.secondary.href}
                target={a.cta.secondary.external ? "_blank" : undefined}
                rel={a.cta.secondary.external ? "noreferrer" : undefined}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-white/20 px-3.5 py-2 text-sm font-semibold text-slate-50 transition-colors duration-150 hover:border-indigo-400 hover:bg-white/10"
              >
                {a.cta.secondary.label}
                <FileText className="h-4 w-4 opacity-90" />
              </a>
            </div>

            {/* MOBILE ORDER FIX:
                - On mobile: profile links first, then followers line
                - On sm+: followers line first, then profile links (original behavior)
            */}
            <div className="flex flex-col gap-2 sm:gap-3">
              {/* Profile links (mobile first) */}
              <div className="order-1 sm:order-2 space-y-2 pt-1 text-sm">
                {a.profileLinks.map((item: any) => {
                  const Icon = iconForProfileLink(String(item.type || ""));
                  const iconEl = (
                    <Icon className="h-4 w-4 text-slate-200/90 opacity-80" />
                  );

                  const isBrightText =
                    item.type === "school" || item.type === "location";

                  if (!item.href) {
                    return (
                      <div
                        key={`${item.type}-${item.label}`}
                        className="flex items-center gap-2"
                      >
                        {iconEl}
                        <span
                          className={
                            isBrightText
                              ? "text-slate-200/90"
                              : "text-muted-foreground"
                          }
                        >
                          {item.label}
                        </span>
                      </div>
                    );
                  }

                  const external = isExternalHref(item.href);
                  return (
                    <div
                      key={`${item.type}-${item.label}`}
                      className="flex items-center gap-2"
                    >
                      {iconEl}
                      <a
                        href={item.href}
                        target={external ? "_blank" : undefined}
                        rel={external ? "noreferrer" : undefined}
                        className="truncate text-slate-200/90 transition-colors hover:text-indigo-300 hover:underline"
                      >
                        {item.label}
                      </a>
                    </div>
                  );
                })}
              </div>

              {/* Followers / following (mobile below links) */}
              <div className="order-2 sm:order-1 flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4 opacity-70" />

                <span className="group cursor-default">
                  <span className="font-semibold text-slate-50 transition-colors group-hover:text-indigo-300">
                    {followerCount}
                  </span>{" "}
                  <span className="transition-colors group-hover:text-indigo-300">
                    followers
                  </span>
                </span>

                <span className="mx-1.5">•</span>

                <span className="group cursor-default">
                  <span className="font-semibold text-slate-50 transition-colors group-hover:text-indigo-300">
                    {followingCount}
                  </span>{" "}
                  <span className="transition-colors group-hover:text-indigo-300">
                    following
                  </span>
                </span>
              </div>
            </div>
          </aside>

          {/* RIGHT */}
          <div className="space-y-8">
            {/* README */}
            <div className="rounded-2xl border border-white/10 bg-transparent">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="text-xs font-semibold">
                  <span className="text-slate-200">{a.handle}</span>
                  <span className="text-muted-foreground"> / </span>
                  <span className="text-slate-200">{fileBase}</span>
                  {fileExt ? (
                    <span className="text-muted-foreground">{fileExt}</span>
                  ) : null}
                </div>

                <Link
                  href="/about"
                  className="inline-flex items-center justify-center text-indigo-300 transition-colors hover:text-indigo-200"
                  aria-label="Open About page"
                >
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>

              <div className="px-4 py-5 sm:px-6">
                <p className="text-xs font-semibold text-muted-foreground">
                  Summary:
                </p>

                <div className="mt-3 space-y-4 text-sm leading-7 text-slate-200/90 sm:text-base">
                  {(a.readme?.paragraphs || []).slice(0, 2).map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>

                {/* Tech badges: old hover behavior restored */}
                {a.techUsed?.length ? (
                  <div className="mt-6">
                    <p className="text-xs font-semibold text-muted-foreground">
                      Tech I&apos;ve used:
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {a.techUsed.map((tool: string) => (
                        <span
                          key={tool}
                          className="rounded-md border border-white/10 px-2.5 py-1 text-sm text-muted-foreground transition-colors duration-200 hover:border-accent/60 hover:bg-white/5 hover:text-white"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Snapshot */}
            <div>
              <div className="mb-3 flex items-center gap-2 text-slate-200/80">
                <Activity className="h-4 w-4" />
                <div className="text-xs font-semibold uppercase tracking-[0.2em]">
                  Live Metrics
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {(a.snapshot?.cards || []).slice(0, 4).map((card: any) => {
                  const CardIcon = iconForName(card.icon);
                  const stats = card.stats as
                    | { icon: string; label: string; value: string }[]
                    | undefined;

                  return (
                    <div
                      key={card.title}
                      className="rounded-xl border border-white/10 bg-transparent p-4"
                    >
                      <div className="min-w-0">
                        <div className="inline-flex items-center gap-2">
                          <CardIcon className="h-4 w-4 text-slate-200/80" />
                          <span className="truncate text-sm font-semibold text-indigo-300 hover:underline">
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
                          {stats.slice(0, 4).map((s) => {
                            const StatIcon = iconForName(s.icon);
                            return (
                              <span
                                key={`${card.title}-${s.label}`}
                                className="group inline-flex items-center gap-1.5"
                              >
                                <StatIcon className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-indigo-300" />
                                <span className="text-slate-200/80 transition-colors group-hover:text-indigo-300">
                                  {s.value}
                                </span>
                                <span className="transition-colors group-hover:text-indigo-300">
                                  {s.label}
                                </span>
                              </span>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
