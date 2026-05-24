// @vitest-environment node
// Tests for lib/structured-data.ts — all branches
import { describe, it, expect, vi, beforeEach } from "vitest";

const BASE_URL = "https://kevintrinh.dev";

describe("generatePersonSchema", () => {
  beforeEach(() => { vi.resetModules(); });

  it("returns full Person schema with all socials and location", async () => {
    vi.doMock("@/config/siteConfig", () => ({
      siteConfig: {
        name: "Kevin Trinh", title: "CS Student", tagline: "Building thoughtful software.",
        location: "Houston, TX",
        socialsList: [
          { key: "github", href: "https://github.com/kevin" },
          { key: "linkedin", href: "https://linkedin.com/in/kevin" },
          { key: "youtube", href: "https://youtube.com/@kevin" },
        ],
      },
    }));
    const { generatePersonSchema } = await import("@/lib/structured-data");
    const r = generatePersonSchema();
    expect(r["@type"]).toBe("Person");
    expect(r.name).toBe("Kevin Trinh");
    expect(r.jobTitle).toBe("CS Student");
    expect(r.description).toBe("Building thoughtful software.");
    expect(r.url).toBe(BASE_URL);
    expect(r.address).toEqual({ "@type": "PostalAddress", addressLocality: "Houston, TX" });
    expect(r.sameAs).toEqual(["https://github.com/kevin", "https://linkedin.com/in/kevin", "https://youtube.com/@kevin"]);
  });

  it("handles missing social links and location", async () => {
    vi.doMock("@/config/siteConfig", () => ({
      siteConfig: { name: "No Soc", title: "Dev", tagline: ".", socialsList: [] },
    }));
    const { generatePersonSchema } = await import("@/lib/structured-data");
    const r = generatePersonSchema();
    expect(r.sameAs).toEqual([]);
    expect(r.address).toBeUndefined();
  });
});

describe("generateWebSiteSchema", () => {
  beforeEach(() => { vi.resetModules(); });

  it("returns WebSite schema", async () => {
    vi.doMock("@/config/siteConfig", () => ({
      siteConfig: { name: "Kevin Trinh", socialsList: [] },
    }));
    const { generateWebSiteSchema } = await import("@/lib/structured-data");
    const r = generateWebSiteSchema();
    expect(r["@type"]).toBe("WebSite");
    expect(r.name).toBe("Kevin Trinh Website");
    expect(r.url).toBe(BASE_URL);
  });
});

describe("generateBreadcrumbSchema", () => {
  beforeEach(() => { vi.resetModules(); });

  it("returns BreadcrumbList with items", async () => {
    vi.doMock("@/config/siteConfig", () => ({
      siteConfig: { name: "X", socialsList: [] },
    }));
    const { generateBreadcrumbSchema } = await import("@/lib/structured-data");
    const items = [{ name: "Home", url: "/" }, { name: "Blog", url: "/blog" }];
    const r = generateBreadcrumbSchema(items);
    expect(r["@type"]).toBe("BreadcrumbList");
    expect(r.itemListElement).toHaveLength(2);
    expect(r.itemListElement[0].position).toBe(1);
  });

  it("returns empty BreadcrumbList when items is empty", async () => {
    vi.doMock("@/config/siteConfig", () => ({
      siteConfig: { name: "X", socialsList: [] },
    }));
    const { generateBreadcrumbSchema } = await import("@/lib/structured-data");
    const r = generateBreadcrumbSchema([]);
    expect(r.itemListElement).toEqual([]);
  });
});
