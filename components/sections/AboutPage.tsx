// components/sections/AboutPage.tsx
import Image from "next/image";
import Link from "next/link";
import {
  Download,
  ExternalLink,
  Mail,
  MapPin,
  GraduationCap,
  Github,
  Linkedin,
  Youtube,
  Video,
  X,
  MessageSquare,
  AtSign,
  Code,
  BriefcaseBusiness,
  BookText,
} from "lucide-react";

import { aboutConfig } from "../../config/aboutConfig";
import { Breadcrumbs } from "../Breadcrumbs";

function isExternalHref(href?: string) {
  if (!href) return false;
  return (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:")
  );
}

type SocialItem = {
  type?: string;
  label?: string;
  href?: string;
};

type InspirationPerson = {
  name: string;
  href: string;
  avatarUrl?: string; // filename OR absolute /images/inspirations/<file>
  tag?: string; // optional explicit handle like "@NeetCode"
};

type AboutPageUsage = {
  title?: string;
  description?: string;
  technologies?: string[];
  tools?: string[];
  platforms?: string[];
};

type UsageItem = {
  key: string;
  name: string;
  href: string;
  detail: string;
  caption?: string;
};

function SocialLogo({
  type,
  className = "h-4 w-4",
}: {
  type?: string;
  className?: string;
}) {
  switch (type) {
    case "email":
      return <Mail className={className} aria-hidden />;
    case "github":
      return <Github className={className} aria-hidden />;
    case "linkedin":
      return <Linkedin className={className} aria-hidden />;
    case "youtube":
      return <Youtube className={className} aria-hidden />;
    case "tiktok":
      return <Video className={className} aria-hidden />;
    case "x":
      return <X className={className} aria-hidden />;
    case "discord":
      return <MessageSquare className={className} aria-hidden />;
    case "threads":
      return <AtSign className={className} aria-hidden />;
    case "leetcode":
      return <Code className={className} aria-hidden />;
    case "handshake":
      return <BriefcaseBusiness className={className} aria-hidden />;
    case "medium":
      return <BookText className={className} aria-hidden />;
    // Dev.to icon: no lucide dev.to; use Code icon as a clean fallback
    case "devto":
      return <Code className={className} aria-hidden />;
    default:
      return <Code className={className} aria-hidden />;
  }
}

/**
 * Extract YouTube handle from a YouTube channel URL.
 * Supports formats like:
 * - https://www.youtube.com/@NeetCode
 * - https://youtube.com/@NeetCode
 * - https://www.youtube.com/c/NeetCode
 * - https://www.youtube.com/channel/UC_mYaQAE6-71rjSN6CeCA-g
 */
