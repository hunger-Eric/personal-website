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
    <main className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
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
        <ol className="relative space-y-6 border-l border-white/10 pl-6 sm:pl-8">
          {items.map((item) => {
            const typeLabel = formatType(item.type);
            return (
              <li key={item.id} className="relative">
                {/* Timeline dot */}
                <span
                  aria-hidden
                  className="absolute -left-[33px] top-6 inline-flex h-3 w-3 items-center justify-center rounded-full bg-accent ring-4 ring-background sm:-left-[37px]"
                />

                <article className="rounded-xl border border-white/10 bg-white/5 p-6 transition-colors hover:border-accent/40 hover:bg-white/[0.07]">
                  {/* Top row: company / location  +  dates */}
                  <div className="mb-2 flex flex-col-reverse gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <div className="min-w-0">
                      <h2 className="text-lg font-semibold text-foreground sm:text-xl">
                        {item.company}
                        {item.location && (
                          <span className="font-normal text-muted-foreground">
                            , {item.location}
                          </span>
                        )}
                      </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground sm:justify-end sm:text-sm">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" aria-hidden />
                        {item.start} – {item.end}
                      </span>
                    </div>
                  </div>

                  {/* Role / program line */}
                  <p className="mb-4 text-sm font-medium text-indigo-300 sm:text-[15px]">
                    {item.role}
                  </p>

                  {/* Type chip — keep small + understated */}
                  {typeLabel && (
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs font-medium text-slate-200/80">
                        {typeLabel}
                      </span>
                      {item.location && (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground sm:hidden">
                          <MapPin className="h-3.5 w-3.5" aria-hidden />
                          {item.location}
                        </span>
                      )}
                    </div>
                  )}

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

                  {/* Attachments — LinkedIn-style media cards */}
                  {item.links && item.links.length > 0 && (
                    <div className="mt-6">
                      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Attachments
                      </div>
                      <ul className="grid gap-3 sm:grid-cols-2">
                        {item.links.map((link: ExperienceLink) => {
                          const Icon = iconForExperienceLink(link.type);
                          const external = isExternalHref(link.href);
                          const showThumb = !!link.image;
                          return (
                            <li key={link.href}>
                              <a
                                href={link.href}
                                target="_blank"
                                rel={
                                  external ? "noreferrer noopener" : undefined
                                }
                                className="group flex h-full overflow-hidden rounded-lg border border-white/10 bg-white/[0.03] transition-all hover:-translate-y-0.5 hover:border-accent/60 hover:bg-white/[0.06] hover:shadow-[0_8px_24px_-12px_rgba(99,102,241,0.4)]"
                              >
                                {/* Thumbnail */}
                                <div className="relative aspect-[3/4] w-24 flex-none overflow-hidden bg-white/5 sm:w-28">
                                  {showThumb ? (
                                    <Image
                                      src={link.image as string}
                                      alt=""
                                      fill
                                      sizes="112px"
                                      className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
                                    />
                                  ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/60">
                                      <Icon className="h-7 w-7" aria-hidden />
                                    </div>
                                  )}
                                  {/* Type badge in corner */}
                                  <span className="absolute left-1.5 top-1.5 inline-flex h-6 w-6 items-center justify-center rounded-md bg-slate-950/75 text-slate-100 backdrop-blur-sm">
                                    <Icon className="h-3.5 w-3.5" aria-hidden />
                                  </span>
                                </div>

                                {/* Body */}
                                <div className="flex min-w-0 flex-1 flex-col justify-between p-3.5">
                                  <div>
                                    <div className="line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-accent">
                                      {link.label}
                                    </div>
                                    {link.subtitle && (
                                      <div className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                                        {link.subtitle}
                                      </div>
                                    )}
                                  </div>
                                  <div className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground/80">
                                    <ExternalLink
                                      className="h-3 w-3 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                                      aria-hidden
                                    />
                                    Open
                                  </div>
                                </div>
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
