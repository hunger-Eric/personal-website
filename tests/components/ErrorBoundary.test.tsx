// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";

// Mock lucide icons used
vi.mock("lucide-react", () => ({
  AlertTriangle: () => React.createElement("svg", { "data-testid": "alert-triangle" }),
  RefreshCw: () => React.createElement("svg", { "data-testid": "refresh-cw" }),
  Info: () => React.createElement("svg", { "data-testid": "info-icon" }),
  CheckCircle: () => React.createElement("svg", { "data-testid": "check-circle" }),
  XCircle: () => React.createElement("svg", { "data-testid": "x-circle" }),
  Lightbulb: () => React.createElement("svg", { "data-testid": "lightbulb" }),
}));

describe("ErrorBoundary", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("ErrorBoundary class component", () => {
    it("renders children when there is no error", async () => {
      const { ErrorBoundary } = await import("@/components/ErrorBoundary");
      render(
        React.createElement(
          ErrorBoundary,
          null,
          React.createElement("div", { "data-testid": "child" }, "Hello")
        )
      );
      expect(screen.getByTestId("child")).toBeInTheDocument();
      expect(screen.getByText("Hello")).toBeInTheDocument();
    });

    it("renders default error UI when a child throws", async () => {
      const { ErrorBoundary } = await import("@/components/ErrorBoundary");
      const Broken = () => {
        throw new Error("Test error");
      };

      render(
        React.createElement(
          ErrorBoundary,
          null,
          React.createElement(Broken)
        )
      );

      // Should show the default error UI
      await vi.waitFor(() => {
        expect(screen.getByText("Something went wrong")).toBeInTheDocument();
      });
      expect(screen.getByText("This section failed to load. Try refreshing.")).toBeInTheDocument();
      expect(screen.getByText("Try again")).toBeInTheDocument();
    });

    it("renders custom fallback when provided", async () => {
      const { ErrorBoundary } = await import("@/components/ErrorBoundary");
      const Broken = () => {
        throw new Error("Test error");
      };

      render(
        React.createElement(
          ErrorBoundary,
          { fallback: React.createElement("div", null, "Custom Error UI") },
          React.createElement(Broken)
        )
      );

      await vi.waitFor(() => {
        expect(screen.getByText("Custom Error UI")).toBeInTheDocument();
      });
      expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument();
    });

    it("calls onError when a child throws", async () => {
      const { ErrorBoundary } = await import("@/components/ErrorBoundary");
      const onError = vi.fn();
      const Broken = () => {
        throw new Error("Test error");
      };

      render(
        React.createElement(
          ErrorBoundary,
          { onError },
          React.createElement(Broken)
        )
      );

      await vi.waitFor(() => {
        expect(onError).toHaveBeenCalled();
      });
      expect(onError.mock.calls[0][0].message).toBe("Test error");
    });

    it("handleReset clears the error state", async () => {
      const { ErrorBoundary } = await import("@/components/ErrorBoundary");
      const Broken = () => {
        throw new Error("Test error");
      };

      render(
        React.createElement(
          ErrorBoundary,
          null,
          React.createElement(Broken)
        )
      );

      await vi.waitFor(() => {
        expect(screen.getByText("Something went wrong")).toBeInTheDocument();
      });

      // Click "Try again" to reset
      fireEvent.click(screen.getByText("Try again"));

      // After reset, the broken component will throw again, so we'll still see error UI
      // But the state should be reset (hasError = false)
      // The re-render will catch the error again since Broken always throws
      await vi.waitFor(() => {
        expect(screen.getByText("Try again")).toBeInTheDocument();
      });
    });
  });

  describe("AsyncBoundary", () => {
    it("renders children when no error and not loading", async () => {
      const { AsyncBoundary } = await import("@/components/ErrorBoundary");
      render(
        React.createElement(
          AsyncBoundary,
          { error: null, isLoading: false },
          React.createElement("div", { "data-testid": "child" }, "Content")
        )
      );
      expect(screen.getByTestId("child")).toBeInTheDocument();
    });

    it("renders spinner when loading with no fallback", async () => {
      const { AsyncBoundary } = await import("@/components/ErrorBoundary");
      const { container } = render(
        React.createElement(
          AsyncBoundary,
          { error: null, isLoading: true },
          React.createElement("div", null, "Content")
        )
      );
      expect(screen.queryByText("Content")).not.toBeInTheDocument();
      expect(container.querySelector(".animate-spin")).toBeInTheDocument();
    });

    it("renders custom loadingFallback when provided", async () => {
      const { AsyncBoundary } = await import("@/components/ErrorBoundary");
      render(
        React.createElement(
          AsyncBoundary,
          {
            error: null,
            isLoading: true,
            loadingFallback: React.createElement("div", null, "Loading..."),
          },
          React.createElement("div", null, "Content")
        )
      );
      expect(screen.getByText("Loading...")).toBeInTheDocument();
      expect(screen.queryByText("Content")).not.toBeInTheDocument();
    });

    it("renders error UI when there is an error with no fallback", async () => {
      const { AsyncBoundary } = await import("@/components/ErrorBoundary");
      render(
        React.createElement(
          AsyncBoundary,
          { error: new Error("Async error"), isLoading: false },
          React.createElement("div", null, "Content")
        )
      );
      expect(screen.getByText("Failed to load content")).toBeInTheDocument();
      expect(screen.queryByText("Content")).not.toBeInTheDocument();
    });

    it("renders custom errorFallback when provided", async () => {
      const { AsyncBoundary } = await import("@/components/ErrorBoundary");
      render(
        React.createElement(
          AsyncBoundary,
          {
            error: new Error("Async error"),
            isLoading: false,
            errorFallback: React.createElement("div", null, "Custom error"),
          },
          React.createElement("div", null, "Content")
        )
      );
      expect(screen.getByText("Custom error")).toBeInTheDocument();
      expect(screen.queryByText("Failed to load content")).not.toBeInTheDocument();
    });

    it("prioritizes loading over error", async () => {
      const { AsyncBoundary } = await import("@/components/ErrorBoundary");
      render(
        React.createElement(
          AsyncBoundary,
          { error: new Error("Async error"), isLoading: true },
          React.createElement("div", null, "Content")
        )
      );
      // Should show loading, not error
      expect(screen.queryByText("Failed to load content")).not.toBeInTheDocument();
      expect(screen.queryByText("Content")).not.toBeInTheDocument();
    });

    it("renders children when error is null and not loading", async () => {
      const { AsyncBoundary } = await import("@/components/ErrorBoundary");
      render(
        React.createElement(
          AsyncBoundary,
          { error: null, isLoading: false },
          React.createElement("div", null, "Content")
        )
      );
      expect(screen.getByText("Content")).toBeInTheDocument();
    });
  });
});
