// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";

vi.mock("lucide-react", () => ({
  Share2: () => React.createElement("svg", { "data-testid": "share-icon" }),
  Check: () => React.createElement("svg", { "data-testid": "check-icon" }),
}));

describe("ShareButton", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Mock window.location
    Object.defineProperty(window, "location", {
      value: { href: "https://example.com/page" },
      writable: true,
      configurable: true,
    });
    // Mock document.title
    Object.defineProperty(document, "title", {
      value: "Test Page",
      writable: true,
      configurable: true,
    });
  });

  it("renders with default label", async () => {
    const { ShareButton } = await import("@/components/ShareButton");
    render(React.createElement(ShareButton));
    const btn = screen.getByRole("button");
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute("aria-label", "Share");
    expect(btn).toHaveAttribute("title", "Share");
  });

  it("renders with custom label", async () => {
    const { ShareButton } = await import("@/components/ShareButton");
    render(React.createElement(ShareButton, { label: "分享" }));
    expect(screen.getByText("分享")).toBeInTheDocument();
  });

  it("renders icon-only when showLabel is false", async () => {
    const { ShareButton } = await import("@/components/ShareButton");
    const { container } = render(React.createElement(ShareButton, { showLabel: false }));
    expect(screen.getByRole("button")).toBeInTheDocument();
    expect(container.textContent).not.toContain("Share");
  });

  it("accepts custom className", async () => {
    const { ShareButton } = await import("@/components/ShareButton");
    render(React.createElement(ShareButton, { className: "custom-class" }));
    expect(screen.getByRole("button")).toHaveClass("custom-class");
  });

  it("uses default className when none provided", async () => {
    const { ShareButton } = await import("@/components/ShareButton");
    render(React.createElement(ShareButton));
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("inline-flex");
    expect(btn.className).toContain("rounded-md");
  });

  it("shows copied state after clipboard copy", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      writable: true,
      configurable: true,
    });
    // Remove navigator.share to force clipboard path
    Object.defineProperty(navigator, "share", {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const { ShareButton } = await import("@/components/ShareButton");
    render(React.createElement(ShareButton, { url: "https://example.com" }));
    await fireEvent.click(screen.getByRole("button"));

    expect(writeText).toHaveBeenCalledWith("https://example.com");
    await vi.waitFor(() => {
      expect(screen.getByText("Copied")).toBeInTheDocument();
    });
    expect(screen.getByRole("button")).toHaveAttribute("aria-label", "Link copied");
  });

  it("uses navigator.share when available and falls through to clipboard on abort", async () => {
    const shareFn = vi.fn().mockRejectedValue(new Error("AbortError"));
    Object.defineProperty(navigator, "share", {
      value: shareFn,
      writable: true,
      configurable: true,
    });
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      writable: true,
      configurable: true,
    });

    const { ShareButton } = await import("@/components/ShareButton");
    render(React.createElement(ShareButton, { url: "https://example.com" }));
    await fireEvent.click(screen.getByRole("button"));

    expect(shareFn).toHaveBeenCalledWith({ title: "Test Page", url: "https://example.com" });
    // Should fall through to clipboard
    await vi.waitFor(() => {
      expect(writeText).toHaveBeenCalledWith("https://example.com");
    });
  });

  it("uses navigator.share successfully and does not copy", async () => {
    const shareFn = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", {
      value: shareFn,
      writable: true,
      configurable: true,
    });
    const writeText = vi.fn();
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      writable: true,
      configurable: true,
    });

    const { ShareButton } = await import("@/components/ShareButton");
    render(React.createElement(ShareButton, { title: "Custom Title", url: "https://example.com" }));
    await fireEvent.click(screen.getByRole("button"));

    expect(shareFn).toHaveBeenCalledWith({ title: "Custom Title", url: "https://example.com" });
    expect(writeText).not.toHaveBeenCalled();
  });

  it("handles clipboard failure gracefully", async () => {
    Object.defineProperty(navigator, "share", {
      value: undefined,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockRejectedValue(new Error("Clipboard error")) },
      writable: true,
      configurable: true,
    });

    const { ShareButton } = await import("@/components/ShareButton");
    const { container } = render(React.createElement(ShareButton));
    await fireEvent.click(screen.getByRole("button"));
    // Should not crash
    expect(container).toBeTruthy();
  });
});
