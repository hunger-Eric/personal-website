// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";

// Navbar imports NavbarCentered (named export) from NavbarCenteredDesktop
// and default import from NavbarCenteredMobile
vi.mock("@/components/NavbarCenteredDesktop", () => ({
  NavbarCentered: () => <div data-testid="navbar-desktop">Desktop</div>,
}));

vi.mock("@/components/NavbarCenteredMobile", () => ({
  default: () => <div data-testid="navbar-mobile">Mobile</div>,
}));

describe("Navbar", () => {
  it("renders desktop and mobile nav", async () => {
    const { default: Navbar } = await import("@/components/Navbar");
    const { container } = render(<Navbar />);
    expect(container.querySelector("[data-testid='navbar-desktop']")).toBeInTheDocument();
    expect(container.querySelector("[data-testid='navbar-mobile']")).toBeInTheDocument();
  });
});
