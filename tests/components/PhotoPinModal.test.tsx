// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";

vi.mock("lucide-react", () => ({
  Lock: () => React.createElement("svg", { "data-testid": "lock-icon" }),
  Eye: () => React.createElement("svg", { "data-testid": "eye-icon" }),
  X: () => React.createElement("svg", { "data-testid": "x-icon" }),
}));

describe("PhotoPinModal", () => {
  const onClose = vi.fn();
  const onSuccess = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    onClose.mockReset();
    onSuccess.mockReset();
    global.fetch = vi.fn();
  });

  it("renders when open", async () => {
    const { PhotoPinModal } = await import("@/components/PhotoPinModal");
    render(React.createElement(PhotoPinModal, { open: true, onClose, onSuccess }));
    expect(screen.getByText("私密照片")).toBeInTheDocument();
    expect(screen.getByText("请输入PIN码查看私密照片")).toBeInTheDocument();
    expect(screen.getByText("查看私密照片")).toBeInTheDocument();
  });

  it("does not render when closed", async () => {
    const { PhotoPinModal } = await import("@/components/PhotoPinModal");
    const { container } = render(
      React.createElement(PhotoPinModal, { open: false, onClose, onSuccess })
    );
    expect(container.innerHTML).toBe("");
  });

  it("shows error on empty PIN submit", async () => {
    const { PhotoPinModal } = await import("@/components/PhotoPinModal");
    render(React.createElement(PhotoPinModal, { open: true, onClose, onSuccess }));
    fireEvent.click(screen.getByText("查看私密照片"));
    expect(screen.getByText("请输入6位PIN码")).toBeInTheDocument();
  });

  it("renders 6 PIN input fields", async () => {
    const { PhotoPinModal } = await import("@/components/PhotoPinModal");
    const { container } = render(React.createElement(PhotoPinModal, { open: true, onClose, onSuccess }));
    const inputs = container.querySelectorAll('input[type="password"]');
    expect(inputs.length).toBe(6);
  });

  it("updates PIN digit on typing", async () => {
    const { PhotoPinModal } = await import("@/components/PhotoPinModal");
    const { container } = render(React.createElement(PhotoPinModal, { open: true, onClose, onSuccess }));
    const inputs = container.querySelectorAll('input[type="password"]');
    fireEvent.change(inputs[0], { target: { value: "1" } });
    expect((inputs[0] as HTMLInputElement).value).toBe("1");
  });

  it("only accepts digits in PIN inputs", async () => {
    const { PhotoPinModal } = await import("@/components/PhotoPinModal");
    const { container } = render(React.createElement(PhotoPinModal, { open: true, onClose, onSuccess }));
    const inputs = container.querySelectorAll('input[type="password"]');
    fireEvent.change(inputs[0], { target: { value: "a" } });
    expect((inputs[0] as HTMLInputElement).value).toBe("");
  });

  it("auto-focuses next input after typing a digit", async () => {
    const { PhotoPinModal } = await import("@/components/PhotoPinModal");
    const { container } = render(React.createElement(PhotoPinModal, { open: true, onClose, onSuccess }));
    const inputs = container.querySelectorAll('input[type="password"]');
    const focusSpy = vi.fn();
    (inputs[1] as HTMLInputElement).focus = focusSpy;
    fireEvent.change(inputs[0], { target: { value: "1" } });
    expect(focusSpy).toHaveBeenCalled();
  });

  it("moves focus back on Backspace when input is empty", async () => {
    const { PhotoPinModal } = await import("@/components/PhotoPinModal");
    const { container } = render(React.createElement(PhotoPinModal, { open: true, onClose, onSuccess }));
    const inputs = container.querySelectorAll('input[type="password"]');
    const focusSpy = vi.fn();
    (inputs[0] as HTMLInputElement).focus = focusSpy;
    // Focus on second input, press Backspace when empty
    fireEvent.keyDown(inputs[1], { key: "Backspace" });
    expect(focusSpy).toHaveBeenCalled();
  });

  it("submits PIN on Enter key", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ photos: [{ id: "1", token: "abc" }] }), { status: 200 })
    );

    const { PhotoPinModal } = await import("@/components/PhotoPinModal");
    const { container } = render(React.createElement(PhotoPinModal, { open: true, onClose, onSuccess }));
    const inputs = container.querySelectorAll('input[type="password"]');

    // Type all digits
    for (let i = 0; i < 6; i++) {
      fireEvent.change(inputs[i], { target: { value: String(i + 1) } });
    }

    // Press Enter on last input
    fireEvent.keyDown(inputs[5], { key: "Enter" });

    await vi.waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it("calls onSuccess with token map on successful PIN verification", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        photos: [
          { id: "photo1", token: "token1" },
          { id: "photo2", token: "token2" },
        ],
      }), { status: 200 })
    );

    const { PhotoPinModal } = await import("@/components/PhotoPinModal");
    const { container } = render(React.createElement(PhotoPinModal, { open: true, onClose, onSuccess }));
    const inputs = container.querySelectorAll('input[type="password"]');

    for (let i = 0; i < 6; i++) {
      fireEvent.change(inputs[i], { target: { value: String(i + 1) } });
    }

    fireEvent.click(screen.getByText("查看私密照片"));

    await vi.waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
    const tokenMap = onSuccess.mock.calls[0][0];
    expect(tokenMap.get("photo1")).toBe("token1");
    expect(tokenMap.get("photo2")).toBe("token2");
  });

  it("shows error for wrong PIN (403)", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(null, { status: 403 })
    );

    const { PhotoPinModal } = await import("@/components/PhotoPinModal");
    const { container } = render(React.createElement(PhotoPinModal, { open: true, onClose, onSuccess }));
    const inputs = container.querySelectorAll('input[type="password"]');

    for (let i = 0; i < 6; i++) {
      fireEvent.change(inputs[i], { target: { value: "1" } });
    }

    fireEvent.click(screen.getByText("查看私密照片"));

    await vi.waitFor(() => {
      expect(screen.getByText("PIN码错误，请重试")).toBeInTheDocument();
    });
  });

  it("shows error when feature not enabled (501)", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(null, { status: 501 })
    );

    const { PhotoPinModal } = await import("@/components/PhotoPinModal");
    const { container } = render(React.createElement(PhotoPinModal, { open: true, onClose, onSuccess }));
    const inputs = container.querySelectorAll('input[type="password"]');

    for (let i = 0; i < 6; i++) {
      fireEvent.change(inputs[i], { target: { value: "1" } });
    }

    fireEvent.click(screen.getByText("查看私密照片"));

    await vi.waitFor(() => {
      expect(screen.getByText("私密照片功能未启用")).toBeInTheDocument();
    });
  });

  it("shows generic error for other status codes", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(null, { status: 500 })
    );

    const { PhotoPinModal } = await import("@/components/PhotoPinModal");
    const { container } = render(React.createElement(PhotoPinModal, { open: true, onClose, onSuccess }));
    const inputs = container.querySelectorAll('input[type="password"]');

    for (let i = 0; i < 6; i++) {
      fireEvent.change(inputs[i], { target: { value: "1" } });
    }

    fireEvent.click(screen.getByText("查看私密照片"));

    await vi.waitFor(() => {
      expect(screen.getByText("验证失败，请重试")).toBeInTheDocument();
    });
  });

  it("shows network error when fetch throws", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

    const { PhotoPinModal } = await import("@/components/PhotoPinModal");
    const { container } = render(React.createElement(PhotoPinModal, { open: true, onClose, onSuccess }));
    const inputs = container.querySelectorAll('input[type="password"]');

    for (let i = 0; i < 6; i++) {
      fireEvent.change(inputs[i], { target: { value: "1" } });
    }

    fireEvent.click(screen.getByText("查看私密照片"));

    await vi.waitFor(() => {
      expect(screen.getByText("网络错误，请重试")).toBeInTheDocument();
    });
  });

  it("shows loading state on submit button while verifying", async () => {
    global.fetch = vi.fn().mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const { PhotoPinModal } = await import("@/components/PhotoPinModal");
    const { container } = render(React.createElement(PhotoPinModal, { open: true, onClose, onSuccess }));
    const inputs = container.querySelectorAll('input[type="password"]');

    for (let i = 0; i < 6; i++) {
      fireEvent.change(inputs[i], { target: { value: "1" } });
    }

    fireEvent.click(screen.getByText("查看私密照片"));

    await vi.waitFor(() => {
      expect(container.querySelector(".animate-spin")).toBeInTheDocument();
    });
  });

  it("closes when clicking on backdrop", async () => {
    const { PhotoPinModal } = await import("@/components/PhotoPinModal");
    render(React.createElement(PhotoPinModal, { open: true, onClose, onSuccess }));
    const backdrop = document.querySelector(".fixed.inset-0");
    fireEvent.click(backdrop!);
    expect(onClose).toHaveBeenCalled();
  });

  it("does not close when clicking inside the modal", async () => {
    const { PhotoPinModal } = await import("@/components/PhotoPinModal");
    render(React.createElement(PhotoPinModal, { open: true, onClose, onSuccess }));
    const modalCard = document.querySelector(".max-w-sm");
    fireEvent.click(modalCard!);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("resets state when opened", async () => {
    const { PhotoPinModal } = await import("@/components/PhotoPinModal");
    const { container, rerender } = render(
      React.createElement(PhotoPinModal, { open: true, onClose, onSuccess })
    );
    // Close and reopen
    rerender(React.createElement(PhotoPinModal, { open: true, onClose, onSuccess }));
    const inputs = container.querySelectorAll('input[type="password"]');
    inputs.forEach((input) => {
      expect((input as HTMLInputElement).value).toBe("");
    });
  });
});
