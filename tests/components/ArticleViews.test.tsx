// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";

const mockFetch = vi.fn();

vi.stubGlobal("fetch", mockFetch);

describe("ArticleViews", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the component wrapper", async () => {
    // fetch never resolves during this test — loading state
    mockFetch.mockReturnValue(new Promise(() => {}));

    const { ArticleViews } = await import(
      "@/components/articles/ArticleViews"
    );
    const { container } = render(
      React.createElement(ArticleViews, { slug: "test-article" })
    );

    const span = container.querySelector(
      "span.inline-flex"
    );
    expect(span).toBeInTheDocument();
    expect(span).toHaveAttribute(
      "aria-label",
      "View count loading"
    );
  });

  it("shows a loading skeleton initially", async () => {
    mockFetch.mockReturnValue(new Promise(() => {}));

    const { ArticleViews } = await import(
      "@/components/articles/ArticleViews"
    );
    const { container } = render(
      React.createElement(ArticleViews, { slug: "test-article" })
    );

    // Look for the animated pulse skeleton
    const skeleton = container.querySelector(
      "span.animate-pulse"
    );
    expect(skeleton).toBeInTheDocument();
    expect(skeleton?.className).toContain("animate-pulse");
  });

  it("displays view count after successful fetch", async () => {
    const views = 1234;
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ views }),
    });

    const { ArticleViews } = await import(
      "@/components/articles/ArticleViews"
    );

    render(
      React.createElement(ArticleViews, { slug: "test-article" })
    );

    await waitFor(() => {
      expect(screen.getByText(/views/i)).toBeInTheDocument();
    });

    // Should show formatted number (1,234)
    expect(screen.getByText("1,234 views")).toBeInTheDocument();

    // Verify fetch was called with the correct URL and POST method
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/views/test-article",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("formats numbers with Intl.NumberFormat", async () => {
    const views = 1000000;
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ views }),
    });

    const { ArticleViews } = await import(
      "@/components/articles/ArticleViews"
    );

    render(
      React.createElement(ArticleViews, { slug: "popular-article" })
    );

    await waitFor(() => {
      expect(screen.getByText("1,000,000 views")).toBeInTheDocument();
    });
  });

  it("handles initial prop without fetch for initial value", async () => {
    const { ArticleViews } = await import(
      "@/components/articles/ArticleViews"
    );

    render(
      React.createElement(ArticleViews, {
        slug: "prefilled",
        initial: 42,
      })
    );

    // Should immediately show the initial value without waiting for fetch
    expect(screen.getByText("42 views")).toBeInTheDocument();
  });
});
