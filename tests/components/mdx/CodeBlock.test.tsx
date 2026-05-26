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

  it("falls back to children when codeRef.current is null", async () => {
    const { CodeBlock } = await import("@/components/mdx/CodeBlock");
    // Render with a ref that we'll manipulate to be null
    const ref = { current: null };
    const { container } = render(
      React.createElement(CodeBlock, { children: "fallback code content" })
    );
    // Get the pre element and simulate the ref being null by directly testing the copy behavior
    // The component uses codeRef.current?.textContent || children
    // We can trigger the fallback by clearing the textContent of the pre element
    const pre = container.querySelector("pre");
    if (pre) {
      // Temporarily clear textContent to simulate codeRef.current being null/undefined
      Object.defineProperty(pre, 'textContent', {
        get: () => null,
        configurable: true
      });
    }

    const copyBtn = screen.getByLabelText("Copy code");
    fireEvent.click(copyBtn);
    // Should fall back to children prop when codeRef.current is null/undefined
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("fallback code content");
  });

  it("renders line numbers with empty lines in code", async () => {
    const { CodeBlock } = await import("@/components/mdx/CodeBlock");
    // Code with an empty line (two consecutive newlines)
    const codeWithEmptyLine = "line1\n\nline3";
    const { container } = render(
      React.createElement(CodeBlock, {
        children: codeWithEmptyLine,
        showLineNumbers: true,
      })
    );
    const pre = container.querySelector("pre");
    // Should contain the line numbers 1, 2, 3
    expect(pre?.textContent).toContain("1");
    expect(pre?.textContent).toContain("2");
    expect(pre?.textContent).toContain("3");
    // Empty line should render as space (not empty string)
    expect(pre?.textContent).toContain(" ");
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
