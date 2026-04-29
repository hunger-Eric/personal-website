// app/experience/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import {
  Briefcase,
  Calendar,
  MapPin,
  FileText,
  BookOpen,
  Newspaper,
  Globe,
  Github,
  PlayCircle,
  ExternalLink,
} from "lucide-react";

import { siteConfig } from "@/config/siteConfig";
import { experience, type ExperienceLink } from "@/config/experience";
import { Breadcrumbs } from "@/components/Breadcrumbs";

function iconForExperienceLink(type?: string): typeof FileText {
  switch (type) {
    case "pdf":
      return FileText;
    case "publication":
      return Newspaper;
    case "abstract":
      return BookOpen;
    case "live":
      return Globe;
    case "github":
      return Github;
    case "video":
      return PlayCircle;
    default:
      return ExternalLink;
  }
}

/** Tailwind classes for the attachment-type badge (corner pill). */
function badgeStylesForLink(type?: string): string {
  switch (type) {
    case "pdf":
      return "bg-rose-500/85 text-white";
    case "publication":
      return "bg-sky-500/85 text-white";
    case "abstract":
      return "bg-violet-500/85 text-white";
    case "live":
      return "bg-emerald-500/85 text-white";
    case "github":
      return "bg-slate-700/90 text-white";
    case "video":
      return "bg-red-600/85 text-white";
    default:
      return "bg-slate-950/75 text-slate-100";
  }
}

/** Tailwind classes for the role-type chip (Internship / Full-time / etc).
 *  Solid colors, sharp corners. */
function chipStylesForType(type?: string): string {
  switch (type) {
    case "internship":
      return "bg-sky-600 text-white";
    case "full-time":
      return "bg-emerald-600 text-white";
    case "part-time":
      return "bg-amber-600 text-white";
    case "contract":
      return "bg-violet-600 text-white";
    default:
      return "bg-slate-700 text-white";
  }
}

function isExternalHref(href: string) {
  return /^https?:\/\//i.test(href);
}

export const metadata: Metadata = {
  title: "Experience",
  description: `Professional experience and roles by ${siteConfig.name}.`,
  openGraph: {
    title: `Experience | ${siteConfig.name}`,
    description: `Professional experience and roles by ${siteConfig.name}.`,
  },
};

function formatType(type?: string): string | null {
  if (!type) return null;
  switch (type) {
    case "internship":
      return "Internship";
    case "full-time":
      return "Full-time";
    case "part-time":
      return "Part-time";
    case "contract":
      return "Contract";
    default:
      return type[0].toUpperCase() + type.slice(1);
  }
}

