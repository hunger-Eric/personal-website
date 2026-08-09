// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/mdx/MdxRenderer", () => ({ MdxRenderer: ({ source }: { source: string }) => <div data-testid="mdx-renderer">{source}</div> }));

import { ArticlePreview } from "@/components/admin/ArticlePreview";

describe("ArticlePreview", () => {
  it("uses the shared server MDX renderer and marks the page as unpublished", () => {
    render(<ArticlePreview source="# 本地文章" />);
    expect(screen.getByText("本地预览，尚未发布")).toBeInTheDocument();
    expect(screen.getByTestId("mdx-renderer")).toHaveTextContent("# 本地文章");
  });
});
