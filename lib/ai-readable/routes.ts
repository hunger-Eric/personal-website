import rawCaseConfig from "@/config/cases.json";
import pagesData from "@/config/pages.json";
import photographyData from "@/config/photography.json";
import { siteConfig } from "@/config/siteConfig";
import { getArticles } from "@/lib/mdx/mdx";
import { SITE_URL } from "@/lib/site-url";

export type ReadableRouteKind =
  | "primary"
  | "project"
  | "article"
  | "photography"
  | "custom"
  | "machine";

export type ReadableRoute = {
  kind: ReadableRouteKind;
  path: string;
  url: string;
  title: string;
  description?: string;
  lastModified?: Date;
  changeFrequency:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority: number;
};

type RawCaseConfig = {
  github_readme_projects?: Array<{
    repo_url?: string;
    name?: string;
    summary?: string;
    priority?: number;
    updated?: string;
    end?: string;
    status?: string;
  }>;
  local_projects?: Array<{
    id?: string;
    name?: string;
    summary?: string;
    priority?: number;
    updated?: string;
    end?: string;
    status?: string;
  }>;
};

type RawPageConfig = {
  pages?: Array<{
    slug?: string;
    title?: string;
    description?: string;
    updated?: string;
  }>;
};

type RawPhotographyConfig = {
  zh?: {
    projects?: Array<{
      slug?: string;
      title?: string;
      description?: string;
      date?: string;
      photos?: Array<{ private?: boolean; src?: string; title?: string }>;
    }>;
  };
  en?: {
    projects?: Array<{
      slug?: string;
      title?: string;
      description?: string;
      date?: string;
    }>;
  };
};

