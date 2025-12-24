// components/sections/HeroShowcaseSection.tsx
"use client";

import { siteConfig } from "../../config/siteConfig";
import {
  FileText,
  Mail,
  ArrowUpRight,
  Youtube,
  Code2,
  PenSquare,
  MessageCircle,
  Coffee,
  GraduationCap,
  AtSign,
} from "lucide-react";

// ⬇⬇⬇ change these two lines to relative paths
import { useModalRoute } from "../hooks/useModalRoute";
import { ContributionGraphCard } from "../ContributionGraphCard";
// ⬆⬆⬆

type SocialItem = {
  key: string; // key to look up in siteConfig.socials if present
  label: string;
  type?: "link" | "email" | "resume" | "donate";
};

// Hard-coded social platforms in the order requested
const SOCIALS: SocialItem[] = [
  { key: "github", label: "GitHub" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "resume", label: "Resume", type: "resume" },
  { key: "email", label: "Email", type: "email" },
  { key: "tiktok", label: "TikTok" },
  { key: "leetcode", label: "LeetCode" },
  { key: "youtube", label: "YouTube" },
  { key: "x", label: "X" },
  { key: "handshake", label: "Handshake" },
  { key: "devto", label: "Dev.to" },
  { key: "medium", label: "Medium" },
  { key: "discord", label: "Discord Server" },
  { key: "threads", label: "Threads" },
  { key: "kofi", label: "Buy me a coffee", type: "donate" }, // Ko-fi / donations
];

function resolveSocialHref(item: SocialItem, resumeHref: string): string {
  const socials: any = (siteConfig as any).socials ?? {};

  if (item.type === "resume") {
    return resumeHref || "/resume";
  }

  if (item.type === "email") {
    const email = socials.email || socials.mail;
    return email
      ? email.startsWith("mailto:")
        ? email
        : `mailto:${email}`
      : "#";
  }

  if (item.type === "donate") {
    return socials.kofi || socials.ko_fi || socials.donate || "#";
  }

  // Generic link: try socials[key], else "#"
  return socials[item.key] ?? "#";
}

/** Filled / more recognizable brand-ish icons (SVG) */
function IconGithubFilled({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M12 2C6.477 2 2 6.58 2 12.23c0 4.52 2.865 8.353 6.839 9.706.5.095.682-.22.682-.49 0-.244-.009-.89-.014-1.747-2.782.617-3.368-1.375-3.368-1.375-.454-1.176-1.11-1.49-1.11-1.49-.907-.634.069-.621.069-.621 1.003.073 1.532 1.052 1.532 1.052.892 1.56 2.341 1.11 2.91.848.091-.664.35-1.11.636-1.366-2.22-.262-4.555-1.137-4.555-5.06 0-1.118.39-2.032 1.03-2.748-.104-.262-.446-1.318.098-2.748 0 0 .84-.275 2.75 1.05A9.28 9.28 0 0 1 12 7.07c.85.004 1.705.117 2.504.344 1.909-1.325 2.748-1.05 2.748-1.05.545 1.43.203 2.486.1 2.748.64.716 1.028 1.63 1.028 2.748 0 3.933-2.339 4.795-4.566 5.052.36.318.68.943.68 1.902 0 1.374-.013 2.48-.013 2.818 0 .272.18.59.688.49C19.137 20.579 22 16.75 22 12.23 22 6.58 17.523 2 12 2Z"
      />
    </svg>
  );
}

/** Square-ish LinkedIn icon (filled) */
function IconLinkedInSquareFilled({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M19.5 2h-15A2.5 2.5 0 0 0 2 4.5v15A2.5 2.5 0 0 0 4.5 22h15a2.5 2.5 0 0 0 2.5-2.5v-15A2.5 2.5 0 0 0 19.5 2ZM8.1 18.6H5.7V10h2.4v8.6ZM6.9 9.02a1.39 1.39 0 1 1 0-2.78 1.39 1.39 0 0 1 0 2.78ZM18.6 18.6h-2.4v-4.45c0-1.06-.02-2.42-1.47-2.42-1.47 0-1.7 1.15-1.7 2.34v4.53h-2.4V10h2.3v1.18h.03c.32-.6 1.1-1.23 2.26-1.23 2.42 0 2.87 1.6 2.87 3.67v4.98Z"
      />
    </svg>
  );
}

