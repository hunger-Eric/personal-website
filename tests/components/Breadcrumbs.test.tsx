// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

vi.mock("next/link", () => ({
  default: ({ children, href, className }: any) =>
    React.createElement("a", { href, className }, children),
}));

vi.mock("lucide-react", () => ({
  Share2: () => React.createElement("svg", { "data-testid": "share-icon" }),
  Check: () => React.createElement("svg", { "data-testid": "check-icon" }),
}));

vi.mock("@/components/JsonLd", () => ({
  JsonLd: ({ data }: any) => React.createElement("script", { "data-testid": "jsonld", type: "application/ld+json" }),
}));

vi.mock("@/lib/structured-data", () => ({
  generateBreadcrumbSchema: (items: any[]) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }),
}));

describe("Breadcrumbs", () => {
  it("returns null when items is empty", async () => {
    const { Breadcrumbs } = await import("@/components/Breadcrumbs");
    const { container } = render(React.createElement(Breadcrumbs, { items: [] }));
    expect(container.innerHTML).toBe("");
  });

  it("returns null when items is undefined", async () => {
    const { Breadcrumbs } = await import("@/components/Breadcrumbs");
    const { container } = render(React.createElement(Breadcrumbs, { items: undefined as any }));
    expect(container.innerHTML).toBe("");
  });

  it("returns null when items is null", async () => {
    const { Breadcrumbs } = await import("@/components/Breadcrumbs");
    const { container } = render(React.createElement(Breadcrumbs, { items: null as any }));
    expect(container.innerHTML).toBe("");
  });

  it("renders single breadcrumb item as plain text (no link for last)", async () => {
    const { Breadcrumbs } = await import("@/components/Breadcrumbs");
    render(React.createElement(Breadcrumbs, {
      items: [{ name: "Home", url: "/" }],
    }));
    expect(screen.getByText("Home")).toBeInTheDocument();
    // Last item should be a span, not a link
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders multiple breadcrumb items with links", async () => {
    const { Breadcrumbs } = await import("@/components/Breadcrumbs");
    render(React.createElement(Breadcrumbs, {
      items: [
        { name: "Home", url: "/" },
        { name: "Articles", url: "/articles" },
        { name: "My Post", url: "/articles/my-post" },
      ],
    }));
    // First two should be links
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute("href", "/");
    expect(links[1]).toHaveAttribute("href", "/articles");
    // Last should be plain text
    expect(screen.getByText("My Post")).toBeInTheDocument();
  });

  it("renders separators between items", async () => {
    const { Breadcrumbs } = await import("@/components/Breadcrumbs");
    const { container } = render(React.createElement(Breadcrumbs, {
      items: [
        { name: "Home", url: "/" },
        { name: "About", url: "/about" },
      ],
    }));
    const separators = container.querySelectorAll('[aria-hidden="true"]');
    expect(separators.length).toBeGreaterThanOrEqual(1);
    expect(separators[0].textContent).toBe("/");
  });

  it("renders ShareButton by default", async () => {
    const { Breadcrumbs } = await import("@/components/Breadcrumbs");
    render(React.createElement(Breadcrumbs, {
      items: [{ name: "Home", url: "/" }],
    }));
    const shareBtn = screen.getByRole("button");
    expect(shareBtn).toBeInTheDocument();
  });

  it("hides ShareButton when showShare=false", async () => {
    const { Breadcrumbs } = await import("@/components/Breadcrumbs");
    render(React.createElement(Breadcrumbs, {
      items: [{ name: "Home", url: "/" }],
      showShare: false,
    }));
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("passes shareLabel to ShareButton", async () => {
    const { Breadcrumbs } = await import("@/components/Breadcrumbs");
    render(React.createElement(Breadcrumbs, {
      items: [{ name: "Home", url: "/" }],
      shareLabel: "分享",
    }));
    expect(screen.getByText("分享")).toBeInTheDocument();
  });

  it("applies custom className", async () => {
    const { Breadcrumbs } = await import("@/components/Breadcrumbs");
    const { container } = render(React.createElement(Breadcrumbs, {
      items: [{ name: "Home", url: "/" }],
      className: "custom-class",
    }));
    const outerDiv = container.querySelector("div");
    expect(outerDiv?.className).toContain("custom-class");
  });

  it("truncates last item name when truncateLastAt is set", async () => {
    const { Breadcrumbs } = await import("@/components/Breadcrumbs");
    render(React.createElement(Breadcrumbs, {
      items: [
        { name: "Home", url: "/" },
        { name: "A very long article title that should be clipped", url: "/articles/long" },
      ],
      truncateLastAt: 20,
    }));
    const lastItem = screen.getByText(/…$/);
    expect(lastItem).toBeInTheDocument();
    expect(lastItem.textContent!.length).toBeLessThanOrEqual(25);
  });

  it("does not truncate item name when within limit", async () => {
    const { Breadcrumbs } = await import("@/components/Breadcrumbs");
    render(React.createElement(Breadcrumbs, {
      items: [
        { name: "Home", url: "/" },
        { name: "Short", url: "/articles/short" },
      ],
      truncateLastAt: 20,
    }));
    expect(screen.getByText("Short")).toBeInTheDocument();
    expect(screen.queryByText(/…$/)).not.toBeInTheDocument();
  });

  it("renders JsonLd with breadcrumb schema", async () => {
    const { Breadcrumbs } = await import("@/components/Breadcrumbs");
    const { container } = render(React.createElement(Breadcrumbs, {
      items: [{ name: "Home", url: "/" }],
    }));
    expect(container.querySelector('[data-testid="jsonld"]')).toBeInTheDocument();
  });

  it("sets aria-label on nav element", async () => {
    const { Breadcrumbs } = await import("@/components/Breadcrumbs");
    const { container } = render(React.createElement(Breadcrumbs, {
      items: [{ name: "Home", url: "/" }],
    }));
    const nav = container.querySelector("nav");
    expect(nav).toHaveAttribute("aria-label", "Breadcrumb");
  });

  it("last item has title attribute with full name", async () => {
    const { Breadcrumbs } = await import("@/components/Breadcrumbs");
    render(React.createElement(Breadcrumbs, {
      items: [{ name: "Home", url: "/" }],
    }));
    const lastSpan = screen.getByText("Home");
    expect(lastSpan).toHaveAttribute("title", "Home");
  });

  it("truncates at word boundary when space is past 60% of max", async () => {
    const { Breadcrumbs } = await import("@/components/Breadcrumbs");
    render(React.createElement(Breadcrumbs, {
      items: [
        { name: "Home", url: "/" },
        { name: "A B C D E F G H I J ShouldBeClipped", url: "/articles/long" },
      ],
      truncateLastAt: 20,
    }));
    // slice(0,20) = "A B C D E F G H I J " — lastIndexOf space = 17 > 12 (60% of 20)
    // So it should word-boundary truncate to "A B C D E F G H I J" + "…"
    const lastItem = screen.getByText(/…$/);
    expect(lastItem).toBeInTheDocument();
    // The text should be without the word "ShouldBeClipped"
    expect(lastItem.textContent).not.toContain("ShouldBeClipped");
  });
});
