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

// Mock the locale config
const mockGetTranslations = vi.fn((locale: string) => {
  if (locale === "en") return { hero: { greeting: "Hi, I am" } };
  return { hero: { greeting: "你好，我是" } };
});

vi.mock("@/config/locale", () => ({
  LOCALE_STORAGE_KEY: "devfoliox-locale",
  getTranslations: (locale: string) => mockGetTranslations(locale),
}));

describe("LocaleProvider", () => {
  beforeEach(() => {
    store = {};
    mockGetItem.mockClear();
    mockSetItem.mockClear();
    mockRemoveItem.mockClear();
    mockGetTranslations.mockClear();
  });

  it("renders children inside the provider", async () => {
    const { LocaleProvider } = await import("@/components/LocaleProvider");
    render(
      React.createElement(LocaleProvider, null,
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
      React.createElement(LocaleProvider, null,
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
    expect(mockSetItem).toHaveBeenCalledWith("devfoliox-locale", "en");
  });

  it("reads initial locale from localStorage", async () => {
    // Set localStorage before importing
    store["devfoliox-locale"] = "en";

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
      React.createElement(LocaleProvider, null,
        React.createElement(Consumer)
      )
    );

    expect(localeValue).toBe("en");
    expect(screen.getByText("en")).toBeInTheDocument();
  });
});
