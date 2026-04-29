import { describe, it, expect } from "vitest";
import { getArticles } from "@/lib/mdx/mdx";

// We import the route handlers directly. They're plain async functions; calling
// them in node returns a Web Response.
import { GET as getRss } from "@/app/feed.xml/route";
import { GET as getJson } from "@/app/feed.json/route";

describe("RSS feed", () => {
  it("responds with application/rss+xml", async () => {
    const res = await getRss();
    expect(res.headers.get("content-type") || "").toContain(
      "application/rss+xml"
    );
  });

  it("contains a single <rss> root and a <channel>", async () => {
    const res = await getRss();
    const body = await res.text();
    expect(body).toContain("<?xml");
    expect(body.match(/<rss[\s>]/g)?.length).toBe(1);
    expect(body).toContain("<channel>");
    expect(body).toContain("</channel>");
  });

  it("emits one <item> per published article", async () => {
    const [res, articles] = await Promise.all([getRss(), getArticles()]);
    const body = await res.text();
    const itemCount = (body.match(/<item>/g) || []).length;
    expect(itemCount).toBe(articles.length);
  });

  it("escapes XML entities in titles", async () => {
    // We can't inject content easily in this test, but we can sanity-check
    // that no unescaped raw '&' (other than &amp;/&lt;/&gt;/&quot;/&apos;)
    // appears in <title>/<description>.
    const res = await getRss();
    const body = await res.text();
    const matches = body.match(/<title>([^<]*)<\/title>/g) || [];
    for (const m of matches) {
      // Strip tags then check that any '&' is followed by a known entity name.
      const inner = m.replace(/<\/?title>/g, "");
      const bareAmps = inner.match(/&(?!(amp|lt|gt|quot|apos);)/g);
      expect(bareAmps, `unescaped & in <title>: ${inner}`).toBeNull();
    }
  });
});

describe("JSON feed", () => {
  it("responds with application/feed+json", async () => {
    const res = await getJson();
    expect(res.headers.get("content-type") || "").toContain(
      "application/feed+json"
    );
  });

  it("declares the JSON Feed 1.1 version", async () => {
    const res = await getJson();
    const body = (await res.json()) as { version: string };
    expect(body.version).toBe("https://jsonfeed.org/version/1.1");
  });

  it("has one item per published article and each item has id+url+title", async () => {
    const [res, articles] = await Promise.all([getJson(), getArticles()]);
    const body = (await res.json()) as {
      items: Array<{ id: string; url: string; title: string }>;
    };
    expect(body.items.length).toBe(articles.length);
    for (const item of body.items) {
      expect(item.id).toMatch(/^https?:\/\//);
      expect(item.url).toMatch(/^https?:\/\//);
      expect(item.title.length).toBeGreaterThan(0);
    }
  });
});
