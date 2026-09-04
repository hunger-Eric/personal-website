// @vitest-environment node
// Tests for lib/structured-data.ts — all branches
import { describe, it, expect, vi, beforeEach } from "vitest";

const BASE_URL = "https://me.itheheda.online";

describe("generatePersonSchema", () => {
  beforeEach(() => { vi.resetModules(); });

  it("returns full Person schema with all socials and location", async () => {
    vi.doMock("@/config/siteConfig", () => ({
      siteConfig: {
        name: "Kevin Trinh", title: "CS Student", tagline: "Building thoughtful software.",
        location: "Houston, TX",
        socialsList: [
          { key: "github", href: "https://github.com/kevin" },
          { key: "linkedin", href: "https://linkedin.com/in/kevin" },
          { key: "youtube", href: "https://youtube.com/@kevin" },
        ],
      },
    }));
    const { generatePersonSchema } = await import("@/lib/structured-data");
    const r = generatePersonSchema();
    expect(r["@type"]).toBe("Person");
    expect(r.name).toBe("Kevin Trinh");
    expect(r.jobTitle).toBe("CS Student");
    expect(r.description).toBe("Building thoughtful software.");
    expect(r.url).toBe(BASE_URL);
    expect(r.address).toEqual({ "@type": "PostalAddress", addressLocality: "Houston, TX" });
    expect(r.sameAs).toEqual(["https://github.com/kevin", "https://linkedin.com/in/kevin", "https://youtube.com/@kevin"]);
  });

  it("handles missing social links and location", async () => {
    vi.doMock("@/config/siteConfig", () => ({
      siteConfig: { name: "No Soc", title: "Dev", tagline: ".", socialsList: [] },
    }));
    const { generatePersonSchema } = await import("@/lib/structured-data");
    const r = generatePersonSchema();
    expect(r.sameAs).toEqual([]);
    expect(r.address).toBeUndefined();
  });
});

describe("generateWebSiteSchema", () => {
  beforeEach(() => { vi.resetModules(); });

  it("returns WebSite schema", async () => {
    vi.doMock("@/config/siteConfig", () => ({
      siteConfig: { name: "Kevin Trinh", socialsList: [] },
    }));
    const { generateWebSiteSchema } = await import("@/lib/structured-data");
    const r = generateWebSiteSchema();
    expect(r["@type"]).toBe("WebSite");
    expect(r.name).toBe("Kevin Trinh Website");
    expect(r.url).toBe(BASE_URL);
  });
});

describe("generateBreadcrumbSchema", () => {
  beforeEach(() => { vi.resetModules(); });

  it("returns BreadcrumbList with items", async () => {
    vi.doMock("@/config/siteConfig", () => ({
      siteConfig: { name: "X", socialsList: [] },
    }));
    const { generateBreadcrumbSchema } = await import("@/lib/structured-data");
    const items = [{ name: "Home", url: "/" }, { name: "Blog", url: "/blog" }];
    const r = generateBreadcrumbSchema(items);
    expect(r["@type"]).toBe("BreadcrumbList");
    expect(r.itemListElement).toHaveLength(2);
    expect(r.itemListElement[0].position).toBe(1);
  });

  it("returns empty BreadcrumbList when items is empty", async () => {
    vi.doMock("@/config/siteConfig", () => ({
      siteConfig: { name: "X", socialsList: [] },
    }));
    const { generateBreadcrumbSchema } = await import("@/lib/structured-data");
    const r = generateBreadcrumbSchema([]);
    expect(r.itemListElement).toEqual([]);
  });

  // Line 210: absolute URL branch — item.url starts with "http"
  it("handles absolute URLs in breadcrumb items", async () => {
    vi.doMock("@/config/siteConfig", () => ({
      siteConfig: { name: "X", socialsList: [] },
    }));
    const { generateBreadcrumbSchema } = await import("@/lib/structured-data");
    const items = [
      { name: "Home", url: "/" },
      { name: "External", url: "https://external.com/page" },
    ];
    const r = generateBreadcrumbSchema(items);
    expect(r.itemListElement).toHaveLength(2);
    // Relative URL should be prefixed with BASE_URL
    expect(r.itemListElement[0].item).toBe(`${BASE_URL}/`);
    // Absolute URL should be used as-is
    expect(r.itemListElement[1].item).toBe("https://external.com/page");
  });
});

