// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FreeReportSubmissions } from "@/components/admin/crawlers/FreeReportSubmissions";
import type { CrawlerAnalyticsResponse } from "@/lib/crawler-analytics/types";

describe("FreeReportSubmissions", () => {
  it("does not fabricate zeros before the observer field exists", () => {
    render(<FreeReportSubmissions />);
    expect(screen.getByText(/尚未启用/)).toBeInTheDocument();
    expect(screen.queryByText("接口请求")).not.toBeInTheDocument();
  });
  it("shows partial observed counts and mechanical failure details", () => {
    render(<FreeReportSubmissions submissions={{ available: true, trackingStartedAt: "2026-10-08T00:00:00.000Z", requestedWindowComplete: false, summary: { requests: 4, accepted: 1, failed: 2, other: 1, transportErrors: 1 }, trend: [], statuses: [{ status: 202, requests: 1 }, { status: 0, requests: 1 }, { status: 400, requests: 1 }, { status: 302, requests: 1 }], errors: [{ status: 0, code: "transport_error", requests: 1 }, { status: 400, code: "invalidUrl", requests: 1 }] }} />);
    expect(screen.getByText(/当前只统计从采集开始后/)).toBeInTheDocument();
    expect(screen.getByText(/非预期接口状态：1/)).toBeInTheDocument();
    expect(screen.getByText(/无 HTTP 状态的传输错误：1/)).toBeInTheDocument();
    expect(screen.getAllByText("无 HTTP 状态").length).toBeGreaterThan(0);
    expect(screen.getByText("网站地址无效（invalidUrl）")).toBeInTheDocument();
    expect(screen.getByText(/不代表独立访客、新报告或报告生成完成/)).toBeInTheDocument();
  });
  it("shows domain rows, omission, and distinct domain collection states", () => {
    const submission: Extract<NonNullable<CrawlerAnalyticsResponse["scanSubmissions"]>, { available?: true }> = { available: true, trackingStartedAt: "2026-10-08T00:00:00.000Z", requestedWindowComplete: true, summary: { requests: 3, accepted: 1, failed: 2, other: 0, transportErrors: 0 }, trend: [], statuses: [{ status: 202, requests: 1 }, { status: 400, requests: 2 }], errors: [{ status: 400, code: "invalidUrl", requests: 2 }] };
    const { rerender } = render(<FreeReportSubmissions submissions={{ ...submission, domains: { available: true, trackingStartedAt: "2026-10-08T00:00:00.000Z", requestedWindowComplete: false, summary: { requests: 3, accepted: 1, failed: 2, other: 0 }, rows: [{ domain: "sub.example.com", requests: 1, accepted: 1, failed: 0, other: 0 }], omittedRequests: 2 } }} />);
    expect(screen.getByRole("table", { name: "提交网站域名" })).toHaveTextContent("sub.example.com");
    expect(screen.getByText(/未逐项列出的提交请求：2/)).toBeInTheDocument();
    rerender(<FreeReportSubmissions submissions={{ ...submission, domains: { available: false } }} />);
    expect(screen.getByText(/域名统计当前不可用/)).toBeInTheDocument();
    rerender(<FreeReportSubmissions submissions={{ ...submission, domains: { available: true, trackingStartedAt: null, requestedWindowComplete: true, summary: { requests: 0, accepted: 0, failed: 0, other: 0 }, rows: [], omittedRequests: 0 } }} />);
    expect(screen.getByText(/域名记录器正在等待首次提交观测/)).toBeInTheDocument();
    rerender(<FreeReportSubmissions submissions={{ ...submission, summary: { requests: 0, accepted: 0, failed: 0, other: 0, transportErrors: 0 }, statuses: [], errors: [], domains: { available: true, trackingStartedAt: "2026-10-08T00:00:00.000Z", requestedWindowComplete: true, summary: { requests: 0, accepted: 0, failed: 0, other: 0 }, rows: [], omittedRequests: 0 } }} />);
    expect(screen.getByText(/本完整查询窗口内未观察到可归入域名/)).toBeInTheDocument();
  });
  it("separates unavailable from waiting for the first observed request", () => {
    const { rerender } = render(<FreeReportSubmissions submissions={{ available: false }} />);
    expect(screen.getByText(/当前不可用/)).toBeInTheDocument();
    rerender(<FreeReportSubmissions submissions={{ available: true, trackingStartedAt: null, requestedWindowComplete: true, summary: { requests: 0, accepted: 0, failed: 0, other: 0, transportErrors: 0 }, trend: [], statuses: [], errors: [] }} />);
    expect(screen.getByText(/等待首次免费报告提交观测/)).toBeInTheDocument();
  });
  it("states a real zero only after a complete collected window", () => {
    render(<FreeReportSubmissions submissions={{ available: true, trackingStartedAt: "2026-10-08T00:00:00.000Z", requestedWindowComplete: true, summary: { requests: 0, accepted: 0, failed: 0, other: 0, transportErrors: 0 }, trend: [], statuses: [], errors: [] }} />);
    expect(screen.getByText("本完整查询窗口内未观察到免费报告提交请求。")).toBeInTheDocument();
    expect(screen.queryByText("接口请求")).not.toBeInTheDocument();
  });
});