function extractYouTubeHandle(href: string): string | null {
  if (!href) return null;

  // Match @handle format
  const atMatch = href.match(/youtube\.com\/@([^/?#]+)/i);
  if (atMatch) return atMatch[1];

  // Match /c/handle format
  const cMatch = href.match(/youtube\.com\/c\/([^/?#]+)/i);
  if (cMatch) return cMatch[1];

  // Match /user/handle format
  const userMatch = href.match(/youtube\.com\/user\/([^/?#]+)/i);
  if (userMatch) return userMatch[1];

  return null;
}

/**
 * Resolve inspiration avatar URL.
 * For YouTube links, uses unavatar.io to fetch the channel avatar.
 * Falls back to local images or default.
 */
function resolveInspirationAvatar(src?: string, href?: string) {
  const fallback = "/images/inspirations/default.jpg";

  // If it's a YouTube link, use unavatar.io to get the channel avatar
  if (href && href.includes("youtube.com")) {
    const handle = extractYouTubeHandle(href);
    if (handle) {
      // unavatar.io is a free service that fetches avatars from various platforms
      // It has built-in caching and fallback support
      return `https://unavatar.io/youtube/${handle}?fallback=${encodeURIComponent(fallback)}`;
    }
  }

  // If no src provided, use fallback
  if (!src || !String(src).trim()) return fallback;

  const v = String(src).trim();

  // If it's "default.jpg" and we have a YouTube href, try to get the avatar
  if ((v === "default.jpg" || v === "/images/inspirations/default.jpg") && href?.includes("youtube.com")) {
    const handle = extractYouTubeHandle(href);
    if (handle) {
      return `https://unavatar.io/youtube/${handle}?fallback=${encodeURIComponent(fallback)}`;
    }
  }

  if (v.startsWith("/")) return v;
  return `/images/inspirations/${v}`;
}

function deriveTagFromHref(href: string) {
  const atIdx = href.indexOf("/@");
  if (atIdx >= 0) {
    const raw = href
      .slice(atIdx + 2)
      .split(/[/?#]/)[0]
      ?.trim();
    if (raw) return `@${raw}`;
  }
  return "";
}

function faviconUrl(href: string) {
  return `https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(
    href
  )}`;
}

const USAGE_CATALOG: Record<
  string,
  { href: string; detail: string; caption?: string }
> = {
  "Next.js": {
    href: "https://nextjs.org/?ref=kevintrinh.dev",
    detail: "React framework",
  },
  "Tailwind CSS": {
    href: "https://tailwindcss.com/?ref=kevintrinh.dev",
    detail: "Styling library",
  },
  TypeScript: {
    href: "https://www.typescriptlang.org/?ref=kevintrinh.dev",
    detail: "Typed JavaScript",
  },
  Python: {
    href: "https://www.python.org/?ref=kevintrinh.dev",
    detail: "Backend + FastAPI + REST APIs",
  },
  "C++": {
    href: "https://isocpp.org/?ref=kevintrinh.dev",
    detail: "Systems and performance work",
  },
  "Ubuntu Linux": {
    href: "https://ubuntu.com/?ref=kevintrinh.dev",
    detail: "Daily OS",
  },
  Supabase: {
    href: "https://supabase.com/?ref=kevintrinh.dev",
    detail: "Postgres + auth + storage",
  },
  MongoDB: {
    href: "https://www.mongodb.com/?ref=kevintrinh.dev",
    detail: "Document database",
  },

  "Git Bash": {
    href: "https://gitforwindows.org/?ref=kevintrinh.dev",
    detail: "Terminal for Git workflows",
  },
  Firefox: {
    href: "https://www.mozilla.org/firefox/?ref=kevintrinh.dev",
    detail: "Web browser",
  },
  "Visual Studio Code": {
    href: "https://code.visualstudio.com/?ref=kevintrinh.dev",
    detail: "Editor",
  },

  GitHub: {
    href: "https://github.com/?ref=kevintrinh.dev",
    detail: "Repos and collaboration",
  },
  Vercel: {
    href: "https://vercel.com/?ref=kevintrinh.dev",
    detail: "Hosting for Next.js",
  },
  Netlify: {
    href: "https://www.netlify.com/?ref=kevintrinh.dev",
    detail: "Static + modern web hosting",
  },
  Cloudflare: {
    href: "https://www.cloudflare.com/?ref=kevintrinh.dev",
    detail: "DNS + edge + security",
  },
  "Google Cloud Run": {
    href: "https://cloud.google.com/run?ref=kevintrinh.dev",
    detail: "Serverless containers",
  },
  Namecheap: {
    href: "https://www.namecheap.com/?ref=kevintrinh.dev",
    detail: "Domains and DNS management",
  },
  Notion: {
    href: "https://www.notion.so/?ref=kevintrinh.dev",
    detail: "Content management system (free and flexible)",
  },
};

function toUsageItems(list: string[] | undefined): UsageItem[] {
  const items = (list ?? []).map((name) => {
    const meta = USAGE_CATALOG[name] ?? {
      href: "https://www.google.com/search?q=" + encodeURIComponent(name),
      detail: "Tool / platform",
    };

    return {
      key: name.toLowerCase().replace(/\s+/g, "-"),
      name,
      href: meta.href,
      detail: meta.detail,
      caption: meta.caption,
    };
  });

  // keep original order, just filter out empties
  return items.filter((x) => x.name && x.href);
}

function UsageRow({ item }: { item: UsageItem }) {
  return (
    <li className="flex items-start gap-3">
      {/* favicon + optional caption (no container/outline) */}
      <div className="mt-[2px] flex w-12 shrink-0 flex-col items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={faviconUrl(item.href)}
          alt=""
          className="h-6 w-6"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        {item.caption ? (
          <span className="mt-1 text-center text-[10px] leading-tight text-slate-200/45">
            {item.caption}
          </span>
        ) : null}
      </div>

      <div className="min-w-0 text-[14px] leading-7 sm:text-[15px]">
        <a
          href={item.href}
          target="_blank"
          rel="noreferrer noopener"
          className="font-semibold text-indigo-300 underline underline-offset-4 transition-colors hover:text-indigo-200"
        >
          {item.name}
        </a>
        <span className="text-slate-200/55"> - {item.detail}</span>
      </div>
    </li>
  );
}

export function AboutPage() {
  const a = aboutConfig as any;
  const p = (a.aboutPage ?? {}) as any;

  const headline =
    p?.hero?.headline ??
    "I build modern full stack apps and free tools that save time.";
  const subheadline =
    p?.hero?.subheadline ??
    "Full stack focused, performance first, and obsessed with clean UI and maintainable architecture.";

  const heroParagraphs: string[] =
    (p?.story?.paragraphs?.length
      ? p.story.paragraphs
      : a.readme?.paragraphs) ?? [];

  const portraitUrl = p?.hero?.portraitUrl ?? a.avatarUrl ?? "/avatar.jpg";
  const locationLabel = p?.hero?.locationLabel ?? "Houston, TX";

  const resumeViewHref = "/resume";
  const resumeDownloadHref = "/download";

  const portraitWidthClass = "w-[348px] sm:w-[380px]";

  // Working on
  const workingTitle = p?.now?.title ?? "What I’m currently working on";
  const workingParagraphs: string[] = p?.now?.paragraphs ?? [
    "Right now I’m iterating on DevfolioX (a clean portfolio template for developers) and expanding CoogPlanner — a full-stack app that helps UH students understand degree progress and build better schedules.",
    "I also recently started VisibleSeed — where I build fast, modern websites and automation systems for local businesses. My focus is shipping reliable features, keeping the UI crisp, and making everything easy to use.",
  ];

  const workingImageUrl: string | undefined =
    p?.now?.imageUrl && String(p.now.imageUrl).trim().length > 0
      ? p.now.imageUrl
      : undefined;

  const workingImageAlt: string = p?.now?.imageAlt ?? "Currently working on";

  // Usage
  const usage = (p?.usage ?? {}) as AboutPageUsage;
  const stackTitle = usage.title ?? "Usage";
  const stackDescription =
    usage.description ?? "The stack and tools I like using day to day.";

  const techItems = toUsageItems(usage.technologies);
  const toolItems = toUsageItems(usage.tools);
  const platformItems = toUsageItems(usage.platforms);

  // Setup
  const setupTitle = p?.setup?.title ?? "Setup";
  const setupParagraphs: string[] = p?.setup?.paragraphs ?? [
    "I’m big on a clean, fast setup that keeps me in flow — minimal friction, quick feedback loops, and tools that don’t fight you.",
    "My ideal setup is simple: fast machine, tidy workspace, and a workflow that makes it easy to stay consistent.",
  ];

  const setupImageUrl: string | undefined =
    p?.setup?.imageUrl && String(p.setup.imageUrl).trim().length > 0
      ? p.setup.imageUrl
      : undefined;

  const setupImageAlt: string = p?.setup?.imageAlt ?? "My setup";
  const setupCaption: string | undefined =
    p?.setup?.caption && String(p.setup.caption).trim().length > 0
      ? p.setup.caption
      : undefined;

  // Socials
  const socialsTitle = p?.socialsSection?.title ?? "Socials";
  const socialsDescription =
    p?.socialsSection?.description ?? "Where I’m active and easy to reach.";

  const rawSocialItems: SocialItem[] = p?.socials?.items ?? [];

  // Ensure devto + medium exist (if user forgets to add them later)
  const socialItems: SocialItem[] = (() => {
    const items = [...rawSocialItems];

    if (!items.some((x) => x.type === "devto")) {
      items.push({
        type: "devto",
        label: "Dev.to",
        href: "https://dev.to/KevinTrinhDev",
      });
    }
    if (!items.some((x) => x.type === "medium")) {
      items.push({
        type: "medium",
        label: "Medium",
        href: "https://medium.com/@KevinTrinhDev",
      });
    }

    // update discord label to "Discord Community" if not already
    return items.map((it) =>
      it.type === "discord"
        ? {
            ...it,
            label:
              it.label && it.label.trim().length > 0
                ? "Discord Community"
                : "Discord Community",
          }
        : it
    );
  })();

  const emailLabel =
    socialItems.find((s) => s.type === "email")?.label ??
    a.profileLinks?.find((x: any) => x.type === "email")?.label ??
    "kevin@kevintrinh.dev";

  const schoolLabel =
    a.schoolName ??
    a.profileLinks?.find((x: any) => x.type === "school")?.label ??
    "University of Houston";

  // Inspirations
  const inspirationsTitle = p?.inspirations?.title ?? "Inspirations";
  const inspirationsDescription =
    p?.inspirations?.description ??
    "Creators and builders I learn from consistently — coding, product mindset, business, and staying disciplined.";

  const inspirations: InspirationPerson[] = p?.inspirations?.people ?? [];

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-16 sm:pt-24">
      <Breadcrumbs
        items={[
          { name: "Home", url: "/" },
          { name: "About", url: "/about" },
        ]}
        className="mb-8"
      />

      <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        {/* LEFT */}
        <div className="min-w-0">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
            {headline}
          </h1>

          <p className="mt-4 text-sm leading-7 text-slate-200/80 sm:text-base">
            {subheadline}
          </p>

          <div className="mt-8 space-y-4 text-sm leading-7 text-slate-200/85 sm:text-base">
            {heroParagraphs.map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>

          {/* Working on */}
          <section className="mt-12">
            <h2 className="text-2xl font-semibold text-slate-50">
              {workingTitle}
            </h2>

            <div className="mt-4 space-y-4 text-sm leading-7 text-slate-200/85 sm:text-base">
              {workingParagraphs.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>

            {workingImageUrl ? (
              <div className="mt-8">
                <div className="relative aspect-[16/9] w-full">
                  <Image
                    src={workingImageUrl}
                    alt={workingImageAlt}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 900px, 100vw"
                    priority={false}
                  />
                </div>
              </div>
            ) : null}
          </section>

          {/* Usage */}
          <section className="mt-12">
            <h2 className="text-2xl font-semibold text-slate-50">
              {stackTitle}
            </h2>

            {/* UPDATED: same color as other paragraphs */}
            <p className="mt-2 text-sm leading-7 text-slate-200/85 sm:text-base">
              {stackDescription}
            </p>

            <div className="mt-7 space-y-12">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Technologies
                </h3>

                <ul className="mt-4 space-y-3">
                  {techItems.map((item) => (
                    <UsageRow key={item.key} item={item} />
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Tools
                </h3>

                <ul className="mt-4 space-y-3">
                  {toolItems.map((item) => (
                    <UsageRow key={item.key} item={item} />
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Platforms
                </h3>

                <ul className="mt-4 space-y-3">
                  {platformItems.map((item) => (
                    <UsageRow key={item.key} item={item} />
                  ))}
                </ul>
              </div>

              {/* Socials (buttons) */}
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {socialsTitle}
                </h3>
                <p className="mt-2 text-sm leading-7 text-slate-200/85 sm:text-base">
                  {socialsDescription}
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  {socialItems
                    .filter((s) => s?.href && String(s.href).trim().length > 0)
                    .filter((s) => s.type !== "email") // email stays under portrait
                    .map((s, idx) => {
                      const external = isExternalHref(s.href);
                      const label =
                        s.type === "discord"
                          ? "Discord Community"
                          : s.label ?? s.type;

                      return (
                        <a
                          key={`${s.type}-${label}-${idx}`}
                          href={s.href}
                          target={external ? "_blank" : undefined}
                          rel={external ? "noreferrer noopener" : undefined}
                          className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/5 px-3.5 py-2 text-sm font-semibold text-slate-200/85 transition-colors hover:border-indigo-400 hover:bg-white/10 hover:text-slate-50"
                        >
                          <SocialLogo
                            type={s.type}
                            className="h-4 w-4 opacity-90"
                          />
                          <span className="truncate">{label}</span>
                        </a>
                      );
                    })}
                </div>
              </div>
            </div>
          </section>

          {/* Setup */}
          <section className="mt-12">
            <h2 className="text-2xl font-semibold text-slate-50">
              {setupTitle}
            </h2>

            <div className="mt-4 space-y-4 text-sm leading-7 text-slate-200/85 sm:text-base">
              {setupParagraphs.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>

            {setupImageUrl ? (
              <div className="mt-8">
                <div className="relative aspect-[16/9] w-full">
                  <Image
                    src={setupImageUrl}
                    alt={setupImageAlt}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 900px, 100vw"
                    priority={false}
                  />
                </div>

                {setupCaption ? (
                  <div className="mt-3 text-center text-sm text-slate-200/55">
                    {setupCaption}
                  </div>
                ) : null}
              </div>
            ) : null}
          </section>
        </div>

        {/* RIGHT */}
        <aside className="w-full">
          <div className={portraitWidthClass}>
            <div className="group relative aspect-square w-full overflow-hidden rounded-2xl">
              <Image
                src={portraitUrl}
                alt={a.displayName ?? "Portrait"}
                fill
                className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.05]"
                sizes="380px"
                priority={false}
              />
            </div>

            <div className="mt-4 grid w-full grid-cols-[1fr_auto] gap-3">
              <Link
                href={resumeViewHref}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-md border border-white/20 bg-white/5 px-3.5 py-2 text-sm font-semibold text-slate-50 transition-colors hover:border-indigo-400 hover:bg-white/10"
              >
                View Résumé
                <ExternalLink
                  className="h-4 w-4 opacity-80 transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>

              <a
                href={resumeDownloadHref}
                className="inline-flex items-center justify-center rounded-md border border-white/20 bg-white/5 px-3 py-2 text-slate-50 transition-colors hover:border-indigo-400 hover:bg-white/10"
                aria-label="Download resume"
                title="Download resume"
              >
                <Download className="h-4 w-4" aria-hidden />
              </a>
            </div>

            <div className="mt-4 space-y-2 text-sm text-slate-200/85">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-200/70" aria-hidden />
                <a
                  href={`mailto:${emailLabel}`}
                  className="truncate transition-colors hover:text-indigo-300 hover:underline"
                >
                  {emailLabel}
                </a>
              </div>

              <div className="flex items-center gap-2">
                <GraduationCap
                  className="h-4 w-4 text-slate-200/70"
                  aria-hidden
                />
                <span className="truncate">{schoolLabel}</span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-200/70" aria-hidden />
                <span className="truncate">{locationLabel}</span>
              </div>
            </div>
          </div>
        </aside>
      </section>

      {/* Inspirations */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-slate-50">
          {inspirationsTitle}
        </h2>
        <p className="mt-2 text-sm leading-7 text-slate-200/85 sm:text-base">
          {inspirationsDescription}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-x-7 gap-y-5 sm:grid-cols-3 lg:grid-cols-4">
          {inspirations.map((person, idx) => {
            const avatarSrc = resolveInspirationAvatar(person.avatarUrl, person.href);
            const tag = person.tag?.trim() || deriveTagFromHref(person.href);

            return (
              <a
                key={`${person.name}-${idx}`}
                href={person.href}
                target="_blank"
                rel="noreferrer noopener"
                className="group inline-flex items-center gap-3"
                title={person.name}
                aria-label={person.name}
              >
                <span className="relative h-10 w-10 overflow-hidden rounded-lg">
                  <Image
                    src={avatarSrc}
                    alt={person.name}
                    fill
                    className="object-cover"
                    sizes="40px"
                    priority={false}
                  />
                </span>

                <span className="min-w-0">
                  <span className="flex items-baseline gap-2">
                    <span
                      className={[
                        "relative truncate text-[15px] font-semibold text-slate-50 transition-colors",
                        "group-hover:text-indigo-300",
                        "after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-indigo-300 after:transition-transform after:duration-300",
                        "group-hover:after:scale-x-100",
                      ].join(" ")}
                    >
                      {person.name}
                    </span>

                    {tag ? (
                      <span className="truncate text-[13px] text-slate-200/55">
                        {tag}
                      </span>
                    ) : null}
                  </span>
                </span>
              </a>
            );
          })}
        </div>
      </section>
    </main>
  );
}
