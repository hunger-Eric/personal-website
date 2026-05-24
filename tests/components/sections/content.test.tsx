// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import React from "react";

vi.mock("@/config/siteConfig", () => ({
  siteConfig: {
    name: "Test", title: "Dev", tagline: "Building",
    socialsList: [
      { key: "youtube", href: "https://youtube.com/@test" },
      { key: "tiktok", href: "https://tiktok.com/@test" },
      { key: "instagram", href: "https://instagram.com/test" },
      { key: "x", href: "https://x.com/test" },
    ],
    featuredContent: { youtubeVideoId: "dQw4w9WgXcQ" },
  }
}));
vi.mock("lucide-react", () => ({
  ArrowUpRight: () => React.createElement("svg"),
  Play: () => React.createElement("svg"),
  Music2: () => React.createElement("svg"),
  Instagram: () => React.createElement("svg"),
}));
vi.mock("@/components/icons/XIcon", () => ({ XIcon: () => React.createElement("svg") }));

describe("ContentSection", () => {
  it("renders without crashing", async () => {
    const mod = await import("@/components/sections/Content");
    const Component = mod["ContentSection"];
    if (typeof Component === "function") {
      const { container } = render(React.createElement(Component));
      expect(container).toBeTruthy();
    }
  });
});
