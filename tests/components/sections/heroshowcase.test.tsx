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
  FileText: () => React.createElement("svg"),
  Mail: () => React.createElement("svg"),
  ArrowUpRight: () => React.createElement("svg"),
  Coffee: () => React.createElement("svg"),
  GraduationCap: () => React.createElement("svg"),
  AtSign: () => React.createElement("svg"),
  MoreHorizontal: () => React.createElement("svg"),
}));

vi.mock("@/components/Typewriter", () => ({
  Typewriter: (props: any) =>
    React.createElement("span", { "data-testid": "typewriter", "data-text": props.text }, props.text),
}));

vi.mock("@/components/ContributionGraphCard", () => ({
  ContributionGraphCard: () =>
    React.createElement("div", { "data-testid": "contribution-graph" }, "Graph"),
}));

// Mutable state for siteConfig
const mockConfigState = vi.hoisted(() => ({
  socials: {} as Record<string, string>,
  socialsList: [] as any[],
  name: "",
}));

vi.mock("@/config/siteConfig", () => ({
  siteConfig: {
    get name() { return mockConfigState.name; },
    get socials() { return mockConfigState.socials; },
    get socialsList() { return mockConfigState.socialsList; },
  },
}));

// ── Tests ──────────────────────────────────────────────────────────────────