describe("generateProjectSchema", () => {
  beforeEach(() => { vi.resetModules(); });

  it("returns SoftwareApplication schema with minimal fields", async () => {
    vi.doMock("@/config/siteConfig", () => ({
      siteConfig: { name: "Kevin Trinh", socialsList: [] },
    }));
    const { generateProjectSchema } = await import("@/lib/structured-data");
    const r = generateProjectSchema({
      id: "my-project",
      name: "My Project",
      summary: "A cool project",
    });
    expect(r["@type"]).toBe("SoftwareApplication");
    expect(r["@id"]).toBe(`${BASE_URL}/projects/my-project#software`);
    expect(r.name).toBe("My Project");
    expect(r.description).toBe("A cool project");
    expect(r.url).toBe(`${BASE_URL}/projects/my-project`);
    expect(r.applicationCategory).toBe("BusinessApplication");
    expect(r.image).toBeUndefined();
    expect(r.codeRepository).toBeUndefined();
    expect(r.programmingLanguage).toBeUndefined();
    expect(r.dateCreated).toBeUndefined();
    expect("offers" in r).toBe(false);
    expect(r.provider).toEqual({ "@id": `${BASE_URL}/#organization` });
  });

  it("uses description when summary is not provided", async () => {
    vi.doMock("@/config/siteConfig", () => ({
      siteConfig: { name: "Kevin Trinh", socialsList: [] },
    }));
    const { generateProjectSchema } = await import("@/lib/structured-data");
    const r = generateProjectSchema({
      id: "proj-1",
      name: "Proj",
      description: "Fallback description",
    });
    expect(r.description).toBe("Fallback description");
  });

  it("includes image with absolute URL as-is", async () => {
    vi.doMock("@/config/siteConfig", () => ({
      siteConfig: { name: "Kevin Trinh", socialsList: [] },
    }));
    const { generateProjectSchema } = await import("@/lib/structured-data");
    const r = generateProjectSchema({
      id: "proj-img",
      name: "Img Project",
      imageSrc: "https://cdn.example.com/project.png",
    });
    expect(r.image).toBe("https://cdn.example.com/project.png");
  });

  it("prefixes relative image with BASE_URL", async () => {
    vi.doMock("@/config/siteConfig", () => ({
      siteConfig: { name: "Kevin Trinh", socialsList: [] },
    }));
    const { generateProjectSchema } = await import("@/lib/structured-data");
    const r = generateProjectSchema({
      id: "proj-rel",
      name: "Relative Img",
      imageSrc: "/images/project.png",
    });
    expect(r.image).toBe(`${BASE_URL}/images/project.png`);
  });

  it("includes codeRepository when repoUrl is provided", async () => {
    vi.doMock("@/config/siteConfig", () => ({
      siteConfig: { name: "Kevin Trinh", socialsList: [] },
    }));
    const { generateProjectSchema } = await import("@/lib/structured-data");
    const r = generateProjectSchema({
      id: "proj-repo",
      name: "Repo Project",
      repoUrl: "https://github.com/kevin/repo",
    });
    expect(r.codeRepository).toBe("https://github.com/kevin/repo");
    expect(r.url).toBe(`${BASE_URL}/projects/proj-repo`);
    expect(r.sameAs).toEqual(["https://github.com/kevin/repo"]);
  });

  it("uses liveUrl when both liveUrl and repoUrl are provided", async () => {
    vi.doMock("@/config/siteConfig", () => ({
      siteConfig: { name: "Kevin Trinh", socialsList: [] },
    }));
    const { generateProjectSchema } = await import("@/lib/structured-data");
    const r = generateProjectSchema({
      id: "proj-live",
      name: "Live Project",
      liveUrl: "https://myapp.com",
      repoUrl: "https://github.com/kevin/repo",
    });
    expect(r.url).toBe(`${BASE_URL}/projects/proj-live`);
    expect(r.sameAs).toEqual(["https://myapp.com", "https://github.com/kevin/repo"]);
    expect(r.codeRepository).toBe("https://github.com/kevin/repo");
  });

  it("includes programmingLanguage when technologies are provided", async () => {
    vi.doMock("@/config/siteConfig", () => ({
      siteConfig: { name: "Kevin Trinh", socialsList: [] },
    }));
    const { generateProjectSchema } = await import("@/lib/structured-data");
    const r = generateProjectSchema({
      id: "proj-tech",
      name: "Tech Project",
      technologies: ["TypeScript", "React", "Node.js"],
    });
    expect(r.programmingLanguage).toEqual(["TypeScript", "React", "Node.js"]);
  });

  it("omits programmingLanguage when technologies array is empty", async () => {
    vi.doMock("@/config/siteConfig", () => ({
      siteConfig: { name: "Kevin Trinh", socialsList: [] },
    }));
    const { generateProjectSchema } = await import("@/lib/structured-data");
    const r = generateProjectSchema({
      id: "proj-empty-tech",
      name: "Empty Tech",
      technologies: [],
    });
    expect(r.programmingLanguage).toBeUndefined();
  });

  it("includes dateCreated when provided", async () => {
    vi.doMock("@/config/siteConfig", () => ({
      siteConfig: { name: "Kevin Trinh", socialsList: [] },
    }));
    const { generateProjectSchema } = await import("@/lib/structured-data");
    const r = generateProjectSchema({
      id: "proj-date",
      name: "Dated Project",
      dateCreated: "2024-01-15",
    });
    expect(r.dateCreated).toBe("2024-01-15");
  });
});

