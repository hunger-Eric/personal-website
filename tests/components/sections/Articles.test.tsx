// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ArticlesSection } from "@/components/sections/Articles";

vi.mock("@/config/articles", () => ({
  blogPosts: [
    {
      id: "1",
      slug: "test-article",
      title: "Test Article",
      summary: "A summary",
      date: "2025-01-15",
      featured: true,
      readTime: "5 min",
      category: "tech",
    },
    {
      id: "2",
      slug: "second-article",
      title: "Second Article",
      summary: "Another summary",
      date: "2025-01-10",
      readTime: "3 min",
      category: "guide",
    },
  ],
}));

vi.mock("lucide-react", () => ({
  ArrowRight: () => <svg data-testid="arrow-right" />,
  CalendarDays: () => <svg data-testid="calendar-days" />,
  Clock3: () => <svg data-testid="clock" />,
}));

describe("ArticlesSection", () => {
  it("renders article previews with centralized copy and links", () => {
    render(<ArticlesSection />);

    expect(screen.getByText("~/文章")).toBeInTheDocument();
    expect(screen.getByText("其他文章")).toBeInTheDocument();
    expect(screen.getByText("Test Article")).toBeInTheDocument();
    expect(screen.getByText("Second Article")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "查看全部文章" })).toHaveAttribute(
      "href",
      "/articles"
    );
    expect(screen.getByRole("link", { name: /Test Article/ })).toHaveAttribute(
      "href",
      "/articles/test-article"
    );
  });

  it("uses system surface classes instead of old template residue", () => {
    const { container } = render(<ArticlesSection />);
    const html = container.innerHTML;
    const oldRounded = ["rounded", "md"].join("-");
    const oldBg = ["bg", "white/5"].join("-");
    const oldBorder = ["border", "white/10"].join("-");

    expect(html).toContain("rounded-card");
    expect(html).toContain("bg-surface-paper-elevated");
    expect(html).not.toContain(oldRounded);
    expect(html).not.toContain(oldBg);
    expect(html).not.toContain(oldBorder);
  });
});
