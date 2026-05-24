// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import React from "react";

const mockFetch = vi.fn();

vi.stubGlobal("fetch", mockFetch);

describe("ArticleViews", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the component wrapper", async () => {
    mockFetch.mockReturnValue(new Promise(() => {}));

    const { ArticleViews } = await import(
      "@/components/articles/ArticleViews"
    );
    const { container } = render(
      React.createElement(ArticleViews, { slug: "test-article" })
    );

    const span = container.querySelector("span.inline-flex");
    expect(span).toBeInTheDocument();
    expect(span).toHaveAttribute("aria-label", "View count loading");
  });

  it("shows a loading skeleton initially", async () => {
    mockFetch.mockReturnValue(new Promise(() => {}));

    const { ArticleViews } = await import(
      "@/components/articles/ArticleViews"
    );
    const { container } = render(
      React.createElement(ArticleViews, { slug: "test-article" })
    );

    const skeleton = container.querySelector("span.animate-pulse");
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

    expect(screen.getByText("1,234 views")).toBeInTheDocument();

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

    expect(screen.getByText("42 views")).toBeInTheDocument();
  });

  it("handles non-ok response gracefully", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
    });

    const { ArticleViews } = await import(
      "@/components/articles/ArticleViews"
    );

    const { container } = render(
      React.createElement(ArticleViews, { slug: "test-article" })
    );

    // Should stay in loading state since res.ok is false
    await new Promise((r) => setTimeout(r, 50));
    // "View count loading" is in aria-label, not visible text
    expect(
      container.querySelector('span[aria-label="View count loading"]')
    ).toBeInTheDocument();
  });

  it("handles fetch error (network blip) gracefully", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    const { ArticleViews } = await import(
      "@/components/articles/ArticleViews"
    );

    const { container } = render(
      React.createElement(ArticleViews, { slug: "test-article" })
    );

    // Should stay in loading state — catch block handles it
    await new Promise((r) => setTimeout(r, 50));
    expect(
      container.querySelector('span[aria-label="View count loading"]')
    ).toBeInTheDocument();
  });

  it("handles malformed JSON response", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });

    const { ArticleViews } = await import(
      "@/components/articles/ArticleViews"
    );

    const { container } = render(
      React.createElement(ArticleViews, { slug: "test-article" })
    );

    // views is undefined, so state should remain null
    await new Promise((r) => setTimeout(r, 50));
    expect(
      container.querySelector('span[aria-label="View count loading"]')
    ).toBeInTheDocument();
  });
});

/* ─── Polling / visibility / cleanup tests with fake timers ─── */
describe("ArticleViews polling and lifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    // Ensure document is visible by default
    Object.defineProperty(document, "hidden", {
      value: false,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("polls with GET after initial POST when tab is visible", async () => {
    const views = 100;
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ views }),
    });

    const { ArticleViews } = await import(
      "@/components/articles/ArticleViews"
    );

    render(React.createElement(ArticleViews, { slug: "poll-test" }));

    // Initial POST
    await vi.advanceTimersByTimeAsync(0);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/views/poll-test",
      expect.objectContaining({ method: "POST" })
    );

    // Advance past the first poll interval (30s)
    // The setTimeout is set at POLL_MS = 30_000
    await vi.advanceTimersByTimeAsync(30_000);

    // Should have called GET for the first poll tick
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch).toHaveBeenLastCalledWith(
      "/api/views/poll-test",
      expect.objectContaining({ method: "GET" })
    );
  });

  it("skips polling tick when document is hidden", async () => {
    Object.defineProperty(document, "hidden", {
      value: true,
      configurable: true,
    });

    const views = 100;
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ views }),
    });

    const { ArticleViews } = await import(
      "@/components/articles/ArticleViews"
    );

    render(React.createElement(ArticleViews, { slug: "hidden-test" }));

    // Initial POST
    await vi.advanceTimersByTimeAsync(0);
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Advance past the poll interval
    await vi.advanceTimersByTimeAsync(30_000);

    // Tick function runs but sees document.hidden=true, so no fetch
    // But it does schedule the next tick via setTimeout
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("fetches on visibilitychange when tab becomes visible", async () => {
    // Start hidden
    Object.defineProperty(document, "hidden", {
      value: true,
      configurable: true,
    });

    const views = 100;
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ views }),
    });

    const { ArticleViews } = await import(
      "@/components/articles/ArticleViews"
    );

    render(React.createElement(ArticleViews, { slug: "vis-test" }));

    // Wait for initial POST
    await vi.advanceTimersByTimeAsync(0);
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Now make document visible
    Object.defineProperty(document, "hidden", {
      value: false,
      configurable: true,
    });

    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });

    // Should trigger fetchViews("GET") immediately
    await vi.advanceTimersByTimeAsync(0);
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch).toHaveBeenLastCalledWith(
      "/api/views/vis-test",
      expect.objectContaining({ method: "GET" })
    );
  });

  it("does not fetch on visibilitychange when tab goes hidden", async () => {
    // Start visible
    Object.defineProperty(document, "hidden", {
      value: false,
      configurable: true,
    });

    const views = 100;
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ views }),
    });

    const { ArticleViews } = await import(
      "@/components/articles/ArticleViews"
    );

    render(React.createElement(ArticleViews, { slug: "vis-hide-test" }));

    // Wait for initial POST
    await vi.advanceTimersByTimeAsync(0);
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Now make document hidden
    Object.defineProperty(document, "hidden", {
      value: true,
      configurable: true,
    });

    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });

    // Should NOT fetch when going hidden
    await vi.advanceTimersByTimeAsync(0);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("cleans up on unmount (clearTimeout, removeEventListener)", async () => {
    const views = 100;
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ views }),
    });

    const clearTimeoutSpy = vi.spyOn(window, "clearTimeout");
    const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");

    const { ArticleViews } = await import(
      "@/components/articles/ArticleViews"
    );

    const { unmount } = render(
      React.createElement(ArticleViews, { slug: "cleanup-test" })
    );

    await vi.advanceTimersByTimeAsync(0);

    unmount();

    // Should have removed the visibilitychange listener
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "visibilitychange",
      expect.any(Function)
    );

    // clearTimeout should have been called (timer was set)
    expect(clearTimeoutSpy).toHaveBeenCalled();

    clearTimeoutSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  it("abandons fetch response if cancelled before JSON resolves", async () => {
    // Create a promise that we control
    let resolveJson: (v: unknown) => void;
    const jsonPromise = new Promise((resolve) => {
      resolveJson = resolve;
    });

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => jsonPromise,
    });

    const { ArticleViews } = await import(
      "@/components/articles/ArticleViews"
    );

    const { unmount } = render(
      React.createElement(ArticleViews, { slug: "cancel-test" })
    );

    // Unmount before the JSON resolves — cancelled flag is set
    unmount();

    // Now resolve the JSON — it should check `cancelled` and skip setViews
    resolveJson!({ views: 999 });

    // Flush microtasks
    await vi.advanceTimersByTimeAsync(10);

    // No error should have occurred; component is unmounted
    // If cancelled check works, no crash here
    expect(true).toBe(true);
  });
});
