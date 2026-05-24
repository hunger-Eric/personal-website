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

    expect(screen.queryByText("Tooltip content")).not.toBeInTheDocument();

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

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.queryByText("Tooltip content")).not.toBeInTheDocument();

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

    act(() => {
      fireEvent.mouseLeave(trigger);
    });

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

    expect(screen.getByText("Tooltip content")).toBeInTheDocument();
  });

  it("renders without tooltip initially (before mount)", async () => {
    const { Tooltip } = await import("@/components/ui/Tooltip");
    const { container } = render(
      React.createElement(Tooltip, { content: "Tooltip" },
        React.createElement("span", null, "Trigger")
      )
    );
    expect(screen.getByText("Trigger")).toBeInTheDocument();
  });
});

/* ─── Positioning tests (trigger-based, no mouse) ─── */
/* Tests all 4 sides and all 3 alignments covering lines 98–132 */
describe("Tooltip positioning", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("positions tooltip on top with center alignment", async () => {
    const { Tooltip } = await import("@/components/ui/Tooltip");
    const { container, rerender } = render(
      React.createElement(
        Tooltip,
        { content: "Tooltip tip", side: "bottom", align: "center" },
        React.createElement("button", null, "Hover")
      )
    );

    const trigger = container.querySelector("div")!;

    // Mock trigger dimensions BEFORE opening
    vi.spyOn(trigger, "getBoundingClientRect").mockReturnValue({
      top: 100, bottom: 150, left: 200, right: 400,
      width: 200, height: 50,
      x: 200, y: 100,
    } as DOMRect);

    // Open tooltip
    act(() => {
      fireEvent.focus(trigger);
      vi.advanceTimersByTime(200);
    });

    const tooltip = screen.getByRole("tooltip");

    // Mock tooltip dimensions
    vi.spyOn(tooltip, "getBoundingClientRect").mockReturnValue({
      top: 0, bottom: 40, left: 0, right: 150,
      width: 150, height: 40,
      x: 0, y: 0,
    } as DOMRect);

    // Force effect re-run by changing side prop, then back to target
    rerender(
      React.createElement(
        Tooltip,
        { content: "Tooltip tip", side: "top", align: "center" },
        React.createElement("button", null, "Hover")
      )
    );

    // Expected: top = 100 - 40 - 8 = 52
    // Expected: left = 200 + 100 - 75 = 225
    expect(tooltip.style.top).toBe("52px");
    expect(tooltip.style.left).toBe("225px");
  });

  it("positions tooltip on top with start alignment", async () => {
    const { Tooltip } = await import("@/components/ui/Tooltip");
    const { container, rerender } = render(
      React.createElement(
        Tooltip,
        { content: "Tooltip tip", side: "bottom", align: "center" },
        React.createElement("button", null, "Hover")
      )
    );

    const trigger = container.querySelector("div")!;

    vi.spyOn(trigger, "getBoundingClientRect").mockReturnValue({
      top: 100, bottom: 150, left: 200, right: 400,
      width: 200, height: 50,
      x: 200, y: 100,
    } as DOMRect);

    act(() => {
      fireEvent.focus(trigger);
      vi.advanceTimersByTime(200);
    });

    const tooltip = screen.getByRole("tooltip");

    vi.spyOn(tooltip, "getBoundingClientRect").mockReturnValue({
      top: 0, bottom: 40, left: 0, right: 150,
      width: 150, height: 40,
      x: 0, y: 0,
    } as DOMRect);

    rerender(
      React.createElement(
        Tooltip,
        { content: "Tooltip tip", side: "top", align: "start" },
        React.createElement("button", null, "Hover")
      )
    );

    // top = 100 - 40 - 8 = 52
    // start: left = triggerRect.left = 200
    expect(tooltip.style.top).toBe("52px");
    expect(tooltip.style.left).toBe("200px");
  });

  it("positions tooltip on top with end alignment", async () => {
    const { Tooltip } = await import("@/components/ui/Tooltip");
    const { container, rerender } = render(
      React.createElement(
        Tooltip,
        { content: "Tooltip tip", side: "bottom", align: "center" },
        React.createElement("button", null, "Hover")
      )
    );

    const trigger = container.querySelector("div")!;

    vi.spyOn(trigger, "getBoundingClientRect").mockReturnValue({
      top: 100, bottom: 150, left: 200, right: 400,
      width: 200, height: 50,
      x: 200, y: 100,
    } as DOMRect);

    act(() => {
      fireEvent.focus(trigger);
      vi.advanceTimersByTime(200);
    });

    const tooltip = screen.getByRole("tooltip");

    vi.spyOn(tooltip, "getBoundingClientRect").mockReturnValue({
      top: 0, bottom: 40, left: 0, right: 150,
      width: 150, height: 40,
      x: 0, y: 0,
    } as DOMRect);

    rerender(
      React.createElement(
        Tooltip,
        { content: "Tooltip tip", side: "top", align: "end" },
        React.createElement("button", null, "Hover")
      )
    );

    // top = 100 - 40 - 8 = 52
    // end: left = triggerRect.right - tooltipRect.width = 400 - 150 = 250
    expect(tooltip.style.top).toBe("52px");
    expect(tooltip.style.left).toBe("250px");
  });

  it("positions tooltip on bottom with center alignment", async () => {
    const { Tooltip } = await import("@/components/ui/Tooltip");
    const { container, rerender } = render(
      React.createElement(
        Tooltip,
        { content: "Tooltip tip", side: "top", align: "center" },
        React.createElement("button", null, "Hover")
      )
    );

    const trigger = container.querySelector("div")!;

    vi.spyOn(trigger, "getBoundingClientRect").mockReturnValue({
      top: 100, bottom: 150, left: 200, right: 400,
      width: 200, height: 50,
      x: 200, y: 100,
    } as DOMRect);

    act(() => {
      fireEvent.focus(trigger);
      vi.advanceTimersByTime(200);
    });

    const tooltip = screen.getByRole("tooltip");

    vi.spyOn(tooltip, "getBoundingClientRect").mockReturnValue({
      top: 0, bottom: 40, left: 0, right: 150,
      width: 150, height: 40,
      x: 0, y: 0,
    } as DOMRect);

    rerender(
      React.createElement(
        Tooltip,
        { content: "Tooltip tip", side: "bottom", align: "center" },
        React.createElement("button", null, "Hover")
      )
    );

    // bottom: top = 150 + 8 = 158
    // center: left = 200 + 100 - 75 = 225
    expect(tooltip.style.top).toBe("158px");
    expect(tooltip.style.left).toBe("225px");
  });

  it("positions tooltip on bottom with start alignment", async () => {
    const { Tooltip } = await import("@/components/ui/Tooltip");
    const { container, rerender } = render(
      React.createElement(
        Tooltip,
        { content: "Tooltip tip", side: "top", align: "center" },
        React.createElement("button", null, "Hover")
      )
    );

    const trigger = container.querySelector("div")!;

    vi.spyOn(trigger, "getBoundingClientRect").mockReturnValue({
      top: 100, bottom: 150, left: 200, right: 400,
      width: 200, height: 50,
      x: 200, y: 100,
    } as DOMRect);

    act(() => {
      fireEvent.focus(trigger);
      vi.advanceTimersByTime(200);
    });

    const tooltip = screen.getByRole("tooltip");

    vi.spyOn(tooltip, "getBoundingClientRect").mockReturnValue({
      top: 0, bottom: 40, left: 0, right: 150,
      width: 150, height: 40,
      x: 0, y: 0,
    } as DOMRect);

    rerender(
      React.createElement(
        Tooltip,
        { content: "Tooltip tip", side: "bottom", align: "start" },
        React.createElement("button", null, "Hover")
      )
    );

    // bottom: top = 150 + 8 = 158
    // start: left = 200
    expect(tooltip.style.top).toBe("158px");
    expect(tooltip.style.left).toBe("200px");
  });

  it("positions tooltip on bottom with end alignment", async () => {
    const { Tooltip } = await import("@/components/ui/Tooltip");
    const { container, rerender } = render(
      React.createElement(
        Tooltip,
        { content: "Tooltip tip", side: "top", align: "center" },
        React.createElement("button", null, "Hover")
      )
    );

    const trigger = container.querySelector("div")!;

    vi.spyOn(trigger, "getBoundingClientRect").mockReturnValue({
      top: 100, bottom: 150, left: 200, right: 400,
      width: 200, height: 50,
      x: 200, y: 100,
    } as DOMRect);

    act(() => {
      fireEvent.focus(trigger);
      vi.advanceTimersByTime(200);
    });

    const tooltip = screen.getByRole("tooltip");

    vi.spyOn(tooltip, "getBoundingClientRect").mockReturnValue({
      top: 0, bottom: 40, left: 0, right: 150,
      width: 150, height: 40,
      x: 0, y: 0,
    } as DOMRect);

    rerender(
      React.createElement(
        Tooltip,
        { content: "Tooltip tip", side: "bottom", align: "end" },
        React.createElement("button", null, "Hover")
      )
    );

    // bottom: top = 150 + 8 = 158
    // end: left = 400 - 150 = 250
    expect(tooltip.style.top).toBe("158px");
    expect(tooltip.style.left).toBe("250px");
  });

  it("positions tooltip on left with start alignment", async () => {
    const { Tooltip } = await import("@/components/ui/Tooltip");
    const { container, rerender } = render(
      React.createElement(
        Tooltip,
        { content: "Tooltip tip", side: "bottom", align: "center" },
        React.createElement("button", null, "Hover")
      )
    );

    const trigger = container.querySelector("div")!;

    vi.spyOn(trigger, "getBoundingClientRect").mockReturnValue({
      top: 100, bottom: 150, left: 200, right: 400,
      width: 200, height: 50,
      x: 200, y: 100,
    } as DOMRect);

    act(() => {
      fireEvent.focus(trigger);
      vi.advanceTimersByTime(200);
    });

    const tooltip = screen.getByRole("tooltip");

    vi.spyOn(tooltip, "getBoundingClientRect").mockReturnValue({
      top: 0, bottom: 40, left: 0, right: 150,
      width: 150, height: 40,
      x: 0, y: 0,
    } as DOMRect);

    rerender(
      React.createElement(
        Tooltip,
        { content: "Tooltip tip", side: "left", align: "start" },
        React.createElement("button", null, "Hover")
      )
    );

    // left: top = triggerRect.top = 100 (start alignment for side=left)
    // left: left = 200 - 150 - 8 = 42
    expect(tooltip.style.top).toBe("100px");
    expect(tooltip.style.left).toBe("42px");
  });

  it("positions tooltip on left with end alignment", async () => {
    const { Tooltip } = await import("@/components/ui/Tooltip");
    const { container, rerender } = render(
      React.createElement(
        Tooltip,
        { content: "Tooltip tip", side: "bottom", align: "center" },
        React.createElement("button", null, "Hover")
      )
    );

    const trigger = container.querySelector("div")!;

    vi.spyOn(trigger, "getBoundingClientRect").mockReturnValue({
      top: 100, bottom: 150, left: 200, right: 400,
      width: 200, height: 50,
      x: 200, y: 100,
    } as DOMRect);

    act(() => {
      fireEvent.focus(trigger);
      vi.advanceTimersByTime(200);
    });

    const tooltip = screen.getByRole("tooltip");

    vi.spyOn(tooltip, "getBoundingClientRect").mockReturnValue({
      top: 0, bottom: 40, left: 0, right: 150,
      width: 150, height: 40,
      x: 0, y: 0,
    } as DOMRect);

    rerender(
      React.createElement(
        Tooltip,
        { content: "Tooltip tip", side: "left", align: "end" },
        React.createElement("button", null, "Hover")
      )
    );

    // left: top = 150 - 40 = 110 (end alignment)
    // left: left = 200 - 150 - 8 = 42
    expect(tooltip.style.top).toBe("110px");
    expect(tooltip.style.left).toBe("42px");
  });

  it("positions tooltip on right with start alignment", async () => {
    const { Tooltip } = await import("@/components/ui/Tooltip");
    const { container, rerender } = render(
      React.createElement(
        Tooltip,
        { content: "Tooltip tip", side: "bottom", align: "center" },
        React.createElement("button", null, "Hover")
      )
    );

    const trigger = container.querySelector("div")!;

    vi.spyOn(trigger, "getBoundingClientRect").mockReturnValue({
      top: 100, bottom: 150, left: 200, right: 400,
      width: 200, height: 50,
      x: 200, y: 100,
    } as DOMRect);

    act(() => {
      fireEvent.focus(trigger);
      vi.advanceTimersByTime(200);
    });

    const tooltip = screen.getByRole("tooltip");

    vi.spyOn(tooltip, "getBoundingClientRect").mockReturnValue({
      top: 0, bottom: 40, left: 0, right: 150,
      width: 150, height: 40,
      x: 0, y: 0,
    } as DOMRect);

    rerender(
      React.createElement(
        Tooltip,
        { content: "Tooltip tip", side: "right", align: "start" },
        React.createElement("button", null, "Hover")
      )
    );

    // right: top = triggerRect.top = 100 (start alignment for side=right)
    // right: left = 400 + 8 = 408
    expect(tooltip.style.top).toBe("100px");
    expect(tooltip.style.left).toBe("408px");
  });

  it("positions tooltip on right with end alignment", async () => {
    const { Tooltip } = await import("@/components/ui/Tooltip");
    const { container, rerender } = render(
      React.createElement(
        Tooltip,
        { content: "Tooltip tip", side: "bottom", align: "center" },
        React.createElement("button", null, "Hover")
      )
    );

    const trigger = container.querySelector("div")!;

    vi.spyOn(trigger, "getBoundingClientRect").mockReturnValue({
      top: 100, bottom: 150, left: 200, right: 400,
      width: 200, height: 50,
      x: 200, y: 100,
    } as DOMRect);

    act(() => {
      fireEvent.focus(trigger);
      vi.advanceTimersByTime(200);
    });

    const tooltip = screen.getByRole("tooltip");

    vi.spyOn(tooltip, "getBoundingClientRect").mockReturnValue({
      top: 0, bottom: 40, left: 0, right: 150,
      width: 150, height: 40,
      x: 0, y: 0,
    } as DOMRect);

    rerender(
      React.createElement(
        Tooltip,
        { content: "Tooltip tip", side: "right", align: "end" },
        React.createElement("button", null, "Hover")
      )
    );

    // right: top = 150 - 40 = 110 (end alignment)
    // right: left = 400 + 8 = 408
    expect(tooltip.style.top).toBe("110px");
    expect(tooltip.style.left).toBe("408px");
  });

  it("passes extra event handlers through", async () => {
    const onMouseEnter = vi.fn();
    const onMouseLeave = vi.fn();
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const onMouseMove = vi.fn();

    const { Tooltip } = await import("@/components/ui/Tooltip");
    const { container } = render(
      React.createElement(
        Tooltip,
        { content: "Tip", onMouseEnter, onMouseLeave, onFocus, onBlur, onMouseMove },
        React.createElement("button", null, "Hover")
      )
    );

    const trigger = container.querySelector("div")!;

    act(() => { fireEvent.mouseEnter(trigger); });
    expect(onMouseEnter).toHaveBeenCalledTimes(1);

    act(() => { fireEvent.mouseMove(trigger); });
    expect(onMouseMove).toHaveBeenCalledTimes(1);

    act(() => { fireEvent.mouseLeave(trigger); });
    expect(onMouseLeave).toHaveBeenCalledTimes(1);

    act(() => { fireEvent.focus(trigger); });
    expect(onFocus).toHaveBeenCalledTimes(1);

    act(() => { fireEvent.blur(trigger); });
    expect(onBlur).toHaveBeenCalledTimes(1);
  });
});
