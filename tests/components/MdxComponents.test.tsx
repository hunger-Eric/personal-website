// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

describe("MdxComponents", () => {
  it("provides MDX component map", async () => {
    const { mdxComponents } = await import("@/components/mdx/MdxComponents");
    expect(mdxComponents).toBeDefined();
  });
});
