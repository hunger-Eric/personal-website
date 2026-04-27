"use client";

import { useState } from "react";

type Inquiry = {
  key: string;
  emoji: string;
  label: string;
  caption: string;
  email: string;
  subject: string;
  body: string;
};

// Inquiry types → which inbox they reach. Easy to edit later.
const INQUIRIES: Inquiry[] = [
  {
    key: "project",
    emoji: "🛠️",
    label: "Hire me / project work",
    caption: "Build me a site or app, freelance, studio commissions.",
    email: "contact@kevintrinh.dev",
    subject: "Project inquiry — kevintrinh.dev",
    body: [
      "Hi Kevin,",
      "",
      "I'd like to discuss a project.",
      "",
      "• Project type:",
      "• Goals / scope:",
      "• Timeline:",
      "• Budget range:",
      "",
      "Thanks!",
    ].join("\n"),
  },
  {
    key: "opportunity",
    emoji: "💼",
    label: "Recruiting / job opportunity",
    caption: "Full-time, internship, or contract roles.",
    email: "kevin@kevintrinh.dev",
    subject: "Role opportunity — kevintrinh.dev",
    body: [
      "Hi Kevin,",
      "",
      "We have an opportunity that may be a fit:",
      "",
      "• Company:",
      "• Role:",
      "• Location / remote?:",
      "• Compensation range:",
      "• Link to JD (if any):",
      "",
      "Looking forward to chatting.",
    ].join("\n"),
  },
  {
    key: "business",
    emoji: "🤝",
    label: "Business / collab / sponsor",
    caption: "Partnerships, sponsorships, or business questions.",
    email: "contact@kevintrinh.dev",
    subject: "Business / collab — kevintrinh.dev",
    body: [
      "Hi Kevin,",
      "",
      "I'd like to discuss a business / collab opportunity:",
      "",
      "• Who I am:",
      "• What I'm proposing:",
      "• What I'm hoping for:",
      "",
      "Thanks!",
    ].join("\n"),
  },
  {
    key: "uh",
    emoji: "🎓",
    label: "UH student question",
    caption: "Advice, study resources, CS at UH.",
    email: "kevin@kevintrinh.dev",
    subject: "UH CS — kevintrinh.dev",
    body: [
      "Hey Kevin,",
      "",
      "I'm a UH student and wanted to reach out about:",
      "",
      "(quick context: year, major, what you're trying to figure out)",
      "",
      "Thanks!",
    ].join("\n"),
  },
  {
    key: "bug",
    emoji: "🐛",
    label: "Bug or feedback",
    caption: "Something broken on a site or open-source tool of mine.",
    email: "kevin@kevintrinh.dev",
    subject: "Bug / feedback — kevintrinh.dev",
    body: [
      "Hi Kevin,",
      "",
      "Project / page:",
      "What I expected:",
      "What happened:",
      "Browser / device:",
      "",
      "Steps to reproduce:",
      "1.",
      "2.",
      "3.",
    ].join("\n"),
  },
  {
    key: "general",
    emoji: "👋",
    label: "Just saying hi",
    caption: "Anything else.",
    email: "kevin@kevintrinh.dev",
    subject: "Hello — kevintrinh.dev",
    body: ["Hi Kevin,", "", ""].join("\n"),
  },
];

function buildMailto(to: string, subject: string, body: string) {
  const params = new URLSearchParams({ subject, body });
  return `mailto:${to}?${params.toString().replace(/\+/g, "%20")}`;
}

export function ContactPicker() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(email);
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      // ignore — user can long-press the address
    }
  };

  return (
    <div className="space-y-8">
      <ul className="flex flex-col gap-2.5">
        {INQUIRIES.map((q) => (
          <li key={q.key}>
            <a
              href={buildMailto(q.email, q.subject, q.body)}
              className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-accent/60 hover:bg-white/[0.07]"
            >
              <span
                aria-hidden
                className="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-white/5 text-2xl"
              >
                {q.emoji}
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-semibold text-foreground sm:text-base">
                  <span className="relative inline-block transition-colors group-hover:text-accent after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-accent after:transition-transform after:duration-300 group-hover:after:scale-x-100">
                    {q.label}
                  </span>
                </span>
                <span className="truncate text-xs text-muted-foreground sm:text-sm">
                  {q.caption}
                </span>
              </span>
              <span
                className="hidden flex-none font-mono text-xs text-muted-foreground/80 sm:inline"
                aria-hidden
              >
                →
              </span>
            </a>
          </li>
        ))}
      </ul>

      {/* Or copy an email */}
      <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          Prefer to email directly?
        </div>
        <div className="flex flex-wrap gap-2">
          {["kevin@kevintrinh.dev", "contact@kevintrinh.dev"].map((addr) => (
            <button
              key={addr}
              type="button"
              onClick={() => copyEmail(addr)}
              className={[
                "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                copied === addr
                  ? "border-emerald-400/60 bg-emerald-500/10 text-emerald-300"
                  : "border-white/15 bg-white/[0.03] text-foreground hover:border-accent hover:bg-white/10",
              ].join(" ")}
            >
              {copied === addr ? "✅ copied" : "📋"} <span className="font-mono">{addr}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
