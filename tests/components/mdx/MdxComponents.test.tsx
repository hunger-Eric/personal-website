// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

vi.mock("lucide-react", () => ({
  Info: () => React.createElement("svg", { "data-testid": "info-icon" }),
  AlertTriangle: () => React.createElement("svg", { "data-testid": "alert-icon" }),
  CheckCircle: () => React.createElement("svg", { "data-testid": "check-icon" }),
  XCircle: () => React.createElement("svg", { "data-testid": "x-icon" }),
  Lightbulb: () => React.createElement("svg", { "data-testid": "lightbulb-icon" }),
}));

describe("mdxComponents", () => {
  it("provides MDX component map with all keys", async () => {
    const { mdxComponents } = await import("@/components/mdx/MdxComponents");
    expect(mdxComponents).toBeDefined();
    expect(typeof mdxComponents).toBe("object");
    expect(mdxComponents).toHaveProperty("Callout");
    expect(mdxComponents).toHaveProperty("YouTube");
    expect(mdxComponents).toHaveProperty("Tweet");
    expect(mdxComponents).toHaveProperty("Figure");
    expect(mdxComponents).toHaveProperty("Kbd");
  });
});

describe("Callout", () => {
  it("renders with default info kind", async () => {
    const { Callout } = await import("@/components/mdx/MdxComponents");
    render(React.createElement(Callout, null, "Callout content"));
    expect(screen.getByText("Callout content")).toBeInTheDocument();
  });

  it("renders with title", async () => {
    const { Callout } = await import("@/components/mdx/MdxComponents");
    render(React.createElement(Callout, { title: "Note" }, "Content"));
    expect(screen.getByText("Note")).toBeInTheDocument();
  });

  it("renders with warning kind", async () => {
    const { Callout } = await import("@/components/mdx/MdxComponents");
    const { container } = render(React.createElement(Callout, { kind: "warning" }, "Warning content"));
    expect(screen.getByText("Warning content")).toBeInTheDocument();
    expect(container.querySelector('[data-testid="alert-icon"]')).toBeInTheDocument();
  });

  it("renders with success kind", async () => {
    const { Callout } = await import("@/components/mdx/MdxComponents");
    const { container } = render(React.createElement(Callout, { kind: "success" }, "Success content"));
    expect(container.querySelector('[data-testid="check-icon"]')).toBeInTheDocument();
  });

  it("renders with danger kind", async () => {
    const { Callout } = await import("@/components/mdx/MdxComponents");
    const { container } = render(React.createElement(Callout, { kind: "danger" }, "Danger content"));
    expect(container.querySelector('[data-testid="x-icon"]')).toBeInTheDocument();
  });

  it("renders with tip kind", async () => {
    const { Callout } = await import("@/components/mdx/MdxComponents");
    const { container } = render(React.createElement(Callout, { kind: "tip" }, "Tip content"));
    expect(container.querySelector('[data-testid="lightbulb-icon"]')).toBeInTheDocument();
  });

  it("falls back to info for unknown kind", async () => {
    const { Callout } = await import("@/components/mdx/MdxComponents");
    const { container } = render(React.createElement(Callout, { kind: "unknown" as any }, "Content"));
    expect(container.querySelector('[data-testid="info-icon"]')).toBeInTheDocument();
  });
});

