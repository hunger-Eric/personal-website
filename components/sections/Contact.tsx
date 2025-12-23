// components/sections/Contact.tsx
"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { siteConfig } from "../../config/siteConfig";
import rawContactCfg from "../../config/contact.json";
import { Send } from "lucide-react";

// ─── Types for contact.json ──────────────────────────────────────────────────
type ContactLimits = {
  nameMax?: number;
  emailMax?: number;
  subjectMax?: number;
  messageMax?: number;
};

type ContactUI = {
  labels?: Record<string, string>;
  placeholders?: Record<string, string>;
  subjectOptions?: string[];
  customSubjectOptionLabel?: string;
  heading?: string;
  title?: string;
  intro?: string;
  successText?: string;
  errorText?: string;
};

type ContactConfig = {
  limits?: ContactLimits;
  ui?: ContactUI;
};

// Cast the imported JSON once with a useful shape
const contactCfg = (rawContactCfg ?? {}) as ContactConfig;

// ─── Limits / config derived from JSON ───────────────────────────────────────
const NAME_MAX = contactCfg?.limits?.nameMax ?? 80;
const EMAIL_MAX = contactCfg?.limits?.emailMax ?? 254;
const MSG_MAX = contactCfg?.limits?.messageMax ?? 2000;
const SUBJECT_MAX = contactCfg?.limits?.subjectMax ?? 50;

const ui = contactCfg?.ui ?? {};
const labels = ui.labels ?? {};
const placeholders = ui.placeholders ?? {};
const subjectOptions = ui.subjectOptions ?? [
  "General message",
  "Role / Opportunity",
  "Question about a project",
  "Business Inquiry",
  "Other",
];
const customSubjectLabel = ui.customSubjectOptionLabel ?? "Custom…";

