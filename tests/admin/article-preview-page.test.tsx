// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => ({ value: "test-token" }) }) }));
vi.mock("next/navigation", () => ({ notFound: vi.fn(), redirect: vi.fn() }));
vi.mock("@/lib/admin-guard", () => ({ isAdminEnabled: () => true, verifyAdminToken: () => true }));
vi.mock("@/lib/article-workbench/server", () => ({ getArticleWorkbenchServer: () => ({ getRun: async () => ({ previewMdx: "# 预览正文" }) }) }));
vi.mock("@/components/admin/ArticlePreview", () => ({ ArticlePreview: ({ source }: { source: string }) => <article>{source}</article> }));

import ArticlePreviewPage from "@/app/admin/articles/preview/[runId]/page";

describe("ArticlePreviewPage", () => {
  it("renders a navigation-free preview when embedded in the generation page", async () => {
    const page = await ArticlePreviewPage({
      params: Promise.resolve({ runId: "awr_aaaaaaaaaaaaaaaaaaaaaaaa" }),
      searchParams: Promise.resolve({ embed: "1" }),
    });
    render(page);

    expect(screen.getByText("# 预览正文")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "返回文章工作台" })).not.toBeInTheDocument();
  });
});
