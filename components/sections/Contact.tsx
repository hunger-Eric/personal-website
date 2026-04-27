// components/sections/Contact.tsx
"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { siteConfig } from "../../config/siteConfig";
import rawContactCfg from "../../config/contact.json";
import { Send } from "lucide-react";
import { QuickContactPanel } from "../contact/QuickContactPanel";

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


export function ContactSection() {
  if (siteConfig.sections && siteConfig.sections.contact === false) return null;

  const [status, setStatus] = useState<
    "idle" | "submitting" | "done" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [nameVal, setNameVal] = useState("");
  const [emailVal, setEmailVal] = useState("");
  const [messageVal, setMessageVal] = useState("");

  const [subjectVal, setSubjectVal] = useState<string>("");

  const [consentOk, setConsentOk] = useState(false);

  const startedAtRef = useRef<number>(0);
  useEffect(() => {
    startedAtRef.current = Date.now();
  }, []);

  const TERMS_HREF = "/terms";

  const canSubmit = status !== "submitting" && !!subjectVal && !!consentOk;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;

    if (!subjectVal) {
      setStatus("error");
      setErrorMsg("Please select a subject before sending.");
      return;
    }

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
    const subject = String(subjectVal).trim().slice(0, SUBJECT_MAX);
    const message = String(formData.get("message") || "")
      .trim()
      .slice(0, MSG_MAX);
    const hp = String(formData.get("company") || "");

    const payload = {
      name,
      email,
      subject,
      message,
      hp,
      startedAt: startedAtRef.current,
      consent: true,
    };

    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 12_000);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

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
      setConsentOk(false);
      setTimeout(() => setStatus("idle"), 3500);
    } catch {
      setErrorMsg(ui.errorText || "Network error. Please try again.");
      setStatus("error");
    } finally {
      clearTimeout(t);
    }
  }

  const heading = ui.heading ?? "~/Contact";
  const titleText = ui.title ?? "Connect with me.";

  return (
    <section id="contact" className="py-16 scroll-mt-12">
      <div className="mx-auto w-full max-w-6xl px-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {heading}
        </h2>
        <h3 className="mt-3 text-2xl font-semibold sm:text-3xl">{titleText}</h3>

        <div className="mt-7 overflow-hidden rounded-lg border border-white/10">
          {/* MOBILE: quick-contact + form stacked */}
          <div className="lg:hidden">
            <div className="border-white/10 bg-white/[0.03]">
              <QuickContactPanel onPickSubject={setSubjectVal} />
            </div>
            <div className="border-t border-white/10 bg-white/5 p-5 sm:p-6">
              <ContactForm
                status={status}
                errorMsg={errorMsg}
                ui={ui}
                siteName={siteConfig.name}
                handleSubmit={handleSubmit}
                canSubmit={canSubmit}
                consentOk={consentOk}
                setConsentOk={setConsentOk}
                TERMS_HREF={TERMS_HREF}
                labels={labels}
                placeholders={placeholders}
                subjectOptions={subjectOptions}
                nameVal={nameVal}
                setNameVal={setNameVal}
                emailVal={emailVal}
                setEmailVal={setEmailVal}
                messageVal={messageVal}
                setMessageVal={setMessageVal}
                subjectVal={subjectVal}
                setSubjectVal={setSubjectVal}
              />
            </div>
          </div>

          {/* DESKTOP/TABLET: split view */}
          <div className="hidden lg:grid lg:grid-cols-2 lg:items-stretch">
            <div className="bg-white/[0.03]">
              <QuickContactPanel onPickSubject={setSubjectVal} />
            </div>

            <div className="border-white/10 bg-white/5 p-5 sm:p-6 lg:border-l">
              <ContactForm
                status={status}
                errorMsg={errorMsg}
                ui={ui}
                siteName={siteConfig.name}
                handleSubmit={handleSubmit}
                canSubmit={canSubmit}
                consentOk={consentOk}
                setConsentOk={setConsentOk}
                TERMS_HREF={TERMS_HREF}
                labels={labels}
                placeholders={placeholders}
                subjectOptions={subjectOptions}
                nameVal={nameVal}
                setNameVal={setNameVal}
                emailVal={emailVal}
                setEmailVal={setEmailVal}
                messageVal={messageVal}
                setMessageVal={setMessageVal}
                subjectVal={subjectVal}
                setSubjectVal={setSubjectVal}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactForm(props: {
  status: "idle" | "submitting" | "done" | "error";
  errorMsg: string | null;
  ui: ContactUI;
  siteName: string;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  canSubmit: boolean;
  consentOk: boolean;
  setConsentOk: (v: boolean) => void;
  TERMS_HREF: string;

  labels: Record<string, string>;
  placeholders: Record<string, string>;
  subjectOptions: string[];

  nameVal: string;
  setNameVal: (v: string) => void;
  emailVal: string;
  setEmailVal: (v: string) => void;
  messageVal: string;
  setMessageVal: (v: string) => void;
  subjectVal: string;
  setSubjectVal: (v: string) => void;
}) {
  const {
    status,
    errorMsg,
    ui,
    siteName,
    handleSubmit,
    canSubmit,
    consentOk,
    setConsentOk,
    TERMS_HREF,
    labels,
    placeholders,
    subjectOptions,
    nameVal,
    setNameVal,
    emailVal,
    setEmailVal,
    messageVal,
    setMessageVal,
    subjectVal,
    setSubjectVal,
  } = props;

  return (
    <div className="flex h-full flex-col space-y-3">
      {status === "done" && (
        <div className="flex items-center gap-2 rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-300">
          <span>✅</span>
          <span>
            {ui.successText ?? "Message sent! I'll get back to you soon."} —{" "}
            {siteName}
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
        className="flex h-full flex-col space-y-4 text-sm sm:text-base"
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

        {/* Subject */}
        <div>
          <label
            htmlFor="subject"
            className="mb-1 block text-xs font-medium text-foreground sm:text-sm"
          >
            {labels.subject ?? "Subject"}
          </label>

          <select
            id="subject"
            name="subject"
            required
            className="h-10 w-full rounded-md border border-white/15 bg-transparent px-2 text-sm text-foreground outline-none ring-0 focus:border-accent"
            value={subjectVal}
            onChange={(e) => setSubjectVal(e.target.value)}
          >
            <option value="" disabled className="bg-[#020817]">
              Select a subject…
            </option>

            {subjectOptions.map((opt) => (
              <option key={opt} value={opt} className="bg-[#020817]">
                {opt}
              </option>
            ))}
          </select>
        </div>

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

        {/* Actions */}
        <div className="mt-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
              <Link
                href={TERMS_HREF}
                className="font-semibold text-accent underline decoration-accent/60 underline-offset-4 transition hover:opacity-90"
              >
                Terms & Privacy
              </Link>
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
    </div>
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
