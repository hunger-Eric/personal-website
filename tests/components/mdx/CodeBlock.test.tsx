// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";

vi.mock("lucide-react", () => {
  const Icon = (props: any) => React.createElement("svg", { ...props, "data-testid": "lucide-icon" });
  return { Check: Icon, Copy: Icon };
});

describe("CodeBlock", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      writable: true,
      configurable: true,
    });
  });

  it("renders basic code content", async () => {
    const { CodeBlock } = await import("@/components/mdx/CodeBlock");
    const { container } = render(React.createElement(CodeBlock, { children: "const x = 1;" }));
    expect(container).toBeTruthy();
    expect(container.querySelector("pre")).toBeInTheDocument();
    expect(container.querySelector("code")).toBeInTheDocument();
  });

  it("renders with language badge", async () => {
    const { CodeBlock } = await import("@/components/mdx/CodeBlock");
    render(React.createElement(CodeBlock, { children: "const x = 1;", language: "javascript" }));
    expect(screen.getByText("javascript")).toBeInTheDocument();
  });

  it("renders with filename", async () => {
    const { CodeBlock } = await import("@/components/mdx/CodeBlock");
    render(React.createElement(CodeBlock, { children: "const x = 1;", filename: "test.js" }));
    expect(screen.getByText("test.js")).toBeInTheDocument();
  });

  it("renders with both language and filename", async () => {
    const { CodeBlock } = await import("@/components/mdx/CodeBlock");
    render(React.createElement(CodeBlock, {
      children: "const x = 1;",
      language: "javascript",
      filename: "test.js",
    }));
    expect(screen.getByText("javascript")).toBeInTheDocument();
    expect(screen.getByText("test.js")).toBeInTheDocument();
  });

  it("renders with line numbers when showLineNumbers is true", async () => {
    const { CodeBlock } = await import("@/components/mdx/CodeBlock");
    const { container } = render(React.createElement(CodeBlock, {
      children: "line1\nline2\nline3",
      showLineNumbers: true,
    }));
    // Line numbers should be rendered
    const pre = container.querySelector("pre");
    expect(pre?.textContent).toContain("1");
    expect(pre?.textContent).toContain("2");
    expect(pre?.textContent).toContain("3");
  });

  it("copies code to clipboard on button click", async () => {
    const { CodeBlock } = await import("@/components/mdx/CodeBlock");
    render(React.createElement(CodeBlock, { children: "const x = 1;" }));
    const copyBtn = screen.getByLabelText("Copy code");
    fireEvent.click(copyBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("const x = 1;");
  });

  it("shows copied state after copying", async () => {
    const { CodeBlock } = await import("@/components/mdx/CodeBlock");
    render(React.createElement(CodeBlock, { children: "const x = 1;" }));
    fireEvent.click(screen.getByLabelText("Copy code"));
    await vi.waitFor(() => {
      expect(screen.getByText("Copied!")).toBeInTheDocument();
    });
  });

  it("falls back to execCommand when clipboard API fails", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockRejectedValue(new Error("Clipboard error")) },
      writable: true,
      configurable: true,
    });
    const execCommandSpy = vi.fn().mockReturnValue(true);
    document.execCommand = execCommandSpy;

    const { CodeBlock } = await import("@/components/mdx/CodeBlock");
    render(React.createElement(CodeBlock, { children: "const x = 1;" }));
    fireEvent.click(screen.getByLabelText("Copy code"));
    await vi.waitFor(() => {
      expect(execCommandSpy).toHaveBeenCalledWith("copy");
    });
  });

  it("applies language class to code element", async () => {
    const { CodeBlock } = await import("@/components/mdx/CodeBlock");
    const { container } = render(React.createElement(CodeBlock, {
      children: "const x = 1;",
      language: "typescript",
    }));
    const code = container.querySelector("code");
    expect(code).toHaveClass("language-typescript");
  });

  it("does not add language class when language is not provided", async () => {
    const { CodeBlock } = await import("@/components/mdx/CodeBlock");
    const { container } = render(React.createElement(CodeBlock, { children: "const x = 1;" }));
    const code = container.querySelector("code");
    expect(code?.className).toBe("");
  });
});

describe("InlineCode", () => {
  it("renders inline code", async () => {
    const { InlineCode } = await import("@/components/mdx/CodeBlock");
    const { container } = render(React.createElement(InlineCode, { children: "const x = 1;" }));
    expect(container.querySelector("code")).toBeInTheDocument();
    expect(container.querySelector("code")?.textContent).toBe("const x = 1;");
  });
});
