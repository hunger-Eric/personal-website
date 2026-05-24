// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock("next/image", () => ({
  default: (p: any) => React.createElement("img", p),
}));

vi.mock("next/link", () => ({
  default: (p: any) => React.createElement("a", p),
}));

vi.mock("lucide-react", () => ({}));

// Mutable state for experience data
const expData = vi.hoisted(() => [] as any[]);
vi.mock("@/config/experience", () => ({ experience: expData }));

// ── Test data ──────────────────────────────────────────────────────────────

const BASE = [
  {
    id: "job1", role: "Software Engineer", company: "TechCorp LLC",
    logoUrl: "/logos/techcorp.png", start: "Jan 2023", end: "Present",
    description: ["Built features", "Fixed bugs", "Wrote tests", "Optimized queries"],
  },
  {
    id: "job2", role: "Intern", company: "Startup Inc.",
    start: "Jun 2022", end: "Aug 2022", description: ["Learned React", "Built a dashboard"],
  },
];

// ── Tests ──────────────────────────────────────────────────────────────────

describe("ExperienceSection", () => {
  beforeEach(() => {
    expData.length = 0;
  });

  it("renders nothing when experience array is empty", async () => {
    expData.length = 0;
    const { ExperienceSection } = await import("@/components/sections/Experience");
    const { container } = render(React.createElement(ExperienceSection));
    expect(container.innerHTML).toBe("");
  });

  it("renders section heading", async () => {
    expData.push(...BASE);
    const { ExperienceSection } = await import("@/components/sections/Experience");
    render(React.createElement(ExperienceSection));
    expect(screen.getByText("~/Experience")).toBeTruthy();
  });

  it("formats company names correctly (LLC -> , LLC)", async () => {
    expData.push(...BASE);
    const { ExperienceSection } = await import("@/components/sections/Experience");
    render(React.createElement(ExperienceSection));
    expect(screen.getByText("TechCorp, LLC")).toBeTruthy();
  });

  it("shows first item as active by default", async () => {
    expData.push(...BASE);
    const { ExperienceSection } = await import("@/components/sections/Experience");
    render(React.createElement(ExperienceSection));
    expect(screen.getByText(/Software Engineer/)).toBeTruthy();
    expect(screen.getByText(/@ TechCorp, LLC/)).toBeTruthy();
  });

  it("renders dates for active item", async () => {
    expData.push(...BASE);
    const { ExperienceSection } = await import("@/components/sections/Experience");
    render(React.createElement(ExperienceSection));
    expect(screen.getByText("Jan 2023 - Present")).toBeTruthy();
  });

  it("switches to second item on click", async () => {
    expData.push(...BASE);
    const { ExperienceSection } = await import("@/components/sections/Experience");
    render(React.createElement(ExperienceSection));
    const buttons = screen.getAllByRole("button");
    const secondBtn = buttons.find((b) => b.textContent?.includes("Startup"));
    expect(secondBtn).toBeTruthy();
    fireEvent.click(secondBtn!);
    expect(screen.getByText(/Intern/)).toBeTruthy();
    expect(screen.getByText(/@ Startup, Inc./)).toBeTruthy();
    expect(screen.getByText("Jun 2022 - Aug 2022")).toBeTruthy();
  });

  it("renders logo image when logoUrl is provided", async () => {
    expData.push(...BASE);
    const { ExperienceSection } = await import("@/components/sections/Experience");
    const { container } = render(React.createElement(ExperienceSection));
    const imgs = container.querySelectorAll("img");
    const logo = Array.from(imgs).find((img) => img.getAttribute("alt") === "TechCorp LLC logo");
    expect(logo).toBeTruthy();
    expect(logo?.getAttribute("src")).toBe("/logos/techcorp.png");
  });

  it("renders company initials when no logoUrl", async () => {
    expData.push(...BASE);
    const { ExperienceSection } = await import("@/components/sections/Experience");
    render(React.createElement(ExperienceSection));
    const buttons = screen.getAllByRole("button");
    const secondBtn = buttons.find((b) => b.textContent?.includes("Startup"));
    fireEvent.click(secondBtn!);
    expect(screen.getByText("SI")).toBeTruthy();
  });

  it("renders max 3 description bullets", async () => {
    expData.push(...BASE);
    const { ExperienceSection } = await import("@/components/sections/Experience");
    const { container } = render(React.createElement(ExperienceSection));
    // Only count description bullets (inside marker:text-indigo-400/70 ul), not sidebar tab li's
    const descUl = container.querySelector('ul[class*="marker\\:text-indigo"]') || container.querySelector('ul.list-disc');
    const listItems = descUl ? descUl.querySelectorAll("li") : [];
    expect(listItems.length).toBe(3);
    expect(listItems[0]?.textContent).toContain("Built features");
    expect(listItems[1]?.textContent).toContain("Fixed bugs");
    expect(listItems[2]?.textContent).toContain("Wrote tests");
    expect(screen.queryByText("Optimized queries")).toBeFalsy();
  });

  it("does not render description when empty", async () => {
    expData.push(...[{
      id: "empty", role: "Consultant", company: "Freelance Co.",
      start: "Jan 2021", end: "Dec 2021", description: [],
    }]);
    const { ExperienceSection } = await import("@/components/sections/Experience");
    const { container } = render(React.createElement(ExperienceSection));
    // The sidebar <ul> is always present, check description <ul> specifically
    const descUl = container.querySelector('ul[class*="marker\\:text-indigo"]') || container.querySelector('ul.list-disc');
    expect(descUl).toBeFalsy();
  });

  it("formats various company suffixes", async () => {
    expData.push(
      { id: "c1", role: "R1", company: "Acme Inc.", start: "", end: "", description: [] },
      { id: "c2", role: "R2", company: "Big Corp.", start: "", end: "", description: [] },
      { id: "c3", role: "R3", company: "Small Ltd", start: "", end: "", description: [] },
      { id: "c4", role: "R4", company: "Global Co.", start: "", end: "", description: [] },
    );
    const { ExperienceSection } = await import("@/components/sections/Experience");
    render(React.createElement(ExperienceSection));
    expect(screen.getByText("Acme, Inc.")).toBeTruthy();
    expect(screen.getByText("Big, Corp.")).toBeTruthy();
    expect(screen.getByText("Small, Ltd")).toBeTruthy();
    expect(screen.getByText("Global, Co.")).toBeTruthy();
  });

  it("computes initials for multi-word and single-word companies", async () => {
    expData.push(
      { id: "s1", role: "R", company: "St. Mary's University", start: "", end: "", description: [] },
      { id: "s2", role: "R", company: "Microsoft", start: "", end: "", description: [] },
      { id: "s3", role: "R", company: "IBM", start: "", end: "", description: [] },
    );
    const { ExperienceSection } = await import("@/components/sections/Experience");
    render(React.createElement(ExperienceSection));
    expect(screen.getByText("SM")).toBeTruthy();
    expect(screen.getByText("MI")).toBeTruthy();
    expect(screen.getByText("IB")).toBeTruthy();
  });

  it("single experience item renders", async () => {
    expData.push(...[BASE[0]]);
    const { ExperienceSection } = await import("@/components/sections/Experience");
    render(React.createElement(ExperienceSection));
    expect(screen.getByText("TechCorp, LLC")).toBeTruthy();
    expect(screen.getByText(/Software Engineer/)).toBeTruthy();
  });

  it("logo has correct sizes attribute", async () => {
    expData.push(...BASE);
    const { ExperienceSection } = await import("@/components/sections/Experience");
    const { container } = render(React.createElement(ExperienceSection));
    const img = container.querySelector("img");
    expect(img?.getAttribute("sizes")).toBe("32px");
  });
});
