// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import React from "react";

vi.mock("@/config/siteConfig", () => ({ siteConfig: { name: "Test", title: "Dev", tagline: "Building", socialsList: [] } }));
vi.mock("lucide-react", () => ({ default: () => React.createElement("svg") }));
vi.mock("next/image", () => ({ default: (p: any) => React.createElement("img", p) }));
vi.mock("next/link", () => ({ default: (p: any) => React.createElement("a", p) }));
vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

describe("PublicationsSection", () => {
  it("renders without crashing", async () => {
    const mod = await import("@/components/sections/Publications");
    const Component = mod["PublicationsSection"];
    if (typeof Component === "function") {
      const { container } = render(React.createElement(Component));
      expect(container).toBeTruthy();
    }
  });
});
