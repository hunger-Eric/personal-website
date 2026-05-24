// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import React from "react";

// Mock MDXRemote since it requires a server runtime
vi.mock("next-mdx-remote/rsc", () => ({
  MDXRemote: ({ source }) => React.createElement("div", { "data-testid": "mdx-content" }, source),
}));

vi.mock("@/components/mdx/MdxComponents", () => ({
  mdxComponents: {},
}));

describe("MdxRenderer", () => {
  it("renders mdx content", async () => {
    const { MdxRenderer } = await import("@/components/mdx/MdxRenderer");
    const { container } = render(React.createElement(MdxRenderer, { source: "# Hello\n\nThis is a test." }));
    expect(container).toBeTruthy();
  });
});
