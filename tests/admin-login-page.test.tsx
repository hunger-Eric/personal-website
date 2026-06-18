// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import AdminLoginPage from "@/app/admin/(auth)/login/page";

const pushMock = vi.fn();
let searchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => searchParams,
}));

vi.mock("lucide-react", () => ({
  Lock: () => <svg data-testid="lock-icon" />,
  LogIn: () => <svg data-testid="login-icon" />,
}));

beforeEach(() => {
  vi.clearAllMocks();
  searchParams = new URLSearchParams();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("AdminLoginPage", () => {
  it("renders the admin login shell and disabled submit state", () => {
    render(<AdminLoginPage />);

    expect(screen.getByRole("heading", { level: 1, name: "管理后台" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "访问验证" })).toBeInTheDocument();
    expect(screen.getByLabelText("密码")).toBeInTheDocument();
    expect(screen.getByText("也可以使用访问令牌直接登录。")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "进入管理后台" })).toBeDisabled();
  });

  it("submits the password and redirects to /admin by default", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      })
    );
    render(<AdminLoginPage />);

    fireEvent.change(screen.getByLabelText("密码"), {
      target: { value: "secret" },
    });
    fireEvent.click(screen.getByRole("button", { name: "进入管理后台" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: "secret" }),
      });
      expect(pushMock).toHaveBeenCalledWith("/admin");
    });
  });

  it("uses the redirect search parameter after successful login", async () => {
    searchParams = new URLSearchParams("redirect=/admin/photography");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      })
    );
    render(<AdminLoginPage />);

    fireEvent.change(screen.getByLabelText("密码"), {
      target: { value: "secret" },
    });
    fireEvent.click(screen.getByRole("button", { name: "进入管理后台" }));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/admin/photography");
    });
  });

  it("shows API errors from the login endpoint", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: "密码错误" }),
      })
    );
    render(<AdminLoginPage />);

    fireEvent.change(screen.getByLabelText("密码"), {
      target: { value: "bad" },
    });
    fireEvent.click(screen.getByRole("button", { name: "进入管理后台" }));

    expect(await screen.findByText("密码错误")).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("shows the centralized network error copy", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    render(<AdminLoginPage />);

    fireEvent.change(screen.getByLabelText("密码"), {
      target: { value: "secret" },
    });
    fireEvent.click(screen.getByRole("button", { name: "进入管理后台" }));

    expect(await screen.findByText("网络错误，请重试")).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });
});
