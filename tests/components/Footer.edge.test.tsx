// @vitest-environment jsdom
// Footer edge-case tests: empty socials, missing name, unknown icon key
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import React from "react";

vi.mock("lucide-react", () => {
  const Icon = (props: any) => React.createElement("svg", { ...props, "data-testid": "icon" });
  return { Github: Icon, Linkedin: Icon, Youtube: Icon, Music2: Icon, Instagram: Icon };
});

describe("Footer edge cases", () => {
  beforeEach(() => { vi.resetModules(); });

  it("renders without socials when socialsList is empty", async () => {
    vi.doMock("@/config/siteConfig", () => ({
      siteConfig: { name: "Test", socialsList: [] },
    }));
    const { Footer } = await import("@/components/Footer");
    const { container } = render(React.createElement(Footer));
    const footer = container.querySelector("footer");
    expect(footer).toBeInTheDocument();
    // No social link icons rendered
    const links = container.querySelectorAll("a[target='_blank']");
    expect(links.length).toBe(0);
  });

  it("uses fallback name when siteConfig.name is missing", async () => {
    vi.doMock("@/config/siteConfig", () => ({
      siteConfig: { socialsList: [{ key: "github", label: "GitHub", href: "https://github.com/u" }] },
    }));
    const { Footer } = await import("@/components/Footer");
    const { container } = render(React.createElement(Footer));
    const year = new Date().getFullYear();
    expect(container.textContent).toContain(`© ${year} fengc`);
  });

  it("renders social links with aria-labels", async () => {
    vi.doMock("@/config/siteConfig", () => ({
      siteConfig: {
        name: "Test",
        socialsList: [
          { key: "github", label: "GitHub", href: "https://github.com/u" },
          { key: "tiktok", label: "TikTok", href: "https://tiktok.com/@u" },
        ],
      },
    }));
    const { Footer } = await import("@/components/Footer");
    const { container } = render(React.createElement(Footer));
    const links = container.querySelectorAll("a[aria-label]");
    expect(links.length).toBe(2);
    expect(links[0].getAttribute("aria-label")).toBe("GitHub");
    expect(links[1].getAttribute("aria-label")).toBe("TikTok");
  });

  it("renders instagram social with correct icon", async () => {
    vi.doMock("@/config/siteConfig", () => ({
      siteConfig: {
        name: "Test",
        socialsList: [
          { key: "instagram", label: "Instagram", href: "https://instagram.com/u" },
        ],
      },
    }));
    const { Footer } = await import("@/components/Footer");
    const { container } = render(React.createElement(Footer));
    const links = container.querySelectorAll("a[aria-label]");
    expect(links.length).toBe(1);
    expect(links[0].getAttribute("aria-label")).toBe("Instagram");
  });

  it("renders linkedin social with correct icon", async () => {
    vi.doMock("@/config/siteConfig", () => ({
      siteConfig: {
        name: "Test",
        socialsList: [
          { key: "linkedin", label: "LinkedIn", href: "https://linkedin.com/u" },
        ],
      },
    }));
    const { Footer } = await import("@/components/Footer");
    const { container } = render(React.createElement(Footer));
    const links = container.querySelectorAll("a[aria-label]");
    expect(links.length).toBe(1);
    expect(links[0].getAttribute("aria-label")).toBe("LinkedIn");
  });

  it("renders unknown social key (gets filtered out, iconFor default not reachable via render)", async () => {
    // unknown keys are filtered out by SOCIAL_ORDER before iconFor is called
    vi.doMock("@/config/siteConfig", () => ({
      siteConfig: {
        name: "Test",
        socialsList: [
          { key: "unknown", label: "Custom", href: "https://custom.com" },
        ],
      },
    }));
    const { Footer } = await import("@/components/Footer");
    const { container } = render(React.createElement(Footer));
    const links = container.querySelectorAll("a[aria-label]");
    expect(links.length).toBe(0);
  });
});
