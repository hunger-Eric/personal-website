// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";

vi.mock("lucide-react", () => {
  const Icon = (props: any) => React.createElement("svg", { ...props, "data-testid": "lucide-icon" });
  return { Sun: Icon, Moon: Icon, Monitor: Icon };
});

const mockToggleTheme = vi.fn();
const mockSetTheme = vi.fn();

let mockTheme = "dark";
let mockResolvedTheme = "dark";

vi.mock("@/components/ThemeProvider", () => ({
  useTheme: () => ({
    theme: mockTheme,
    resolvedTheme: mockResolvedTheme,
    toggleTheme: mockToggleTheme,
    setTheme: mockSetTheme,
  }),
}));

vi.mock("@/config/theme", () => ({
  themeConfig: { allowToggle: true, respectSystemPreference: true, defaultMode: "dark" },
  default: { allowToggle: true, respectSystemPreference: true, defaultMode: "dark" },
}));

describe("ThemeToggle", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockToggleTheme.mockReset();
    mockSetTheme.mockReset();
    mockTheme = "dark";
    mockResolvedTheme = "dark";
  });

  it("renders toggle button", async () => {
    const { ThemeToggle } = await import("@/components/ThemeToggle");
    const { container } = render(React.createElement(ThemeToggle));
    const btn = container.querySelector("button");
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute("aria-label");
    expect(btn).toHaveAttribute("title", "Theme: Dark");
  });

  it("calls toggleTheme on click", async () => {
    const { ThemeToggle } = await import("@/components/ThemeToggle");
    render(React.createElement(ThemeToggle));
    const btn = screen.getByRole("button");
    fireEvent.click(btn);
    expect(mockToggleTheme).toHaveBeenCalledOnce();
  });

  it("shows label when showLabel is true", async () => {
    const { ThemeToggle } = await import("@/components/ThemeToggle");
    render(React.createElement(ThemeToggle, { showLabel: true }));
    expect(screen.getByText("Dark")).toBeInTheDocument();
  });

  it("shows light label when resolvedTheme is light", async () => {
    mockTheme = "light";
    mockResolvedTheme = "light";
    const { ThemeToggle } = await import("@/components/ThemeToggle");
    const { container } = render(React.createElement(ThemeToggle, { showLabel: true }));
    expect(screen.getByText("Light")).toBeInTheDocument();
  });

  it("shows System label when theme is system", async () => {
    mockTheme = "system";
    mockResolvedTheme = "dark";
    const { ThemeToggle } = await import("@/components/ThemeToggle");
    render(React.createElement(ThemeToggle, { showLabel: true }));
    expect(screen.getByText("System")).toBeInTheDocument();
  });

  it("applies custom className", async () => {
    const { ThemeToggle } = await import("@/components/ThemeToggle");
    const { container } = render(React.createElement(ThemeToggle, { className: "custom-cls" }));
    const btn = container.querySelector("button");
    expect(btn?.className).toContain("custom-cls");
  });
});

describe("ThemeDropdown", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockSetTheme.mockReset();
    mockTheme = "dark";
    mockResolvedTheme = "dark";
  });

  it("renders select element", async () => {
    const { ThemeDropdown } = await import("@/components/ThemeToggle");
    render(React.createElement(ThemeDropdown));
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("shows system option when respectSystemPreference is true", async () => {
    const { ThemeDropdown } = await import("@/components/ThemeToggle");
    render(React.createElement(ThemeDropdown));
    expect(screen.getByText("System")).toBeInTheDocument();
  });

  it("calls setTheme on change", async () => {
    const { ThemeDropdown } = await import("@/components/ThemeToggle");
    render(React.createElement(ThemeDropdown));
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "light" } });
    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });

  it("applies custom className", async () => {
    const { ThemeDropdown } = await import("@/components/ThemeToggle");
    const { container } = render(React.createElement(ThemeDropdown, { className: "my-class" }));
    expect(container.innerHTML).toContain("my-class");
  });
});
