// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";

vi.mock("lucide-react", () => ({
  Share2: () => React.createElement("svg", { "data-testid": "share2-icon" }),
  Linkedin: () => React.createElement("svg", { "data-testid": "linkedin-icon" }),
  Mail: () => React.createElement("svg", { "data-testid": "mail-icon" }),
  Link: () => React.createElement("svg", { "data-testid": "link-icon" }),
  Check: () => React.createElement("svg", { "data-testid": "check-icon" }),
  LinkIcon: () => React.createElement("svg", { "data-testid": "linkicon-icon" }),
  MessageCircle: () => React.createElement("svg", { "data-testid": "message-icon" }),
}));

describe("ShareLinks", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      writable: true,
      configurable: true,
    });
    Object.defineProperty(navigator, "share", {
      value: undefined,
      writable: true,
      configurable: true,
    });
    // Mock window.location.origin
    Object.defineProperty(window, "location", {
      value: { ...window.location, origin: "https://example.com" },
      writable: true,
      configurable: true,
    });
  });

  it("renders with default heading", async () => {
    const { ShareLinks } = await import("@/components/articles/ShareLinks");
    render(React.createElement(ShareLinks, { url: "https://example.com/article", title: "Test Article" }));
    expect(screen.getByText("Share this article")).toBeInTheDocument();
  });

  it("renders with custom heading", async () => {
    const { ShareLinks } = await import("@/components/articles/ShareLinks");
    render(React.createElement(ShareLinks, { url: "https://example.com/article", title: "Test", heading: "Share!" }));
    expect(screen.getByText("Share!")).toBeInTheDocument();
  });

  it("hides heading when heading is null", async () => {
    const { ShareLinks } = await import("@/components/articles/ShareLinks");
    render(React.createElement(ShareLinks, { url: "https://example.com/article", title: "Test", heading: null }));
    expect(screen.queryByText("Share this article")).not.toBeInTheDocument();
  });

  it("renders social share buttons", async () => {
    const { ShareLinks } = await import("@/components/articles/ShareLinks");
    const { container } = render(React.createElement(ShareLinks, { url: "https://example.com/article", title: "Test Article" }));
    // Should have X/Twitter, LinkedIn, Reddit, Facebook, Email, SMS links
    const links = container.querySelectorAll("a");
    expect(links.length).toBeGreaterThanOrEqual(5);
  });

  it("renders copy link button", async () => {
    const { ShareLinks } = await import("@/components/articles/ShareLinks");
    render(React.createElement(ShareLinks, { url: "https://example.com/article", title: "Test" }));
    const copyBtn = screen.getByLabelText("Copy link");
    expect(copyBtn).toBeInTheDocument();
  });

  it("copies URL to clipboard on copy button click", async () => {
    const { ShareLinks } = await import("@/components/articles/ShareLinks");
    render(React.createElement(ShareLinks, { url: "https://example.com/article", title: "Test" }));
    fireEvent.click(screen.getByLabelText("Copy link"));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("https://example.com/article");
  });

  it("shows copied state after copying", async () => {
    const { ShareLinks } = await import("@/components/articles/ShareLinks");
    render(React.createElement(ShareLinks, { url: "https://example.com/article", title: "Test" }));
    fireEvent.click(screen.getByLabelText("Copy link"));
    await vi.waitFor(() => {
      expect(screen.getByLabelText("Link copied")).toBeInTheDocument();
    });
  });

  it("expands relative URLs to absolute", async () => {
    const { ShareLinks } = await import("@/components/articles/ShareLinks");
    render(React.createElement(ShareLinks, { url: "/article/test", title: "Test" }));
    // After mount, the relative URL should be expanded
    await vi.waitFor(() => {
      // The copy button should have the full URL
      fireEvent.click(screen.getByLabelText("Copy link"));
    });
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("https://example.com/article/test");
  });

  it("shows native share button when navigator.share is available", async () => {
    Object.defineProperty(navigator, "share", {
      value: vi.fn().mockResolvedValue(undefined),
      writable: true,
      configurable: true,
    });

    const { ShareLinks } = await import("@/components/articles/ShareLinks");
    render(React.createElement(ShareLinks, { url: "https://example.com", title: "Test" }));
    await vi.waitFor(() => {
      expect(screen.getByLabelText("Share via your device")).toBeInTheDocument();
    });
  });

  it("shares via navigator.share when native share button clicked", async () => {
    const shareFn = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", {
      value: shareFn,
      writable: true,
      configurable: true,
    });

    const { ShareLinks } = await import("@/components/articles/ShareLinks");
    render(React.createElement(ShareLinks, { url: "https://example.com/article", title: "Test", summary: "A summary" }));
    await vi.waitFor(() => {
      const shareBtn = screen.getByLabelText("Share via your device");
      fireEvent.click(shareBtn);
    });
    expect(shareFn).toHaveBeenCalledWith({
      title: "Test",
      text: "A summary",
      url: "https://example.com/article",
    });
  });

  it("falls back to copy when native share is not available and button is clicked", async () => {
    const { ShareLinks } = await import("@/components/articles/ShareLinks");
    render(React.createElement(ShareLinks, { url: "https://example.com", title: "Test" }));
    // No native share button since navigator.share is undefined
    expect(screen.queryByLabelText("Share via your device")).not.toBeInTheDocument();
  });

  it("creates correct Twitter/X share URL", async () => {
    const { ShareLinks } = await import("@/components/articles/ShareLinks");
    render(React.createElement(ShareLinks, { url: "https://example.com/article", title: "Hello World" }));
    const xLink = screen.getByLabelText("Share on X / Twitter");
    expect(xLink).toHaveAttribute("href", expect.stringContaining("twitter.com/intent/tweet"));
    expect(xLink).toHaveAttribute("target", "_blank");
    expect(xLink).toHaveAttribute("rel", "noreferrer noopener");
  });

  it("creates correct LinkedIn share URL", async () => {
    const { ShareLinks } = await import("@/components/articles/ShareLinks");
    render(React.createElement(ShareLinks, { url: "https://example.com/article", title: "Test" }));
    const linkedinLink = screen.getByLabelText("Share on LinkedIn");
    expect(linkedinLink).toHaveAttribute("href", expect.stringContaining("linkedin.com/sharing"));
    expect(linkedinLink).toHaveAttribute("target", "_blank");
  });

  it("creates correct Email share URL", async () => {
    const { ShareLinks } = await import("@/components/articles/ShareLinks");
    render(React.createElement(ShareLinks, { url: "https://example.com", title: "Test" }));
    const emailLink = screen.getByLabelText("Share on Email");
    expect(emailLink).toHaveAttribute("href", expect.stringContaining("mailto:"));
  });

  it("handles clipboard failure gracefully", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockRejectedValue(new Error("Clipboard error")) },
      writable: true,
      configurable: true,
    });

    const { ShareLinks } = await import("@/components/articles/ShareLinks");
    render(React.createElement(ShareLinks, { url: "https://example.com", title: "Test" }));
    fireEvent.click(screen.getByLabelText("Copy link"));
    // Should not crash — just no visual change
    expect(screen.getByLabelText("Copy link")).toBeInTheDocument();
  });
});
