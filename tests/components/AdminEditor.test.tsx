// @vitest-environment jsdom
// Comprehensive tests for AdminEditor — covering load, save, CI polling, deploy polling
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
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

function defaultLoadResponse() {
  return new Response(JSON.stringify({ config: { test: true } }), { status: 200 });
}

describe("AdminEditor — load", () => {
  beforeEach(() => vi.restoreAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it("renders title and save button after successful load", async () => {
    global.fetch = vi.fn().mockResolvedValue(defaultLoadResponse());
    const { AdminEditor } = await import("@/components/admin/AdminEditor");
    render(React.createElement(AdminEditor, { title: "My Editor", description: "Desc", configKey: "site" },
      (data: any) => React.createElement("div", { "data-testid": "content" }, JSON.stringify(data))
    ));
    await vi.waitFor(() => expect(screen.getByText("My Editor")).toBeInTheDocument());
    expect(screen.getByText("Save to GitHub")).toBeInTheDocument();
  });

  it("shows error on load failure", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));
    const { AdminEditor } = await import("@/components/admin/AdminEditor");
    render(React.createElement(AdminEditor, { title: "X", description: "D", configKey: "site" },
      () => React.createElement("div", null, "Content")
    ));
    await vi.waitFor(() => expect(screen.getByText(/Load failed/)).toBeInTheDocument());
  });

  it("shows error on non-ok response without body.error", async () => {
    global.fetch = vi.fn().mockResolvedValue(new Response("Not Found", { status: 404 }));
    const { AdminEditor } = await import("@/components/admin/AdminEditor");
    render(React.createElement(AdminEditor, { title: "X", description: "D", configKey: "site" },
      () => React.createElement("div", null, "Content")
    ));
    await vi.waitFor(() => expect(screen.getByText(/Load failed: Request failed \(404\)/)).toBeInTheDocument());
  });

  it("shows error when config payload is not an object", async () => {
    global.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ config: "string" }), { status: 200 }));
    const { AdminEditor } = await import("@/components/admin/AdminEditor");
    render(React.createElement(AdminEditor, { title: "X", description: "D", configKey: "site" },
      () => React.createElement("div", null, "Content")
    ));
    await vi.waitFor(() => expect(screen.getByText(/Invalid config payload/)).toBeInTheDocument());
  });

  it("uses custom loadUrl when provided", async () => {
    let capturedUrl = "";
    global.fetch = vi.fn().mockImplementation((url: string) => {
      capturedUrl = url;
      return Promise.resolve(defaultLoadResponse());
    });
    const { AdminEditor } = await import("@/components/admin/AdminEditor");
    render(React.createElement(AdminEditor, { title: "X", description: "D", configKey: "site", loadUrl: "/api/custom" },
      () => React.createElement("div", null, "Content")
    ));
    await vi.waitFor(() => expect(screen.getByText("Save to GitHub")).toBeInTheDocument());
    expect(capturedUrl).toBe("/api/custom");
  });
});

describe("AdminEditor — save", () => {
  beforeEach(() => { vi.restoreAllMocks(); });
  afterEach(() => { vi.restoreAllMocks(); });

  async function renderEditor(props: any = {}) {
    const { AdminEditor } = await import("@/components/admin/AdminEditor");
    render(React.createElement(AdminEditor, { title: "X", description: "D", configKey: "site", ...props },
      (data: any) => React.createElement("div", { "data-testid": "content" }, "Content")
    ));
    await vi.waitFor(() => expect(screen.getByText("Save to GitHub")).toBeInTheDocument());
  }

  it("shows success message after save", async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url === "/api/admin/save") {
        return Promise.resolve(new Response(JSON.stringify({ message: "Saved OK" }), { status: 200 }));
      }
      return Promise.resolve(defaultLoadResponse());
    });
    await renderEditor();
    fireEvent.click(screen.getByText("Save to GitHub"));
    await vi.waitFor(() => expect(screen.getByText("Saved OK")).toBeInTheDocument());
  });

  it("shows error on save failure", async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url === "/api/admin/save") {
        return Promise.resolve(new Response(JSON.stringify({ error: "Bad data" }), { status: 400 }));
      }
      return Promise.resolve(defaultLoadResponse());
    });
    await renderEditor();
    fireEvent.click(screen.getByText("Save to GitHub"));
    await vi.waitFor(() => expect(screen.getByText(/Save failed: Bad data/)).toBeInTheDocument());
  });

  it("shows saving spinner during save", async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url === "/api/admin/save") return new Promise(() => {});
      return Promise.resolve(defaultLoadResponse());
    });
    await renderEditor();
    fireEvent.click(screen.getByText("Save to GitHub"));
    await vi.waitFor(() => expect(screen.getByText("Saving...")).toBeInTheDocument());
  });

  it("applies transformSave before sending", async () => {
    let sentBody: any = null;
    global.fetch = vi.fn().mockImplementation((url: string, opts?: any) => {
      if (url === "/api/admin/save") {
        sentBody = JSON.parse(opts.body);
        return Promise.resolve(new Response(JSON.stringify({ message: "Saved" }), { status: 200 }));
      }
      return Promise.resolve(defaultLoadResponse());
    });
    await renderEditor({ transformSave: (d: any) => ({ ...d, transformed: true }) });
    fireEvent.click(screen.getByText("Save to GitHub"));
    await vi.waitFor(() => expect(screen.getByText("Saved")).toBeInTheDocument());
    expect(sentBody.content.transformed).toBe(true);
  });
});

