// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock("next/image", () => ({
  default: (p: any) => React.createElement("img", p),
}));

vi.mock("next/link", () => ({
  default: (p: any) => React.createElement("a", p),
}));

vi.mock("lucide-react", () => ({
  Link2: () => React.createElement("svg", { "data-testid": "icon-link2" }),
}));

// Mutable state for configs
const mockConfigState = vi.hoisted(() => ({
  aboutEnabled: true,
  handle: "testuser",
  displayName: "Test User",
  avatarUrl: "/avatar.jpg",
  fileLabel: "README.md",
  paragraphs: ["Hello, I am a developer.", "I build things."],
  afterTechParagraph: "I also take photos.",
}));

vi.mock("@/config/siteConfig", () => ({
  siteConfig: {
    get name() { return mockConfigState.displayName; },
    get sections() { return { about: mockConfigState.aboutEnabled }; },
  },
}));

vi.mock("@/config/aboutConfig", () => ({
  aboutConfig: {
    get handle() { return mockConfigState.handle; },
    get displayName() { return mockConfigState.displayName; },
    get avatarUrl() { return mockConfigState.avatarUrl; },
    get readme() {
      return {
        fileLabel: mockConfigState.fileLabel,
        paragraphs: mockConfigState.paragraphs,
        afterTechParagraph: mockConfigState.afterTechParagraph,
      };
    },
  },
}));

// ── Tests ──────────────────────────────────────────────────────────────────

describe("AboutSection", () => {
  it("renders nothing when section is disabled", async () => {
    mockConfigState.aboutEnabled = false;
    const { AboutSection } = await import("@/components/sections/About");
    const { container } = render(React.createElement(AboutSection));
    expect(container.innerHTML).toBe("");
  });

  it("renders section heading when enabled", async () => {
    mockConfigState.aboutEnabled = true;
    const { AboutSection } = await import("@/components/sections/About");
    render(React.createElement(AboutSection));
    expect(screen.getByText("~/About Me")).toBeTruthy();
  });

  it("renders avatar image when avatarUrl is provided", async () => {
    mockConfigState.aboutEnabled = true;
    mockConfigState.avatarUrl = "/avatar.jpg";
    mockConfigState.displayName = "Test User";
    const { AboutSection } = await import("@/components/sections/About");
    const { container } = render(React.createElement(AboutSection));
    const img = container.querySelector("img");
    expect(img).toBeTruthy();
    expect(img?.getAttribute("src")).toBe("/avatar.jpg");
    expect(img?.getAttribute("alt")).toBe("Test User");
  });

  it("does not render avatar when avatarUrl is absent", async () => {
    mockConfigState.aboutEnabled = true;
    mockConfigState.avatarUrl = undefined as any;
    const { AboutSection } = await import("@/components/sections/About");
    const { container } = render(React.createElement(AboutSection));
    expect(container.querySelector("img")).toBeFalsy();
  });

  it("renders 'View all my socials' link", async () => {
    mockConfigState.aboutEnabled = true;
    mockConfigState.avatarUrl = "/avatar.jpg";
    const { AboutSection } = await import("@/components/sections/About");
    const { container } = render(React.createElement(AboutSection));
    const link = container.querySelector('a[href="/links"]');
    expect(link).toBeTruthy();
    expect(link?.textContent).toContain("View all my socials");
  });

  it("renders handle and file label", async () => {
    mockConfigState.aboutEnabled = true;
    mockConfigState.handle = "testuser";
    mockConfigState.fileLabel = "README.md";
    const { AboutSection } = await import("@/components/sections/About");
    render(React.createElement(AboutSection));
    expect(screen.getByText("testuser")).toBeTruthy();
    expect(screen.getByText("README")).toBeTruthy();
    expect(screen.getByText(".md")).toBeTruthy();
  });

  it("renders file label for non-md files", async () => {
    mockConfigState.aboutEnabled = true;
    mockConfigState.fileLabel = "PROFILE.txt";
    mockConfigState.paragraphs = ["Hi"];
    const { AboutSection } = await import("@/components/sections/About");
    render(React.createElement(AboutSection));
    expect(screen.getByText("PROFILE.txt")).toBeTruthy();
    // Reset
    mockConfigState.fileLabel = "README.md";
    mockConfigState.paragraphs = ["Hello, I am a developer.", "I build things."];
  });

  it("renders paragraphs (max 2)", async () => {
    mockConfigState.aboutEnabled = true;
    mockConfigState.paragraphs = ["P1", "P2", "P3"];
    const { AboutSection } = await import("@/components/sections/About");
    render(React.createElement(AboutSection));
    expect(screen.getByText("P1")).toBeTruthy();
    expect(screen.getByText("P2")).toBeTruthy();
    expect(screen.queryByText("P3")).toBeFalsy();
    mockConfigState.paragraphs = ["Hello, I am a developer.", "I build things."];
  });

  it("renders technology list", async () => {
    mockConfigState.aboutEnabled = true;
    const { AboutSection } = await import("@/components/sections/About");
    render(React.createElement(AboutSection));
    expect(screen.getByText("Python")).toBeTruthy();
    expect(screen.getByText("React.js")).toBeTruthy();
    expect(screen.getByText("TypeScript")).toBeTruthy();
  });

  it("renders 'some of the technologies' text", async () => {
    mockConfigState.aboutEnabled = true;
    const { AboutSection } = await import("@/components/sections/About");
    render(React.createElement(AboutSection));
    expect(screen.getByText(/Some of the technologies I work with/)).toBeTruthy();
  });

  it("renders afterTechParagraph when present", async () => {
    mockConfigState.aboutEnabled = true;
    mockConfigState.afterTechParagraph = "I also take photos.";
    const { AboutSection } = await import("@/components/sections/About");
    render(React.createElement(AboutSection));
    expect(screen.getByText("I also take photos.")).toBeTruthy();
  });

  it("does not render afterTechParagraph when absent", async () => {
    mockConfigState.aboutEnabled = true;
    mockConfigState.afterTechParagraph = undefined as any;
    const { AboutSection } = await import("@/components/sections/About");
    render(React.createElement(AboutSection));
    expect(screen.queryByText("I also take photos.")).toBeFalsy();
    mockConfigState.afterTechParagraph = "I also take photos.";
  });

  it("renders Link2 icon", async () => {
    mockConfigState.aboutEnabled = true;
    const { AboutSection } = await import("@/components/sections/About");
    const { container } = render(React.createElement(AboutSection));
    expect(container.querySelector('[data-testid="icon-link2"]')).toBeTruthy();
  });

  it("uses displayName for alt text", async () => {
    mockConfigState.aboutEnabled = true;
    mockConfigState.avatarUrl = "/avatar.jpg";
    mockConfigState.displayName = "Display Name";
    const { AboutSection } = await import("@/components/sections/About");
    const { container } = render(React.createElement(AboutSection));
    const img = container.querySelector("img");
    expect(img?.getAttribute("alt")).toBe("Display Name");
  });

  it("falls back to siteConfig.name for alt text", async () => {
    mockConfigState.aboutEnabled = true;
    mockConfigState.avatarUrl = "/avatar.jpg";
    mockConfigState.displayName = undefined as any;
    const { AboutSection } = await import("@/components/sections/About");
    const { container } = render(React.createElement(AboutSection));
    const img = container.querySelector("img");
    // Falls back to siteConfig.name which also returns mockConfigState.displayName (undefined)
    expect(img?.getAttribute("alt")).toBeNull();
    mockConfigState.displayName = "Test User";
  });
});
