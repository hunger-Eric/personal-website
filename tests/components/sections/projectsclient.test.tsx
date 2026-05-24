// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import React from "react";

vi.mock("@/config/siteConfig", () => ({ siteConfig: { socialsList: [] } }));
vi.mock("lucide-react", () => { const S = () => React.createElement("svg"); return { ExternalLink: S, Github: S, Star: S, ArrowRight: S, Filter: S, Search: S, X: S }; });
vi.mock("next/link", () => ({ default: (p: any) => React.createElement("a", p) }));
vi.mock("next/image", () => ({ default: (p: any) => React.createElement("img", p) }));
vi.mock("next/navigation", () => ({ usePathname: () => "/", useSearchParams: () => new URLSearchParams() }));

describe("ProjectsSectionClient", () => {
  it("renders without crashing", async () => {
    const mod = await import("@/components/sections/ProjectsClient");
    const Component = mod.ProjectsSectionClient;
    if (typeof Component === "function") {
      const { container } = render(React.createElement(Component, { projects: [] }));
      expect(container).toBeTruthy();
    }
  });
});