describe("AdminEditor — CI polling", () => {
  beforeEach(() => { vi.restoreAllMocks(); vi.useFakeTimers(); });
  afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers(); });

  async function renderEditor() {
    const { AdminEditor } = await import("@/components/admin/AdminEditor");
    render(React.createElement(AdminEditor, { title: "X", description: "D", configKey: "site" },
      () => React.createElement("div", null, "Content")
    ));
    await vi.waitFor(() => expect(screen.getByText("Save to GitHub")).toBeInTheDocument());
  }

  it("polls CI and shows passed on success", async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url === "/api/admin/save") {
        return Promise.resolve(new Response(JSON.stringify({ message: "Saved" }), { status: 200 }));
      }
      if (url === "/api/admin/ci-status") {
        return Promise.resolve(new Response(JSON.stringify({ status: "completed", conclusion: "success", runNumber: 42 }), { status: 200 }));
      }
      return Promise.resolve(defaultLoadResponse());
    });
    await renderEditor();
    fireEvent.click(screen.getByText("Save to GitHub"));
    await vi.waitFor(() => expect(screen.getByText("Saved")).toBeInTheDocument());
    act(() => { vi.advanceTimersByTime(8000); });
    await vi.waitFor(() => expect(screen.getByText(/CI #42: passed/)).toBeInTheDocument());
  });

  it("polls CI and shows failure", async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url === "/api/admin/save") return Promise.resolve(new Response(JSON.stringify({ message: "Saved" }), { status: 200 }));
      if (url === "/api/admin/ci-status") return Promise.resolve(new Response(JSON.stringify({ status: "completed", conclusion: "failure", runNumber: 7 }), { status: 200 }));
      return Promise.resolve(defaultLoadResponse());
    });
    await renderEditor();
    fireEvent.click(screen.getByText("Save to GitHub"));
    await vi.waitFor(() => expect(screen.getByText("Saved")).toBeInTheDocument());
    act(() => { vi.advanceTimersByTime(8000); });
    await vi.waitFor(() => expect(screen.getByText(/CI #7: failure/)).toBeInTheDocument());
  });

  it("polls CI and shows in_progress", async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url === "/api/admin/save") return Promise.resolve(new Response(JSON.stringify({ message: "Saved" }), { status: 200 }));
      if (url === "/api/admin/ci-status") return Promise.resolve(new Response(JSON.stringify({ status: "in_progress", runNumber: 3 }), { status: 200 }));
      return Promise.resolve(defaultLoadResponse());
    });
    await renderEditor();
    fireEvent.click(screen.getByText("Save to GitHub"));
    await vi.waitFor(() => expect(screen.getByText("Saved")).toBeInTheDocument());
    act(() => { vi.advanceTimersByTime(8000); });
    await vi.waitFor(() => expect(screen.getByText(/CI #3: running/)).toBeInTheDocument());
  });

  it("polls CI and shows queued", async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url === "/api/admin/save") return Promise.resolve(new Response(JSON.stringify({ message: "Saved" }), { status: 200 }));
      if (url === "/api/admin/ci-status") return Promise.resolve(new Response(JSON.stringify({ status: "queued", runNumber: 5 }), { status: 200 }));
      return Promise.resolve(defaultLoadResponse());
    });
    await renderEditor();
    fireEvent.click(screen.getByText("Save to GitHub"));
    await vi.waitFor(() => expect(screen.getByText("Saved")).toBeInTheDocument());
    act(() => { vi.advanceTimersByTime(8000); });
    await vi.waitFor(() => expect(screen.getByText(/CI #5: queued/)).toBeInTheDocument());
  });

  it("polls CI and shows NOT_FOUND", async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url === "/api/admin/save") return Promise.resolve(new Response(JSON.stringify({ message: "Saved" }), { status: 200 }));
      if (url === "/api/admin/ci-status") return Promise.resolve(new Response(JSON.stringify({ status: "NOT_FOUND" }), { status: 200 }));
      return Promise.resolve(defaultLoadResponse());
    });
    await renderEditor();
    fireEvent.click(screen.getByText("Save to GitHub"));
    await vi.waitFor(() => expect(screen.getByText("Saved")).toBeInTheDocument());
    act(() => { vi.advanceTimersByTime(8000); });
    await vi.waitFor(() => expect(screen.getByText(/workflow run not found/)).toBeInTheDocument());
  });

  it("polls CI with non-ok response returns early", async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url === "/api/admin/save") return Promise.resolve(new Response(JSON.stringify({ message: "Saved" }), { status: 200 }));
      if (url === "/api/admin/ci-status") return Promise.resolve(new Response("", { status: 500 }));
      return Promise.resolve(defaultLoadResponse());
    });
    await renderEditor();
    fireEvent.click(screen.getByText("Save to GitHub"));
    await vi.waitFor(() => expect(screen.getByText("Saved")).toBeInTheDocument());
    act(() => { vi.advanceTimersByTime(8000); });
    // No CI message means the !res.ok early return was hit
    expect(screen.queryByText(/CI/)).not.toBeInTheDocument();
  });

  it("polls CI with cancelled conclusion", async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url === "/api/admin/save") return Promise.resolve(new Response(JSON.stringify({ message: "Saved" }), { status: 200 }));
      if (url === "/api/admin/ci-status") return Promise.resolve(new Response(JSON.stringify({ status: "completed", conclusion: "cancelled", runNumber: 9 }), { status: 200 }));
      return Promise.resolve(defaultLoadResponse());
    });
    await renderEditor();
    fireEvent.click(screen.getByText("Save to GitHub"));
    await vi.waitFor(() => expect(screen.getByText("Saved")).toBeInTheDocument());
    act(() => { vi.advanceTimersByTime(8000); });
    await vi.waitFor(() => expect(screen.getByText(/CI #9: cancelled/)).toBeInTheDocument());
  });

  it("polls CI completed with no conclusion (falls back to 'failed')", async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url === "/api/admin/save") return Promise.resolve(new Response(JSON.stringify({ message: "Saved" }), { status: 200 }));
      if (url === "/api/admin/ci-status") return Promise.resolve(new Response(JSON.stringify({ status: "completed" }), { status: 200 }));
      return Promise.resolve(defaultLoadResponse());
    });
    await renderEditor();
    fireEvent.click(screen.getByText("Save to GitHub"));
    await vi.waitFor(() => expect(screen.getByText("Saved")).toBeInTheDocument());
    act(() => { vi.advanceTimersByTime(8000); });
    await vi.waitFor(() => expect(screen.getByText(/failed/)).toBeInTheDocument());
  });
});

