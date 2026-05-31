import { describe, expect, it } from "vitest";
import { GET } from "@/app/llms.txt/route";

describe("llms.txt", () => {
  it("returns a readable canonical site map", async () => {
    const res = await GET();
    const body = await res.text();

    expect(res.headers.get("content-type") || "").toContain("text/plain");
    expect(body).toContain("# fengc");
    expect(body).toContain("https://me.itheheda.online/");
    expect(body).toContain("https://me.itheheda.online/sitemap.xml");
    expect(body).not.toContain("kevintrinh.dev");
  });
});
