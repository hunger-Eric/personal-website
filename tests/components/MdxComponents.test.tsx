// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
describe("MdxComponents", () => {
  it("provides MDX component map", async () => {
    const { mdxComponents } = await import("@/components/mdx/MdxComponents");
    expect(mdxComponents).toBeDefined();
  });
});
