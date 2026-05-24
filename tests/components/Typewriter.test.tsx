// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import React from "react";

describe("Typewriter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders with basic text", async () => {
    const { Typewriter } = await import("@/components/Typewriter");
    const { container } = render(React.createElement(Typewriter, { text: "Hello" }));
    expect(container.querySelector('[role="text"]')).toBeInTheDocument();
    expect(container.querySelector('[role="text"]')).toHaveAttribute("aria-label", "Hello");
  });

  it("shows caret by default", async () => {
    const { Typewriter } = await import("@/components/Typewriter");
    const { container } = render(React.createElement(Typewriter, { text: "Hello" }));
    const caret = container.querySelector(".animate-caret-blink");
    expect(caret).toBeInTheDocument();
  });

  it("hides caret when caret=false", async () => {
    const { Typewriter } = await import("@/components/Typewriter");
    const { container } = render(React.createElement(Typewriter, { text: "Hello", caret: false }));
    expect(container.querySelector(".animate-caret-blink")).not.toBeInTheDocument();
  });

  it("applies custom className", async () => {
    const { Typewriter } = await import("@/components/Typewriter");
    const { container } = render(React.createElement(Typewriter, { text: "Hello", className: "text-2xl" }));
    expect(container.querySelector('[role="text"]')).toHaveClass("text-2xl");
  });

  it("types characters one by one over time", async () => {
    const { Typewriter } = await import("@/components/Typewriter");
    act(() => {
      render(React.createElement(Typewriter, { text: "ABC", speedMs: 50, startDelayMs: 10 }));
    });
    const span = screen.getByRole("text");

    // Initially empty
    expect(span.textContent).toBe("");

    // After start delay only (t=10) — first char appears
    act(() => { vi.advanceTimersByTime(10); });
    expect(span.textContent).toBe("A");

    // After one more tick (t=60) — second char appears
    act(() => { vi.advanceTimersByTime(60); });
    expect(span.textContent).toBe("AB");

    // After final tick (t=110) — all chars typed
    act(() => { vi.advanceTimersByTime(60); });
    expect(span.textContent).toBe("ABC");
  });

  it("sets done state when typing completes and caret shows opacity-0", async () => {
    const { Typewriter } = await import("@/components/Typewriter");
    const { container } = render(React.createElement(Typewriter, { text: "A", speedMs: 50, startDelayMs: 10 }));
    // Complete typing: startDelay(10) + 1 tick(50) = 60ms total
    act(() => { vi.advanceTimersByTime(100); });
    const caret = container.querySelector(".animate-caret-blink");
    expect(caret).toHaveClass("opacity-0");
  });

  it("renders highlighted segment when highlightStart and highlightEnd are provided", async () => {
    const { Typewriter } = await import("@/components/Typewriter");
    const { container } = render(
      React.createElement(Typewriter, {
        text: "Hello World",
        highlightStart: 6,
        highlightEnd: 11,
        speedMs: 50,
        startDelayMs: 10,
      })
    );
    // Type all 11 characters: startDelay(10) + 11*50 = 560ms
    act(() => { vi.advanceTimersByTime(600); });
    const accentSpan = container.querySelector(".text-accent");
    expect(accentSpan).toBeInTheDocument();
    expect(accentSpan?.textContent).toBe("World");
  });

  it("renders with custom accentClassName", async () => {
    const { Typewriter } = await import("@/components/Typewriter");
    const { container } = render(
      React.createElement(Typewriter, {
        text: "Hello World",
        highlightStart: 6,
        highlightEnd: 11,
        accentClassName: "text-blue-500",
        speedMs: 50,
        startDelayMs: 10,
      })
    );
    act(() => { vi.advanceTimersByTime(600); });
    const accentSpan = container.querySelector(".text-blue-500");
    expect(accentSpan).toBeInTheDocument();
    expect(accentSpan?.textContent).toBe("World");
  });

  it("does not render highlight when highlightEnd <= highlightStart", async () => {
    const { Typewriter } = await import("@/components/Typewriter");
    const { container } = render(
      React.createElement(Typewriter, {
        text: "Hello World",
        highlightStart: 6,
        highlightEnd: 3,
        speedMs: 50,
        startDelayMs: 10,
      })
    );
    act(() => { vi.advanceTimersByTime(600); });
    expect(container.querySelector(".text-accent")).not.toBeInTheDocument();
  });

  it("does not render highlight when highlightStart is negative", async () => {
    const { Typewriter } = await import("@/components/Typewriter");
    const { container } = render(
      React.createElement(Typewriter, {
        text: "Hello World",
        highlightStart: -1,
        highlightEnd: 3,
        speedMs: 50,
        startDelayMs: 10,
      })
    );
    act(() => { vi.advanceTimersByTime(600); });
    expect(container.querySelector(".text-accent")).not.toBeInTheDocument();
  });

  it("cleans up timeouts on unmount", async () => {
    const { Typewriter } = await import("@/components/Typewriter");
    const clearTimeoutSpy = vi.spyOn(window, "clearTimeout");
    const { unmount } = render(React.createElement(Typewriter, { text: "Hello", speedMs: 1000, startDelayMs: 1000 }));
    unmount();
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it("stops typing on unmount (cancelled guard)", async () => {
    const { Typewriter } = await import("@/components/Typewriter");
    const { container, unmount } = render(React.createElement(Typewriter, { text: "ABCDE", speedMs: 100, startDelayMs: 10 }));
    // Advance past start delay and first couple ticks
    act(() => { vi.advanceTimersByTime(150); }); // tick 0 and tick 1 fire, then...
    expect(container.querySelector('[role="text"]')?.textContent?.length).toBeGreaterThan(0);
    // Unmount while still typing (tick 2+ are scheduled)
    unmount();
    // Advance remaining time — should NOT throw (cancelled guard prevents setCount)
    act(() => { vi.advanceTimersByTime(500); });
    // No crash = test passes
  });
});
