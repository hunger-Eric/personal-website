// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";

vi.mock("react-dom", () => ({
  createPortal: (node: React.ReactNode) => node,
}));

describe("Tooltip", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders children", async () => {
    const { Tooltip } = await import("@/components/ui/Tooltip");
    render(
      React.createElement(Tooltip, { content: "Tooltip content" },
        React.createElement("button", null, "Hover me")
      )
    );
    expect(screen.getByText("Hover me")).toBeInTheDocument();
  });

  it("does not show tooltip content initially", async () => {
    const { Tooltip } = await import("@/components/ui/Tooltip");
    render(
      React.createElement(Tooltip, { content: "Tooltip content" },
        React.createElement("button", null, "Hover me")
      )
    );
    expect(screen.queryByText("Tooltip content")).not.toBeInTheDocument();
  });

  it("shows tooltip on mouse enter after delay", async () => {
    const { Tooltip } = await import("@/components/ui/Tooltip");
    const { container } = render(
      React.createElement(Tooltip, { content: "Tooltip content" },
        React.createElement("button", null, "Hover me")
      )
    );

    const trigger = container.querySelector("[onMouseEnter]") || container.querySelector("div");
    expect(trigger).toBeInTheDocument();

    act(() => {
      fireEvent.mouseEnter(trigger!);
    });

    // Not shown yet (within delay)
    expect(screen.queryByText("Tooltip content")).not.toBeInTheDocument();

    // Advance past the delay
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(screen.getByText("Tooltip content")).toBeInTheDocument();
  });

  it("hides tooltip on mouse leave", async () => {
    const { Tooltip } = await import("@/components/ui/Tooltip");
    const { container } = render(
      React.createElement(Tooltip, { content: "Tooltip content" },
        React.createElement("button", null, "Hover me")
      )
    );

    const trigger = container.querySelector("div")!;

    act(() => {
      fireEvent.mouseEnter(trigger);
      vi.advanceTimersByTime(200);
    });

    expect(screen.getByText("Tooltip content")).toBeInTheDocument();

    act(() => {
      fireEvent.mouseLeave(trigger);
    });

    expect(screen.queryByText("Tooltip content")).not.toBeInTheDocument();
  });

  it("shows tooltip on focus", async () => {
    const { Tooltip } = await import("@/components/ui/Tooltip");
    const { container } = render(
      React.createElement(Tooltip, { content: "Tooltip content" },
        React.createElement("button", null, "Focus me")
      )
    );

    const trigger = container.querySelector("div")!;

    act(() => {
      fireEvent.focus(trigger);
      vi.advanceTimersByTime(200);
    });

    expect(screen.getByText("Tooltip content")).toBeInTheDocument();
  });

  it("hides tooltip on blur", async () => {
    const { Tooltip } = await import("@/components/ui/Tooltip");
    const { container } = render(
      React.createElement(Tooltip, { content: "Tooltip content" },
        React.createElement("button", null, "Focus me")
      )
    );

    const trigger = container.querySelector("div")!;

    act(() => {
      fireEvent.focus(trigger);
      vi.advanceTimersByTime(200);
    });

    expect(screen.getByText("Tooltip content")).toBeInTheDocument();

    act(() => {
      fireEvent.blur(trigger);
    });

    expect(screen.queryByText("Tooltip content")).not.toBeInTheDocument();
  });

  it("has role='tooltip' on tooltip element", async () => {
    const { Tooltip } = await import("@/components/ui/Tooltip");
    const { container } = render(
      React.createElement(Tooltip, { content: "Tooltip content" },
        React.createElement("button", null, "Hover me")
      )
    );

    const trigger = container.querySelector("div")!;
    act(() => {
      fireEvent.mouseEnter(trigger);
      vi.advanceTimersByTime(200);
    });

    const tooltip = screen.getByRole("tooltip");
    expect(tooltip).toBeInTheDocument();
  });

  it("sets aria-describedby on trigger when open", async () => {
    const { Tooltip } = await import("@/components/ui/Tooltip");
    const { container } = render(
      React.createElement(Tooltip, { content: "Tooltip content" },
        React.createElement("button", null, "Hover me")
      )
    );

    const trigger = container.querySelector("div")!;
    expect(trigger).not.toHaveAttribute("aria-describedby");

    act(() => {
      fireEvent.mouseEnter(trigger);
      vi.advanceTimersByTime(200);
    });

    expect(trigger).toHaveAttribute("aria-describedby");
  });

  it("uses custom delay", async () => {
    const { Tooltip } = await import("@/components/ui/Tooltip");
    const { container } = render(
      React.createElement(Tooltip, { content: "Tooltip content", delay: 500 },
        React.createElement("button", null, "Hover me")
      )
    );

    const trigger = container.querySelector("div")!;

    act(() => {
      fireEvent.mouseEnter(trigger);
    });

    // Should not show at 300ms (before 500ms delay)
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.queryByText("Tooltip content")).not.toBeInTheDocument();

    // Should show after 500ms
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getByText("Tooltip content")).toBeInTheDocument();
  });

  it("clears timeout on mouse leave before delay expires", async () => {
    const { Tooltip } = await import("@/components/ui/Tooltip");
    const { container } = render(
      React.createElement(Tooltip, { content: "Tooltip content", delay: 500 },
        React.createElement("button", null, "Hover me")
      )
    );

    const trigger = container.querySelector("div")!;

    act(() => {
      fireEvent.mouseEnter(trigger);
    });

    // Leave before the delay
    act(() => {
      fireEvent.mouseLeave(trigger);
    });

    // Advance past the delay
    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(screen.queryByText("Tooltip content")).not.toBeInTheDocument();
  });

  it("accepts and passes through additional HTML attributes", async () => {
    const { Tooltip } = await import("@/components/ui/Tooltip");
    const { container } = render(
      React.createElement(Tooltip, { content: "Tooltip content", className: "extra-class", id: "my-tooltip" },
        React.createElement("button", null, "Hover me")
      )
    );

    const trigger = container.querySelector("div")!;
    expect(trigger.className).toContain("extra-class");
  });

  it("updates tooltip position on mouse move", async () => {
    const { Tooltip } = await import("@/components/ui/Tooltip");
    const { container } = render(
      React.createElement(Tooltip, { content: "Tooltip content" },
        React.createElement("button", null, "Hover me")
      )
    );

    const trigger = container.querySelector("div")!;
    act(() => {
      fireEvent.mouseEnter(trigger, { clientX: 100, clientY: 200 });
      vi.advanceTimersByTime(200);
    });

    act(() => {
      fireEvent.mouseMove(trigger, { clientX: 150, clientY: 250 });
    });

    // Tooltip should be visible
    expect(screen.getByText("Tooltip content")).toBeInTheDocument();
  });

  it("renders without tooltip initially (before mount)", async () => {
    // Test the initial state before the useEffect runs
    const { Tooltip } = await import("@/components/ui/Tooltip");
    // Create the component inside act to control the render
    const { container } = render(
      React.createElement(Tooltip, { content: "Tooltip" },
        React.createElement("span", null, "Trigger")
      )
    );
    // After mounting, the useEffect should have run setting mounted=true
    expect(screen.getByText("Trigger")).toBeInTheDocument();
  });
});