describe("generateArticleSchema", () => {
  beforeEach(() => { vi.resetModules(); });

  it("uses the requested article language in the canonical URL and schema", async () => {
    const { generateArticleSchema } = await import("@/lib/structured-data");
    const schema = generateArticleSchema({
      title: "English GEO audit",
      slug: "ai-search-visibility-audit-geo",
      date: "2026-08-29",
    }, "en");

    expect(schema).toMatchObject({
      url: "https://me.itheheda.online/en/articles/ai-search-visibility-audit-geo",
      inLanguage: "en",
    });
  });

  it("returns BlogPosting schema with minimal fields", async () => {
    vi.doMock("@/config/siteConfig", () => ({
      siteConfig: { name: "Kevin Trinh", socialsList: [] },
    }));
    const { generateArticleSchema } = await import("@/lib/structured-data");
    const r = generateArticleSchema({
      title: "Hello World",
      slug: "hello-world",
      summary: "My first post",
      date: "2024-01-01",
    });
    expect(r["@type"]).toBe("BlogPosting");
    expect(r.headline).toBe("Hello World");
    expect(r.description).toBe("My first post");
    expect(r.url).toBe(`${BASE_URL}/articles/hello-world`);
    expect(r.mainEntityOfPage).toEqual({ "@type": "WebPage", "@id": `${BASE_URL}/articles/hello-world` });
    expect(r.datePublished).toBe("2024-01-01");
    expect(r.dateModified).toBe("2024-01-01");
    expect(r.image).toBeUndefined();
    expect(r.keywords).toBeUndefined();
    expect(r.timeRequired).toBeUndefined();
  });

  it("includes image with absolute URL as-is", async () => {
    vi.doMock("@/config/siteConfig", () => ({
      siteConfig: { name: "Kevin Trinh", socialsList: [] },
    }));
    const { generateArticleSchema } = await import("@/lib/structured-data");
    const r = generateArticleSchema({
      title: "Article",
      slug: "article-1",
      date: "2024-02-01",
      imageSrc: "https://cdn.example.com/hero.jpg",
    });
    expect(r.image).toBe("https://cdn.example.com/hero.jpg");
  });

  it("prefixes relative image with BASE_URL", async () => {
    vi.doMock("@/config/siteConfig", () => ({
      siteConfig: { name: "Kevin Trinh", socialsList: [] },
    }));
    const { generateArticleSchema } = await import("@/lib/structured-data");
    const r = generateArticleSchema({
      title: "Article",
      slug: "article-2",
      date: "2024-03-01",
      imageSrc: "/images/hero.png",
    });
    expect(r.image).toBe(`${BASE_URL}/images/hero.png`);
  });

  it("includes tags as keywords when provided", async () => {
    vi.doMock("@/config/siteConfig", () => ({
      siteConfig: { name: "Kevin Trinh", socialsList: [] },
    }));
    const { generateArticleSchema } = await import("@/lib/structured-data");
    const r = generateArticleSchema({
      title: "Tagged Article",
      slug: "tagged",
      date: "2024-04-01",
      tags: ["javascript", "react", "tutorial"],
    });
    expect(r.keywords).toBe("javascript, react, tutorial");
  });

  it("omits keywords when tags array is empty", async () => {
    vi.doMock("@/config/siteConfig", () => ({
      siteConfig: { name: "Kevin Trinh", socialsList: [] },
    }));
    const { generateArticleSchema } = await import("@/lib/structured-data");
    const r = generateArticleSchema({
      title: "Empty Tags",
      slug: "empty-tags",
      date: "2024-05-01",
      tags: [],
    });
    expect(r.keywords).toBeUndefined();
  });

  it("includes readingTime as ISO 8601 duration", async () => {
    vi.doMock("@/config/siteConfig", () => ({
      siteConfig: { name: "Kevin Trinh", socialsList: [] },
    }));
    const { generateArticleSchema } = await import("@/lib/structured-data");
    const r = generateArticleSchema({
      title: "Long Read",
      slug: "long-read",
      date: "2024-06-01",
      readingTime: 12,
    });
    expect(r.timeRequired).toBe("PT12M");
  });

  it("uses updated date for dateModified when provided", async () => {
    vi.doMock("@/config/siteConfig", () => ({
      siteConfig: { name: "Kevin Trinh", socialsList: [] },
    }));
    const { generateArticleSchema } = await import("@/lib/structured-data");
    const r = generateArticleSchema({
      title: "Updated Article",
      slug: "updated",
      date: "2024-01-01",
      updated: "2024-06-15",
    });
    expect(r.datePublished).toBe("2024-01-01");
    expect(r.dateModified).toBe("2024-06-15");
  });
});

