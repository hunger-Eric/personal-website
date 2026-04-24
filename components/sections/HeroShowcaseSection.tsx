// components/sections/HeroShowcaseSection.tsx
"use client";

import { siteConfig } from "../../config/siteConfig";
import {
  FileText,
  Mail,
  ArrowUpRight,
  Coffee,
  GraduationCap,
  AtSign,
} from "lucide-react";

import { useModalRoute } from "../hooks/useModalRoute";
import { ContributionGraphCard } from "../ContributionGraphCard";

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

/* ---------------- Brand-ish icons (filled SVGs) ---------------- */

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

function IconYouTubeFilled({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M23 7.5s-.2-1.7-.8-2.4c-.8-.9-1.7-.9-2.1-1C17.2 3.8 12 3.8 12 3.8h0s-5.2 0-8.1.3c-.4.1-1.3.1-2.1 1C1.2 5.8 1 7.5 1 7.5S.7 9.5.7 11.5v1.9c0 2 .3 4 .3 4s.2 1.7.8 2.4c.8.9 1.9.9 2.4 1 1.7.2 7.8.3 7.8.3s5.2 0 8.1-.3c.4-.1 1.3-.1 2.1-1 .6-.7.8-2.4.8-2.4s.3-2 .3-4v-1.9c0-2-.3-4-.3-4zM9.8 15.8V8.7l6.4 3.6-6.4 3.5z"
      />
    </svg>
  );
}

function IconDiscordFilled({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M20.317 4.369a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.211.375-.444.864-.608 1.249a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.249.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.319 13.58.099 18.057a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.077.077 0 0 0 .084-.027c.461-.63.873-1.295 1.226-1.994a.076.076 0 0 0-.041-.105 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.127c.126-.094.252-.192.371-.291a.074.074 0 0 1 .077-.01c3.927 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.119.099.245.197.372.291a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.04.106c.36.698.772 1.363 1.225 1.993a.076.076 0 0 0 .084.028 19.876 19.876 0 0 0 6.002-3.03.077.077 0 0 0 .031-.055c.5-5.177-.838-9.673-3.548-13.66a.061.061 0 0 0-.031-.028zM8.02 15.331c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.418 2.157-2.418 1.21 0 2.176 1.094 2.157 2.418 0 1.334-.955 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.418 2.157-2.418 1.21 0 2.176 1.094 2.157 2.418 0 1.334-.946 2.419-2.157 2.419z"
      />
    </svg>
  );
}

function IconMediumFilled({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M2.846 6.887c.03-.295-.082-.59-.302-.79L.367 3.47V3.09h6.76l5.223 11.45 4.59-11.45H23v.38l-1.862 1.785a.56.56 0 0 0-.214.537v13.11a.56.56 0 0 0 .214.537L23 21.224v.38h-9.37v-.38l1.93-1.83c.19-.19.19-.246.19-.537V8.26l-5.37 13.32h-.726L3.4 8.26v8.91a1.29 1.29 0 0 0 .357 1.07l2.514 3.04v.38H0v-.38l2.514-3.04a1.25 1.25 0 0 0 .332-1.07V6.887z"
      />
    </svg>
  );
}

function IconDevToFilled({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M7.42 10.05c-.18-.16-.46-.23-.84-.23H6l.02 2.44.04 2.45.56-.02c.41 0 .63-.07.83-.26.24-.24.26-.36.26-2.2 0-1.91-.02-1.96-.29-2.18zM0 4.94v14.12h24V4.94H0zM8.56 15.3c-.44.58-1.06.77-2.53.77H4.71V8.53h1.4c1.67 0 2.16.18 2.6.9.27.43.29.6.32 2.57.05 2.23-.02 2.73-.47 3.3zm5.09-5.47h-2.47v1.77h1.52v1.28l-.72.04-.75.03v1.77l1.22.03 1.2.04v1.28h-1.6c-1.53 0-1.6-.01-1.87-.3l-.3-.28v-3.16c0-3.02.01-3.18.25-3.48.23-.31.25-.31 1.88-.31h1.64v1.3zm4.68 5.45c-.17.43-.64.79-1 .79-.18 0-.45-.15-.67-.39-.32-.32-.45-.63-.82-2.08l-.9-3.39-.45-1.67h.76c.4 0 .75.02.75.05 0 .06 1.16 4.54 1.26 4.83.04.15.32-.7.73-2.3l.66-2.52.74-.04c.4-.02.73 0 .73.04 0 .14-1.67 6.38-1.8 6.68z"
      />
    </svg>
  );
}

function IconLeetCodeFilled({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z"
      />
    </svg>
  );
}

function IconTikTokFilled({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M16.7 2c.3 2.7 1.9 4.3 4.3 4.5V9c-1.6.1-3-.4-4.2-1.2v7.2c0 4.2-3.4 7.7-7.7 7.7S1.4 19.2 1.4 15s3.4-7.7 7.7-7.7c.5 0 1 .1 1.5.2v2.8c-.5-.2-1-.3-1.5-.3-2.7 0-4.9 2.2-4.9 4.9s2.2 4.9 4.9 4.9 4.9-2.2 4.9-4.9V2h2.7Z"
      />
    </svg>
  );
}

function IconChatBubbleFilled({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M20 3H4a2 2 0 0 0-2 2v16.5a.5.5 0 0 0 .78.41L6.6 19.5H20a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Z"
      />
    </svg>
  );
}

/* ------------------------------------------------------------- */

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

  // ✅ Actual platform logos
  if (key === "tiktok") return <IconTikTokFilled className={base} />;
  if (key === "leetcode") return <IconLeetCodeFilled className={base} />;
  if (key === "youtube") return <IconYouTubeFilled className={base} />;
  if (key === "devto" || key === "dev.to")
    return <IconDevToFilled className={base} />;
  if (key === "medium") return <IconMediumFilled className={base} />;
  if (key === "discord") return <IconDiscordFilled className={base} />;

  // Keep the rest as-is
  if (key === "email") return <Mail className={base} />;
  if (key === "resume") return <FileText className={base} />;
  if (key === "handshake") return <GraduationCap className={base} />;
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
    // ✅ less top padding on mobile, unchanged on desktop
    <section id="top" className="pt-12 sm:pt-16 pb-20">
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
                // Skip any social that hasn't been configured (no real href)
                if (!href || href === "#" || href.startsWith("copy:")) {
                  return null;
                }
                const external = resolveIsExternal(href);

                return (
                  <a
                    key={item.key}
                    href={href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
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
                <span>View My Resume</span>
              </a>

              <a
                href="mailto:kevin@kevintrinh.dev"
                className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-slate-50 transition-colors duration-150 hover:border-accent hover:bg-white/10"
              >
                {/* ✅ filled speech bubble */}
                <IconChatBubbleFilled className="h-4 w-4" />
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
