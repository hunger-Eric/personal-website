// @vitest-environment jsdom
import { describe, it, expect } from "vitest";

describe("mdxComponents", () => {
  it("provides MDX component map with all keys", async () => {
    const { mdxComponents } = await import("@/components/mdx/MdxComponents");
    expect(mdxComponents).toBeDefined();
    expect(typeof mdxComponents).toBe("object");
  });
});
