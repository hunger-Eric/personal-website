// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

vi.mock("lucide-react", () => ({
  Github: () => React.createElement("svg", { "data-testid": "icon-github" }),
  Linkedin: () => React.createElement("svg", { "data-testid": "icon-linkedin" }),
  Instagram: () => React.createElement("svg", { "data-testid": "icon-instagram" }),
  Youtube: () => React.createElement("svg", { "data-testid": "icon-youtube" }),
  Music2: () => React.createElement("svg", { "data-testid": "icon-music2" }),
}));

let mockSocialsList: any[] = [];
let mockName = "Test Footer";

vi.mock("@/config/siteConfig", () => ({
  siteConfig: {
    get name() { return mockName; },
    get socialsList() { return mockSocialsList; },
  },
}));

describe("Footer", () => {
  beforeEach(() => {
    mockName = "Test Footer";
    mockSocialsList = [
      { key: "github", href: "https://github.com", label: "GitHub" },
      { key: "linkedin", href: "https://linkedin.com", label: "LinkedIn" },
      { key: "tiktok", href: "https://tiktok.com" },
      { key: "youtube", href: "https://youtube.com" },
      { key: "instagram", href: "https://instagram.com" },
    ];
  });

  it("renders copyright with current year and name", async () => {
    const { Footer } = await import("@/components/Footer");
    render(React.createElement(Footer));
    const year = new Date().getFullYear();
    expect(screen.getByText(`© ${year} Test Footer`)).toBeInTheDocument();
  });

  it("renders social icons when socialsList has items", async () => {
    const { Footer } = await import("@/components/Footer");
    const { container } = render(React.createElement(Footer));
    expect(container.querySelector('[data-testid="icon-github"]')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="icon-linkedin"]')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="icon-music2"]')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="icon-youtube"]')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="icon-instagram"]')).toBeInTheDocument();
  });

  it("does not render socials when socialsList is empty", async () => {
    mockSocialsList = [];
    const { Footer } = await import("@/components/Footer");
    const { container } = render(React.createElement(Footer));
    expect(container.querySelector('[data-testid="icon-github"]')).not.toBeInTheDocument();
  });

  it("filters out items without href", async () => {
    mockSocialsList = [
      { key: "github", href: "https://github.com" },
      { key: "linkedin" },
    ];
    const { Footer } = await import("@/components/Footer");
    const { container } = render(React.createElement(Footer));
    expect(container.querySelector('[data-testid="icon-github"]')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="icon-linkedin"]')).not.toBeInTheDocument();
  });

  it("renders with correct aria-labels", async () => {
    const { Footer } = await import("@/components/Footer");
    render(React.createElement(Footer));
    expect(screen.getByLabelText("GitHub")).toBeInTheDocument();
    expect(screen.getByLabelText("LinkedIn")).toBeInTheDocument();
  });

  it("uses key as label when label is missing", async () => {
    const { Footer } = await import("@/components/Footer");
    render(React.createElement(Footer));
    expect(screen.getByLabelText("tiktok")).toBeInTheDocument();
  });

  it("uses default name when name is empty", async () => {
    mockName = "";
    const { Footer } = await import("@/components/Footer");
    render(React.createElement(Footer));
    const year = new Date().getFullYear();
    expect(screen.getByText(`© ${year} fengc`)).toBeInTheDocument();
  });

  it("renders icons in SOCIAL_ORDER", async () => {
    const { Footer } = await import("@/components/Footer");
    const { container } = render(React.createElement(Footer));

    const anchors = container.querySelectorAll("a");
    const order = ["github", "linkedin", "tiktok", "youtube", "instagram"];
    expect(anchors.length).toBe(5);
    anchors.forEach((a, i) => {
      expect(a.getAttribute("title")).toBe(order[i] === "tiktok" ? "tiktok" : a.getAttribute("title"));
    });
  });
});
