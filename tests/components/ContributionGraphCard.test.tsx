// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

// Mock fetch so the component's API calls don't actually fire
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("ContributionGraphCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Return empty contribution data so the component renders without error
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ days: [] }),
    });
  });

  it("renders without crashing and shows the default title", async () => {
    const { ContributionGraphCard } = await import(
      "@/components/ContributionGraphCard"
    );
    const { container } = render(React.createElement(ContributionGraphCard));
    // The component renders a section with the title
    expect(screen.getByText(/Contribution Graph/i)).toBeInTheDocument();
    // Verify the section is in the DOM
    const section = container.querySelector("section");
    expect(section).toBeInTheDocument();
  });

  it("renders with a custom title", async () => {
    const { ContributionGraphCard } = await import(
      "@/components/ContributionGraphCard"
    );
    render(
      React.createElement(ContributionGraphCard, { title: "My Activity" })
    );
    expect(screen.getByText(/My Activity/i)).toBeInTheDocument();
  });

  it("renders year selector buttons", async () => {
    const { ContributionGraphCard } = await import(
      "@/components/ContributionGraphCard"
    );
    render(React.createElement(ContributionGraphCard));
    // Should show the current year in the button selector
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(String(currentYear))).toBeInTheDocument();
  });

  it("handles fetch errors gracefully (does not crash)", async () => {
    // Override mock to reject
    mockFetch.mockRejectedValue(new Error("Network error"));

    const { ContributionGraphCard } = await import(
      "@/components/ContributionGraphCard"
    );
    // Should not throw even with fetch error
    expect(() => {
      render(React.createElement(ContributionGraphCard));
    }).not.toThrow();
  });
});