describe("AdminEditor — deploy polling", () => {
  beforeEach(() => { vi.restoreAllMocks(); vi.useFakeTimers(); });
  afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers(); });

  async function renderEditor() {
    const { AdminEditor } = await import("@/components/admin/AdminEditor");
    render(React.createElement(AdminEditor, { title: "X", description: "D", configKey: "site" },
      () => React.createElement("div", null, "Content")
    ));
    await vi.waitFor(() => expect(screen.getByText("Save to GitHub")).toBeInTheDocument());
  }

  it("shows deployed on READY", async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url === "/api/admin/save") return Promise.resolve(new Response(JSON.stringify({ deployId: "dep_123", message: "Saved" }), { status: 200 }));
      if (url?.startsWith("/api/admin/deploy-status?deployId=dep_123")) return Promise.resolve(new Response(JSON.stringify({ status: "READY" }), { status: 200 }));
      return Promise.resolve(defaultLoadResponse());
    });
    await renderEditor();
    fireEvent.click(screen.getByText("Save to GitHub"));
    await vi.waitFor(() => expect(screen.getByText("Saved")).toBeInTheDocument());
    act(() => { vi.advanceTimersByTime(5000); });
    await vi.waitFor(() => expect(screen.getByText(/site saved and deployed/)).toBeInTheDocument());
  });

  it("shows deploy failed on ERROR", async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url === "/api/admin/save") return Promise.resolve(new Response(JSON.stringify({ deployId: "dep_456", message: "Saved" }), { status: 200 }));
      if (url?.startsWith("/api/admin/deploy-status?deployId=dep_456")) return Promise.resolve(new Response(JSON.stringify({ status: "ERROR" }), { status: 200 }));
      return Promise.resolve(defaultLoadResponse());
    });
    await renderEditor();
    fireEvent.click(screen.getByText("Save to GitHub"));
    await vi.waitFor(() => expect(screen.getByText("Saved")).toBeInTheDocument());
    act(() => { vi.advanceTimersByTime(5000); });
    await vi.waitFor(() => expect(screen.getByText(/auto-deploy failed/)).toBeInTheDocument());
  });

  it("shows deploying during intermediate status", async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url === "/api/admin/save") return Promise.resolve(new Response(JSON.stringify({ deployId: "dep_789", message: "Saved" }), { status: 200 }));
      if (url?.startsWith("/api/admin/deploy-status?deployId=dep_789")) return Promise.resolve(new Response(JSON.stringify({ status: "BUILDING" }), { status: 200 }));
      return Promise.resolve(defaultLoadResponse());
    });
    await renderEditor();
    fireEvent.click(screen.getByText("Save to GitHub"));
    await vi.waitFor(() => expect(screen.getByText("Saved")).toBeInTheDocument());
    act(() => { vi.advanceTimersByTime(5000); });
    await vi.waitFor(() => expect(screen.getByText(/Deploying to Vercel/)).toBeInTheDocument());
  });
});
