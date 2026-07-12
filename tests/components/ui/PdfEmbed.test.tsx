// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

describe("PdfEmbed", () => {
  it("renders PDF embed with src", async () => {
    const PdfEmbed = (await import("@/components/ui/PdfEmbed")).default;
    const { container } = render(React.createElement(PdfEmbed, { src: "/api/resume" }));
    const obj = container.querySelector("object");
    expect(obj).toBeInTheDocument();
    expect(obj).toHaveAttribute("data", "/api/resume");
    expect(obj).toHaveAttribute("type", "application/pdf");
  });

  it("renders fallback text for unsupported browsers", async () => {
    const PdfEmbed = (await import("@/components/ui/PdfEmbed")).default;
    render(React.createElement(PdfEmbed, { src: "/api/resume" }));
    expect(screen.getByText(/PDFs inline/i)).toBeInTheDocument();
    expect(screen.getByText(/Open the PDF in a new tab/i)).toBeInTheDocument();
  });

  it("applies custom className", async () => {
    const PdfEmbed = (await import("@/components/ui/PdfEmbed")).default;
    const { container } = render(React.createElement(PdfEmbed, { src: "/test.pdf", className: "custom-wrap" }));
    const outer = container.firstChild;
    expect(outer).toHaveClass("custom-wrap");
  });
});
