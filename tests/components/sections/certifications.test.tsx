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

vi.mock("lucide-react", () => ({
  ChevronDown: () => React.createElement("svg", { "data-testid": "icon-chevron-down" }),
  ChevronUp: () => React.createElement("svg", { "data-testid": "icon-chevron-up" }),
  ExternalLink: () => React.createElement("svg", { "data-testid": "icon-external-link" }),
}));

// Mutable array
const certData = vi.hoisted(() => [] as any[]);
vi.mock("@/config/certifications", () => ({ certifications: certData }));

const CERT = (n: number) => ({
  name: `Cert ${n}`, issuer: `Issuer ${n}`, date: `2024-0${n}-15`,
  description: `Description ${n}`, imageUrl: `/images/cert${n}.png`,
  link: `https://example.com/cert${n}`,
});

// ── Tests ──────────────────────────────────────────────────────────────────

describe("CertificationsSection", () => {
  beforeEach(() => {
    certData.length = 0;
  });

  it("renders section heading and subtitle", async () => {
    certData.push(CERT(1), CERT(2), CERT(3));
    const { CertificationsSection } = await import("@/components/sections/Certifications");
    render(React.createElement(CertificationsSection));
    expect(screen.getByText("~/Certifications")).toBeTruthy();
    expect(screen.getByText("My verified skills and credentials.")).toBeTruthy();
  });

  it("renders certification names", async () => {
    certData.push(CERT(1), CERT(2), CERT(3));
    const { CertificationsSection } = await import("@/components/sections/Certifications");
    render(React.createElement(CertificationsSection));
    expect(screen.getByText("Cert 1")).toBeTruthy();
    expect(screen.getByText("Cert 2")).toBeTruthy();
    expect(screen.getByText("Cert 3")).toBeTruthy();
  });

  it("renders issuer and date", async () => {
    certData.push(CERT(1));
    const { CertificationsSection } = await import("@/components/sections/Certifications");
    render(React.createElement(CertificationsSection));
    expect(screen.getByText(/Issuer 1/)).toBeTruthy();
    expect(screen.getByText(/2024-01-15/)).toBeTruthy();
  });

  it("renders certification images", async () => {
    certData.push(CERT(1), CERT(2), CERT(3));
    const { CertificationsSection } = await import("@/components/sections/Certifications");
    const { container } = render(React.createElement(CertificationsSection));
    const imgs = container.querySelectorAll("img");
    expect(imgs.length).toBe(3);
    expect(imgs[0].getAttribute("src")).toBe("/images/cert1.png");
    expect(imgs[0].getAttribute("alt")).toBe("Cert 1");
  });

  it("renders ExternalLink icons on credential links", async () => {
    certData.push(CERT(1), CERT(2));
    const { CertificationsSection } = await import("@/components/sections/Certifications");
    const { container } = render(React.createElement(CertificationsSection));
    expect(container.querySelectorAll('[data-testid="icon-external-link"]').length).toBe(2);
  });

  describe("showAll toggle", () => {
    it("shows only first 3 when > 3 certs", async () => {
      certData.push(CERT(1), CERT(2), CERT(3), CERT(4));
      const { CertificationsSection } = await import("@/components/sections/Certifications");
      render(React.createElement(CertificationsSection));
      expect(screen.getByText("Cert 1")).toBeTruthy();
      expect(screen.getByText("Cert 2")).toBeTruthy();
      expect(screen.getByText("Cert 3")).toBeTruthy();
      expect(screen.queryByText("Cert 4")).toBeFalsy();
    });

    it("shows 'View more' button when > 3", async () => {
      certData.push(CERT(1), CERT(2), CERT(3), CERT(4));
      const { CertificationsSection } = await import("@/components/sections/Certifications");
      render(React.createElement(CertificationsSection));
      expect(screen.getByText("View more")).toBeTruthy();
      expect(screen.queryByText("Show less")).toBeFalsy();
    });

    it("shows ChevronDown icon initially", async () => {
      certData.push(CERT(1), CERT(2), CERT(3), CERT(4));
      const { CertificationsSection } = await import("@/components/sections/Certifications");
      const { container } = render(React.createElement(CertificationsSection));
      expect(container.querySelector('[data-testid="icon-chevron-down"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="icon-chevron-up"]')).toBeFalsy();
    });

    it("shows all after clicking 'View more'", async () => {
      certData.push(CERT(1), CERT(2), CERT(3), CERT(4));
      const { CertificationsSection } = await import("@/components/sections/Certifications");
      render(React.createElement(CertificationsSection));
      fireEvent.click(screen.getByText("View more"));
      expect(screen.getByText("Cert 4")).toBeTruthy();
      expect(screen.getByText("Show less")).toBeTruthy();
    });

    it("toggles back after clicking 'Show less'", async () => {
      certData.push(CERT(1), CERT(2), CERT(3), CERT(4));
      const { CertificationsSection } = await import("@/components/sections/Certifications");
      render(React.createElement(CertificationsSection));
      fireEvent.click(screen.getByText("View more"));
      expect(screen.getByText("Cert 4")).toBeTruthy();
      fireEvent.click(screen.getByText("Show less"));
      expect(screen.queryByText("Cert 4")).toBeFalsy();
    });

    it("shows ChevronUp after expanding", async () => {
      certData.push(CERT(1), CERT(2), CERT(3), CERT(4));
      const { CertificationsSection } = await import("@/components/sections/Certifications");
      const { container } = render(React.createElement(CertificationsSection));
      fireEvent.click(screen.getByText("View more"));
      expect(container.querySelector('[data-testid="icon-chevron-up"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="icon-chevron-down"]')).toBeFalsy();
    });
  });

  it("no toggle when exactly 3 certs", async () => {
    certData.push(CERT(1), CERT(2), CERT(3));
    const { CertificationsSection } = await import("@/components/sections/Certifications");
    render(React.createElement(CertificationsSection));
    expect(screen.queryByText("View more")).toBeFalsy();
  });

  it("no toggle when 2 certs", async () => {
    certData.push(CERT(1), CERT(2));
    const { CertificationsSection } = await import("@/components/sections/Certifications");
    render(React.createElement(CertificationsSection));
    expect(screen.queryByText("View more")).toBeFalsy();
  });

  it("opens cert link when image clicked", async () => {
    const spy = vi.spyOn(window, "open").mockImplementation(() => null);
    certData.push(CERT(1));
    const { CertificationsSection } = await import("@/components/sections/Certifications");
    render(React.createElement(CertificationsSection));
    const buttons = screen.getAllByRole("button");
    const imgBtn = buttons.find((b) => b.querySelector("img"));
    if (imgBtn) fireEvent.click(imgBtn!);
    expect(spy).toHaveBeenCalledWith("https://example.com/cert1", "_blank", "noopener,noreferrer");
    spy.mockRestore();
  });

  it("empty certs shows heading only", async () => {
    certData.length = 0;
    const { CertificationsSection } = await import("@/components/sections/Certifications");
    const { container } = render(React.createElement(CertificationsSection));
    expect(screen.getByText("~/Certifications")).toBeTruthy();
    expect(container.querySelectorAll("img").length).toBe(0);
  });
});
