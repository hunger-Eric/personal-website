// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

vi.mock("next/image", () => ({
  default: (p: any) => React.createElement("img", p),
}));

vi.mock("next/link", () => ({
  default: (p: any) => React.createElement("a", p),
}));

vi.mock("lucide-react", () => ({
  FileText: () => React.createElement("svg", { "data-testid": "icon-filetext" }),
  BookOpenText: () => React.createElement("svg", { "data-testid": "icon-book" }),
  ArrowUpRight: () => React.createElement("svg", { "data-testid": "icon-arrow" }),
  ScrollText: () => React.createElement("svg", { "data-testid": "icon-scroll" }),
}));

const pubData = vi.hoisted(() => [] as any[]);

vi.mock("@/config/publications.json", () => ({ default: pubData }));

const PUB_FULL = {
  id: "pub1",
  title: "A Novel Approach to AI",
  venue: "IEEE Conference on AI",
  volume: "Vol. 42",
  publisher: "IEEE",
  year: "2024",
  type: "Conference Paper",
  summary: "This paper presents a novel approach to artificial intelligence...",
  image: "/images/paper.png",
  links: [
    { label: "PDF", subtitle: "2.4 MB", href: "/papers/paper.pdf", type: "pdf" },
    { label: "Publisher", subtitle: "IEEE Xplore", href: "https://ieeexplore.ieee.org", type: "publication" },
    { label: "Abstract", subtitle: "Read online", href: "/abstract", type: "abstract" },
  ],
};

const PUB_NO_IMAGE = {
  id: "pub2",
  title: "Simple Study",
  venue: "Journal of Simple Things",
  summary: "A simple study.",
  links: [{ label: "Open", href: "https://example.com", type: "other" }],
};

const PUB_NO_LINKS = {
  id: "pub3",
  title: "No Links Paper",
  venue: "Conference 2023",
  summary: "Paper without links.",
  year: "2023",
  type: "Workshop",
};

const PUB_MINIMAL = {
  id: "pub4",
  title: "Minimal Paper",
  venue: "Local Journal",
  summary: "Just a basic paper.",
};

