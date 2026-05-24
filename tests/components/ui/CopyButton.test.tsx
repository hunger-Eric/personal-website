// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";

vi.mock("lucide-react", () => {
  const Icon = (props: any) => React.createElement("svg", { ...props, "data-testid": "lucide-icon" });
  return { Check: Icon, Copy: Icon };
});

const mockCopyFn = vi.fn();
let mockCopied = false;

vi.mock("@/components/ui/useCopyToClipboard", () => ({
  useCopyToClipboard: () => ({ copied: mockCopied, copy: mockCopyFn }),
}));

describe("CopyButton", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockCopyFn.mockReset();
    mockCopied = false;
  });

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

  it("calls copy with the provided text on click", async () => {
    const { CopyButton } = await import("@/components/ui/CopyButton");
    render(React.createElement(CopyButton, { text: "Text to copy" }));
    fireEvent.click(screen.getByRole("button"));
    expect(mockCopyFn).toHaveBeenCalledWith("Text to copy");
  });

  it("renders with custom className", async () => {
    const { CopyButton } = await import("@/components/ui/CopyButton");
    const { container } = render(React.createElement(CopyButton, { text: "Text", className: "my-class" }));
    const btn = container.querySelector("button");
    expect(btn?.className).toContain("my-class");
  });

  it("uses default aria-label", async () => {
    const { CopyButton } = await import("@/components/ui/CopyButton");
    render(React.createElement(CopyButton, { text: "Text" }));
    expect(screen.getByRole("button")).toHaveAttribute("aria-label", "Copy to clipboard");
  });

  it("uses custom aria-label", async () => {
    const { CopyButton } = await import("@/components/ui/CopyButton");
    render(React.createElement(CopyButton, { text: "Text", ariaLabel: "Copy my text" }));
    expect(screen.getByRole("button")).toHaveAttribute("aria-label", "Copy my text");
  });

  it("shows copied state when copied is true", async () => {
    mockCopied = true;

    const { CopyButton } = await import("@/components/ui/CopyButton");
    render(React.createElement(CopyButton, { text: "Text" }));
    expect(screen.getByText("Copied!")).toBeInTheDocument();
  });
});
