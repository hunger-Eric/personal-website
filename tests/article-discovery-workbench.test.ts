import { readFileSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FrontmatterSchema, type ArticlePreview } from "@/lib/mdx/mdx";

const fixturePath = path.join(
  process.cwd(),
  "tests",
  "fixtures",
  "articles",
  "2026-08-09-evidence-led-enterprise-ai-workflow.mdx",
);

describe("workbench article discovery fixture", () => {
  it("is canonical source-backed MDX with a publication content hash", () => {
    const fixture = readFileSync(fixturePath, "utf8");

    expect(fixture).toContain('slug: "evidence-led-enterprise-ai-workflow"');
    expect(fixture).toMatch(/contentHash: "sha256:[a-f0-9]{64}"/);
    expect(fixture).toContain("## Sources");
    expect(fixture).toContain("https://www.nist.gov/");
  });
});

const fixture = FrontmatterSchema.parse(matter(readFileSync(fixturePath, "utf8")).data);
if (!fixture.title || !fixture.date) {
  throw new Error("Discovery fixture must include canonical title and date metadata");
}
const article: ArticlePreview = {
  title: fixture.title,
  slug: fixture.slug ?? "evidence-led-enterprise-ai-workflow",
  summary: fixture.summary ?? "",
  date: fixture.date,
  updated: fixture.updated,
  category: fixture.category,
  tags: fixture.tags ?? [],
  featured: fixture.featured ?? false,
  draft: fixture.draft ?? false,
  imageSrc: fixture.imageSrc,
  imageAlt: fixture.imageAlt,
  author: fixture.author,
  contentHash: fixture.contentHash,
  readingTime: 1,
  chapter: undefined,
  publicPath: "/articles/evidence-led-enterprise-ai-workflow",
};
const canonicalUrl = "https://me.itheheda.online/articles/evidence-led-enterprise-ai-workflow";

beforeEach(() => {
  vi.resetModules();
  vi.doUnmock("@/lib/mdx/mdx");
  vi.doUnmock("@/lib/ai-readable/routes");
});

describe("workbench article public discovery", () => {
  it("appears exactly once in the article index, feeds, sitemap, and llms.txt", async () => {
    vi.doMock("@/lib/mdx/mdx", () => ({ getArticles: vi.fn().mockResolvedValue([article]) }));
    vi.doMock("@/lib/ai-readable/routes", () => ({
      getReadableRoutes: vi.fn().mockResolvedValue([
        { kind: "article", path: article.publicPath, url: canonicalUrl, title: article.title, description: article.summary, changeFrequency: "monthly", priority: 0.55 },
      ]),
      groupReadableRoutes: (routes: Array<{ kind: string }>) => ({ primary: [], project: [], article: routes.filter((route) => route.kind === "article"), machine: [] }),
    }));

    const [{ default: ArticlesPage }, { GET: getRss }, { GET: getJson }, { default: sitemap }, { GET: getLlms }] = await Promise.all([
      import("@/app/articles/page"),
      import("@/app/feed.xml/route"),
      import("@/app/feed.json/route"),
      import("@/app/sitemap"),
      import("@/app/llms.txt/route"),
    ]);

    const index = await ArticlesPage();
    expect(index.props.articles).toHaveLength(1);
    expect(index.props.articles[0]).toMatchObject({ slug: article.slug, title: article.title });

    const [rss, json, sitemapEntries, llms] = await Promise.all([getRss(), getJson(), sitemap(), getLlms()]);
    const rssText = await rss.text();
    const jsonBody = (await json.json()) as { items: Array<{ url: string }> };
    const llmsText = await llms.text();

    expect(rssText.match(new RegExp(canonicalUrl, "g")) ?? []).toHaveLength(2);
    expect(jsonBody.items.filter((item) => item.url === canonicalUrl)).toHaveLength(1);
    expect(sitemapEntries.filter((entry) => entry.url === canonicalUrl)).toHaveLength(1);
    expect(llmsText.match(new RegExp(canonicalUrl, "g")) ?? []).toHaveLength(1);
  });

  it("generates one canonical BlogPosting JSON-LD record for the fixture", async () => {
    const { generateArticleSchema } = await import("@/lib/structured-data");
    const schema = generateArticleSchema(article);

    expect(schema).toMatchObject({
      "@type": "BlogPosting",
      headline: article.title,
      url: canonicalUrl,
      mainEntityOfPage: { "@id": canonicalUrl },
    });
  });
});