describe("PublicationsSection", () => {
  beforeEach(() => {
    pubData.length = 0;
  });

  it("renders nothing when publications array is empty", async () => {
    const { PublicationsSection } = await import("@/components/sections/Publications");
    const { container } = render(React.createElement(PublicationsSection));
    expect(container.innerHTML).toBe("");
  });

  it("renders section heading and subtitle", async () => {
    pubData.push(PUB_FULL);
    const { PublicationsSection } = await import("@/components/sections/Publications");
    render(React.createElement(PublicationsSection));
    expect(screen.getByText("~/Publications")).toBeTruthy();
    expect(screen.getByText("Peer-reviewed research.")).toBeTruthy();
  });

  it("renders featured publication title and venue", async () => {
    pubData.push(PUB_FULL);
    const { PublicationsSection } = await import("@/components/sections/Publications");
    render(React.createElement(PublicationsSection));
    expect(screen.getByText("A Novel Approach to AI")).toBeTruthy();
    expect(screen.getByText(/IEEE Conference on AI/)).toBeTruthy();
  });

  it("renders volume and publisher when present", async () => {
    pubData.push(PUB_FULL);
    const { PublicationsSection } = await import("@/components/sections/Publications");
    render(React.createElement(PublicationsSection));
    expect(screen.getByText(/Vol\. 42/)).toBeTruthy();
    expect(screen.getByText(/- IEEE$/)).toBeTruthy();
  });

  it("renders publication type badge and year", async () => {
    pubData.push(PUB_FULL);
    const { PublicationsSection } = await import("@/components/sections/Publications");
    render(React.createElement(PublicationsSection));
    expect(screen.getByText("Conference Paper")).toBeTruthy();
    expect(screen.getByText("2024")).toBeTruthy();
  });

  it("renders publication image with correct alt", async () => {
    pubData.push(PUB_FULL);
    const { PublicationsSection } = await import("@/components/sections/Publications");
    const { container } = render(React.createElement(PublicationsSection));
    const img = container.querySelector("img");
    expect(img).toBeTruthy();
    expect(img?.getAttribute("alt")).toBe("A Novel Approach to AI");
    expect(img?.getAttribute("src")).toBe("/images/paper.png");
  });

  it("does not render image when image field is absent", async () => {
    pubData.push(PUB_NO_IMAGE);
    const { PublicationsSection } = await import("@/components/sections/Publications");
    const { container } = render(React.createElement(PublicationsSection));
    expect(container.querySelector("img")).toBeFalsy();
  });

  it("renders link buttons for each link", async () => {
    pubData.push(PUB_FULL);
    const { PublicationsSection } = await import("@/components/sections/Publications");
    render(React.createElement(PublicationsSection));
    expect(screen.getByText("PDF")).toBeTruthy();
    expect(screen.getByText("Publisher")).toBeTruthy();
    expect(screen.getByText("Abstract")).toBeTruthy();
  });

  it("renders link subtitles", async () => {
    pubData.push(PUB_FULL);
    const { PublicationsSection } = await import("@/components/sections/Publications");
    render(React.createElement(PublicationsSection));
    expect(screen.getByText(/2\.4 MB/)).toBeTruthy();
    expect(screen.getByText(/IEEE Xplore/)).toBeTruthy();
    expect(screen.getByText(/Read online/)).toBeTruthy();
  });

  it("primaryHref falls back to first link when no publication type", async () => {
    pubData.push(PUB_NO_IMAGE);
    const { PublicationsSection } = await import("@/components/sections/Publications");
    const { container } = render(React.createElement(PublicationsSection));
    const titleLink = container.querySelector('a[href="https://example.com"]');
    expect(titleLink).toBeTruthy();
  });

  it("primaryHref falls back to '#' when no links exist", async () => {
    pubData.push(PUB_NO_LINKS);
    const { PublicationsSection } = await import("@/components/sections/Publications");
    const { container } = render(React.createElement(PublicationsSection));
    const titleLinks = container.querySelectorAll('a[href="#"]');
    expect(titleLinks.length).toBeGreaterThanOrEqual(1);
  });

  it("does not render type badge when type is absent", async () => {
    pubData.push(PUB_MINIMAL);
    const { PublicationsSection } = await import("@/components/sections/Publications");
    render(React.createElement(PublicationsSection));
    expect(screen.queryByText("Conference Paper")).toBeFalsy();
  });

  it("does not render links section when links are missing", async () => {
    pubData.push(PUB_NO_LINKS);
    const { PublicationsSection } = await import("@/components/sections/Publications");
    render(React.createElement(PublicationsSection));
    expect(screen.queryByText("PDF")).toBeFalsy();
  });

  it("renders correct icons for each link type", async () => {
    pubData.push(PUB_FULL);
    const { PublicationsSection } = await import("@/components/sections/Publications");
    const { container } = render(React.createElement(PublicationsSection));
    expect(container.querySelectorAll('[data-testid="icon-filetext"]').length).toBeGreaterThanOrEqual(1);
    expect(container.querySelectorAll('[data-testid="icon-book"]').length).toBeGreaterThanOrEqual(1);
    expect(container.querySelectorAll('[data-testid="icon-scroll"]').length).toBeGreaterThanOrEqual(1);
  });

  it("uses ArrowUpRight for unknown link types", async () => {
    pubData.push(PUB_NO_IMAGE);
    const { PublicationsSection } = await import("@/components/sections/Publications");
    const { container } = render(React.createElement(PublicationsSection));
    expect(container.querySelectorAll('[data-testid="icon-arrow"]').length).toBeGreaterThanOrEqual(1);
  });

  it("renders summary text", async () => {
    pubData.push(PUB_FULL);
    const { PublicationsSection } = await import("@/components/sections/Publications");
    render(React.createElement(PublicationsSection));
    expect(screen.getByText(/This paper presents/)).toBeTruthy();
  });

  it("image anchor uses primaryHref", async () => {
    pubData.push(PUB_FULL);
    const { PublicationsSection } = await import("@/components/sections/Publications");
    const { container } = render(React.createElement(PublicationsSection));
    const imageAnchors = container.querySelectorAll('a[href="/papers/paper.pdf"]');
    expect(imageAnchors.length).toBeGreaterThanOrEqual(1);
  });
});
