"use client";

import { useMemo, useState } from "react";
import {
  Hammer,
  Briefcase,
  Handshake,
  MessageSquare,
  GraduationCap,
  Bug,
  Mail,
  ArrowUpRight,
  Copy,
  Check,
} from "lucide-react";

import { useCopyToClipboard } from "../ui/useCopyToClipboard";

type Inquiry = {
  key: string;
  label: string;
  caption: string;
  Icon: typeof Mail;
  email: string;
  subject: string;
  body: string;
};

// Inquiry types → which inbox they reach. Easy to edit later.
const INQUIRIES: Inquiry[] = [
  {
    key: "project",
    label: "Hire me / project work",
    caption:
      "Build a website or app for me, freelance work, or studio commissions.",
    Icon: Hammer,
    email: "contact@kevintrinh.dev",
    subject: "Project inquiry — kevintrinh.dev",
    body: [
      "Hi Kevin,",
      "",
      "I'd like to discuss a project:",
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
    label: "Recruiting / job opportunity",
    caption:
      "Full-time, internship, or contract role. Also good for technical screens / scheduling.",
    Icon: Briefcase,
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
    label: "Business / collab / sponsor",
    caption:
      "Partnerships, sponsorships, podcast invites, or business questions.",
    Icon: Handshake,
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
    label: "University of Houston student",
    caption:
      "UH student looking for advice, study resources, or a chat about CS at UH.",
    Icon: GraduationCap,
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
    label: "Bug / feedback on a project",
    caption:
      "Found something broken on one of my sites or open-source tools? Send it here.",
    Icon: Bug,
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
    label: "Just saying hi",
    caption: "Anything else — questions, kind words, or to introduce yourself.",
    Icon: MessageSquare,
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
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const { copied, copy } = useCopyToClipboard();

  const active = useMemo(
    () => INQUIRIES.find((i) => i.key === activeKey) ?? null,
    [activeKey]
  );

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          1. Pick what fits
        </h2>
        <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {INQUIRIES.map((q) => {
            const Icon = q.Icon;
            const isActive = activeKey === q.key;
            return (
              <li key={q.key}>
                <button
                  type="button"
                  onClick={() => setActiveKey(q.key)}
                  aria-pressed={isActive}
                  className={[
                    "group flex w-full items-start gap-3 rounded-lg border p-3.5 text-left transition-all",
                    isActive
                      ? "border-accent/70 bg-accent/10 shadow-[0_0_0_1px_rgba(99,102,241,0.35)]"
                      : "border-white/10 bg-white/[0.03] hover:border-accent/40 hover:bg-white/[0.07]",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "flex h-9 w-9 flex-none items-center justify-center rounded-md transition-colors",
                      isActive
                        ? "bg-accent/20 text-accent"
                        : "bg-white/5 text-slate-100 group-hover:bg-accent/10 group-hover:text-accent",
                    ].join(" ")}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-semibold text-foreground">
                      {q.label}
                    </span>
                    <span className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {q.caption}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          2. Send the email
        </h2>

        {!active ? (
          <div className="rounded-lg border border-dashed border-white/10 p-6 text-center text-sm text-muted-foreground">
            Pick an option above and a pre-filled email will appear here.
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-white/5 p-5 sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <div className="text-sm text-muted-foreground">Going to</div>
                <div className="mt-0.5 font-mono text-sm font-medium text-foreground">
                  {active.email}
                </div>
              </div>
              <button
                type="button"
                onClick={() => copy(active.email)}
                aria-label={`Copy ${active.email}`}
                className={[
                  "inline-flex flex-none items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition",
                  copied
                    ? "border-accent/70 bg-accent/10 text-accent"
                    : "border-white/15 bg-white/[0.03] text-foreground hover:border-accent hover:bg-white/10",
                ].join(" ")}
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" /> Copy
                  </>
                )}
              </button>
            </div>

            <div className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
              Subject
            </div>
            <div className="mb-4 rounded-md bg-white/[0.03] px-3 py-2 text-sm text-foreground">
              {active.subject}
            </div>

            <div className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
              Message preview
            </div>
            <pre className="mb-5 max-h-56 overflow-auto whitespace-pre-wrap rounded-md bg-white/[0.03] p-3 text-xs leading-relaxed text-muted-foreground sm:text-[13px]">
              {active.body}
            </pre>

            <a
              href={buildMailto(active.email, active.subject, active.body)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-white shadow-sm transition-transform transition-colors hover:-translate-y-0.5 hover:bg-accent/90 hover:shadow-md sm:w-auto"
            >
              <Mail className="h-4 w-4" />
              Open my email app
              <ArrowUpRight className="h-4 w-4" />
            </a>

            <p className="mt-3 text-xs text-muted-foreground">
              The button just opens a pre-filled <code className="font-mono">mailto:</code> link in your default email client. Nothing is sent automatically.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
