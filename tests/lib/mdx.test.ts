// @vitest-environment node
import { describe, it, expect } from "vitest";
import { calculateReadingTime, FrontmatterSchema } from "@/lib/mdx/mdx";

describe("calculateReadingTime", () => {
  it("calculates reading time correctly", () => {
    const words = Array(400).fill("word").join(" ");
    const { time, words: count } = calculateReadingTime(words);
    expect(time).toBe(2);
    expect(count).toBe(400);
  });

  it("returns minimum 1 minute for short content", () => {
    const { time } = calculateReadingTime("short");
    expect(time).toBe(1);
  });

  it("handles empty string", () => {
    const { time, words } = calculateReadingTime("");
    // "" split on whitespace returns [""] length=1
    expect(words).toBe(1);
    expect(time).toBe(1);
  });
});

describe("FrontmatterSchema", () => {
  it("validates valid frontmatter", () => {
    const r = FrontmatterSchema.safeParse({ title: "My Post", date: "2025-01-01" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.tags).toEqual([]);
      expect(r.data.draft).toBe(false);
    }
  });
  it("rejects missing title", () => {
    expect(FrontmatterSchema.safeParse({ date: "2025-01-01" }).success).toBe(false);
  });
  it("rejects invalid slug", () => {
    expect(FrontmatterSchema.safeParse({ title: "X", slug: "UPPERCASE!!!", date: "2025-01-01" }).success).toBe(false);
  });
  it("rejects invalid date", () => {
    expect(FrontmatterSchema.safeParse({ title: "X", date: "not-a-date" }).success).toBe(false);
  });
  it("accepts all optional fields", () => {
    expect(FrontmatterSchema.safeParse({ title: "Full", slug: "full-post", summary: "Great", date: "2025-03-15", updated: "2025-04-01", category: "tech", tags: ["js"], featured: true, draft: true, imageSrc: "/img.jpg", imageAlt: "Alt", author: "John" }).success).toBe(true);
  });
});