describe("generateVideoSchema", () => {
  beforeEach(() => { vi.resetModules(); });

  it("returns VideoObject schema with minimal fields", async () => {
    vi.doMock("@/config/siteConfig", () => ({
      siteConfig: { name: "Kevin Trinh", socialsList: [] },
    }));
    const { generateVideoSchema } = await import("@/lib/structured-data");
    const r = generateVideoSchema({
      title: "My Video",
      description: "A great video",
      thumbnailUrl: "https://i.ytimg.com/vi/abc123/default.jpg",
      videoUrl: "https://www.youtube.com/watch?v=abc123",
      uploadDate: "2024-01-01",
    });
    expect(r["@type"]).toBe("VideoObject");
    expect(r.name).toBe("My Video");
    expect(r.description).toBe("A great video");
    expect(r.thumbnailUrl).toBe("https://i.ytimg.com/vi/abc123/default.jpg");
    expect(r.contentUrl).toBe("https://www.youtube.com/watch?v=abc123");
    expect(r.embedUrl).toBe("https://www.youtube.com/embed/abc123");
    expect(r.uploadDate).toBe("2024-01-01");
    expect(r.duration).toBeUndefined();
    expect(r.interactionStatistic).toBeUndefined();
  });

  it("includes duration when provided", async () => {
    vi.doMock("@/config/siteConfig", () => ({
      siteConfig: { name: "Kevin Trinh", socialsList: [] },
    }));
    const { generateVideoSchema } = await import("@/lib/structured-data");
    const r = generateVideoSchema({
      title: "Timed Video",
      thumbnailUrl: "https://i.ytimg.com/vi/abc123/default.jpg",
      videoUrl: "https://www.youtube.com/watch?v=abc123",
      uploadDate: "2024-02-01",
      duration: "PT15M30S",
    });
    expect(r.duration).toBe("PT15M30S");
  });

  it("includes viewCount as interactionStatistic when provided", async () => {
    vi.doMock("@/config/siteConfig", () => ({
      siteConfig: { name: "Kevin Trinh", socialsList: [] },
    }));
    const { generateVideoSchema } = await import("@/lib/structured-data");
    const r = generateVideoSchema({
      title: "Popular Video",
      thumbnailUrl: "https://i.ytimg.com/vi/abc123/default.jpg",
      videoUrl: "https://www.youtube.com/watch?v=abc123",
      uploadDate: "2024-03-01",
      viewCount: 42000,
    });
    expect(r.interactionStatistic).toEqual({
      "@type": "InteractionCounter",
      interactionType: "https://schema.org/WatchAction",
      userInteractionCount: 42000,
    });
  });

  it("includes both duration and viewCount when both provided", async () => {
    vi.doMock("@/config/siteConfig", () => ({
      siteConfig: { name: "Kevin Trinh", socialsList: [] },
    }));
    const { generateVideoSchema } = await import("@/lib/structured-data");
    const r = generateVideoSchema({
      title: "Full Video",
      thumbnailUrl: "https://i.ytimg.com/vi/abc123/default.jpg",
      videoUrl: "https://www.youtube.com/watch?v=abc123",
      uploadDate: "2024-04-01",
      duration: "PT1H30M",
      viewCount: 999999,
    });
    expect(r.duration).toBe("PT1H30M");
    expect(r.interactionStatistic.userInteractionCount).toBe(999999);
  });
});

