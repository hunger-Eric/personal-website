import { describe, expect, it } from "vitest";

import { metadata as aboutMetadata } from "@/app/about/page";
import { metadata as articlesMetadata } from "@/app/articles/page";
import { metadata as contactMetadata } from "@/app/contact/page";
import { generateMetadata as generateProjectMetadata } from "@/app/projects/[id]/page";
import { metadata as projectsMetadata } from "@/app/projects/page";
import { metadata as servicesMetadata } from "@/app/services/page";

describe("public page metadata", () => {
  it.each([
    ["services", servicesMetadata, "/services", "企业 AI 工作流系统设计与交付"],
    ["projects", projectsMetadata, "/projects", "项目库"],
    ["articles", articlesMetadata, "/articles", "文章与系统实践"],
    ["about", aboutMetadata, "/about", "关于实解智能"],
    ["contact", contactMetadata, "/contact", "提交业务问题"],
  ])("publishes page-specific social metadata for %s", (_name, metadata, path, title) => {
    expect(metadata.alternates).toEqual({ canonical: path });
    expect(metadata.openGraph).toMatchObject({
      type: "website",
      url: path,
      title: `${title} | 实解智能`,
      description: metadata.description,
    });
    expect(metadata.twitter).toMatchObject({
      card: "summary_large_image",
      title: `${title} | 实解智能`,
      description: metadata.description,
    });
  });

  it("publishes canonical social metadata for project details", async () => {
    const metadata = await generateProjectMetadata({
      params: Promise.resolve({ id: "open-geo-console" }),
    });

    expect(metadata.alternates).toEqual({ canonical: "/projects/open-geo-console" });
    expect(metadata.openGraph).toMatchObject({
      type: "website",
      url: "/projects/open-geo-console",
      title: "Open GEO Console：AI 搜索可见性诊断与整改 | 实解智能",
    });
    expect(metadata.twitter).toMatchObject({
      card: "summary_large_image",
      title: "Open GEO Console：AI 搜索可见性诊断与整改 | 实解智能",
    });
  });
});
