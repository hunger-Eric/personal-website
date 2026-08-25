// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const replaceMock = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: replaceMock }), usePathname: () => "/admin/articles" }));

import { ArticleWorkbench } from "@/components/admin/ArticleWorkbench";

const run = { id: "awr_aaaaaaaaaaaaaaaaaaaaaaaa", status: "validated", article: { title: "原标题", slugProposal: "original-slug", summary: "摘要", tags: ["AI"], body: "# 正文", sourceAssessments: [{ sourceId: "S001", category: "official", rationale: "官方一手资料" }, { sourceId: "S002", category: "standard", rationale: "行业标准" }] }, sources: [{ id: "S001", title: "官方资料", url: "https://example.com/a" }, { id: "S002", title: "标准资料", url: "https://example.com/b" }], confirmations: [], previewMdx: "# 预览" };
const activeRun = { id: "awr_bbbbbbbbbbbbbbbbbbbbbbbb", status: "created", origin: "open_geo_local" as const, openGeo: { phase: "writing", progress: 67, etaSeconds: 42 } };
const importedRun = { id: activeRun.id, status: "validated", origin: "open_geo_local" as const, openGeo: { phase: "completed", progress: 100 }, article: { title: "Open GEO 标题", slugProposal: "open-geo-title", summary: "Open GEO 摘要", tags: ["GEO"], body: "正文 [来源](https://example.com/source)。", sourceAssessments: [] }, confirmations: [], previewMdx: "# 预览" };

function json(body: unknown) { return { ok: true, json: async () => body }; }

beforeEach(() => { vi.clearAllMocks(); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.useRealTimers(); });

describe("ArticleWorkbench", () => {
  it("creates, polls, and automatically imports one local Open GEO task without links, copying, legacy generation, or checkout", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(json({ run: activeRun }))
      .mockResolvedValueOnce(json({ run: importedRun }));
    vi.stubGlobal("fetch", fetchMock);
    render(<ArticleWorkbench defaultSourceUrl="https://me.itheheda.online" />);
    expect(screen.getByRole("link", { name: "返回管理台" })).toHaveClass("md:hidden");
    expect(screen.queryByRole("link", { name: /Open GEO/ })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Open GEO Markdown")).not.toBeInTheDocument();
    expect(screen.queryByText(/付款|支付|结账/)).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("文章主题"), { target: { value: "企业如何准备 GEO 证据" } });
    fireEvent.change(screen.getByLabelText("补充关键信息"), { target: { value: "只使用已审核事实。" } });
    fireEvent.click(screen.getByRole("button", { name: "开始自动生成" }));

    expect(await screen.findByTitle("文章同页预览")).toHaveAttribute("src", `/admin/articles/preview/${importedRun.id}?embed=1`);
    expect(screen.queryByRole("link", { name: "打开本地预览" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "编辑文章" }));
    expect(screen.getByLabelText("标题")).toHaveValue("Open GEO 标题");
    fireEvent.click(screen.getByRole("button", { name: "预览文章" }));
    expect(screen.getByTitle("文章同页预览")).toBeInTheDocument();
    expect(replaceMock).toHaveBeenCalledWith(`/admin/articles?run=${importedRun.id}`);
    expect(fetchMock).toHaveBeenCalledWith("/api/admin/articles/open-geo", expect.objectContaining({ method: "POST", credentials: "same-origin", signal: expect.anything() }));
    const submitted = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body));
    expect(submitted).toMatchObject({ topic: "企业如何准备 GEO 证据", sourceUrl: "https://me.itheheda.online", sourceText: "只使用已审核事实。" });
    expect(fetchMock).toHaveBeenCalledWith(`/api/admin/articles/runs/${importedRun.id}/open-geo`, expect.objectContaining({ credentials: "same-origin" }));
    expect(fetchMock.mock.calls.some(([path]) => String(path).includes("/generate"))).toBe(false);
    expect(fetchMock.mock.calls.some(([path]) => String(path).includes("checkout"))).toBe(false);
    expect(screen.getByRole("button", { name: "上传并发布" })).toBeEnabled();
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

  it("uses the article project's embedded sources without a second confirmation gate", async () => {
    vi.stubGlobal("fetch", vi.fn());
    render(<ArticleWorkbench initialRun={run} />);

    expect(screen.queryByText("来源确认")).not.toBeInTheDocument();
    expect(screen.queryByRole("checkbox", { name: /确认来源/ })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "上传并发布" })).toBeEnabled();
  });

  it("keeps a failed run locked after its single publication attempt", async () => {
    const attempted = { ...run, confirmations: [{ sourceId: "S001", confirmed: true as const }, { sourceId: "S002", confirmed: true as const }] };
    const fetchMock = vi.fn().mockResolvedValueOnce({ ok: false, json: async () => ({ error: "发布失败" }) });
    vi.stubGlobal("fetch", fetchMock);
    render(<ArticleWorkbench initialRun={attempted} />);
    fireEvent.click(screen.getByRole("button", { name: "上传并发布" }));
    expect(await screen.findByText("发布失败")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "上传并发布" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "上传并发布" }));
    expect(fetchMock.mock.calls.filter(([path]) => String(path).endsWith("/publish")).length).toBe(1);
  });

  it("keeps local Open GEO creation failures visible without retrying, linking out, or falling back", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({ ok: false, json: async () => ({ error: "本机 Open GEO 服务不可用" }) });
    vi.stubGlobal("fetch", fetchMock);
    render(<ArticleWorkbench />);
    fireEvent.change(screen.getByLabelText("文章主题"), { target: { value: "本地生成测试" } });
    fireEvent.click(screen.getByRole("button", { name: "开始自动生成" }));
    expect(await screen.findByText("本机 Open GEO 服务不可用")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls.some(([path]) => String(path).includes("/generate"))).toBe(false);
    expect(screen.queryByRole("link", { name: /Open GEO/ })).not.toBeInTheDocument();
  });
});