export default function ExperiencePage() {
  const items = experience;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { name: "Home", url: "/" },
          { name: "Experience", url: "/experience" },
        ]}
      />

      <div className="mb-10">
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Experience
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Roles I&apos;ve held — internships, research, and applied work.
        </p>

        {/* Document downloads — resume + CV summarize this page */}
        <div className="mt-5 flex flex-wrap gap-2">
          <a
            href="/resume"
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:border-accent hover:bg-white/10 hover:text-white"
          >
            <FileText className="h-4 w-4" aria-hidden /> View Resume (PDF)
          </a>
          <a
            href="/resume?dl=1"
            className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:border-accent hover:bg-white/10 hover:text-white"
          >
            <FileText className="h-4 w-4" aria-hidden /> Download Resume
          </a>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 py-16 text-center">
          <Briefcase className="mb-4 h-12 w-12 text-muted-foreground/60" />
          <h2 className="mb-2 text-lg font-semibold">No experience yet</h2>
          <p className="text-sm text-muted-foreground">
            Roles will appear here once added.
          </p>
        </div>
      ) : (
        <ol className="space-y-10 md:space-y-14">
          {items.map((item, idx) => {
            const typeLabel = formatType(item.type);
            const isLast = idx === items.length - 1;
            return (
              <li
                key={item.id}
                className="md:grid md:grid-cols-[minmax(220px,240px)_24px_1fr] md:gap-x-3"
              >
                {/* LEFT (desktop) / TOP (mobile): meta — date + company/location + role */}
                <div className="mb-4 md:mb-0 md:pt-1 md:pr-2">
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:text-[13px]">
                    <Calendar className="h-3.5 w-3.5" aria-hidden />
                    {item.start} – {item.end}
                  </div>
                  <h2 className="mt-2 text-lg font-semibold text-foreground sm:text-xl">
                    {item.company}
                    {item.location && (
                      <span className="font-normal text-muted-foreground">
                        , {item.location}
                      </span>
                    )}
                  </h2>
                  <p className="mt-1 text-sm font-medium text-indigo-300 sm:text-[15px]">
                    {item.role}
                  </p>
                  {typeLabel && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span
                        className={[
                          "inline-flex items-center px-2 py-1 text-[11px] font-bold uppercase tracking-wider",
                          chipStylesForType(item.type),
                        ].join(" ")}
                      >
                        {typeLabel}
                      </span>
                      {item.location && (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground md:hidden">
                          <MapPin className="h-3.5 w-3.5" aria-hidden />
                          {item.location}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* RAIL column (desktop only) — vertical line + dot */}
                <div className="relative hidden md:block">
                  {!isLast && (
                    <span
                      aria-hidden
                      className="absolute left-1/2 top-3 h-[calc(100%+3.5rem)] w-px -translate-x-1/2 bg-white/10"
                    />
                  )}
                  {isLast && (
                    <span
                      aria-hidden
                      className="absolute left-1/2 top-3 h-6 w-px -translate-x-1/2 bg-white/10"
                    />
                  )}
                  <span
                    aria-hidden
                    className="absolute left-1/2 top-3 inline-flex h-3 w-3 -translate-x-1/2 items-center justify-center rounded-full bg-accent ring-4 ring-background"
                  />
                </div>

                {/* RIGHT (desktop) / BELOW (mobile): the details card */}
                <article className="rounded-xl border border-white/10 bg-white/5 p-6 transition-colors hover:border-accent/40 hover:bg-white/[0.07]">
                  {/* Description */}
                  {item.description?.length > 0 && (
                    <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {item.description.map((line, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <span
                            aria-hidden
                            className="mt-[7px] inline-block h-0 w-0 flex-none border-y-[4px] border-l-[7px] border-y-transparent border-l-accent"
                          />
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Technologies */}
                  {item.technologies && item.technologies.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-1.5">
                      {item.technologies.map((t) => (
                        <span
                          key={t}
                          className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-muted-foreground"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Attachments — compact LinkedIn-style media cards */}
                  {item.links && item.links.length > 0 && (
                    <div className="mt-6">
                      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Attachments
                      </div>
                      <ul className="flex flex-col gap-2">
                        {item.links.map((link: ExperienceLink) => {
                          const Icon = iconForExperienceLink(link.type);
                          const external = isExternalHref(link.href);
                          const showThumb = !!link.image;
                          const badgeCls = badgeStylesForLink(link.type);
                          return (
                            <li key={link.href}>
                              <a
                                href={link.href}
                                target="_blank"
                                rel={
                                  external ? "noreferrer noopener" : undefined
                                }
                                className="group flex items-center gap-3 overflow-hidden rounded-lg border border-white/10 bg-white/[0.03] p-2 transition-all hover:border-accent/60 hover:bg-white/[0.07]"
                              >
                                {/* Compact thumbnail */}
                                <div className="relative h-12 w-12 flex-none overflow-hidden rounded-md bg-white/5 sm:h-14 sm:w-14">
                                  {showThumb ? (
                                    <Image
                                      src={link.image as string}
                                      alt=""
                                      fill
                                      sizes="56px"
                                      className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.06]"
                                    />
                                  ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/60">
                                      <Icon className="h-5 w-5" aria-hidden />
                                    </div>
                                  )}
                                  {/* Type-colored badge in corner */}
                                  <span
                                    className={[
                                      "absolute -bottom-1 -right-1 inline-flex h-5 w-5 items-center justify-center rounded-md ring-2 ring-background",
                                      badgeCls,
                                    ].join(" ")}
                                  >
                                    <Icon className="h-3 w-3" aria-hidden />
                                  </span>
                                </div>

                                {/* Body */}
                                <div className="flex min-w-0 flex-1 flex-col">
                                  <div className="line-clamp-1 text-sm font-semibold text-foreground transition-colors group-hover:text-accent">
                                    {link.label}
                                  </div>
                                  {link.subtitle && (
                                    <div className="line-clamp-1 text-xs text-muted-foreground">
                                      {link.subtitle}
                                    </div>
                                  )}
                                </div>

                                <ExternalLink
                                  className="h-4 w-4 flex-none text-muted-foreground/70 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                                  aria-hidden
                                />
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </article>
              </li>
            );
          })}
        </ol>
      )}
    </main>
  );
}
