// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, renderHook, act } from "@testing-library/react";
import React from "react";

// Store for our fake localStorage
let store: Record<string, string> = {};

const mockGetItem = vi.fn((key: string) => store[key] ?? null);
const mockSetItem = vi.fn((key: string, value: string) => {
  store[key] = value;
});
const mockRemoveItem = vi.fn((key: string) => {
  delete store[key];
});

vi.stubGlobal("localStorage", {
  getItem: mockGetItem,
  setItem: mockSetItem,
  removeItem: mockRemoveItem,
  clear: vi.fn(() => {
    store = {};
  }),
  get length() {
    return Object.keys(store).length;
  },
  key: vi.fn((i: number) => Object.keys(store)[i] ?? null),
});

vi.mock("@/config/locale", () => ({
  LOCALE_STORAGE_KEY: "shijie-intelligence-locale",
}));

describe("LocaleProvider", () => {
  beforeEach(() => {
    store = {};
    mockGetItem.mockClear();
    mockSetItem.mockClear();
    mockRemoveItem.mockClear();
  });

  it("renders children inside the provider", async () => {
    const { LocaleProvider } = await import("@/components/LocaleProvider");
    render(
      React.createElement(LocaleProvider, { initialLocale: "zh" },
        React.createElement("div", { "data-testid": "child" }, "Hello")
      )
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("throws when useLocale is called outside LocaleProvider", async () => {
    const { useLocale } = await import("@/components/LocaleProvider");
    // renderHook should catch the error from useContext
    expect(() => {
      renderHook(() => useLocale());
    }).toThrow("useLocale must be used within a LocaleProvider");
  });

  it("provides locale context with toggleLocale and setLocale", async () => {
    const { LocaleProvider, useLocale } = await import(
      "@/components/LocaleProvider"
    );

    let localeValue: string | undefined;
    let toggleFn: (() => void) | undefined;

    const Consumer = () => {
      const ctx = useLocale();
      localeValue = ctx.locale;
      toggleFn = ctx.toggleLocale;
      return React.createElement("span", null, ctx.locale);
    };

    render(
      React.createElement(LocaleProvider, { initialLocale: "zh" },
        React.createElement(Consumer)
      )
    );

    // Default locale should be "zh"
    expect(localeValue).toBe("zh");
    expect(screen.getByText("zh")).toBeInTheDocument();

    // Toggle locale
    act(() => {
      toggleFn!();
    });

    // After toggle, should be "en"
    expect(localeValue).toBe("en");

    // Ensure localStorage was updated
    expect(mockSetItem).toHaveBeenCalledWith("shijie-intelligence-locale", "en");
  });

  it("uses the server route locale instead of restoring a conflicting preference", async () => {
    store["shijie-intelligence-locale"] = "en";

    const { LocaleProvider, useLocale } = await import(
      "@/components/LocaleProvider"
    );

    let localeValue: string | undefined;

    const Consumer = () => {
      const ctx = useLocale();
      localeValue = ctx.locale;
      return React.createElement("span", null, ctx.locale);
    };

    render(
      React.createElement(LocaleProvider, { initialLocale: "zh" },
        React.createElement(Consumer)
      )
    );

    expect(localeValue).toBe("zh");
    expect(screen.getByText("zh")).toBeInTheDocument();
    expect(mockGetItem).not.toHaveBeenCalled();
  });

  it("handles localStorage.setItem throw gracefully", async () => {
    mockSetItem.mockImplementationOnce(() => { throw new Error("storage full"); });
    const { LocaleProvider, useLocale } = await import("@/components/LocaleProvider");

    let localeValue: string | undefined;
    const Consumer = () => {
      const ctx = useLocale();
      const setLocale = ctx.setLocale;
      localeValue = ctx.locale;
      React.useEffect(() => setLocale("en"), [setLocale]);
      return null;
    };

    render(React.createElement(LocaleProvider, { initialLocale: "zh" }, React.createElement(Consumer)));
    expect(localeValue).toBe("en");
  });
});