describe("generateProfilePageSchema", () => {
  beforeEach(() => { vi.resetModules(); });

  it("returns ProfilePage schema referencing Person schema", async () => {
    vi.doMock("@/config/siteConfig", () => ({
      siteConfig: {
        name: "Kevin Trinh",
        title: "CS Student",
        tagline: "Building thoughtful software.",
        location: "Houston, TX",
        socialsList: [
          { key: "github", href: "https://github.com/kevin" },
        ],
      },
    }));
    const { generateProfilePageSchema } = await import("@/lib/structured-data");
    const r = generateProfilePageSchema();
    expect(r["@type"]).toBe("ProfilePage");
    expect(r.name).toBe("Kevin Trinh - CS Student");
    expect(r.description).toBe("Building thoughtful software.");
    expect(r.url).toBe(BASE_URL);
    expect(r.mainEntity["@type"]).toBe("Person");
    expect(r.mainEntity.name).toBe("Kevin Trinh");
    expect(r.mainEntity.jobTitle).toBe("CS Student");
  });
});

describe("public enterprise structured data", () => {
  it("uses the reviewed public identity and service model", async () => {
    const {
      generateProfessionalServiceSchema,
      generatePublicPersonSchema,
      generatePublicWebSiteSchema,
    } = await import("@/lib/structured-data");

    const person = generatePublicPersonSchema();
    const website = generatePublicWebSiteSchema();
    const service = generateProfessionalServiceSchema();

    expect(person["@type"]).toBe("Organization");
    expect(person.name).toBe("实解智能");
    expect(person.alternateName).toBe("SolveReal Systems");
    expect(person.description).toContain("人工衔接");
    expect(website.name).toBe("实解智能");
    expect(website.alternateName).toBe("SolveReal Systems");
    expect(website.url).toBe(BASE_URL);
    expect(website.dateModified).toBe("2026-09-04");
    expect(website["@id"]).toBe(`${BASE_URL}/#website`);
    expect(website.author).toEqual({ "@id": `${BASE_URL}/#organization` });
    expect(service["@type"]).toBe("ProfessionalService");
    expect(service["@id"]).toBe(`${BASE_URL}/#professional-service`);
    expect(service.provider).toEqual({ "@id": `${BASE_URL}/#organization` });
    expect(service.potentialAction.target).toBe(`${BASE_URL}/contact`);
    expect(service.serviceType.length).toBeGreaterThan(1);

    const englishPerson = generatePublicPersonSchema("en");
    const englishWebsite = generatePublicWebSiteSchema("en");
    const englishService = generateProfessionalServiceSchema("en");
    expect(englishPerson.name).toBe("实解智能");
    expect(englishPerson.alternateName).toBe("SolveReal Systems");
    expect(englishWebsite.name).toBe("实解智能");
    expect(englishWebsite.alternateName).toBe("SolveReal Systems");
    expect(englishWebsite.url).toBe(BASE_URL);
    expect(englishWebsite.inLanguage).toEqual(["zh-CN", "en"]);
    expect(englishService.name).toContain("SolveReal Systems");
    expect(englishService.potentialAction.target).toBe(`${BASE_URL}/en/contact`);
  });

  it("uses the public organization consistently for article author and publisher", async () => {
    vi.resetModules();
    const { generateArticleSchema } = await import("@/lib/structured-data");
    const article = generateArticleSchema({
      title: "企业 AI 工作流",
      slug: "enterprise-ai-workflow",
      date: "2026-08-10",
    });

    expect(article.author).toEqual({
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`,
      name: "实解智能",
      url: BASE_URL,
    });
    expect(article.publisher).toEqual(article.author);
  });

  it("describes the article archive as a canonical CollectionPage and ItemList", async () => {
    vi.resetModules();
    const { generateArticleCollectionSchema } = await import("@/lib/structured-data");
    const schema = generateArticleCollectionSchema([
      {
        title: "第一篇",
        slug: "first",
        summary: "第一篇摘要",
        date: "2026-08-10",
        updated: "2026-08-21",
        publicPath: "/articles/first",
      },
    ]);

    expect(schema).toMatchObject({
      "@type": "CollectionPage",
      "@id": `${BASE_URL}/articles#collection`,
      url: `${BASE_URL}/articles`,
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: 1,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            url: `${BASE_URL}/articles/first`,
            item: {
              "@type": "BlogPosting",
              headline: "第一篇",
              description: "第一篇摘要",
              datePublished: "2026-08-10",
              dateModified: "2026-08-21",
            },
          },
        ],
      },
    });
  });

  it("describes the public project library without inventing prices", async () => {
    vi.resetModules();
    const { generateProjectCollectionSchema } = await import("@/lib/structured-data");
    const schema = generateProjectCollectionSchema([
      {
        id: "open-geo-console",
        name: "Open GEO Console",
        summary: "AI 搜索可见性诊断与整改",
        liveUrl: "https://geo.itheheda.online",
      },
    ]);

    expect(schema).toMatchObject({
      "@type": "CollectionPage",
      "@id": `${BASE_URL}/projects#collection`,
      url: `${BASE_URL}/projects`,
      isPartOf: { "@id": `${BASE_URL}/#website` },
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: 1,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            url: `${BASE_URL}/projects#open-geo-console`,
            item: {
              "@id": `${BASE_URL}/projects/open-geo-console#software`,
              "@type": "SoftwareApplication",
            },
          },
        ],
      },
    });
    expect(JSON.stringify(schema)).not.toContain('"price"');
  });
});
