// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageBlocks } from "@/components/PageBlocks";

// ── Mock siteConfig ──────────────────────────────────────────────────────────
const mockSocialsList = vi.fn(() => [
  { key: "email", href: "mailto:hello@example.com", label: "Email" },
  { key: "github", href: "https://github.com/example", label: "GitHub" },
]);

vi.mock("@/config/siteConfig", () => ({
  siteConfig: {
    get socialsList() {
      return mockSocialsList();
    },
  },
}));

// ── Helpers ──────────────────────────────────────────────────────────────────
function makeBlock(
  overrides: Partial<{
    id: string;
    type: "hero" | "text" | "gallery" | "cards" | "contact";
    title: string;
    content: Record<string, unknown>;
  }> = {}
) {
  return {
    id: "block-1",
    type: "hero" as const,
    title: "",
    content: {},
    ...overrides,
  };
}

// ── Before each ──────────────────────────────────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks();
  mockSocialsList.mockReturnValue([
    { key: "email", href: "mailto:hello@example.com", label: "Email" },
    { key: "github", href: "https://github.com/example", label: "GitHub" },
  ]);
});

// ── Tests ────────────────────────────────────────────────────────────────────
describe("PageBlocks", () => {
  // ──────── hero ────────
  describe("hero block", () => {
    it("renders headline, subheadline, and CTA", () => {
      render(
        <PageBlocks
          blocks={[
            makeBlock({
              type: "hero",
              title: "Hero Section",
              content: {
                headline: "Welcome!",
                subheadline: "Nice to meet you",
                ctaText: "Get Started",
                ctaHref: "/start",
              },
            }),
          ]}
        />
      );

      expect(screen.getByText("Hero Section")).toBeInTheDocument();
      expect(screen.getByText("Welcome!")).toBeInTheDocument();
      expect(screen.getByText("Nice to meet you")).toBeInTheDocument();
      const cta = screen.getByText("Get Started");
      expect(cta).toBeInTheDocument();
      expect(cta.closest("a")).toHaveAttribute("href", "/start");
    });

    it("omits optional fields when absent", () => {
      render(
        <PageBlocks
          blocks={[
            makeBlock({
              type: "hero",
              content: { headline: "Only Headline" },
            }),
          ]}
        />
      );

      expect(screen.getByText("Only Headline")).toBeInTheDocument();
      expect(screen.queryByText("Get Started")).not.toBeInTheDocument();
    });

    it("falls back to '#' for ctaHref when missing", () => {
      render(
        <PageBlocks
          blocks={[
            makeBlock({
              type: "hero",
              content: { headline: "H", ctaText: "Click" },
            }),
          ]}
        />
      );

      const cta = screen.getByText("Click");
      expect(cta.closest("a")).toHaveAttribute("href", "#");
    });
  });

  // ──────── text ────────
  describe("text block", () => {
    it("splits multi-line text by newline", () => {
      render(
        <PageBlocks
          blocks={[
            makeBlock({
              type: "text",
              title: "About",
              content: { text: "Line one\nLine two\nLine three" },
            }),
          ]}
        />
      );

      expect(screen.getByText("About")).toBeInTheDocument();
      expect(screen.getByText("Line one")).toBeInTheDocument();
      expect(screen.getByText("Line two")).toBeInTheDocument();
      expect(screen.getByText("Line three")).toBeInTheDocument();
    });

    it("renders nothing in prose when text is empty", () => {
      render(
        <PageBlocks
          blocks={[
            makeBlock({
              type: "text",
              content: { text: "" },
            }),
          ]}
        />
      );

      // Empty text is falsy in component, so no prose rendered
      const { container } = render(
        <PageBlocks
          blocks={[
            makeBlock({
              type: "text",
              content: { text: "" },
            }),
          ]}
        />
      );
      // text="" is falsy, so the prose section doesn't render text content
      expect(screen.queryByText("About")).not.toBeInTheDocument();
    });

    it("handles undefined text gracefully", () => {
      // Should not crash
      const { container } = render(
        <PageBlocks blocks={[makeBlock({ type: "text", content: {} })]} />
      );
      const paragraphs = container.querySelectorAll("p");
      expect(paragraphs.length).toBe(0);
    });
  });

  // ──────── gallery ────────
  describe("gallery block", () => {
    it("renders images with src and alt", () => {
      render(
        <PageBlocks
          blocks={[
            makeBlock({
              type: "gallery",
              title: "Gallery",
              content: {
                images: [
                  { src: "/img1.jpg", alt: "Photo 1" },
                  { src: "/img2.jpg", alt: "Photo 2" },
                ],
              },
            }),
          ]}
        />
      );

      expect(screen.getByText("Gallery")).toBeInTheDocument();
      const imgs = document.querySelectorAll("img");
      expect(imgs).toHaveLength(2);
      expect(imgs[0]).toHaveAttribute("src", "/img1.jpg");
      expect(imgs[0]).toHaveAttribute("alt", "Photo 1");
    });

    it("shows placeholder when images array is empty", () => {
      render(
        <PageBlocks
          blocks={[
            makeBlock({
              type: "gallery",
              content: { images: [] },
            }),
          ]}
        />
      );

      expect(screen.getByText("暂无图片")).toBeInTheDocument();
    });

    it("shows placeholder when images is undefined", () => {
      render(
        <PageBlocks
          blocks={[
            makeBlock({
              type: "gallery",
              content: {},
            }),
          ]}
        />
      );

      expect(screen.getByText("暂无图片")).toBeInTheDocument();
    });

    it("handles missing src gracefully", () => {
      render(
        <PageBlocks
          blocks={[
            makeBlock({
              type: "gallery",
              content: {
                images: [{ alt: "No src" }],
              },
            }),
          ]}
        />
      );

      // Component only renders img when img.src is truthy
      const img = document.querySelector("img");
      expect(img).not.toBeInTheDocument();
    });

    it("handles missing alt attribute gracefully", () => {
      render(
        <PageBlocks
          blocks={[
            makeBlock({
              type: "gallery",
              content: {
                images: [{ src: "/img-no-alt.jpg" }],
              },
            }),
          ]}
        />
      );

      const img = document.querySelector("img");
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute("src", "/img-no-alt.jpg");
      // img.alt should fall back to empty string
      expect(img).toHaveAttribute("alt", "");
    });
  });

  // ──────── cards ────────
  describe("cards block", () => {
    it("renders cards with title and description", () => {
      render(
        <PageBlocks
          blocks={[
            makeBlock({
              type: "cards",
              title: "Services",
              content: {
                cards: [
                  { title: "Card 1", description: "Desc 1" },
                  { title: "Card 2", description: "Desc 2" },
                ],
              },
            }),
          ]}
        />
      );

      expect(screen.getByText("Services")).toBeInTheDocument();
      expect(screen.getByText("Card 1")).toBeInTheDocument();
      expect(screen.getByText("Desc 1")).toBeInTheDocument();
      expect(screen.getByText("Card 2")).toBeInTheDocument();
      expect(screen.getByText("Desc 2")).toBeInTheDocument();
    });

    it("omits description when not provided", () => {
      render(
        <PageBlocks
          blocks={[
            makeBlock({
              type: "cards",
              content: {
                cards: [{ title: "Card without desc" }],
              },
            }),
          ]}
        />
      );

      expect(screen.getByText("Card without desc")).toBeInTheDocument();
      // No <p> tag with description
      expect(screen.queryByText("undefined")).not.toBeInTheDocument();
    });

    it("shows placeholder when cards array is empty", () => {
      render(
        <PageBlocks
          blocks={[
            makeBlock({
              type: "cards",
              content: { cards: [] },
            }),
          ]}
        />
      );

      expect(screen.getByText("暂无内容")).toBeInTheDocument();
    });

    it("shows placeholder when cards is undefined", () => {
      render(
        <PageBlocks
          blocks={[
            makeBlock({
              type: "cards",
              content: {},
            }),
          ]}
        />
      );

      expect(screen.getByText("暂无内容")).toBeInTheDocument();
    });
  });

  // ──────── contact ────────
  describe("contact block", () => {
    it("renders email link from siteConfig.socialsList", () => {
      render(
        <PageBlocks
          blocks={[
            makeBlock({
              type: "contact",
            }),
          ]}
        />
      );

      expect(screen.getByText("联系我")).toBeInTheDocument();
      expect(
        screen.getByText(/有任何问题或合作意向，欢迎联系/)
      ).toBeInTheDocument();

      const emailLink = screen.getByText("发送邮件");
      expect(emailLink).toBeInTheDocument();
      expect(emailLink.closest("a")).toHaveAttribute(
        "href",
        "mailto:hello@example.com"
      );
    });

    it("does not render email button when socialsList has no email entry", () => {
      mockSocialsList.mockReturnValue([
        { key: "github", href: "https://github.com/example" },
      ]);

      render(
        <PageBlocks
          blocks={[
            makeBlock({
              type: "contact",
            }),
          ]}
        />
      );

      expect(screen.getByText("联系我")).toBeInTheDocument();
      expect(screen.queryByText("发送邮件")).not.toBeInTheDocument();
    });

    it("does not render email button when socialsList is empty", () => {
      mockSocialsList.mockReturnValue([]);

      render(
        <PageBlocks
          blocks={[
            makeBlock({
              type: "contact",
            }),
          ]}
        />
      );

      expect(screen.getByText("联系我")).toBeInTheDocument();
      expect(screen.queryByText("发送邮件")).not.toBeInTheDocument();
    });
  });

  // ──────── multiple blocks ────────
  describe("multiple blocks in sequence", () => {
    it("renders all block types in order", () => {
      render(
        <PageBlocks
          blocks={[
            makeBlock({
              id: "b1",
              type: "hero",
              title: "Hero Title",
              content: { headline: "Welcome" },
            }),
            makeBlock({
              id: "b2",
              type: "text",
              title: "Text Block",
              content: { text: "Some text." },
            }),
            makeBlock({
              id: "b3",
              type: "contact",
            }),
          ]}
        />
      );

      expect(screen.getByText("Hero Title")).toBeInTheDocument();
      expect(screen.getByText("Text Block")).toBeInTheDocument();
      expect(screen.getByText("Some text.")).toBeInTheDocument();
      expect(screen.getByText("联系我")).toBeInTheDocument();

      // Sections are rendered with correct ids
      const sections = document.querySelectorAll("section");
      expect(sections[0]).toHaveAttribute("id", "block-b1");
      expect(sections[1]).toHaveAttribute("id", "block-b2");
      expect(sections[2]).toHaveAttribute("id", "block-b3");
    });
  });

  // ──────── empty blocks ────────
  describe("empty blocks array", () => {
    it("renders nothing when blocks is an empty array", () => {
      const { container } = render(<PageBlocks blocks={[]} />);

      expect(container.querySelector("div")).toBeInTheDocument();
      expect(container.querySelector("section")).not.toBeInTheDocument();
    });
  });
});