function absoluteUrl(path: string) {
  if (path === "/") return `${SITE_URL}/`;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function dateOrUndefined(value?: string) {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function repoRouteId(repoUrl?: string, fallback?: string) {
  if (!repoUrl) return fallback || "";
  try {
    const url = new URL(repoUrl);
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length >= 2) return `${parts[0]}-${parts[1]}`.toLowerCase();
  } catch {
    return fallback || "";
  }
  return fallback || "";
}

function buildStaticRoutes(): ReadableRoute[] {
  const routes: ReadableRoute[] = [
    {
      kind: "primary",
      path: "/",
      url: absoluteUrl("/"),
      title: "Home",
      description: siteConfig.tagline,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      kind: "primary",
      path: "/projects",
      url: absoluteUrl("/projects"),
      title: "Projects",
      description: "AI Native system cases and project archive.",
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      kind: "primary",
      path: "/links",
      url: absoluteUrl("/links"),
      title: "Links",
      description: "Canonical contact and social links.",
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      kind: "primary",
      path: "/content",
      url: absoluteUrl("/content"),
      title: "Content",
      description: "Public writing, video, and social channels.",
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      kind: "primary",
      path: "/photography",
      url: absoluteUrl("/photography"),
      title: "Photography",
      description: "Photography projects and visual notes.",
      changeFrequency: "monthly",
      priority: 0.65,
    },
    {
      kind: "primary",
      path: "/resume",
      url: absoluteUrl("/resume"),
      title: "Resume",
      description: "Canonical resume endpoint.",
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  return routes.filter((route) => {
    if (route.path === "/projects") return Boolean(siteConfig.sections?.projects);
    if (route.path === "/articles") return Boolean(siteConfig.sections?.articles);
    return true;
  });
}

function buildCaseRoutes(): ReadableRoute[] {
  const cfg = rawCaseConfig as RawCaseConfig;
  const github = (cfg.github_readme_projects || []).map((entry, index) => {
    const id = repoRouteId(entry.repo_url, entry.name);
    return {
      kind: "project" as const,
      path: `/projects/${id}`,
      url: absoluteUrl(`/projects/${id}`),
      title: entry.name || id,
      description: entry.summary,
      lastModified: dateOrUndefined(entry.updated || entry.end),
      changeFrequency: "monthly" as const,
      priority: entry.priority ? Math.max(0.5, Math.min(0.85, entry.priority / 100)) : 0.65,
      _order: entry.priority ?? index,
    };
  });

  const local = (cfg.local_projects || []).map((entry, index) => {
    const id = entry.id || entry.name || "";
    return {
      kind: "project" as const,
      path: `/projects/${id}`,
      url: absoluteUrl(`/projects/${id}`),
      title: entry.name || id,
      description: entry.summary,
      lastModified: dateOrUndefined(entry.updated || entry.end),
      changeFrequency: "monthly" as const,
      priority: entry.priority ? Math.max(0.5, Math.min(0.9, entry.priority / 100)) : 0.7,
      _order: entry.priority ?? 500 + index,
    };
  });

  return [...github, ...local]
    .filter((route) => route.path !== "/projects/")
    .sort((a, b) => a._order - b._order)
    .map((route) => {
      const { _order: sortOrder, ...readableRoute } = route;
      void sortOrder;
      return readableRoute;
    });
}

function buildPhotographyRoutes(): ReadableRoute[] {
  const data = photographyData as RawPhotographyConfig;
  const zhProjects = data.zh?.projects || [];
  const enBySlug = new Map((data.en?.projects || []).map((project) => [project.slug, project]));

  return zhProjects
    .filter((project) => project.slug)
    .map((project) => {
      const en = enBySlug.get(project.slug);
      return {
        kind: "photography" as const,
        path: `/photography/${project.slug}`,
        url: absoluteUrl(`/photography/${project.slug}`),
        title: en?.title || project.title || project.slug || "Photography project",
        description: en?.description || project.description,
        lastModified: dateOrUndefined(project.date),
        changeFrequency: "monthly" as const,
        priority: 0.55,
      };
    });
}

function buildMachineRoutes(): ReadableRoute[] {
  return [
    {
      kind: "machine",
      path: "/llms.txt",
      url: absoluteUrl("/llms.txt"),
      title: "llms.txt",
      description: "Markdown map for AI systems and crawlers.",
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      kind: "machine",
      path: "/feed.xml",
      url: absoluteUrl("/feed.xml"),
      title: "RSS feed",
      description: "RSS feed for published articles.",
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      kind: "machine",
      path: "/feed.json",
      url: absoluteUrl("/feed.json"),
      title: "JSON feed",
      description: "JSON Feed 1.1 for published articles.",
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      kind: "machine",
      path: "/sitemap.xml",
      url: absoluteUrl("/sitemap.xml"),
      title: "Sitemap",
      description: "Canonical XML sitemap for public and machine-readable pages.",
      changeFrequency: "weekly",
      priority: 0.75,
    },
    {
      kind: "machine",
      path: "/.well-known/brand-facts.json",
      url: absoluteUrl("/.well-known/brand-facts.json"),
      title: "Brand facts",
      description: "Canonical identity, work, writing, and citation facts.",
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];
}

export async function getReadableRoutes(): Promise<ReadableRoute[]> {
  const articles = siteConfig.sections?.articles ? await getArticles() : [];
  const articleRoutes: ReadableRoute[] = articles.map((article) => ({
    kind: "article",
    path: `/articles/${article.slug}`,
    url: absoluteUrl(`/articles/${article.slug}`),
    title: article.title,
    description: article.summary,
    lastModified: dateOrUndefined(article.updated || article.date),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const pages = (pagesData as RawPageConfig).pages || [];
  const customRoutes: ReadableRoute[] = pages
    .filter((page) => page.slug)
    .map((page) => ({
      kind: "custom",
      path: `/page/${page.slug}`,
      url: absoluteUrl(`/page/${page.slug}`),
      title: page.title || page.slug || "Custom page",
      description: page.description,
      lastModified: dateOrUndefined(page.updated),
      changeFrequency: "monthly",
      priority: 0.5,
    }));

  return [
    ...buildStaticRoutes(),
    ...(siteConfig.sections?.articles
      ? [
          {
            kind: "primary" as const,
            path: "/articles",
            url: absoluteUrl("/articles"),
            title: "Articles",
            description: "Published articles and lab notes.",
            changeFrequency: "weekly" as const,
            priority: 0.8,
          },
        ]
      : []),
    ...buildCaseRoutes(),
    ...articleRoutes,
    ...buildPhotographyRoutes(),
    ...customRoutes,
    ...buildMachineRoutes(),
  ];
}

export function groupReadableRoutes(routes: ReadableRoute[]) {
  return routes.reduce<Record<ReadableRouteKind, ReadableRoute[]>>(
    (groups, route) => {
      groups[route.kind].push(route);
      return groups;
    },
    {
      primary: [],
      project: [],
      article: [],
      photography: [],
      custom: [],
      machine: [],
    }
  );
}
