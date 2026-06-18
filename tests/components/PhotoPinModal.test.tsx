// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PhotoPinModal } from "@/components/PhotoPinModal";

vi.mock("lucide-react", () => ({
  Eye: () => <svg data-testid="eye-icon" />,
  Lock: () => <svg data-testid="lock-icon" />,
  X: () => <svg data-testid="x-icon" />,
}));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function renderModal() {
  const onClose = vi.fn();
  const onSuccess = vi.fn();
  render(<PhotoPinModal open onClose={onClose} onSuccess={onSuccess} />);
  return { onClose, onSuccess };
}

function fillPin(value: string) {
  const inputs = screen.getAllByLabelText(/PIN/);
  value.split("").forEach((digit, index) => {
    fireEvent.change(inputs[index], { target: { value: digit } });
  });
}

describe("PhotoPinModal", () => {
  it("does not render when closed", () => {
    render(<PhotoPinModal open={false} onClose={vi.fn()} onSuccess={vi.fn()} />);

    expect(screen.queryByText("私密照片")).not.toBeInTheDocument();
  });

  it("closes from the icon button", () => {
    const { onClose } = renderModal();

    fireEvent.click(screen.getByLabelText("关闭"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("validates six PIN digits before submitting", async () => {
    vi.stubGlobal("fetch", vi.fn());
    renderModal();

    fireEvent.click(screen.getByText("查看私密照片"));

    expect(await screen.findByText("请输入 6 位 PIN 码")).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("returns a token map on successful PIN verification", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          photos: [
            { id: "private-1", token: "token-abc" },
            { id: "private-2", token: "token-xyz" },
          ],
        }),
      })
    );
    const { onClose, onSuccess } = renderModal();

    fillPin("123456");
    fireEvent.click(screen.getByText("查看私密照片"));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(
        new Map([
          ["private-1", "token-abc"],
          ["private-2", "token-xyz"],
        ])
      );
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("shows status-specific verification errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
      })
    );
    renderModal();

    fillPin("123456");
    fireEvent.click(screen.getByText("查看私密照片"));

    expect(await screen.findByText("PIN 码错误，请重试")).toBeInTheDocument();
  });

  it("shows a disabled-feature error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 501,
      })
    );
    renderModal();

    fillPin("123456");
    fireEvent.click(screen.getByText("查看私密照片"));

    expect(await screen.findByText("私密照片功能未启用")).toBeInTheDocument();
  });

  it("shows a network error when the request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    renderModal();

    fillPin("123456");
    fireEvent.click(screen.getByText("查看私密照片"));

    expect(await screen.findByText("网络错误，请重试")).toBeInTheDocument();
  });
});
