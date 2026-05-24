// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows loading state initially", async () => {
    global.fetch = vi.fn().mockImplementation(() => new Promise(() => {})); // Never resolves
    const { AdminEditor } = await import("@/components/admin/AdminEditor");
    render(
      React.createElement(AdminEditor, { title: "Test", description: "Test desc", configKey: "site" },
        (data: any) => React.createElement("div", { "data-testid": "editor-content" }, JSON.stringify(data))
      )
    );
    const spinner = document.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("renders title and save button after load", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ config: { test: true } }), { status: 200 })
    );
    const { AdminEditor } = await import("@/components/admin/AdminEditor");
    render(
      React.createElement(AdminEditor, { title: "Test Editor", description: "Test description", configKey: "site" },
        (data: any) => React.createElement("div", { "data-testid": "editor-content" }, JSON.stringify(data))
      )
    );
    await vi.waitFor(() => {
      expect(screen.getByText("Test Editor")).toBeInTheDocument();
    });
    expect(screen.getByText("保存到 GitHub")).toBeInTheDocument();
  });

  it("shows description text when provided", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ config: { test: true } }), { status: 200 })
    );
    const { AdminEditor } = await import("@/components/admin/AdminEditor");
    render(
      React.createElement(AdminEditor, { title: "Test", description: "Edit site config", configKey: "site" },
        (data: any) => React.createElement("div", null, JSON.stringify(data))
      )
    );
    await vi.waitFor(() => {
      expect(screen.getByText("Edit site config")).toBeInTheDocument();
    });
  });

  it("shows error state when fetch fails", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));
    const { AdminEditor } = await import("@/components/admin/AdminEditor");
    render(
      React.createElement(AdminEditor, { title: "Test", description: "Test", configKey: "site" },
        (data: any) => React.createElement("div", null, JSON.stringify(data))
      )
    );
    await vi.waitFor(() => {
      expect(screen.getByText(/加载失败/)).toBeInTheDocument();
    });
  });

  it("renders children function with data after load", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ config: { hello: "world" } }), { status: 200 })
    );
    const { AdminEditor } = await import("@/components/admin/AdminEditor");
    render(
      React.createElement(AdminEditor, { title: "Test", description: "Test", configKey: "site" },
        (data: any, setData: any) =>
          React.createElement("input", {
            "data-testid": "title-input",
            value: data.hello || "",
            onChange: (e: any) => setData({ ...data, hello: e.target.value }),
          })
      )
    );
    await vi.waitFor(() => {
      const input = screen.getByTestId("title-input") as HTMLInputElement;
      expect(input.value).toBe("world");
    });
  });

  it("sends save request when save button is clicked", async () => {
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
      React.createElement(AdminEditor, { title: "Test", description: "Test", configKey: "site" },
        (data: any, setData: any) => React.createElement("div", null, "Content")
      )
    );

    await vi.waitFor(() => {
      expect(screen.getByText("保存到 GitHub")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("保存到 GitHub"));

    await vi.waitFor(() => {
      expect(fetchCall).not.toBeNull();
      expect(fetchCall.method).toBe("POST");
      expect(fetchCall.headers["Content-Type"]).toBe("application/json");
      const body = JSON.parse(fetchCall.body);
      expect(body.key).toBe("site");
    });
  });

  it("shows success message after save", async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url === "/api/admin/save") {
        return Promise.resolve(
          new Response(JSON.stringify({ message: "Saved: test" }), { status: 200 })
        );
      }
      return Promise.resolve(
        new Response(JSON.stringify({ config: { test: true } }), { status: 200 })
      );
    });

    const { AdminEditor } = await import("@/components/admin/AdminEditor");
    render(
      React.createElement(AdminEditor, { title: "Test", description: "Test", configKey: "site" },
        (data: any) => React.createElement("div", null, "Content")
      )
    );

    await vi.waitFor(() => {
      expect(screen.getByText("保存到 GitHub")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("保存到 GitHub"));

    await vi.waitFor(() => {
      expect(screen.getByText("Saved: test")).toBeInTheDocument();
    });
  });

  it("shows error message when save fails", async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url === "/api/admin/save") {
        return Promise.resolve(
          new Response(JSON.stringify({ error: "Save failed" }), { status: 500 })
        );
      }
      return Promise.resolve(
        new Response(JSON.stringify({ config: { test: true } }), { status: 200 })
      );
    });

    const { AdminEditor } = await import("@/components/admin/AdminEditor");
    render(
      React.createElement(AdminEditor, { title: "Test", description: "Test", configKey: "site" },
        (data: any) => React.createElement("div", null, "Content")
      )
    );

    await vi.waitFor(() => {
      expect(screen.getByText("保存到 GitHub")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("保存到 GitHub"));

    await vi.waitFor(() => {
      expect(screen.getByText(/保存失败/)).toBeInTheDocument();
    });
  });

  it("shows loading spinner on save button while saving", async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url === "/api/admin/save") {
        return new Promise(() => {}); // Never resolve to keep saving state
      }
      return Promise.resolve(
        new Response(JSON.stringify({ config: { test: true } }), { status: 200 })
      );
    });

    const { AdminEditor } = await import("@/components/admin/AdminEditor");
    render(
      React.createElement(AdminEditor, { title: "Test", description: "Test", configKey: "site" },
        (data: any) => React.createElement("div", null, "Content")
      )
    );

    await vi.waitFor(() => {
      expect(screen.getByText("保存到 GitHub")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("保存到 GitHub"));

    await vi.waitFor(() => {
      expect(screen.getByText("保存中...")).toBeInTheDocument();
    });
  });

  it("uses custom loadUrl when provided", async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      expect(url).toBe("/api/custom/endpoint");
      return Promise.resolve(
        new Response(JSON.stringify({ config: { test: true } }), { status: 200 })
      );
    });

    const { AdminEditor } = await import("@/components/admin/AdminEditor");
    render(
      React.createElement(AdminEditor, { title: "Test", description: "Test", configKey: "site", loadUrl: "/api/custom/endpoint" },
        (data: any) => React.createElement("div", null, "Content")
      )
    );

    await vi.waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/custom/endpoint");
    });
  });

  it("uses transformSave when provided", async () => {
    let fetchCall: any = null;
    global.fetch = vi.fn().mockImplementation((url: string, options?: any) => {
      if (url === "/api/admin/save") {
        fetchCall = options;
        return Promise.resolve(
          new Response(JSON.stringify({ message: "Saved" }), { status: 200 })
        );
      }
      return Promise.resolve(
        new Response(JSON.stringify({ config: { name: "test" } }), { status: 200 })
      );
    });

    const { AdminEditor } = await import("@/components/admin/AdminEditor");
    render(
      React.createElement(AdminEditor, {
        title: "Test",
        description: "Test",
        configKey: "site",
        transformSave: (data: any) => ({ transformed: true, original: data }),
      },
        (data: any) => React.createElement("div", null, "Content")
      )
    );

    await vi.waitFor(() => {
      expect(screen.getByText("保存到 GitHub")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("保存到 GitHub"));

    await vi.waitFor(() => {
      expect(fetchCall).not.toBeNull();
      const body = JSON.parse(fetchCall.body);
      expect(body.content.transformed).toBe(true);
    });
  });

  it("handles fetch error during load gracefully", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Failed to load"));
    const { AdminEditor } = await import("@/components/admin/AdminEditor");
    render(
      React.createElement(AdminEditor, { title: "Test", description: "Test", configKey: "site" },
        (data: any) => React.createElement("div", null, "Content")
      )
    );
    await vi.waitFor(() => {
      expect(screen.getByText(/加载失败/)).toBeInTheDocument();
    });
  });
});
