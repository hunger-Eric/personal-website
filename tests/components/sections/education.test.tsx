// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock("next/image", () => ({
  default: (p: any) => React.createElement("img", p),
}));

vi.mock("next/link", () => ({
  default: (p: any) => React.createElement("a", p),
}));

vi.mock("lucide-react", () => ({
  MapPin: () => React.createElement("svg", { "data-testid": "icon-map-pin" }),
  Calendar: () => React.createElement("svg", { "data-testid": "icon-calendar" }),
}));

// Mutable array that keeps the same reference
const eduData = vi.hoisted(() => [] as any[]);
vi.mock("@/config/education", () => ({ education: eduData }));

// ── Test data presets ──────────────────────────────────────────────────────

const makeFull = () => [{
  id: "uh", school: "University of Houston", degree: "Bachelor of Science",
  major: "Computer Science", minor: "Mathematics", location: "Houston, TX",
  start: "Aug 2020", end: "May 2024", gpa: "3.8/4.0",
  coursework: ["Data Structures", "Algorithms"], activities: ["ACM", "Hackathons"],
  awards: ["Dean's List", "Scholarship"], imageUrl: "/images/uh.jpg",
}];

const makeNoImage = () => [{
  id: "online", school: "Online University", degree: "Master", major: "Data Science",
  start: "2023", end: "2025", gpa: "3.9/4.0",
}];

const makeMinimal = () => [{
  id: "course", school: "Code Academy", degree: "Certificate",
  start: "", end: "", expectedGraduation: "Dec 2025",
}];

const makeOnlyExpected = () => [{
  id: "future", school: "Future University", degree: "PhD",
  start: "", end: "", expectedGraduation: "Jun 2028", location: "Virtual",
}];

// ── Tests ──────────────────────────────────────────────────────────────────

