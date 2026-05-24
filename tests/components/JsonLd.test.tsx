// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import React from "react";

describe("JsonLd", () => {
  it("renders a script tag with type application/ld+json", async () => {
    const { JsonLd } = await import("@/components/JsonLd");
    const { container } = render(
      React.createElement(JsonLd, {
        data: { "@context": "https://schema.org", "@type": "Person", name: "Test" },
      })
    );
    const script = container.querySelector("script");
    expect(script).toBeInTheDocument();
    expect(script).toHaveAttribute("type", "application/ld+json");
  });

  it("renders single data object as direct JSON-LD", async () => {
    const { JsonLd } = await import("@/components/JsonLd");
    const { container } = render(
      React.createElement(JsonLd, {
        data: { "@context": "https://schema.org", "@type": "WebSite", name: "My Site" },
      })
    );
    const script = container.querySelector("script");
    expect(script).toBeInTheDocument();
    const parsed = JSON.parse(script?.innerHTML || "{}");
    expect(parsed["@type"]).toBe("WebSite");
    expect(parsed.name).toBe("My Site");
  });

  it("renders array data wrapped in @graph", async () => {
    const { JsonLd } = await import("@/components/JsonLd");
    const { container } = render(
      React.createElement(JsonLd, {
        data: [
          { "@context": "https://schema.org", "@type": "Person", name: "Alice" },
          { "@context": "https://schema.org", "@type": "WebSite", name: "Blog" },
        ],
      })
    );
    const script = container.querySelector("script");
    expect(script).toBeInTheDocument();
    const parsed = JSON.parse(script?.innerHTML || "{}");
    expect(parsed["@graph"]).toBeDefined();
    expect(Array.isArray(parsed["@graph"])).toBe(true);
    expect(parsed["@graph"]).toHaveLength(2);
    expect(parsed["@graph"][0]["@type"]).toBe("Person");
    expect(parsed["@graph"][1]["@type"]).toBe("WebSite");
  });

  it("strips @context from individual items when using @graph", async () => {
    const { JsonLd } = await import("@/components/JsonLd");
    const { container } = render(
      React.createElement(JsonLd, {
        data: [
          { "@context": "https://schema.org", "@type": "Person", name: "Alice" },
        ],
      })
    );
    const script = container.querySelector("script");
    const parsed = JSON.parse(script?.innerHTML || "{}");
    expect(parsed["@context"]).toBe("https://schema.org");
    // Individual @context should be stripped
    expect(parsed["@graph"][0]["@context"]).toBeUndefined();
  });

  it("handles empty data gracefully", async () => {
    const { JsonLd } = await import("@/components/JsonLd");
    const { container } = render(
      React.createElement(JsonLd, { data: {} })
    );
    const script = container.querySelector("script");
    expect(script).toBeInTheDocument();
    const parsed = JSON.parse(script?.innerHTML || "{}");
    expect(parsed).toEqual({});
  });

  it("default export is same as named export", async () => {
    const mod = await import("@/components/JsonLd");
    expect(mod.default).toBe(mod.JsonLd);
  });
});
