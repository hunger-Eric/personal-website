// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";

vi.mock("lucide-react", () => ({
  ChevronLeft: () => React.createElement("svg", { "data-testid": "chevron-left" }),
  ChevronRight: () => React.createElement("svg", { "data-testid": "chevron-right" }),
}));

vi.mock("@/components/FilledIcons", () => ({
  FilledGithub: ({ className }: any) => React.createElement("svg", { "data-testid": "filled-github", className }),
  FilledGlobe: ({ className }: any) => React.createElement("svg", { "data-testid": "filled-globe", className }),
  FilledFileText: ({ className }: any) => React.createElement("svg", { "data-testid": "filled-filetext", className }),
  FilledDownload: ({ className }: any) => React.createElement("svg", { "data-testid": "filled-download", className }),
  FilledPlay: ({ className }: any) => React.createElement("svg", { "data-testid": "filled-play", className }),
  FilledArrowUpRight: ({ className }: any) => React.createElement("svg", { "data-testid": "filled-arrowupright", className }),
}));

function makeProject(id: string, overrides: Record<string, any> = {}): any {
  return {
    id,
    name: `Project ${id}`,
    summary: `Summary for ${id}`,
    start: "2025-01",
    end: "2025-03",
    ...overrides,
  };
}

describe("FeaturedProjectsTicker", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    })) as any;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders nothing when no projects", async () => {
    const { FeaturedProjectsTicker } = await import("@/components/projects/FeaturedProjectsTicker");
    const { container } = render(React.createElement(FeaturedProjectsTicker, { projects: [] }));
    expect(container.innerHTML).toBe("");
  });

  it("renders project name and summary", async () => {
    const { FeaturedProjectsTicker } = await import("@/components/projects/FeaturedProjectsTicker");
    render(React.createElement(FeaturedProjectsTicker, {
      projects: [makeProject("1")],
    }));
    expect(screen.getByText("Project 1")).toBeInTheDocument();
    expect(screen.getByText("Summary for 1")).toBeInTheDocument();
  });

  it("renders with links and primary button", async () => {
    const { FeaturedProjectsTicker } = await import("@/components/projects/FeaturedProjectsTicker");
    render(React.createElement(FeaturedProjectsTicker, {
      projects: [makeProject("1", {
        links: [
          { label: "GitHub", href: "https://github.com/test", type: "github" },
          { label: "Live", href: "https://live.example.com", type: "live" },
        ],
      })],
    }));
    expect(screen.getByText("View Project")).toBeInTheDocument();
    expect(screen.getByText("GitHub")).toBeInTheDocument();
  });

  it("shows technologies when available", async () => {
    const { FeaturedProjectsTicker } = await import("@/components/projects/FeaturedProjectsTicker");
    render(React.createElement(FeaturedProjectsTicker, {
      projects: [makeProject("1", { technologies: ["React", "TypeScript", "Node"] })],
    }));
    expect(screen.getByText("React, TypeScript, Node")).toBeInTheDocument();
  });

  it("does not show technologies section when empty", async () => {
    const { FeaturedProjectsTicker } = await import("@/components/projects/FeaturedProjectsTicker");
    render(React.createElement(FeaturedProjectsTicker, {
      projects: [makeProject("1", { technologies: [] })],
    }));
    expect(screen.queryByText(/React/)).not.toBeInTheDocument();
  });

  it("uses description[0] as blurb when available", async () => {
    const { FeaturedProjectsTicker } = await import("@/components/projects/FeaturedProjectsTicker");
    render(React.createElement(FeaturedProjectsTicker, {
      projects: [makeProject("1", { description: ["Custom blurb from description"] })],
    }));
    expect(screen.getByText("Custom blurb from description")).toBeInTheDocument();
  });

  it("uses fallback blurb when no description or summary", async () => {
    const { FeaturedProjectsTicker } = await import("@/components/projects/FeaturedProjectsTicker");
    render(React.createElement(FeaturedProjectsTicker, {
      projects: [makeProject("1", { summary: undefined, description: undefined })],
    }));
    expect(screen.getByText("A featured project built to solve a real problem.")).toBeInTheDocument();
  });

  it("limits technologies to 8 items", async () => {
    const { FeaturedProjectsTicker } = await import("@/components/projects/FeaturedProjectsTicker");
    const techs = Array.from({ length: 12 }, (_, i) => `Tech${i + 1}`);
    render(React.createElement(FeaturedProjectsTicker, {
      projects: [makeProject("1", { technologies: techs })],
    }));
    expect(screen.getByText(/Tech1/)).toBeInTheDocument();
    expect(screen.queryByText(/Tech9/)).not.toBeInTheDocument();
  });

  it("limits slides to 8 projects", async () => {
    const { FeaturedProjectsTicker } = await import("@/components/projects/FeaturedProjectsTicker");
    const projects = Array.from({ length: 12 }, (_, i) => makeProject(`proj-${i + 1}`));
    const { container } = render(React.createElement(FeaturedProjectsTicker, { projects }));
    const indicatorButtons = container.querySelectorAll('[aria-label^="Go to slide"]');
    expect(indicatorButtons.length).toBeLessThanOrEqual(8);
  });

  it("navigates to next project on next button click", async () => {
    const { FeaturedProjectsTicker } = await import("@/components/projects/FeaturedProjectsTicker");
    const projects = [makeProject("1"), makeProject("2"), makeProject("3")];
    render(React.createElement(FeaturedProjectsTicker, { projects }));
    expect(screen.getByText("Project 1")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Next project"));
    expect(screen.getByText("Project 2")).toBeInTheDocument();
  });

  it("navigates to previous project on prev button click", async () => {
    const { FeaturedProjectsTicker } = await import("@/components/projects/FeaturedProjectsTicker");
    const projects = [makeProject("1"), makeProject("2")];
    render(React.createElement(FeaturedProjectsTicker, { projects }));
    fireEvent.click(screen.getByLabelText("Next project"));
    expect(screen.getByText("Project 2")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Previous project"));
    expect(screen.getByText("Project 1")).toBeInTheDocument();
  });

  it("navigates to specific slide via indicator", async () => {
    const { FeaturedProjectsTicker } = await import("@/components/projects/FeaturedProjectsTicker");
    const projects = [makeProject("1"), makeProject("2"), makeProject("3")];
    const { container } = render(React.createElement(FeaturedProjectsTicker, { projects }));
    const slideBtns = container.querySelectorAll('[aria-label^="Go to slide"]');
    fireEvent.click(slideBtns[2]);
    expect(screen.getByText("Project 3")).toBeInTheDocument();
  });

  it("hides nav buttons when only 1 project", async () => {
    const { FeaturedProjectsTicker } = await import("@/components/projects/FeaturedProjectsTicker");
    render(React.createElement(FeaturedProjectsTicker, {
      projects: [makeProject("1")],
    }));
    expect(screen.queryByLabelText("Next project")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Previous project")).not.toBeInTheDocument();
  });

  it("pauses auto-advance on mouse enter", async () => {
    const { FeaturedProjectsTicker } = await import("@/components/projects/FeaturedProjectsTicker");
    const projects = [makeProject("1"), makeProject("2")];
    const { container } = render(React.createElement(FeaturedProjectsTicker, { projects }));

    const outerDiv = container.firstChild as HTMLElement;
    fireEvent.mouseEnter(outerDiv);
    vi.advanceTimersByTime(10000);
    expect(screen.getByText("Project 1")).toBeInTheDocument();
  });

  it("resumes auto-advance on mouse leave", async () => {
    const { FeaturedProjectsTicker } = await import("@/components/projects/FeaturedProjectsTicker");
    const projects = [makeProject("1"), makeProject("2")];
    const { container } = render(React.createElement(FeaturedProjectsTicker, { projects }));

    const outerDiv = container.firstChild as HTMLElement;
    fireEvent.mouseEnter(outerDiv);
    fireEvent.mouseLeave(outerDiv);
    act(() => { vi.advanceTimersByTime(6000); });
    expect(screen.getByText("Project 2")).toBeInTheDocument();
  });

  it("handles touch swipe left to go next", async () => {
    const { FeaturedProjectsTicker } = await import("@/components/projects/FeaturedProjectsTicker");
    const projects = [makeProject("1"), makeProject("2")];
    const { container } = render(React.createElement(FeaturedProjectsTicker, { projects }));

    const carousel = container.querySelector('[aria-label="Featured projects carousel"]')!;
    fireEvent.touchStart(carousel, { touches: [{ clientX: 200 }] });
    fireEvent.touchMove(carousel, { touches: [{ clientX: 100 }] });
    fireEvent.touchEnd(carousel);
    expect(screen.getByText("Project 2")).toBeInTheDocument();
  });

  it("handles touch swipe right to go prev", async () => {
    const { FeaturedProjectsTicker } = await import("@/components/projects/FeaturedProjectsTicker");
    const projects = [makeProject("1"), makeProject("2")];
    const { container } = render(React.createElement(FeaturedProjectsTicker, { projects }));

    fireEvent.click(screen.getByLabelText("Next project"));
    expect(screen.getByText("Project 2")).toBeInTheDocument();

    const carousel = container.querySelector('[aria-label="Featured projects carousel"]')!;
    fireEvent.touchStart(carousel, { touches: [{ clientX: 100 }] });
    fireEvent.touchMove(carousel, { touches: [{ clientX: 200 }] });
    fireEvent.touchEnd(carousel);
    expect(screen.getByText("Project 1")).toBeInTheDocument();
  });

  it("ignores small touch swipes (< 45px)", async () => {
    const { FeaturedProjectsTicker } = await import("@/components/projects/FeaturedProjectsTicker");
    const projects = [makeProject("1"), makeProject("2")];
    const { container } = render(React.createElement(FeaturedProjectsTicker, { projects }));

    const carousel = container.querySelector('[aria-label="Featured projects carousel"]')!;
    fireEvent.touchStart(carousel, { touches: [{ clientX: 100 }] });
    fireEvent.touchMove(carousel, { touches: [{ clientX: 110 }] });
    fireEvent.touchEnd(carousel);
    expect(screen.getByText("Project 1")).toBeInTheDocument();
  });

  it("renders gradient background when no imageUrl", async () => {
    const { FeaturedProjectsTicker } = await import("@/components/projects/FeaturedProjectsTicker");
    const { container } = render(React.createElement(FeaturedProjectsTicker, {
      projects: [makeProject("1")],
    }));
    expect(container.querySelector(".bg-gradient-to-br")).toBeInTheDocument();
  });

  it("opens project links in new window", async () => {
    const openSpy = vi.fn();
    window.open = openSpy;

    const { FeaturedProjectsTicker } = await import("@/components/projects/FeaturedProjectsTicker");
    render(React.createElement(FeaturedProjectsTicker, {
      projects: [makeProject("1", {
        links: [
          { label: "Live", href: "https://live.example.com", type: "live" },
          { label: "GitHub", href: "https://github.com/test", type: "github" },
        ],
      })],
    }));

    fireEvent.click(screen.getByText("GitHub"));
    expect(openSpy).toHaveBeenCalledWith("https://github.com/test", "_blank", "noopener,noreferrer");
  });

  it("resets active index when total changes", async () => {
    const { FeaturedProjectsTicker } = await import("@/components/projects/FeaturedProjectsTicker");
    const projects = [makeProject("1"), makeProject("2")];
    const { container } = render(React.createElement(FeaturedProjectsTicker, { projects }));

    fireEvent.click(screen.getByLabelText("Next project"));
    expect(screen.getByText("Project 2")).toBeInTheDocument();
  });
});
