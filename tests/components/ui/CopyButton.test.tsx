// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

vi.mock("./useCopyToClipboard", () => ({
  useCopyToClipboard: () => ({ copied: false, copy: vi.fn() }),
}));

vi.mock("lucide-react", () => {
  const Icon = (props) => React.createElement("svg", { ...props, "data-testid": "lucide-icon" });
  return { Check: Icon, Copy: Icon };
});

describe("CopyButton", () => {
  it("renders with default label", async () => {
    const { CopyButton } = await import("@/components/ui/CopyButton");
    render(React.createElement(CopyButton, { text: "Text to copy" }));
    expect(screen.getByRole("button")).toBeInTheDocument();
    expect(screen.getByText("Copy")).toBeInTheDocument();
  });

  it("renders with custom children label", async () => {
    const { CopyButton } = await import("@/components/ui/CopyButton");
    render(React.createElement(CopyButton, { text: "Text to copy" }, "Custom Label"));
    expect(screen.getByText("Custom Label")).toBeInTheDocument();
  });

  it("renders icon-only when iconOnly is true", async () => {
    const { CopyButton } = await import("@/components/ui/CopyButton");
    const { container } = render(React.createElement(CopyButton, { text: "Text", iconOnly: true }));
    expect(screen.getByRole("button")).toBeInTheDocument();
    expect(container.textContent).not.toContain("Copy");
  });
});
