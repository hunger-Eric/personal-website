"use client";

import * as LucideIcons from "lucide-react";
import { ArrowUpRight, Check, Copy } from "lucide-react";

import { siteConfig } from "../../config/siteConfig";
import { useCopyToClipboard } from "../ui/useCopyToClipboard";

type Inquiry = {
  key: string;
  label: string;
  caption: string;
  icon: keyof typeof LucideIcons;
  subject: string;
  body: string;
};

const INQUIRIES: Inquiry[] = [
  {
    key: "project",
    label: "Project inquiry",
    caption: "Want to commission, collaborate, or freelance work.",
    icon: "Hammer",
    subject: "Project inquiry — kevintrinh.dev",
    body: "Hi Kevin,\n\nI'd like to discuss a project. Here's what I'm thinking:\n\n• Project type:\n• Goals / scope:\n• Timeline:\n• Budget range:\n\nThanks!",
  },
  {
    key: "opportunity",
    label: "Role / opportunity",
    caption: "Recruiting for full-time, intern, or contract roles.",
    icon: "Briefcase",
    subject: "Role opportunity — kevintrinh.dev",
    body: "Hi Kevin,\n\nWe have an opportunity that may be a fit:\n\n• Company:\n• Role:\n• Location / remote?:\n• Compensation range:\n• Link to JD (if any):\n\nLooking forward to chatting!",
  },
  {
    key: "business",
    label: "Business / collab",
    caption: "Partnerships, sponsorships, or business questions.",
    icon: "Handshake",
    subject: "Business / collab — kevintrinh.dev",
    body: "Hi Kevin,\n\nI'd like to discuss a business / collab opportunity:\n\n• Who I am:\n• What I'm proposing:\n• What I'm hoping for:\n\nThanks!",
  },
  {
    key: "general",
    label: "General question",
    caption: "Anything else — questions, feedback, or just to say hi.",
    icon: "MessageSquare",
    subject: "Hello — kevintrinh.dev",
    body: "Hi Kevin,\n\n",
  },
];

function getEmail(): string {
  const list = siteConfig.socialsList ?? [];
  const item = list.find((s) => s.key === "email");
  if (!item) return "kevin@kevintrinh.dev";
  const href = (item.href || "").trim();
  if (href.startsWith("mailto:")) return href.slice("mailto:".length);
  return href || "kevin@kevintrinh.dev";
}

function buildMailto(to: string, subject: string, body: string) {
  const params = new URLSearchParams({ subject, body });
  return `mailto:${to}?${params.toString().replace(/\+/g, "%20")}`;
}

export function QuickContactPanel({
  onPickSubject,
}: {
  /** Called with the inquiry's subject so the form below can pre-select it. */
  onPickSubject?: (subject: string) => void;
}) {
  const email = getEmail();
  const discordTag = (siteConfig.socialsList ?? []).find(
    (s) => s.key === "discordTag"
  );
  const discordValue = discordTag?.copyValue || "kevintrnh";
  const { copied, copy } = useCopyToClipboard();

  return (
    <div className="flex h-full flex-col gap-4 p-5 sm:p-6">
      <div>
        <h4 className="text-base font-semibold text-foreground sm:text-lg">
          Quickest way to reach me
        </h4>
        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
          Pick the closest fit — opens an email pre-filled with the right
          subject. The form below also works.
        </p>
      </div>

      <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {INQUIRIES.map((q) => {
          const Icon = (LucideIcons as any)[q.icon] ?? LucideIcons.Mail;
          const href = buildMailto(email, q.subject, q.body);
          return (
            <li key={q.key}>
              <a
                href={href}
                onClick={() => onPickSubject?.(mapToFormSubject(q.key))}
                className="group flex h-full items-start gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3 transition-all hover:border-accent/60 hover:bg-white/[0.07]"
              >
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-md bg-white/5 text-slate-100 transition-transform duration-150 group-hover:scale-105">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="flex items-center gap-1 truncate text-sm font-semibold text-foreground">
                    {q.label}
                    <ArrowUpRight
                      className="h-3.5 w-3.5 flex-none text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                      aria-hidden
                    />
                  </span>
                  <span className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                    {q.caption}
                  </span>
                </span>
              </a>
            </li>
          );
        })}
      </ul>

      {/* Discord */}
      <div className="mt-1 rounded-lg border border-white/10 bg-white/[0.03] p-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 flex-none items-center justify-center rounded-md bg-white/5 text-slate-100">
            <LucideIcons.MessageCircle className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-foreground">
              Or DM me on Discord
            </div>
            <div className="truncate text-xs text-muted-foreground">
              tag: <span className="font-mono">{discordValue}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => copy(discordValue)}
            aria-label={`Copy Discord tag ${discordValue}`}
            className={[
              "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition",
              copied
                ? "border-accent/80 bg-accent/10 text-accent"
                : "border-white/15 text-foreground hover:border-accent hover:bg-white/5",
            ].join(" ")}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Map quick-contact key to a value present in the form's subject options
 * (config/contact.json subjectOptions). Defaults to "General message".
 */
function mapToFormSubject(key: string): string {
  switch (key) {
    case "project":
      return "Question about a project";
    case "opportunity":
      return "Role / Opportunity";
    case "business":
      return "Business Inquiry";
    case "general":
    default:
      return "General message";
  }
}
