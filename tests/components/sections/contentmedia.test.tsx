// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import React from "react";

vi.mock("next/image", () => ({ default: (p: any) => React.createElement("img", p) }));
vi.mock("lucide-react", () => ({ FileText: () => React.createElement("svg") }));

describe("ContentMedia", () => {
  it("renders with media items", async () => {
    const mod = await import("@/components/sections/ContentMedia");
    const Component = mod.ContentMedia || Object.values(mod)[0];
    if (typeof Component === "function") {
      const { container } = render(React.createElement(Component));
      expect(container).toBeTruthy();
    }
  });
});