describe("EducationSection", () => {
  beforeEach(() => {
    eduData.length = 0;
  });

  it("renders nothing when education array is empty", async () => {
    eduData.length = 0;
    const { EducationSection } = await import("@/components/sections/Education");
    const { container } = render(React.createElement(EducationSection));
    expect(container.innerHTML).toBe("");
  });

  it("renders the section heading and subtitle", async () => {
    eduData.push(...makeFull());
    const { EducationSection } = await import("@/components/sections/Education");
    render(React.createElement(EducationSection));
    expect(screen.getByText("~/Education")).toBeTruthy();
    expect(screen.getByText(/Where I've been studying/)).toBeTruthy();
  });

  it("renders school name and degree", async () => {
    eduData.push(...makeFull());
    const { EducationSection } = await import("@/components/sections/Education");
    render(React.createElement(EducationSection));
    expect(screen.getByText("University of Houston")).toBeTruthy();
    expect(screen.getByText(/Bachelor of Science/)).toBeTruthy();
  });

  it("renders major, minor, and GPA", async () => {
    eduData.push(...makeFull());
    const { EducationSection } = await import("@/components/sections/Education");
    render(React.createElement(EducationSection));
    expect(screen.getByText(/Computer Science/)).toBeTruthy();
    expect(screen.getByText(/Minor in Mathematics/)).toBeTruthy();
    expect(screen.getByText(/GPA: 3.8/)).toBeTruthy();
  });

  it("renders date range with Calendar icon", async () => {
    eduData.push(...makeFull());
    const { EducationSection } = await import("@/components/sections/Education");
    const { container } = render(React.createElement(EducationSection));
    expect(screen.getByText("Aug 2020 — May 2024")).toBeTruthy();
    expect(container.querySelector('[data-testid="icon-calendar"]')).toBeTruthy();
  });

  it("renders location with MapPin icon", async () => {
    eduData.push(...makeFull());
    const { EducationSection } = await import("@/components/sections/Education");
    const { container } = render(React.createElement(EducationSection));
    expect(screen.getByText("Houston, TX")).toBeTruthy();
    expect(container.querySelector('[data-testid="icon-map-pin"]')).toBeTruthy();
  });

  it("renders awards, activities, and coursework", async () => {
    eduData.push(...makeFull());
    const { EducationSection } = await import("@/components/sections/Education");
    render(React.createElement(EducationSection));
    expect(screen.getByText(/Dean's List/)).toBeTruthy();
    expect(screen.getByText(/ACM/)).toBeTruthy();
    expect(screen.getByText(/Data Structures/)).toBeTruthy();
  });

  it("renders image when imageUrl is provided", async () => {
    eduData.push(...makeFull());
    const { EducationSection } = await import("@/components/sections/Education");
    const { container } = render(React.createElement(EducationSection));
    const img = container.querySelector("img");
    expect(img).toBeTruthy();
    expect(img?.getAttribute("src")).toBe("/images/uh.jpg");
  });

  it("does not render image when imageUrl is absent", async () => {
    eduData.push(...makeNoImage());
    const { EducationSection } = await import("@/components/sections/Education");
    const { container } = render(React.createElement(EducationSection));
    expect(container.querySelector("img")).toBeFalsy();
  });

  it("handles empty start/end with expectedGraduation", async () => {
    eduData.push(...makeMinimal());
    const { EducationSection } = await import("@/components/sections/Education");
    render(React.createElement(EducationSection));
    expect(screen.getByText(/Expected Graduation: Dec 2025/)).toBeTruthy();
  });

  it("handles expectedGraduation with location", async () => {
    eduData.push(...makeOnlyExpected());
    const { EducationSection } = await import("@/components/sections/Education");
    render(React.createElement(EducationSection));
    expect(screen.getByText("Future University")).toBeTruthy();
    expect(screen.getByText(/Expected Graduation: Jun 2028/)).toBeTruthy();
    expect(screen.getByText("Virtual")).toBeTruthy();
  });

  it("renders without GPA when gpa absent", async () => {
    eduData.push(...makeNoImage().map((e: any) => ({ ...e, gpa: undefined })));
    const { EducationSection } = await import("@/components/sections/Education");
    render(React.createElement(EducationSection));
    expect(screen.queryByText(/GPA/)).toBeFalsy();
  });

  it("does not render awards/activities/coursework when empty", async () => {
    eduData.push(...[{
      id: "basic", school: "Basic School", degree: "Associate", major: "IT",
    }]);
    const { EducationSection } = await import("@/components/sections/Education");
    render(React.createElement(EducationSection));
    expect(screen.queryByText("Awards:")).toBeFalsy();
    expect(screen.queryByText("Activities and societies:")).toBeFalsy();
    expect(screen.queryByText("Relevant coursework:")).toBeFalsy();
  });

  it("parses GPA correctly with extra text", async () => {
    eduData.push(...[{
      id: "w", school: "Some School", degree: "BS", gpa: "3.75 / 4.0 (Honors)",
    }]);
    const { EducationSection } = await import("@/components/sections/Education");
    render(React.createElement(EducationSection));
    expect(screen.getByText(/GPA: 3.75/)).toBeTruthy();
  });

  it("handles multiple education items", async () => {
    eduData.push(
      { id: "uh", school: "University of Houston", degree: "BS", major: "CS", start: "Aug 2020", end: "May 2024", gpa: "3.8/4.0", imageUrl: "/images/uh.jpg" },
      { id: "cc", school: "Community College", degree: "Associate", start: "Aug 2018", end: "May 2020" },
    );
    const { EducationSection } = await import("@/components/sections/Education");
    render(React.createElement(EducationSection));
    expect(screen.getByText("University of Houston")).toBeTruthy();
    expect(screen.getByText("Community College")).toBeTruthy();
  });

  it("handles start without end date", async () => {
    eduData.push(...[{
      id: "og", school: "Ongoing School", degree: "BS", start: "Sep 2022", end: "",
    }]);
    const { EducationSection } = await import("@/components/sections/Education");
    render(React.createElement(EducationSection));
    expect(screen.getByText("Sep 2022")).toBeTruthy();
  });

  it("handles end without start date", async () => {
    eduData.push(...[{
      id: "fi", school: "Finished School", degree: "MS", start: "", end: "Dec 2020",
    }]);
    const { EducationSection } = await import("@/components/sections/Education");
    render(React.createElement(EducationSection));
    expect(screen.getByText("Dec 2020")).toBeTruthy();
  });

  it("handles no dates at all", async () => {
    eduData.push(...[{
      id: "nd", school: "No Dates School", degree: "Cert", location: "Online",
    }]);
    const { EducationSection } = await import("@/components/sections/Education");
    render(React.createElement(EducationSection));
    expect(screen.getByText("No Dates School")).toBeTruthy();
    expect(screen.getByText("Online")).toBeTruthy();
  });

  it("handles start+end with expectedGraduation", async () => {
    eduData.push(...[{
      id: "wexp", school: "Test U", degree: "BS", start: "Sep 2020", end: "May 2024",
      expectedGraduation: "Jun 2024",
    }]);
    const { EducationSection } = await import("@/components/sections/Education");
    render(React.createElement(EducationSection));
    // start+end and expectedGraduation render in one span: "Sep 2020 — May 2024 · Expected Jun 2024"
    expect(screen.getByText(/Sep 2020/)).toBeTruthy();
    expect(screen.getByText(/Expected Jun 2024/)).toBeTruthy();
  });
});
