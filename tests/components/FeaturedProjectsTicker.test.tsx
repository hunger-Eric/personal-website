// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

vi.mock("lucide-react", () => ({ Star: () => <svg />, ExternalLink: () => <svg /> }));

describe("FeaturedProjectsTicker", () => {
  it("renders nothing when no projects", async () => {
    const { FeaturedProjectsTicker } = await import("@/components/projects/FeaturedProjectsTicker");
    const { container } = render(React.createElement(FeaturedProjectsTicker, { projects: [] }));
    expect(container.innerHTML).toBe("");
  });
});
