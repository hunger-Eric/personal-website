// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import React, {
  type AnchorHTMLAttributes,
  type ImgHTMLAttributes,
  type ReactNode,
  type SVGProps,
} from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getSiteCopy } from "@/config/contentCopy";
import type { Certification } from "@/config/certifications";

type MockImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
};

type MockLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children?: ReactNode;
};

const certData = vi.hoisted(() => [] as Certification[]);

vi.mock("@/config/certifications", () => ({ certifications: certData }));

vi.mock("next/image", () => ({
  default: ({ fill, priority, sizes, ...props }: MockImageProps) => {
    void fill;
    void priority;
    void sizes;
    return React.createElement("img", props);
  },
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: MockLinkProps) =>
    React.createElement("a", { href, ...props }, children),
}));

function mockIcon(testId: string) {
  return function Icon(props: SVGProps<SVGSVGElement>) {
    return React.createElement("svg", {
      ...props,
      "aria-hidden": "true",
      "data-testid": testId,
    });
  };
}

vi.mock("lucide-react", () => ({
  ChevronDown: mockIcon("icon-chevron-down"),
  ChevronUp: mockIcon("icon-chevron-up"),
  ExternalLink: mockIcon("icon-external-link"),
}));

const copy = getSiteCopy("zh").certifications;

function cert(index: number): Certification {
  return {
    name: `Cert ${index}`,
    issuer: `Issuer ${index}`,
    date: `2024-0${index}-15`,
    description: `Description ${index}`,
    imageUrl: `/images/cert${index}.png`,
    link: `https://example.com/cert${index}`,
  };
}

async function renderSection() {
  const { CertificationsSection } = await import(
    "@/components/sections/Certifications"
  );
  return render(<CertificationsSection />);
}

describe("CertificationsSection", () => {
  beforeEach(() => {
    certData.length = 0;
  });

  it("renders the copy-driven section header", async () => {
    certData.push(cert(1), cert(2), cert(3));

    await renderSection();

    expect(screen.getByText(copy.eyebrow)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: copy.title }),
    ).toBeInTheDocument();
  });

  it("renders the first three certification records when the archive is long", async () => {
    certData.push(cert(1), cert(2), cert(3), cert(4));

    await renderSection();

    expect(screen.getByText("Cert 1")).toBeInTheDocument();
    expect(screen.getByText("Cert 2")).toBeInTheDocument();
    expect(screen.getByText("Cert 3")).toBeInTheDocument();
    expect(screen.queryByText("Cert 4")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: copy.viewMore }),
    ).toBeInTheDocument();
  });

  it("expands and collapses the archive with localized action copy", async () => {
    certData.push(cert(1), cert(2), cert(3), cert(4));

    const { container } = await renderSection();

    expect(
      container.querySelector('[data-testid="icon-chevron-down"]'),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: copy.viewMore }));

    expect(screen.getByText("Cert 4")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: copy.showLess }),
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-testid="icon-chevron-up"]'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: copy.showLess }));

    expect(screen.queryByText("Cert 4")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: copy.viewMore }),
    ).toBeInTheDocument();
  });

  it("does not render the archive toggle for three or fewer records", async () => {
    certData.push(cert(1), cert(2), cert(3));

    await renderSection();

    expect(
      screen.queryByRole("button", { name: copy.viewMore }),
    ).not.toBeInTheDocument();
  });

  it("renders issuer, date, image alt text, and credential links", async () => {
    certData.push(cert(1), cert(2));

    const { container } = await renderSection();
    const images = container.querySelectorAll("img");

    expect(screen.getByText(/Issuer 1/)).toBeInTheDocument();
    expect(screen.getByText(/2024-01-15/)).toBeInTheDocument();
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute("src", "/images/cert1.png");
    expect(images[0]).toHaveAttribute("alt", "Cert 1");

    const imageLink = screen.getByRole("link", {
      name: `${copy.viewCredential}: Cert 1`,
    });
    expect(imageLink).toHaveAttribute("href", "https://example.com/cert1");
    expect(imageLink).toHaveAttribute("target", "_blank");
    expect(imageLink).toHaveAttribute("rel", "noreferrer noopener");

    expect(
      screen.getAllByRole("link", { name: copy.viewCredential }),
    ).toHaveLength(2);
    expect(
      container.querySelectorAll('[data-testid="icon-external-link"]'),
    ).toHaveLength(2);
  });

  it("renders the section shell with no credential cards when data is empty", async () => {
    const { container } = await renderSection();

    expect(screen.getByText(copy.eyebrow)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: copy.title }),
    ).toBeInTheDocument();
    expect(container.querySelectorAll("img")).toHaveLength(0);
    expect(
      screen.queryByRole("link", { name: copy.viewCredential }),
    ).not.toBeInTheDocument();
  });

  it("uses system surface tokens instead of old template residue", async () => {
    certData.push(cert(1));

    const { container } = await renderSection();

    expect(container.querySelector(".bg-surface-paper")).toBeInTheDocument();
    expect(container.innerHTML).not.toContain(["bg", "card"].join("-"));
    expect(container.innerHTML).not.toContain(["rounded", "2xl"].join("-"));
    expect(container.innerHTML).not.toContain(["border", "white/10"].join("-"));
  });
});
