// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import React from "react";

vi.mock("lucide-react", () => ({
  Share2: () => React.createElement("svg"),
  Linkedin: () => React.createElement("svg"),
  Mail: () => React.createElement("svg"),
  Link: () => React.createElement("svg"),
  Check: () => React.createElement("svg"),
  MessageCircle: () => React.createElement("svg"),
}));

describe("ShareLinks", () => {
  it("renders share buttons", async () => {
    const { ShareLinks } = await import("@/components/articles/ShareLinks");
    const { container } = render(React.createElement(ShareLinks, { url: "https://example.com/article", title: "Test Article" }));
    expect(container).toBeTruthy();
  });
});
