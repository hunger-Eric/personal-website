// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/admin",
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) =>
    <a href={href} data-testid="next-link">{children}</a>,
}));

vi.mock("lucide-react", () => ({
  Save: () => <svg data-testid="save-icon" />,
  ArrowLeft: () => <svg data-testid="arrow-left" />,
}));

describe("AdminEditor", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Mock fetch to return data immediately
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ config: { test: true } }), { status: 200 })
    );
  });

  it("shows loading state initially", async () => {
    // Don't resolve fetch yet to test loading state
    global.fetch = vi.fn().mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );
    const { AdminEditor } = await import("@/components/admin/AdminEditor");
    render(
      <AdminEditor title="Test" description="Test desc" configKey="site">
        {(data: any) => <div data-testid="editor-content">{JSON.stringify(data)}</div>}
      </AdminEditor>
    );
    // Should show spinner while loading
    const spinner = document.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("renders title and save button after load", async () => {
    const { AdminEditor } = await import("@/components/admin/AdminEditor");
    render(
      <AdminEditor title="Test Editor" description="Test description" configKey="site">
        {(data: any) => <div data-testid="editor-content">{JSON.stringify(data)}</div>}
      </AdminEditor>
    );
    // Wait for fetch to resolve
    await vi.waitFor(() => {
      expect(screen.getByText("Test Editor")).toBeInTheDocument();
    });
    expect(screen.getByText("保存到 GitHub")).toBeInTheDocument();
  });
});
