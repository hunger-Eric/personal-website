// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/admin",
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) =>
    React.createElement("a", { href, "data-testid": "next-link" }, children),
}));

vi.mock("lucide-react", () => ({
  Save: () => React.createElement("svg", { "data-testid": "save-icon" }),
  ArrowLeft: () => React.createElement("svg", { "data-testid": "arrow-left" }),
}));

describe("AdminEditor", () => {
  beforeEach(() => vi.restoreAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it("renders title and save button after load", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ config: { test: true } }), { status: 200 })
    );
    const { AdminEditor } = await import("@/components/admin/AdminEditor");
    render(
      React.createElement(
        AdminEditor,
        { title: "Test Editor", description: "Test description", configKey: "site" },
        (data: any) =>
          React.createElement("div", { "data-testid": "editor-content" }, JSON.stringify(data))
      )
    );

    await vi.waitFor(() => expect(screen.getByText("Test Editor")).toBeInTheDocument());
    expect(screen.getByText("Save to GitHub")).toBeInTheDocument();
  });

  it("shows load error state", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));
    const { AdminEditor } = await import("@/components/admin/AdminEditor");
    render(
      React.createElement(
        AdminEditor,
        { title: "Test", description: "Test", configKey: "site" },
        () => React.createElement("div", null, "Content")
      )
    );
    await vi.waitFor(() =>
      expect(screen.getByText(/Load failed/)).toBeInTheDocument()
    );
  });

  it("sends save request and shows success message", async () => {
    let fetchCall: any = null;
    global.fetch = vi.fn().mockImplementation((url: string, options?: any) => {
      if (url === "/api/admin/save") {
        fetchCall = options;
        return Promise.resolve(
          new Response(JSON.stringify({ message: "Saved successfully" }), { status: 200 })
        );
      }
      return Promise.resolve(
        new Response(JSON.stringify({ config: { test: true } }), { status: 200 })
      );
    });

    const { AdminEditor } = await import("@/components/admin/AdminEditor");
    render(
      React.createElement(
        AdminEditor,
        { title: "Test", description: "Test", configKey: "site" },
        () => React.createElement("div", null, "Content")
      )
    );

    await vi.waitFor(() =>
      expect(screen.getByText("Save to GitHub")).toBeInTheDocument()
    );
    fireEvent.click(screen.getByText("Save to GitHub"));

    await vi.waitFor(() => {
      expect(fetchCall).not.toBeNull();
      expect(screen.getByText("Saved successfully")).toBeInTheDocument();
    });
  });

  it("shows saving state", async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url === "/api/admin/save") return new Promise(() => {});
      return Promise.resolve(
        new Response(JSON.stringify({ config: { test: true } }), { status: 200 })
      );
    });

    const { AdminEditor } = await import("@/components/admin/AdminEditor");
    render(
      React.createElement(
        AdminEditor,
        { title: "Test", description: "Test", configKey: "site" },
        () => React.createElement("div", null, "Content")
      )
    );

    await vi.waitFor(() =>
      expect(screen.getByText("Save to GitHub")).toBeInTheDocument()
    );
    fireEvent.click(screen.getByText("Save to GitHub"));
    await vi.waitFor(() => expect(screen.getByText("Saving...")).toBeInTheDocument());
  });
});
