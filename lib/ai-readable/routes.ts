import { publicContent } from "@/config/public-content";
import { publicIdentity } from "@/config/public-identity";
import { getArticles } from "@/lib/mdx/mdx";
import { SITE_URL } from "@/lib/site-url";

export type ReadableRouteKind = "primary" | "project" | "article" | "machine";

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

function absoluteUrl(path: string) {
  return path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`;
}

function dateOrUndefined(value?: string) {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function primaryRoutes(): ReadableRoute[] {
  return [
    {
      kind: "primary",
      path: "/",
      url: absoluteUrl("/"),
      title: "Home",
      description: publicIdentity.positioning.en,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      kind: "primary",
      path: "/projects",
      url: absoluteUrl("/projects"),
      title: "Cases",
      description: "Reviewed evidence of transferable AI automation delivery.",
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      kind: "primary",
      path: "/contact",
      url: absoluteUrl("/contact"),
      title: "Submit a workflow problem",
      description: publicIdentity.contact.promise.en,
      changeFrequency: "monthly",
      priority: 0.95,
    },
    {
      kind: "primary",
      path: "/about",
      url: absoluteUrl("/about"),
      title: "About",
      description: publicIdentity.description.en,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      kind: "primary",
      path: "/articles",
      url: absoluteUrl("/articles"),
      title: "Articles",
      description: "Original writing about AI, agents, automation, and workflows.",
      changeFrequency: "weekly",
      priority: 0.65,
    },
  ];
}

function projectRoutes(): ReadableRoute[] {
  return publicContent.projects.map((project) => ({
    kind: "project" as const,
    path: `/projects/${project.id}`,
    url: absoluteUrl(`/projects/${project.id}`),
    title: project.name.en ?? project.name.zh ?? project.id,
    description: project.purpose?.en ?? project.purpose?.zh,
    lastModified: dateOrUndefined(project.reviewedAt),
    changeFrequency: "monthly" as const,
    priority: project.featured ? 0.85 : 0.7,
  }));
}

function machineRoutes(): ReadableRoute[] {
  const common = {
    kind: "machine" as const,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  };
  return [
    {
      ...common,
      path: "/llms.txt",
      url: absoluteUrl("/llms.txt"),
      title: "llms.txt",
      description: "Canonical Markdown guide for AI systems.",
    },
    {
      ...common,
      path: "/.well-known/brand-facts.json",
      url: absoluteUrl("/.well-known/brand-facts.json"),
      title: "Brand facts",
      description: "Canonical identity and positioning facts.",
    },
    {
      ...common,
      path: "/ai/services.json",
      url: absoluteUrl("/ai/services.json"),
      title: "Service facts",
      description: "Problem fit, delivery method, and engagement boundaries.",
    },
    {
      ...common,
      path: "/ai/projects.json",
      url: absoluteUrl("/ai/projects.json"),
      title: "Case index",
      description: "Index of reviewed public project evidence.",
    },
    ...publicContent.projects.map((project) => ({
      ...common,
      path: `/ai/projects/${project.id}.json`,
      url: absoluteUrl(`/ai/projects/${project.id}.json`),
      title: `${project.name.en ?? project.name.zh ?? project.id} facts`,
      description: "Complete reviewed public facts for this case.",
    })),
    {
      ...common,
      path: "/sitemap.xml",
      url: absoluteUrl("/sitemap.xml"),
      title: "Sitemap",
      description: "Canonical public route inventory.",
    },
    {
      ...common,
      path: "/feed.xml",
      url: absoluteUrl("/feed.xml"),
      title: "RSS feed",
      description: "RSS feed for relevant published articles.",
      priority: 0.5,
    },
    {
      ...common,
      path: "/feed.json",
      url: absoluteUrl("/feed.json"),
      title: "JSON feed",
      description: "JSON feed for relevant published articles.",
      priority: 0.5,
    },
  ];
}

export async function getReadableRoutes(): Promise<ReadableRoute[]> {
  const articles = await getArticles();
  const articleRoutes: ReadableRoute[] = articles.map((article) => ({
    kind: "article",
    path: `/articles/${article.slug}`,
    url: absoluteUrl(`/articles/${article.slug}`),
    title: article.title,
    description: article.summary,
    lastModified: dateOrUndefined(article.updated || article.date),
    changeFrequency: "monthly",
    priority: 0.55,
  }));

  return [
    ...primaryRoutes(),
    ...projectRoutes(),
    ...articleRoutes,
    ...machineRoutes(),
  ];
}

export function groupReadableRoutes(routes: ReadableRoute[]) {
  return routes.reduce<Record<ReadableRouteKind, ReadableRoute[]>>(
    (groups, route) => {
      groups[route.kind].push(route);
      return groups;
    },
    { primary: [], project: [], article: [], machine: [] }
  );
}
