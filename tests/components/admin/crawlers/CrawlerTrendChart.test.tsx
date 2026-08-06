// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CrawlerTrendChart } from "@/components/admin/crawlers/CrawlerTrendChart";

const trend = [
  { bucket: "2026-08-06T10:00:00Z", identifiedAiCrawler: 2, openGeoSelfTest: 5, otherAutomation: 1 },
  { bucket: "2026-08-06T11:00:00Z", identifiedAiCrawler: 3, openGeoSelfTest: 0, otherAutomation: 2 },
];

describe("CrawlerTrendChart", () => {
  it("renders an accessible graphic and a textual fallback table", () => {
    render(<CrawlerTrendChart trend={trend} />);
    expect(screen.getByRole("img", { name: "自动化请求趋势" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "自动化请求趋势数据" })).toBeInTheDocument();
    expect(screen.getByText("2026-08-06 10:00")).toBeInTheDocument();
  });

  it("renders a clear empty state without an invalid SVG path", () => {
    const { container } = render(<CrawlerTrendChart trend={[]} />);
    expect(screen.getByText("所选时间内没有可绘制的自动化趋势。")).toBeInTheDocument();
    expect(container.querySelector("path[d*='NaN']")).toBeNull();
  });
});
