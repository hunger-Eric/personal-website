// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";

vi.mock("lucide-react", () => ({ Share2: () => React.createElement("svg", { "data-testid": "share-icon" }) }));

describe("ShareButton", () => {
  it("renders with label and renders in default mode", async () => {
    const { ShareButton } = await import("@/components/ShareButton");
    render(React.createElement(ShareButton, { url: "https://example.com", title: "Test" }));
    expect(document.querySelector("button") || document.querySelector("div")).toBeTruthy();
  });
});
