// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("lucide-react", () => ({
  Lock: () => <svg data-testid="lock-icon" />,
  Eye: () => <svg data-testid="eye-icon" />,
  X: () => <svg data-testid="x-icon" />,
}));

import { PhotoPinModal } from "@/components/PhotoPinModal";

describe("PhotoPinModal", () => {
  it("renders when open", () => {
    render(<PhotoPinModal open={true} onClose={vi.fn()} onSuccess={vi.fn()} />);
    expect(screen.getByText("私密照片")).toBeInTheDocument();
    expect(screen.getByText("请输入PIN码查看私密照片")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    const { container } = render(
      <PhotoPinModal open={false} onClose={vi.fn()} onSuccess={vi.fn()} />
    );
    expect(container.innerHTML).toBe("");
  });

  it("shows error on empty PIN submit", () => {
    render(<PhotoPinModal open={true} onClose={vi.fn()} onSuccess={vi.fn()} />);
    fireEvent.click(screen.getByText("查看私密照片"));
    expect(screen.getByText("请输入6位PIN码")).toBeInTheDocument();
  });
});
