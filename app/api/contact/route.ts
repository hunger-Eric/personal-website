import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

const inquirySchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(160),
  company: z.string().trim().min(1).max(160),
  workflow: z.string().trim().min(30).max(3000),
  frequency: z.enum(["daily", "weekly", "monthly", "event"]),
  manualTime: z.string().trim().min(1).max(120),
  website: z.string().max(0).optional().default(""),
});

const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT = 5;
const attempts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(request: Request) {
  const key = request.headers.get("cf-connecting-ip") || request.headers.get("x-real-ip") || "unknown";
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  current.count += 1;
  return current.count > RATE_LIMIT;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] || character);
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") || "0");
  if (contentLength > 12_000) {
    return NextResponse.json({ message: "请求内容过大。" }, { status: 413 });
  }

  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).host !== new URL(request.url).host) {
        return NextResponse.json({ message: "请求来源无效。" }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ message: "请求来源无效。" }, { status: 403 });
    }
  }

  if (isRateLimited(request)) {
    return NextResponse.json({ message: "提交过于频繁，请稍后再试。" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "请求格式无效。" }, { status: 400 });
  }

  const parsed = inquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "请检查必填信息和内容长度。" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!apiKey || !to || !from) {
    return NextResponse.json({ message: "联系通道暂未配置，请稍后再试。" }, { status: 503 });
  }

  const data = parsed.data;
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to,
    replyTo: data.email,
    subject: `[网站流程诊断] ${data.company.replace(/[\r\n]+/g, " ")} · ${data.name.replace(/[\r\n]+/g, " ")}`,
    html: `<h1>新的流程诊断申请</h1><p><strong>联系人：</strong>${escapeHtml(data.name)}</p><p><strong>邮箱：</strong>${escapeHtml(data.email)}</p><p><strong>公司/场景：</strong>${escapeHtml(data.company)}</p><p><strong>频率：</strong>${escapeHtml(data.frequency)}</p><p><strong>人工投入：</strong>${escapeHtml(data.manualTime)}</p><h2>当前流程</h2><p>${escapeHtml(data.workflow).replace(/\n/g, "<br>")}</p>`,
  });
  if (error) {
    return NextResponse.json({ message: "提交失败，请稍后重试。" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
