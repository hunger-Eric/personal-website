import { describe, expect, it, vi } from "vitest";

const getRun = vi.fn();
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => ({ value: "token" }) }) }));
vi.mock("next/navigation", () => ({ notFound: vi.fn(), redirect: vi.fn() }));
vi.mock("@/lib/admin-guard", () => ({ isAdminEnabled: () => true, verifyAdminToken: () => true }));
vi.mock("@/lib/article-workbench/server", () => ({ getArticleWorkbenchServer: () => ({ getRun }) }));
vi.mock("@/components/admin/ArticleWorkbench", () => ({ ArticleWorkbench: ({ initialRun }: { initialRun?: { id: string } }) => <div data-testid="workbench">{initialRun?.id ?? "empty"}</div> }));

import AdminArticlesPage from "@/app/admin/articles/page";

describe("AdminArticlesPage", () => {
  it("restores a valid requested run and ignores invalid IDs", async () => {
    getRun.mockResolvedValueOnce({ id: "awr_aaaaaaaaaaaaaaaaaaaaaaaa" });
    const valid = await AdminArticlesPage({ searchParams: Promise.resolve({ run: "awr_aaaaaaaaaaaaaaaaaaaaaaaa" }) });
    expect(getRun).toHaveBeenCalledWith("awr_aaaaaaaaaaaaaaaaaaaaaaaa");
    expect(valid.props.initialRun.id).toBe("awr_aaaaaaaaaaaaaaaaaaaaaaaa");
    getRun.mockClear();
    const invalid = await AdminArticlesPage({ searchParams: Promise.resolve({ run: "bad" }) });
    expect(getRun).not.toHaveBeenCalled();
    expect(invalid.props.initialRun).toBeUndefined();
  });
});
