import path from "node:path";
import matter from "gray-matter";
import { beforeEach, describe, expect, it, vi } from "vitest";

const fsMocks = vi.hoisted(() => ({
  existsSync: vi.fn(),
  readdirSync: vi.fn(),
  readFileSync: vi.fn(),
}));

vi.mock("node:fs", () => ({ ...fsMocks, default: fsMocks }));

const fixturePath = path.join(
  process.cwd(),
  "tests",
  "fixtures",
  "articles",
  "2026-08-09-evidence-led-enterprise-ai-workflow.mdx",
);
const fixtureFilename = path.basename(fixturePath);
const fixtureSlug = "evidence-led-enterprise-ai-workflow";
const canonicalUrl = `https://me.itheheda.online/articles/${fixtureSlug}`;
let fixtureMdx = "";
const legacyMdx = `---\ntitle: "Legacy article"\ndate: "2025-01-01"\n---\n\nLegacy content.`;

beforeEach(async () => {
  const actualFs = await vi.importActual<typeof import("node:fs")>("node:fs");
  fixtureMdx = actualFs.readFileSync(fixturePath, "utf8");
  vi.resetModules();
  fsMocks.existsSync.mockImplementation((value: string) => /content[\\/]articles$/.test(String(value)));
  fsMocks.readdirSync.mockReturnValue([fixtureFilename, "legacy.mdx"]);
  fsMocks.readFileSync.mockImplementation((value: string) =>
    String(value).endsWith(fixtureFilename) ? fixtureMdx : legacyMdx,
  );
});

describe("workbench article discovery fixture", () => {
  it("is canonical source-backed MDX with a publication content hash", () => {
    const frontmatter = matter(fixtureMdx).data;

    expect(frontmatter).toMatchObject({ slug: fixtureSlug, contentHash: expect.stringMatching(/^sha256:[a-f0-9]{64}$/) });
    expect(fixtureMdx).toContain("## Sources");
    expect(fixtureMdx).toContain("https://www.nist.gov/");
  });

  it("loads the fixture and legacy frontmatter through the real MDX loader", async () => {
    const { getArticleBySlug, getArticles } = await import("@/lib/mdx/mdx");

    await expect(getArticles()).resolves.toHaveLength(2);
    expect(fsMocks.existsSync).toHaveBeenCalled();
    await expect(getArticleBySlug(fixtureSlug)).resolves.toMatchObject({
      slug: fixtureSlug,
      title: "Evidence-led enterprise AI workflow design",
      contentHash: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
    });
    await expect(getArticleBySlug("legacy")).resolves.toMatchObject({ slug: "legacy", contentHash: undefined });
    await expect(getArticles()).resolves.toHaveLength(2);
  });
});

describe("workbench article public discovery", () => {
  it("projects the real loaded fixture once to index, feeds, sitemap, and llms.txt", async () => {
    const [{ default: ArticlesPage }, { GET: getRss }, { GET: getJson }, { default: sitemap }, { GET: getLlms }] = await Promise.all([
      import("@/app/articles/page"),
      import("@/app/feed.xml/route"),
      import("@/app/feed.json/route"),
      import("@/app/sitemap"),
      import("@/app/llms.txt/route"),
    ]);

    const index = await ArticlesPage();
    expect(index.props.articles.filter((article: { slug: string }) => article.slug === fixtureSlug)).toHaveLength(1);

    const [rss, json, sitemapEntries, llms] = await Promise.all([getRss(), getJson(), sitemap(), getLlms()]);
    const rssText = await rss.text();
    const jsonBody = (await json.json()) as { items: Array<{ url: string }> };
    const llmsText = await llms.text();

    expect(rssText.match(/<item>/g) ?? []).toHaveLength(2);
    expect(rssText.match(new RegExp(`<title>Evidence-led enterprise AI workflow design</title>`, "g")) ?? []).toHaveLength(1);
    expect(jsonBody.items.filter((item) => item.url === canonicalUrl)).toHaveLength(1);
    expect(sitemapEntries.filter((entry) => entry.url === canonicalUrl)).toHaveLength(1);
    expect(llmsText.match(new RegExp(canonicalUrl, "g")) ?? []).toHaveLength(1);
  });

  it("builds the actual article page with one canonical BlogPosting record and content hash metadata", async () => {
    const { default: ArticlePage, generateMetadata } = await import("@/app/articles/[slug]/page");
    const metadata = await generateMetadata({ params: Promise.resolve({ slug: fixtureSlug }) });
    const page = await ArticlePage({ params: Promise.resolve({ slug: fixtureSlug }) });
    const records = findBlogPostingRecords(page);

    expect(metadata.other).toEqual({ "article-content-hash": expect.stringMatching(/^sha256:[a-f0-9]{64}$/) });
    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({ "@type": "BlogPosting", url: canonicalUrl, mainEntityOfPage: { "@id": canonicalUrl } });
  });
});

function findBlogPostingRecords(node: unknown): Array<Record<string, unknown>> {
  if (!node || typeof node !== "object") return [];
  const record = node as { props?: { data?: unknown; children?: unknown } };
  const data = record.props?.data;
  const current = data && typeof data === "object" && (data as { "@type"?: unknown })["@type"] === "BlogPosting"
    ? [data as Record<string, unknown>]
    : [];
  const children = record.props?.children;
  return [...current, ...(Array.isArray(children) ? children : [children]).flatMap(findBlogPostingRecords)];
}
