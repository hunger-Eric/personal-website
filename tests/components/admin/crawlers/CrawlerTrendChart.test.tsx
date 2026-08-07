// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CrawlerTrendChart } from "@/components/admin/crawlers/CrawlerTrendChart";

const trend = [
  { bucket: "2026-08-06T09:00:00Z", identifiedAiCrawler: 0, openGeoSelfTest: 0, otherAutomation: 0 },
  { bucket: "2026-08-06T10:00:00Z", identifiedAiCrawler: 2, openGeoSelfTest: 5, otherAutomation: 1 },
  { bucket: "2026-08-06T11:00:00Z", identifiedAiCrawler: 3, openGeoSelfTest: 0, otherAutomation: 2 },
];

describe("CrawlerTrendChart", () => {
  it("renders an accessible graphic and only the meaningful peak periods", () => {
    render(<CrawlerTrendChart trend={trend} />);
    expect(screen.getByRole("img", { name: "自动化请求趋势" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "自动化请求趋势数据" })).toBeInTheDocument();
    expect(screen.getByText("有流量时段").nextSibling).toHaveTextContent("2");
    expect(screen.getByText("单时段峰值").nextSibling).toHaveTextContent("8");
    expect(screen.queryByText("2026-08-06 09:00 UTC")).not.toBeInTheDocument();
    expect(screen.getAllByText("2026-08-06 10:00 UTC")).toHaveLength(2);
  });

  it("renders a clear empty state without an invalid SVG path", () => {
    const { container } = render(<CrawlerTrendChart trend={[]} />);
    expect(screen.getByText("所选时间内没有可绘制的自动化趋势。")).toBeInTheDocument();
    expect(container.querySelector("path[d*='NaN']")).toBeNull();
  });

  it("caps the peak table at six rows", () => {
    const manyActiveRows = Array.from({ length: 8 }, (_, index) => ({
      bucket: `2026-08-06T${String(index).padStart(2, "0")}:00:00Z`,
      identifiedAiCrawler: 0,
      openGeoSelfTest: 0,
      otherAutomation: index + 1,
    }));
    render(<CrawlerTrendChart trend={manyActiveRows} />);
    const table = screen.getByRole("table", { name: "自动化请求趋势数据" });
    expect(within(table).getAllByRole("row")).toHaveLength(7);
    expect(within(table).queryByText("2026-08-06 00:00 UTC")).not.toBeInTheDocument();
    expect(within(table).getByText("2026-08-06 07:00 UTC")).toBeInTheDocument();
  });
});
