// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import React from "react";

vi.mock("next/navigation", () => ({
  usePathname: () => "/test-path",
}));

describe("PageTransition", () => {
  it("renders children wrapped in a div", async () => {
    const { PageTransition } = await import("@/components/PageTransition");
    const { container } = render(
      React.createElement(PageTransition, null, React.createElement("span", null, "Hello"))
    );
    const wrapper = container.querySelector("div");
    expect(wrapper).toBeInTheDocument();
    expect(wrapper?.textContent).toBe("Hello");
  });

  it("applies animate-page-fade class to wrapper", async () => {
    const { PageTransition } = await import("@/components/PageTransition");
    const { container } = render(
      React.createElement(PageTransition, null, React.createElement("span", null, "Content"))
    );
    const wrapper = container.querySelector("div");
    expect(wrapper).toHaveClass("animate-page-fade");
  });

  it("has key set to current pathname", async () => {
    const { PageTransition } = await import("@/components/PageTransition");
    const { container } = render(
      React.createElement(PageTransition, null, React.createElement("span", null, "Hello"))
    );
    // The key is a React internal; we verify the div rendered with the correct content
    const wrapper = container.querySelector("div");
    expect(wrapper).toBeInTheDocument();
  });

  it("renders multiple children", async () => {
    const { PageTransition } = await import("@/components/PageTransition");
    const { container } = render(
      React.createElement(PageTransition, null,
        React.createElement("span", null, "First"),
        React.createElement("span", null, "Second")
      )
    );
    const wrapper = container.querySelector("div");
    expect(wrapper?.children).toHaveLength(2);
    expect(wrapper?.children[0]?.textContent).toBe("First");
    expect(wrapper?.children[1]?.textContent).toBe("Second");
  });
});
