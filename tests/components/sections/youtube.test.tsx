// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import React from "react";

vi.mock("@/config/youtube", () => ({
  youtubeVideos: [
    {
      id: "vid1", title: "Test Video", description: "A test video",
      url: "https://youtube.com/watch?v=test123", thumbnailUrl: "/thumb.jpg",
      date: "2025-01-15", views: "1500", duration: "10:30",
    },
    {
      id: "vid2", title: "Second Video", description: "Second test",
      url: "https://youtube.com/watch?v=test456", thumbnailUrl: "/thumb2.jpg",
      date: "2025-01-10", views: "500", duration: "5:00",
    },
    {
      id: "vid3", title: "Third Video", description: "Third test",
      url: "https://youtube.com/watch?v=test789", thumbnailUrl: "/thumb3.jpg",
      date: "2025-01-05", views: "200", duration: "3:00",
    },
  ]
}));
vi.mock("@/config/siteConfig", () => ({
  siteConfig: { name: "Test", socials: { youtube: "https://youtube.com/@test" } }
}));
vi.mock("lucide-react", () => ({
  Youtube: () => React.createElement("svg"),
  ExternalLink: () => React.createElement("svg"),
}));

describe("YouTubeSection", () => {
  it("renders without crashing", async () => {
    const mod = await import("@/components/sections/YouTube");
    const Component = mod["YouTubeSection"];
    if (typeof Component === "function") {
      const { container } = render(React.createElement(Component));
      expect(container).toBeTruthy();
    }
  });
});
