// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import React from "react";

vi.mock("lucide-react", () => ({
  Check: () => React.createElement("svg"),
  Copy: () => React.createElement("svg"),
}));

describe("CodeBlock", () => {
  it("renders code content", async () => {
    const { CodeBlock } = await import("@/components/mdx/CodeBlock");
    const { container } = render(React.createElement(CodeBlock, { children: "const x = 1;" }));
    expect(container).toBeTruthy();
  });

  it("renders with language and filename", async () => {
    const { CodeBlock } = await import("@/components/mdx/CodeBlock");
    const { container } = render(React.createElement(CodeBlock, {
      children: "const x = 1;",
      language: "javascript",
      filename: "test.js",
    }));
    expect(container).toBeTruthy();
  });

  it("renders with line numbers", async () => {
    const { CodeBlock } = await import("@/components/mdx/CodeBlock");
    const { container } = render(React.createElement(CodeBlock, {
      children: "line1\nline2\nline3",
      showLineNumbers: true,
    }));
    expect(container).toBeTruthy();
  });
});

describe("InlineCode", () => {
  it("renders inline code", async () => {
    const { InlineCode } = await import("@/components/mdx/CodeBlock");
    const { container } = render(React.createElement(InlineCode, { children: "const x = 1;" }));
    expect(container).toBeTruthy();
  });
});
