// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

import { ContactQrCard } from "@/components/contact/ContactQrCard";

vi.mock("lucide-react", () => ({
  ArrowRight: () => React.createElement("svg"),
  MessageCircle: () => React.createElement("svg"),
  X: () => React.createElement("svg"),
}));

describe("contact interactions", () => {
  it("opens and closes a QR modal", () => {
    render(
      React.createElement(ContactQrCard, {
        label: "微信",
        description: "404",
        actionLabel: "查看二维码",
        qrImage: "/images/contact/wechat-official.jpg",
        qrAlt: "QR",
      })
    );

    fireEvent.click(screen.getByRole("button", { name: /查看二维码/i }));
    expect(screen.getByRole("dialog", { name: /微信 QR code/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Close QR code" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
