// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import React from "react";

// Mock siteConfig via the exact path Footer.tsx uses
vi.mock("@/config/siteConfig", () => ({
  siteConfig: {
    name: "Test User",
    socialsList: [
      { key: "github", label: "GitHub", href: "https://github.com/user" },
      { key: "youtube", label: "YouTube", href: "https://youtube.com/@user" },
    ],
  },
}));

vi.mock("lucide-react", () => {
  const Icon = (props: any) => React.createElement("svg", { ...props, "data-testid": "icon" });
  return { Github: Icon, Linkedin: Icon, Youtube: Icon, Music2: Icon, Instagram: Icon };
});

describe("Footer", () => {
  it("renders footer element", async () => {
    const { Footer } = await import("@/components/Footer");
    const { container } = render(React.createElement(Footer));
    const footer = container.querySelector("footer");
    expect(footer).toBeInTheDocument();
  });

  it("renders copyright with year and name", async () => {
    const { Footer } = await import("@/components/Footer");
    const { container } = render(React.createElement(Footer));
    const year = new Date().getFullYear();
    expect(container.textContent).toContain(`© ${year} Test User`);
  });
});