export function ContactSection() {
  // Only render if the section is enabled
  if (siteConfig.sections && siteConfig.sections.contact === false) {
    return null;
  }

  const [status, setStatus] = useState<
    "idle" | "submitting" | "done" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [nameVal, setNameVal] = useState("");
  const [emailVal, setEmailVal] = useState("");
  const [messageVal, setMessageVal] = useState("");

  // Subject select is REQUIRED now
  const [subjectVal, setSubjectVal] = useState<string>(""); // must choose
  const [subjectCustom, setSubjectCustom] = useState<string>("");

  // Consent checkbox (must accept to send)
  const [consentOk, setConsentOk] = useState(false);

  const startedAtRef = useRef<number>(0);
  useEffect(() => {
    startedAtRef.current = Date.now();
  }, []);

  const isCustom = subjectVal === "__custom__";
  const effectiveSubject = (isCustom ? subjectCustom : subjectVal).slice(
    0,
    SUBJECT_MAX
  );

  // Update this route whenever you add the page
  const TERMS_HREF = "/terms";

  const canSubmit =
    status !== "submitting" &&
    !!subjectVal &&
    (!isCustom || !!subjectCustom.trim()) &&
    !!consentOk;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;

    // Guard: subject required
    if (!subjectVal || (isCustom && !subjectCustom.trim())) {
      setStatus("error");
      setErrorMsg("Please select a subject before sending.");
      return;
    }

    // Guard: consent required
    if (!consentOk) {
      setStatus("error");
      setErrorMsg("Please accept the terms to continue.");
      return;
    }

    setStatus("submitting");
    setErrorMsg(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const name = String(formData.get("name") || "")
      .trim()
      .slice(0, NAME_MAX);
    const email = String(formData.get("email") || "")
      .trim()
      .slice(0, EMAIL_MAX);
    const subject = effectiveSubject; // already clipped
    const message = String(formData.get("message") || "")
      .trim()
      .slice(0, MSG_MAX);
    const hp = String(formData.get("company") || ""); // honeypot

    const payload = {
      name,
      email,
      subject,
      message,
      hp,
      startedAt: startedAtRef.current,
      consent: true,
    };

    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 12_000);

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(t);

      if (!res.ok) {
        const { error } = await res
          .json()
          .catch(() => ({ error: ui.errorText || "Failed to send" }));
        setErrorMsg(error || ui.errorText || "Failed to send");
        setStatus("error");
        return;
      }

      setStatus("done");
      form.reset();
      setNameVal("");
      setEmailVal("");
      setMessageVal("");
      setSubjectVal("");
      setSubjectCustom("");
      setConsentOk(false);
      setTimeout(() => setStatus("idle"), 4000);
    } catch {
      setErrorMsg(ui.errorText || "Network error. Please try again.");
      setStatus("error");
    }
  }

  const heading = ui.heading ?? "~/Contact";
  const titleText = ui.title ?? "Let's get in touch.";

  return (
    <section id="contact" className="py-16 scroll-mt-12">
      <div className="mx-auto w-full max-w-6xl px-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {heading}
        </h2>

        <h3 className="mt-3 text-2xl font-semibold sm:text-3xl">{titleText}</h3>

        {/* Removed the description paragraph completely */}

        <div className="mt-8 space-y-6">
          {status === "done" && (
            <div className="flex items-center gap-2 rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-300">
              <span>✅</span>
              <span>
                {ui.successText ?? "Message sent! I'll get back to you soon."} —{" "}
                {siteConfig.name}
              </span>
            </div>
          )}
          {status === "error" && (
            <div className="flex items-center gap-2 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              <span>⚠️</span>
              <span>
                {errorMsg ??
                  ui.errorText ??
                  "Something went wrong. Please try again."}
              </span>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            suppressHydrationWarning
            className="space-y-4 rounded-lg border border-white/10 bg-white/5 p-4 text-sm sm:text-base"
          >
            {/* Honeypot */}
            <input
              type="text"
              name="company"
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
              aria-hidden="true"
            />

            {/* Row: Name / Email */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <FieldWithCounter
                id="name"
                name="name"
                label={labels.name ?? "Name"}
                placeholder={placeholders.name ?? "Your name"}
                type="text"
                max={NAME_MAX}
                value={nameVal}
                setValue={(v) => setNameVal(v.slice(0, NAME_MAX))}
              />
              <FieldWithCounter
                id="email"
                name="email"
                label={labels.email ?? "Email"}
                placeholder={placeholders.email ?? "you@example.com"}
                type="email"
                max={EMAIL_MAX}
                value={emailVal}
                setValue={(v) => setEmailVal(v.slice(0, EMAIL_MAX))}
              />
            </div>

            {/* Subject select (REQUIRED + placeholder) */}
            <div>
              <label
                htmlFor="subject"
                className="mb-1 block text-xs font-medium text-foreground sm:text-sm"
              >
                {labels.subject ?? "Subject"}
              </label>

              <select
                id="subject"
                name="subjectSelect"
                required
                className="h-10 w-full rounded-md border border-white/15 bg-transparent px-2 text-sm text-foreground outline-none ring-0 focus:border-accent"
                value={subjectVal}
                onChange={(e) => {
                  const v = e.target.value;
                  setSubjectVal(v);
                  if (v !== "__custom__") setSubjectCustom("");
                }}
              >
                <option value="" disabled className="bg-[#020817]">
                  Select a subject…
                </option>

                {subjectOptions.map((opt) => (
                  <option key={opt} value={opt} className="bg-[#020817]">
                    {opt}
                  </option>
                ))}

                <option value="__custom__" className="bg-[#020817]">
                  {customSubjectLabel}
                </option>
              </select>
            </div>

            {/* Custom subject (only if Custom… selected) */}
            {isCustom && (
              <div>
                <label
                  htmlFor="subjectCustom"
                  className="mb-1 flex items-center justify-between text-xs font-medium text-foreground sm:text-sm"
                >
                  <span>Custom subject</span>
                  <span className="text-[10px] text-muted-foreground">
                    {subjectCustom.length}/{SUBJECT_MAX}
                  </span>
                </label>
                <input
                  id="subjectCustom"
                  name="subjectCustom"
                  type="text"
                  value={subjectCustom}
                  onChange={(e) =>
                    setSubjectCustom(e.target.value.slice(0, SUBJECT_MAX))
                  }
                  maxLength={SUBJECT_MAX}
                  className="h-10 w-full rounded-md border border-white/15 bg-transparent px-2 text-sm text-foreground outline-none ring-0 placeholder:text-xs placeholder:text-muted-foreground/60 focus:border-accent"
                  placeholder={
                    ui.placeholders?.customSubject ?? "Enter a custom subject"
                  }
                  required
                />
              </div>
            )}

            {/* Message */}
            <div>
              <label
                htmlFor="message"
                className="mb-1 flex items-center justify-between text-xs font-medium text-foreground sm:text-sm"
              >
                <span>{labels.message ?? "Message"}</span>
                <span className="text-[10px] text-muted-foreground">
                  {messageVal.length}/{MSG_MAX}
                </span>
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={4}
                maxLength={MSG_MAX}
                value={messageVal}
                onChange={(e) => setMessageVal(e.target.value)}
                className="w-full rounded-md border border-white/15 bg-transparent px-2 py-2 text-sm text-foreground outline-none ring-0 placeholder:text-xs placeholder:text-muted-foreground/60 focus:border-accent"
                placeholder={
                  placeholders.message ??
                  "Write a short message and include your preferred contact info so I know how to get back to you."
                }
              />
            </div>

            {/* Actions: consent line (left) + send button (right) */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* REPLACES “Email me directly” */}
              <label className="inline-flex items-center gap-2 text-[11px] text-muted-foreground sm:text-xs">
                <input
                  type="checkbox"
                  checked={consentOk}
                  onChange={(e) => setConsentOk(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-transparent text-white outline-none focus:ring-0"
                  aria-label="Consent to be contacted"
                />
                <span>
                  I agree to{" "}
                  <a
                    href={TERMS_HREF}
                    className="font-semibold text-accent underline decoration-accent/60 underline-offset-4 transition hover:opacity-90"
                  >
                    Terms & Privacy
                  </a>
                  .
                </span>
              </label>

              <button
                type="submit"
                disabled={!canSubmit}
                className="inline-flex items-center gap-1.5 rounded-md border border-transparent bg-accent px-4 py-2 text-xs font-medium text-white shadow-sm transition-transform transition-colors duration-200 hover:border-accent hover:bg-accent/90 hover:shadow-md hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 sm:text-sm"
              >
                <Send className="h-4 w-4" />
                {status === "submitting"
                  ? "Sending..."
                  : status === "done"
                  ? "Sent!"
                  : status === "error"
                  ? "Try again"
                  : "Send message"}
              </button>
            </div>
          </form>

          {/* Removed the entire “More of my work & socials” block */}
        </div>
      </div>
    </section>
  );
}

function FieldWithCounter(props: {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  type: string;
  max: number;
  value: string;
  setValue: (v: string) => void;
}) {
  const { id, name, label, placeholder, type, max, value, setValue } = props;
  return (
    <div className="flex-1">
      <label
        htmlFor={id}
        className="mb-1 flex items-center justify-between text-xs font-medium text-foreground sm:text-sm"
      >
        <span>{label}</span>
        <span className="text-[10px] text-muted-foreground">
          {value.length}/{max}
        </span>
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required
        maxLength={max}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-10 w-full rounded-md border border-white/15 bg-transparent px-2 text-sm text-foreground outline-none ring-0 placeholder:text-xs placeholder:text-muted-foreground/60 focus:border-accent"
        placeholder={placeholder}
      />
    </div>
  );
}