describe("HeroShowcaseSection", () => {
  it("renders the typewriter heading with siteConfig name", async () => {
    mockConfigState.name = "Kevin";
    mockConfigState.socials = { github: "https://github.com/test" };
    mockConfigState.socialsList = [{ key: "email", href: "mailto:test@example.com" }];
    const { HeroShowcaseSection } = await import("@/components/sections/HeroShowcaseSection");
    const { container } = render(React.createElement(HeroShowcaseSection));
    const tw = container.querySelector('[data-testid="typewriter"]');
    expect(tw).toBeTruthy();
    expect(tw?.getAttribute("data-text")).toContain("Kevin");
  });

  it("renders social links for configured platforms", async () => {
    mockConfigState.name = "Kevin";
    mockConfigState.socials = {
      github: "https://github.com/KevinTrinhDev",
      linkedin: "https://linkedin.com/in/KevinTrinhDev",
      tiktok: "https://tiktok.com/@KevinTrinhDev",
      youtube: "https://youtube.com/@KevinTrinhDev",
      instagram: "https://instagram.com/KevinTrinhDev",
    };
    mockConfigState.socialsList = [{ key: "email", href: "mailto:test@example.com" }];
    const { HeroShowcaseSection } = await import("@/components/sections/HeroShowcaseSection");
    const { container } = render(React.createElement(HeroShowcaseSection));
    const links = container.querySelectorAll('a[target="_blank"]');
    const hrefs = Array.from(links).map((a) => a.getAttribute("href"));
    expect(hrefs).toContain("https://github.com/KevinTrinhDev");
    expect(hrefs).toContain("https://linkedin.com/in/KevinTrinhDev");
    expect(hrefs).toContain("https://youtube.com/@KevinTrinhDev");
  });

  it("skips social links with href='#' (unconfigured)", async () => {
    mockConfigState.name = "Kevin";
    mockConfigState.socials = { github: "#", linkedin: "#" };
    mockConfigState.socialsList = [];
    const { HeroShowcaseSection } = await import("@/components/sections/HeroShowcaseSection");
    const { container } = render(React.createElement(HeroShowcaseSection));
    const links = container.querySelectorAll('a[target="_blank"]');
    expect(links.length).toBe(0);
  });

  it("renders the 'More' mobile link", async () => {
    mockConfigState.name = "Kevin";
    mockConfigState.socials = { github: "https://github.com/test" };
    mockConfigState.socialsList = [{ key: "email", href: "mailto:test@example.com" }];
    const { HeroShowcaseSection } = await import("@/components/sections/HeroShowcaseSection");
    const { container } = render(React.createElement(HeroShowcaseSection));
    const moreLink = container.querySelector('a[href="/links"]');
    expect(moreLink).toBeTruthy();
    expect(moreLink?.getAttribute("aria-label")).toBe("See all my links");
  });

  it("renders the CTA contact button", async () => {
    mockConfigState.name = "Kevin";
    mockConfigState.socials = { github: "https://github.com/test" };
    mockConfigState.socialsList = [{ key: "email", href: "mailto:test@example.com" }];
    const { HeroShowcaseSection } = await import("@/components/sections/HeroShowcaseSection");
    const { container } = render(React.createElement(HeroShowcaseSection));
    const cta = container.querySelector('a[href="mailto:test@example.com"]');
    expect(cta).toBeTruthy();
    expect(cta?.textContent).toContain("联系我");
  });

  it("uses # fallback when email is not in socialsList", async () => {
    mockConfigState.name = "Kevin";
    mockConfigState.socials = { github: "https://github.com/test" };
    mockConfigState.socialsList = [];
    const { HeroShowcaseSection } = await import("@/components/sections/HeroShowcaseSection");
    const { container } = render(React.createElement(HeroShowcaseSection));
    const cta = container.querySelector('a[href="#"]');
    expect(cta).toBeTruthy();
  });

  it("renders mobile avatar image", async () => {
    mockConfigState.name = "Kevin";
    mockConfigState.socials = { github: "https://github.com/test" };
    mockConfigState.socialsList = [{ key: "email", href: "mailto:test@example.com" }];
    const { HeroShowcaseSection } = await import("@/components/sections/HeroShowcaseSection");
    const { container } = render(React.createElement(HeroShowcaseSection));
    const avatar = Array.from(container.querySelectorAll("img")).find(
      (img) => img.getAttribute("src") === "/avatar.jpg"
    );
    expect(avatar).toBeTruthy();
    expect(avatar?.getAttribute("alt")).toBe("Kevin");
  });

  it("renders the contribution graph", async () => {
    mockConfigState.name = "Kevin";
    mockConfigState.socials = { github: "https://github.com/test" };
    mockConfigState.socialsList = [{ key: "email", href: "mailto:test@example.com" }];
    const { HeroShowcaseSection } = await import("@/components/sections/HeroShowcaseSection");
    const { container } = render(React.createElement(HeroShowcaseSection));
    expect(container.querySelector('[data-testid="contribution-graph"]')).toBeTruthy();
  });

  it("renders description paragraph", async () => {
    mockConfigState.name = "Kevin";
    mockConfigState.socials = { github: "https://github.com/test" };
    mockConfigState.socialsList = [{ key: "email", href: "mailto:test@example.com" }];
    const { HeroShowcaseSection } = await import("@/components/sections/HeroShowcaseSection");
    render(React.createElement(HeroShowcaseSection));
    expect(screen.getByText(/全栈程序猿/)).toBeTruthy();
  });

  it("handles null socials gracefully", async () => {
    mockConfigState.name = "Kevin";
    mockConfigState.socials = {} as any;
    mockConfigState.socialsList = [];
    const { HeroShowcaseSection } = await import("@/components/sections/HeroShowcaseSection");
    const { container } = render(React.createElement(HeroShowcaseSection));
    expect(container.querySelector("h1")).toBeTruthy();
  });

  it("renders all configured social items", async () => {
    mockConfigState.name = "Kevin";
    mockConfigState.socials = { github: "https://github.com/test", linkedin: "https://linkedin.com/in/test" };
    mockConfigState.socialsList = [{ key: "email", href: "mailto:test@example.com" }];
    const { HeroShowcaseSection } = await import("@/components/sections/HeroShowcaseSection");
    const { container } = render(React.createElement(HeroShowcaseSection));
    // github and linkedin should appear
    expect(container.querySelector('a[href="https://github.com/test"]')).toBeTruthy();
    expect(container.querySelector('a[href="https://linkedin.com/in/test"]')).toBeTruthy();
  });

  it("handles email social type correctly", async () => {
    mockConfigState.name = "Kevin";
    mockConfigState.socials = { email: "mailto:hello@test.com" };
    mockConfigState.socialsList = [{ key: "email", href: "mailto:hello@test.com" }];
    const { HeroShowcaseSection } = await import("@/components/sections/HeroShowcaseSection");
    const { container } = render(React.createElement(HeroShowcaseSection));
    // Although email isn't in the SOCIALS array, the CTA button should use it
    const cta = container.querySelector('a[href="mailto:hello@test.com"]');
    expect(cta).toBeTruthy();
  });
});
