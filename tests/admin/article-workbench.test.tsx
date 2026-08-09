// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ArticleWorkbench } from "@/components/admin/ArticleWorkbench";

const profile = { identity: { name: "Site", category: "AI", positioning: "Automation", description: "Description" }, services: ["Service"], audience: "Operators", geographicScope: [], differentiators: ["Evidence"], approvedEvidence: [], disallowedClaims: ["No claim"] };
const run = { id: "awr_aaaaaaaaaaaaaaaaaaaaaaaa", status: "validated", article: { title: "原标题", slugProposal: "original-slug", summary: "摘要", tags: ["AI"], body: "# 正文", sourceAssessments: [{ sourceId: "S001", category: "official", rationale: "官方一手资料" }, { sourceId: "S002", category: "standard", rationale: "行业标准" }] }, sources: [{ id: "S001", title: "官方资料", url: "https://example.com/a" }, { id: "S002", title: "标准资料", url: "https://example.com/b" }], confirmations: [], previewMdx: "# 预览" };

function json(body: unknown) { return { ok: true, json: async () => body }; }

beforeEach(() => { vi.clearAllMocks(); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.useRealTimers(); });

describe("ArticleWorkbench", () => {
  it("loads the profile, generates a run, edits it and submits once after two source confirmations", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(json({ profile }))
      .mockResolvedValueOnce(json({ run: { id: run.id, status: run.status } }))
      .mockResolvedValueOnce(json({ run }))
      .mockResolvedValueOnce(json({ run: { ...run, confirmations: [{ sourceId: "S001", confirmed: true }, { sourceId: "S002", confirmed: true }] } }))
      .mockResolvedValueOnce(json({ publication: { id: "commit", slug: "original-slug", contentHash: "hash", status: "submitted" } }));
    vi.stubGlobal("fetch", fetchMock);
    render(<ArticleWorkbench />);
    expect(screen.getByRole("link", { name: "返回管理台" })).toHaveClass("md:hidden");
    expect(document.querySelector("aside")?.parentElement?.className).toContain("hidden");
    expect(await screen.findByLabelText("业务背景 JSON")).toHaveValue(JSON.stringify(profile, null, 2));
    fireEvent.change(screen.getByLabelText("文章选题"), { target: { value: "如何写业务文章" } });
    fireEvent.click(screen.getByRole("button", { name: "生成文章" }));
    expect(await screen.findByLabelText("标题")).toHaveValue("原标题");
    fireEvent.change(screen.getByLabelText("标题"), { target: { value: "人工修改标题" } });
    fireEvent.click(screen.getByRole("checkbox", { name: "确认来源 S001" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "确认来源 S002" }));
    fireEvent.click(screen.getByRole("button", { name: "保存并校验" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(`/api/admin/articles/runs/${run.id}`, expect.objectContaining({ method: "PUT" })));
    expect(screen.getByRole("button", { name: "上传并发布" })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "上传并发布" }));
    fireEvent.click(screen.getByRole("button", { name: "上传并发布" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(`/api/admin/articles/runs/${run.id}/publish`, expect.objectContaining({ method: "POST" })));
    expect(fetchMock.mock.calls.filter(([path]) => String(path).endsWith("/publish")).length).toBe(1);
    expect(screen.getByText("本地预览，尚未发布")).toBeInTheDocument();
  });

  it("polls publication at five-second intervals without re-submitting", async () => {
    vi.useFakeTimers();
    const submitted = { ...run, publication: { id: "commit", slug: "slug", contentHash: "hash", status: "submitted" as const } };
    const fetchMock = vi.fn().mockResolvedValue(json({ publication: submitted.publication }));
    vi.stubGlobal("fetch", fetchMock);
    render(<ArticleWorkbench initialRun={submitted} />);
    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(5_000);
    expect(fetchMock.mock.calls.filter(([path]) => String(path).includes("/publication")).length).toBe(1);
    await vi.advanceTimersByTimeAsync(295_000);
    expect(fetchMock.mock.calls.filter(([path]) => String(path).includes("/publication")).length).toBe(60);
    expect(fetchMock.mock.calls.filter(([path]) => String(path).includes("/publish")).length).toBe(0);
  });

  it("counts only bound authoritative source assessments toward publication", async () => {
    const invalidSources = { ...run, sources: [{ id: "S001", title: "未分类", url: "https://example.com/a" }, { id: "S002", title: "不匹配", url: "https://example.com/b" }], article: { ...run.article, sourceAssessments: [{ sourceId: "S003", category: "official", rationale: "不绑定" }] } };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json({ profile })));
    const { unmount } = render(<ArticleWorkbench initialRun={invalidSources} />);
    expect(screen.getByRole("checkbox", { name: "确认来源 S001" })).toBeDisabled();
    expect(screen.getByRole("checkbox", { name: "确认来源 S002" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "上传并发布" })).toBeDisabled();
    unmount();
    render(<ArticleWorkbench initialRun={run} />);
    fireEvent.click(screen.getByRole("checkbox", { name: "确认来源 S001" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "确认来源 S002" }));
    expect(screen.getByRole("button", { name: "上传并发布" })).toBeEnabled();
  });

  it("keeps a failed run locked after its single publication attempt", async () => {
    const attempted = { ...run, confirmations: [{ sourceId: "S001", confirmed: true as const }, { sourceId: "S002", confirmed: true as const }] };
    const fetchMock = vi.fn().mockResolvedValueOnce(json({ profile })).mockResolvedValueOnce({ ok: false, json: async () => ({ error: "发布失败" }) });
    vi.stubGlobal("fetch", fetchMock);
    render(<ArticleWorkbench initialRun={attempted} />);
    fireEvent.click(screen.getByRole("button", { name: "上传并发布" }));
    expect(await screen.findByText("发布失败")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "上传并发布" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "上传并发布" }));
    expect(fetchMock.mock.calls.filter(([path]) => String(path).endsWith("/publish")).length).toBe(1);
  });

  it("saves an approved profile and keeps profile validation errors visible", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(json({ profile })).mockResolvedValueOnce(json({ profile }));
    vi.stubGlobal("fetch", fetchMock);
    render(<ArticleWorkbench />);
    await screen.findByLabelText("业务背景 JSON");
    fireEvent.click(screen.getByRole("button", { name: "保存业务背景" }));
    expect(await screen.findByText("业务背景已保存。")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("业务背景 JSON"), { target: { value: "{" } });
    fireEvent.click(screen.getByRole("button", { name: "保存业务背景" }));
    await waitFor(() => expect(screen.getByRole("status")).not.toHaveTextContent("业务背景已保存。"));
  });
});