/** Filled X (Twitter) icon */
function IconXFilled({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M18.9 2H22l-6.8 7.78L22.9 22H17l-4.6-6.1L6.9 22H3.8l7.3-8.38L1.2 2H7.3l4.2 5.6L18.9 2Zm-1.1 18h1.7L6.4 3.9H4.6L17.8 20Z"
      />
    </svg>
  );
}

function resolveIsExternal(href: string) {
  return href.startsWith("http://") || href.startsWith("https://");
}

function SocialIcon({ item }: { item: SocialItem }) {
  const key = item.key.toLowerCase();
  const base =
    "h-4 w-4 text-slate-400 transition-colors group-hover:text-accent";

  // Prefer filled/recognizable where it helps most
  if (key === "github") return <IconGithubFilled className={base} />;
  if (key === "linkedin") return <IconLinkedInSquareFilled className={base} />;
  if (key === "x") return <IconXFilled className={base} />;

  // Keep the rest as-is (works fine + consistent)
  if (key === "leetcode") return <Code2 className={base} />;
  if (key === "email") return <Mail className={base} />;
  if (key === "resume") return <FileText className={base} />;
  if (key === "youtube") return <Youtube className={base} />;
  if (key === "tiktok") return <PenSquare className={base} />; // placeholder icon
  if (key === "handshake") return <GraduationCap className={base} />;
  if (key === "devto" || key === "dev.to") return <Code2 className={base} />;
  if (key === "medium") return <PenSquare className={base} />;
  if (key === "discord") return <MessageCircle className={base} />;
  if (key === "threads") return <AtSign className={base} />;
  if (key === "kofi") return <Coffee className={base} />;

  // fallback
  return <ArrowUpRight className={base} />;
}

export function HeroShowcaseSection() {
  // Short flag-style link: "/?resume"
  const resumeModal = useModalRoute({
    scheme: "flag",
    key: "resume",
    scroll: false,
  });

  const resumeHref = resumeModal.href || "/resume";

  // Top small text
  const smallLabel = "Hello there,";

  // Big heading lines
  const lineOne = "Kevin Trinh here.";
  const lineTwo = "I like to build cool stuff often.";

  const description =
    "I'm currently pursuing a B.S. in Computer Science at the University of Houston. I have a profound interest in machine learning, databases, full-stack apps, and everything in between.";

  return (
    <section id="top" className="pt-16 pb-20">
      <div className="mx-auto w-full max-w-6xl px-4">
        {/* Top hero row (right side left blank for now) */}
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          {/* Left: intro + socials + CTAs */}
          <div>
            <p className="text-sm font-medium text-muted-foreground sm:text-base">
              {smallLabel}
            </p>

            {/* big heading, two lines (second line slightly smaller) */}
            <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              <span className="block">{lineOne}</span>

              {/* ✅ Slightly darker than the main line (still very subtle) */}
              <span className="mt-1 block text-3xl text-slate-200/90 sm:text-4xl lg:text-[2.6rem]">
                {lineTwo}
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">
              {description}
            </p>

            {/* Social links row */}
            <div className="mt-5 flex flex-wrap gap-2 text-xs sm:text-sm">
              {SOCIALS.map((item) => {
                const href = resolveSocialHref(item, resumeHref);
                const external = resolveIsExternal(href);

                return (
                  <a
                    key={item.key}
                    href={href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noreferrer" : undefined}
                    className="group inline-flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs sm:text-sm text-slate-50/90 transition-colors duration-150 hover:bg-white/5 hover:text-slate-50"
                  >
                    <SocialIcon item={item} />
                    <span className="text-slate-50">{item.label}</span>
                  </a>
                );
              })}
            </div>

            {/* CTAs */}
            <div className="mt-7 flex flex-wrap gap-3">
              {/* Open the resume modal with a shareable SPA URL (/?resume) */}
              <a
                href={resumeHref}
                onClick={(e) => {
                  e.preventDefault();
                  resumeModal.open();
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-slate-50 shadow-sm transition-colors duration-150 hover:bg-accent/90 hover:shadow-md"
                title={`Open ${resumeHref}`}
              >
                <FileText className="h-4 w-4" />
                <span>View Resume</span>
              </a>

              <a
                href="#contact"
                className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-slate-50 transition-colors duration-150 hover:border-accent hover:bg-white/10"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Say hello to me!</span>
              </a>
            </div>
          </div>

          {/* Right column intentionally blank for now */}
          <div className="hidden lg:block" />
        </div>

        {/* Contribution graph row */}
        <div className="mt-20">
          <ContributionGraphCard />
        </div>
      </div>
    </section>
  );
}