describe("YouTube", () => {
  it("renders iframe with video id", async () => {
    const { YouTube } = await import("@/components/mdx/MdxComponents");
    const { container } = render(React.createElement(YouTube, { id: "dQw4w9WgXcQ" }));
    const iframe = container.querySelector("iframe");
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute("src", "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
  });

  it("renders iframe with custom title", async () => {
    const { YouTube } = await import("@/components/mdx/MdxComponents");
    render(React.createElement(YouTube, { id: "test123", title: "My Video" }));
    const iframe = screen.getByTitle("My Video");
    expect(iframe).toBeInTheDocument();
  });

  it("extracts id from full youtube URL", async () => {
    const { YouTube } = await import("@/components/mdx/MdxComponents");
    const { container } = render(React.createElement(YouTube, {
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    }));
    const iframe = container.querySelector("iframe");
    expect(iframe).toHaveAttribute("src", expect.stringContaining("dQw4w9WgXcQ"));
  });

  it("extracts id from youtu.be URL", async () => {
    const { YouTube } = await import("@/components/mdx/MdxComponents");
    const { container } = render(React.createElement(YouTube, {
      url: "https://youtu.be/dQw4w9WgXcQ",
    }));
    const iframe = container.querySelector("iframe");
    expect(iframe).toHaveAttribute("src", expect.stringContaining("dQw4w9WgXcQ"));
  });

  it("extracts id from embed URL", async () => {
    const { YouTube } = await import("@/components/mdx/MdxComponents");
    const { container } = render(React.createElement(YouTube, {
      url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    }));
    const iframe = container.querySelector("iframe");
    expect(iframe).toHaveAttribute("src", expect.stringContaining("dQw4w9WgXcQ"));
  });

  it("returns null when no id or url provided", async () => {
    const { YouTube } = await import("@/components/mdx/MdxComponents");
    const { container } = render(React.createElement(YouTube, {}));
    expect(container.innerHTML).toBe("");
  });

  it("returns null for invalid URL", async () => {
    const { YouTube } = await import("@/components/mdx/MdxComponents");
    const { container } = render(React.createElement(YouTube, { url: "not-a-url" }));
    expect(container.innerHTML).toBe("");
  });
});

describe("Tweet", () => {
  it("renders blockquote with link", async () => {
    const { Tweet } = await import("@/components/mdx/MdxComponents");
    render(React.createElement(Tweet, { url: "https://x.com/user/status/123" }));
    const link = screen.getByText("View on X / Twitter →");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "https://x.com/user/status/123");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("renders children inside blockquote", async () => {
    const { Tweet } = await import("@/components/mdx/MdxComponents");
    render(React.createElement(Tweet, { url: "https://x.com/user/status/123" },
      React.createElement("span", null, "Tweet content")
    ));
    expect(screen.getByText("Tweet content")).toBeInTheDocument();
  });

  it("returns null when url is empty", async () => {
    const { Tweet } = await import("@/components/mdx/MdxComponents");
    const { container } = render(React.createElement(Tweet, { url: "" }));
    expect(container.innerHTML).toBe("");
  });
});

describe("Figure", () => {
  it("renders img with src", async () => {
    const { Figure } = await import("@/components/mdx/MdxComponents");
    const { container } = render(React.createElement(Figure, { src: "/images/test.png", alt: "Test image" }));
    const img = container.querySelector("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/images/test.png");
    expect(img).toHaveAttribute("alt", "Test image");
  });

  it("renders caption when provided", async () => {
    const { Figure } = await import("@/components/mdx/MdxComponents");
    render(React.createElement(Figure, { src: "/images/test.png", caption: "A caption" }));
    expect(screen.getByText("A caption")).toBeInTheDocument();
  });

  it("uses caption as alt when alt is not provided", async () => {
    const { Figure } = await import("@/components/mdx/MdxComponents");
    const { container } = render(React.createElement(Figure, { src: "/images/test.png", caption: "Caption as alt" }));
    const img = container.querySelector("img");
    expect(img).toHaveAttribute("alt", "Caption as alt");
  });

  it("uses empty string as alt when neither alt nor caption provided", async () => {
    const { Figure } = await import("@/components/mdx/MdxComponents");
    const { container } = render(React.createElement(Figure, { src: "/images/test.png" }));
    const img = container.querySelector("img");
    expect(img).toHaveAttribute("alt", "");
  });

  it("returns null when src is empty", async () => {
    const { Figure } = await import("@/components/mdx/MdxComponents");
    const { container } = render(React.createElement(Figure, { src: "" }));
    expect(container.innerHTML).toBe("");
  });

  it("applies width and height when provided", async () => {
    const { Figure } = await import("@/components/mdx/MdxComponents");
    const { container } = render(React.createElement(Figure, { src: "/images/test.png", width: 800, height: 600 }));
    const img = container.querySelector("img");
    expect(img).toHaveAttribute("width", "800");
    expect(img).toHaveAttribute("height", "600");
  });
});

describe("Kbd", () => {
  it("renders kbd element", async () => {
    const { Kbd } = await import("@/components/mdx/MdxComponents");
    const { container } = render(React.createElement(Kbd, null, "Ctrl"));
    const kbd = container.querySelector("kbd");
    expect(kbd).toBeInTheDocument();
    expect(kbd?.textContent).toBe("Ctrl");
  });

  it("renders complex key combinations", async () => {
    const { Kbd } = await import("@/components/mdx/MdxComponents");
    render(React.createElement(Kbd, null,
      React.createElement("span", null, "Ctrl"),
      " + ",
      React.createElement("span", null, "K")
    ));
    expect(screen.getByText("Ctrl")).toBeInTheDocument();
  });
});
