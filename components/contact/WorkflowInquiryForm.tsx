"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { useLocale } from "@/components/LocaleProvider";

type FormStatus = "idle" | "sending" | "sent" | "error";

export function WorkflowInquiryForm() {
  const { locale } = useLocale();
  const zh = locale === "zh";
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { message?: string };
      if (!response.ok) throw new Error(result.message || "Request failed");
      form.reset();
      setStatus("sent");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : zh ? "提交失败，请稍后重试。" : "Submission failed. Please try again.");
    }
  }

  if (status === "sent") {
    return (
      <div role="status" className="border border-accent bg-surface-paper-elevated p-6">
        <CheckCircle2 className="h-7 w-7 text-accent" aria-hidden />
        <h2 className="mt-5 text-2xl font-semibold text-foreground">{zh ? "问题已提交" : "Your workflow was submitted"}</h2>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">{zh ? "我会先人工查看你提供的信息；如果适合进一步讨论，再通过邮箱确认 30 分钟初步诊断。" : "I will review the information personally and confirm a 30-minute initial diagnosis by email when it is a fit."}</p>
      </div>
    );
  }

  const inputClass = "mt-2 w-full border border-hairline bg-surface-paper-elevated px-3 py-3 text-sm text-foreground outline-none transition focus:border-accent focus:ring-1 focus:ring-accent";

  return (
    <form onSubmit={submit} className="space-y-5" aria-label={zh ? "流程问题提交表单" : "Workflow inquiry form"}>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-semibold text-foreground">{zh ? "你的姓名" : "Your name"}<input name="name" required maxLength={80} autoComplete="name" className={inputClass} /></label>
        <label className="text-sm font-semibold text-foreground">{zh ? "工作邮箱" : "Work email"}<input name="email" required type="email" maxLength={160} autoComplete="email" className={inputClass} /></label>
      </div>
      <label className="block text-sm font-semibold text-foreground">{zh ? "公司与业务场景" : "Company and business context"}<input name="company" required maxLength={160} className={inputClass} placeholder={zh ? "例如：20 人的跨境物流团队" : "e.g. a 20-person logistics team"} /></label>
      <label className="block text-sm font-semibold text-foreground">{zh ? "目前的流程是怎样的？" : "How does the workflow work today?"}<textarea name="workflow" required minLength={30} maxLength={3000} rows={6} className={inputClass} placeholder={zh ? "请写清输入、处理步骤、参与人员、输出，以及最容易出错的位置。" : "Describe inputs, steps, people involved, outputs, and where errors occur."} /></label>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-semibold text-foreground">{zh ? "发生频率" : "Frequency"}<select name="frequency" required className={inputClass} defaultValue=""><option value="" disabled>{zh ? "请选择" : "Select"}</option><option value="daily">{zh ? "每天" : "Daily"}</option><option value="weekly">{zh ? "每周" : "Weekly"}</option><option value="monthly">{zh ? "每月" : "Monthly"}</option><option value="event">{zh ? "按业务事件触发" : "Event-driven"}</option></select></label>
        <label className="text-sm font-semibold text-foreground">{zh ? "每次大约投入多少人工时间？" : "Approximate manual time per run"}<input name="manualTime" required maxLength={120} className={inputClass} placeholder={zh ? "例如：2 人 × 4 小时" : "e.g. 2 people × 4 hours"} /></label>
      </div>
      <label className="sr-only" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      {status === "error" ? <p role="alert" className="text-sm font-medium text-destructive">{message}</p> : null}
      <button type="submit" disabled={status === "sending"} className="inline-flex w-full items-center justify-center gap-2 bg-accent px-5 py-3.5 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover disabled:opacity-60">
        {status === "sending" ? (zh ? "正在提交…" : "Submitting…") : (zh ? "提交并申请初步诊断" : "Submit for initial diagnosis")}<ArrowRight className="h-4 w-4" aria-hidden />
      </button>
      <p className="text-xs leading-5 text-muted-foreground">{zh ? "提交不等于自动报价或保证安排会议。你的信息只用于判断是否适合进一步沟通。" : "Submission is not an automatic quote or guaranteed meeting. Your information is used only to assess fit."}</p>
    </form>
  );
}
