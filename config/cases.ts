// config/cases.ts
import rawConfig from "./cases.json";
import { caseStories } from "./caseStories";
import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

export type CaseLinkType =
  | "github"
  | "live"
  | "docs"
  | "download"
  | "video"
  | "other";

export type CaseLink = {
  label: string;
  href: string;
  type?: CaseLinkType;
};

export type CaseArchitectureItem = {
  label: string;
  detail: string;
};

export type CaseDemoType = "knowledge-flow" | "lead-flow" | "asset-flow";

export type CaseDemoStep = {
  title: string;
  status: string;
  input: string;
  output: string;
  metric?: string;
  logs?: string[];
};

export type CaseDemo = {
  type: CaseDemoType;
  title: string;
  description: string;
  steps: CaseDemoStep[];
  result: {
    label: string;
    cta: string;
  };
};

export type CustomerStoryStep = {
  title: string;
  customerAction: string;
  systemAction: string;
  visibleOutput: string;
  artifactPreview: string;
  proof?: string;
  metric?: string;
};

export type CustomerStory = {
  archetype: "knowledge-system" | "lead-discovery" | "ui-asset-runtime" | string;
  headline: string;
  chapterTitle?: string;
  shortPromise?: string;
  animationSrc?: string;
  posterSrc?: string;
  sceneAccent?: string;
  publicScenario: string;
  exampleInput: string;
  transferableValue: string;
  artifactLabel: string;
  proofPoints: string[];
  steps: CustomerStoryStep[];
};

export type CaseItem = {
  id: string;
  name: string;

  summary: string;
  description?: string[];
  format?: string;

  start: string;
  end: string;
  // NEW: optional image for featured ticker / cards
  imageUrl?: string;

  technologies?: string[];
  links?: CaseLink[];
  featured?: boolean;
  archive?: boolean;
  caseType?: string;
  role?: string;
  status?: string;
  tags?: string[];
  workflows?: string[];
  aiStack?: string[];
  automation?: string[];
  experiments?: string[];
  problem?: string[];
  systemOverview?: string[];
  aiOrchestration?: string[];
  architecture?: CaseArchitectureItem[];
  results?: string[];
  learnings?: string[];
  demo?: CaseDemo;
  customerStory?: CustomerStory;

  // Static shields / badges to show in the popup
  badges?: string[];

  // For AUTO date behavior (in UI layer)
  autoInactiveThresholdDays?: number;

  // GitHub stats
  githubStars?: number;
  githubForks?: number;
  // For our new system: downloads for the latest release (if stats_downloads is true)
  downloads?: number;

  // Extra GitHub repo metadata (for modal)
  repoDescription?: string;
  repoHomepage?: string;
  repoTopics?: string[];
  repoLicense?: string;
  repoCreatedAt?: string;
  repoPushedAt?: string;

  // Latest release metadata (optional, only when stats_downloads is true)
  githubLatestReleaseTag?: string;
  githubLatestReleaseName?: string;
  githubLatestReleasePublishedAt?: string;

  // Cached README (client never fetches; rendered in modal only if present)
  readmePlainExcerpt?: string;
  readmePlainFull?: string;
  readmeHtmlExcerpt?: string;
  readmeHtmlFull?: string;

  // For locals, we may carry this to gate README usage in the modal
  githubRepoUrl?: string;
};

export type ProjectLinkType = CaseLinkType;
export type ProjectLink = CaseLink;
export type ProjectItem = CaseItem;

// Raw JSON shapes
type RawGithubReadmeProject = Partial<CaseItem> & {
  repo_url: string;
  priority?: number;
  zh?: Partial<CaseItem>;
  en?: Partial<CaseItem>;
};

type RawLocalCase = CaseItem & {
  priority?: number;
  stats?: {
    stars?: boolean;
    forks?: boolean;
    downloads?: boolean;
  };
};

type RawConfig = {
  display?: {
    mode?: "auto" | "featured" | "catalog";
    autoCatalogThreshold?: number;
    featuredCount?: number;
    previewLimit?: number;
  };
  github_readme_projects: RawGithubReadmeProject[];
  local_projects: RawLocalCase[];
};

const cfg: RawConfig = (rawConfig as RawConfig) ?? {
  github_readme_projects: [],
  local_projects: [],
};

type GithubReleaseAsset = {
  download_count?: number;
};

// Helpers
const MAX_README_BYTES = 150_000; // cap to keep builds lean

function mdToSafeHtml(md: string): string {
  // Newer `marked` no longer accepts { mangle, headerIds } on parse.
  // Just parse and let sanitize-html strip any unwanted attributes (like id).
  const raw = (marked.parse(md) as string) || "";
  return sanitizeHtml(raw, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "img",
      "h1",
      "h2",
      "h3",
      "pre",
      "code",
      "table",
      "div",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "hr",
      "details",
      "summary",
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "title", "width", "height"],
      code: ["class"],
      pre: ["class"],
      th: ["colspan", "rowspan", "align"],
      td: ["colspan", "rowspan", "align"],
    },
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
    },
  });
}

function parseOwnerRepo(url: string): { owner: string; repo: string } {
  const cleaned = url
    .replace(/^git\+https?:\/\//i, "")
    .replace(/^https?:\/\//i, "")
    .replace(/#.*$/, "")
    .replace(/\?.*$/, "")
    .replace(/\.git$/i, "")
    .replace(/\/+$/, "");
  const m = cleaned.match(/github\.com\/([^/]+)\/([^/]+)/i);
  if (!m) throw new Error(`Invalid GitHub repo URL: ${url}`);
  return { owner: m[1], repo: m[2] };
}

/** Optional JSON blob in README:
 * <!-- devfoliox { "title": "...", "summary": "...", ... } -->
 */
function extractMetaFromReadme(readme: string) {
  const match = readme.match(
    /<!--\s*devfoliox(?:-project)?\s*([\s\S]*?)\s*-->/i
  );
  if (!match) return null;
  try {
      const meta = JSON.parse(match[1].trim()) as {
        title?: string;
        summary?: string;
        description?: string[];
        format?: string;
        case_format?: string;
        technologies?: string[];
        start?: string;
        end?: string;
      links?: CaseLink[];
      githubStars?: number;
      githubForks?: number;
      downloads?: number;
      featured?: boolean;
      stats_stars?: boolean;
      stats_forks?: boolean;
      stats_downloads?: boolean;
      badges?: string[];
      auto_inactive_threshold_days?: number;
      image_url?: string; // NEW
    };

    return meta;
  } catch {
    return null;
  }
}

// Turn relative URLs into absolute GitHub links
function absolutizeHtml(html: string, owner: string, repo: string) {
  // Raw content host for images
  const RAW = `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/`;
  // Web view for links
  const BLOB = `https://github.com/${owner}/${repo}/blob/HEAD/`;

  // Convert src/href that don't start with http(s), //, data:, mailto:, tel:, or #
  return html.replace(
    /\b(src|href)="(?!https?:|\/\/|data:|mailto:|tel:|#)([^"]+)"/g,
    (_m, attr, url) => {
      const clean = url.replace(/^\.?\//, ""); // strip leading ./ or /
      const base = attr === "src" ? RAW : BLOB;
      return `${attr}="${base}${clean}"`;
    }
  );
}

function sliceReadmeWithBase(md: string, owner?: string, repo?: string) {
  const trimmed = md.trim();
  const cutAt = trimmed.indexOf("\n## ");
  const excerptMd = trimmed.slice(0, cutAt > 0 ? cutAt : 1200).trim();
  const fullMd =
    trimmed.length > MAX_README_BYTES
      ? trimmed.slice(0, MAX_README_BYTES)
      : trimmed;

  let htmlExcerpt = mdToSafeHtml(excerptMd);
  let htmlFull = mdToSafeHtml(fullMd);

  if (owner && repo) {
    htmlExcerpt = absolutizeHtml(htmlExcerpt, owner, repo);
    htmlFull = absolutizeHtml(htmlFull, owner, repo);
  }

  return {
    plainExcerpt: excerptMd,
    plainFull: fullMd,
    htmlExcerpt,
    htmlFull,
  };
}

function githubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "devfoliox-projects",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

async function fetchGithubStats(
  owner: string,
  repo: string,
  opts: {
    stats_stars?: boolean;
    stats_forks?: boolean;
    stats_downloads?: boolean;
  },
  revalidateSeconds: number
): Promise<{
  stars?: number;
  forks?: number;
  downloads?: number;
  repoDescription?: string;
  repoHomepage?: string;
  repoTopics?: string[];
  license?: string;
  createdAt?: string;
  pushedAt?: string;
  latestReleaseTag?: string;
  latestReleaseName?: string;
  latestReleasePublishedAt?: string;
}> {
  const wantStars = !!opts.stats_stars;
  const wantForks = !!opts.stats_forks;
  const wantDownloads = !!opts.stats_downloads;

  let stars: number | undefined;
  let forks: number | undefined;
  let downloads: number | undefined;

  let repoDescription: string | undefined;
  let repoHomepage: string | undefined;
  let repoTopics: string[] | undefined;
  let license: string | undefined;
  let createdAt: string | undefined;
  let pushedAt: string | undefined;
  let latestReleaseTag: string | undefined;
  let latestReleaseName: string | undefined;
  let latestReleasePublishedAt: string | undefined;

  const [repoJson, releasesJson] = await Promise.all([
    fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: githubHeaders(),
      next: { revalidate: revalidateSeconds },
    })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null),
    wantDownloads
      ? fetch(
          `https://api.github.com/repos/${owner}/${repo}/releases?per_page=1`,
          {
            headers: githubHeaders(),
            next: { revalidate: revalidateSeconds },
          }
        )
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null)
      : Promise.resolve(null),
  ]);

  if (repoJson) {
    // core stats
    if (wantStars && Number.isFinite(Number(repoJson.stargazers_count))) {
      stars = Number(repoJson.stargazers_count);
    }
    if (wantForks && Number.isFinite(Number(repoJson.forks_count))) {
      forks = Number(repoJson.forks_count);
    }

    // extra repo metadata
    if (typeof repoJson.description === "string" && repoJson.description) {
      repoDescription = repoJson.description;
    }

    if (typeof repoJson.homepage === "string" && repoJson.homepage) {
      repoHomepage = repoJson.homepage;
    }

    if (Array.isArray(repoJson.topics) && repoJson.topics.length > 0) {
      repoTopics = repoJson.topics.map((t: unknown) => String(t));
    }

    if (repoJson.license) {
      const lic = repoJson.license as {
        spdx_id?: string;
        key?: string;
        name?: string;
      };
      license = lic.spdx_id || lic.key || lic.name;
    }

    if (typeof repoJson.created_at === "string") {
      createdAt = repoJson.created_at;
    }
    if (typeof repoJson.pushed_at === "string") {
      pushedAt = repoJson.pushed_at;
    }
  }

  if (Array.isArray(releasesJson) && releasesJson.length > 0 && wantDownloads) {
    const rel = releasesJson[0];
    const assets = Array.isArray(rel?.assets) ? rel.assets : [];
    downloads = (assets as GithubReleaseAsset[]).reduce(
      (sum: number, asset) => sum + (Number(asset.download_count) || 0),
      0
    );

    if (typeof rel.tag_name === "string") {
      latestReleaseTag = rel.tag_name;
    }
    if (typeof rel.name === "string" && rel.name) {
      latestReleaseName = rel.name;
    } else if (latestReleaseTag) {
      latestReleaseName = latestReleaseTag;
    }
    if (typeof rel.published_at === "string") {
      latestReleasePublishedAt = rel.published_at;
    }
  }

  return {
    stars,
    forks,
    downloads,
    repoDescription,
    repoHomepage,
    repoTopics,
    license,
    createdAt,
    pushedAt,
    latestReleaseTag,
    latestReleaseName,
    latestReleasePublishedAt,
  };
}

function sortByPriority<T extends { _priority?: number }>(items: T[]) {
  return items.sort((a, b) => (a._priority ?? 9999) - (b._priority ?? 9999));
}

// Main loader

export async function loadCases(locale: "zh" | "en" = "zh"): Promise<CaseItem[]> {
  const revalidateSeconds = 60 * 60 * 3; // 3h

  // 1) GitHub-backed (metadata from README)
  const fromGithub = await Promise.all(
    (cfg.github_readme_projects || []).map(async (entry, idx) => {
      try {
        const { owner, repo } = parseOwnerRepo(entry.repo_url);
        const id = `${owner}-${repo}`.toLowerCase();

        const readmeRes = await fetch(
          `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/README.md`,
          { headers: githubHeaders(), next: { revalidate: revalidateSeconds } }
        );

        if (!readmeRes.ok) {
          return {
            id,
            name: repo,
            summary: "GitHub project",
            start: "",
            end: "",
            githubRepoUrl: entry.repo_url,
            _priority: entry.priority ?? idx + 1,
          } as CaseItem & { _priority?: number };
        }

        const raw = await readmeRes.text();
        const clipped =
          raw.length > MAX_README_BYTES ? raw.slice(0, MAX_README_BYTES) : raw;

        const meta = extractMetaFromReadme(clipped) || undefined;

        // Build plain + HTML caches (fix relative URLs using owner/repo)
        const { plainExcerpt, plainFull, htmlExcerpt, htmlFull } =
          sliceReadmeWithBase(clipped, owner, repo);

        let stars: number | undefined;
        let forks: number | undefined;
        let downloads: number | undefined;

        let repoDescription: string | undefined;
        let repoHomepage: string | undefined;
        let repoTopics: string[] | undefined;
        let repoLicense: string | undefined;
        let repoCreatedAt: string | undefined;
        let repoPushedAt: string | undefined;
        let latestReleaseTag: string | undefined;
        let latestReleaseName: string | undefined;
        let latestReleasePublishedAt: string | undefined;

        if (meta) {
          const statResult = await fetchGithubStats(
            owner,
            repo,
            {
              stats_stars: meta.stats_stars,
              stats_forks: meta.stats_forks,
              stats_downloads: meta.stats_downloads,
            },
            revalidateSeconds
          );
          stars = statResult.stars;
          forks = statResult.forks;
          downloads = statResult.downloads;

          repoDescription = statResult.repoDescription;
          repoHomepage = statResult.repoHomepage;
          repoTopics = statResult.repoTopics;
          repoLicense = statResult.license;
          repoCreatedAt = statResult.createdAt;
          repoPushedAt = statResult.pushedAt;
          latestReleaseTag = statResult.latestReleaseTag;
          latestReleaseName = statResult.latestReleaseName;
          latestReleasePublishedAt = statResult.latestReleasePublishedAt;
        }

        // Merge locale-specific fields from entry.zh / entry.en
        const localized = entry[locale] || {};
        const entrySummary = localized.summary ?? entry.summary;
        const entryProblem = localized.problem ?? entry.problem;
        const entrySystemOverview = localized.systemOverview ?? entry.systemOverview;
        const entryAiOrchestration = localized.aiOrchestration ?? entry.aiOrchestration;
        const entryResults = localized.results ?? entry.results;
        const entryLearnings = localized.learnings ?? entry.learnings;

        return {
          id,
          name: entry.name ?? meta?.title ?? repo,
          summary: entrySummary ?? meta?.summary ?? "GitHub project",
          description: entry.description ?? meta?.description,
          format: entry.format ?? meta?.format ?? meta?.case_format,
          start: entry.start ?? meta?.start ?? "",
          end: entry.end ?? meta?.end ?? "",
          technologies: entry.technologies ?? meta?.technologies,
          links: entry.links ?? meta?.links,
          featured: entry.featured ?? meta?.featured,
          archive: entry.archive,
          caseType: entry.caseType,
          role: entry.role,
          status: entry.status,
          tags: entry.tags,
          workflows: entry.workflows,
          aiStack: entry.aiStack,
          automation: entry.automation,
          experiments: entry.experiments,
          problem: entryProblem,
          systemOverview: entrySystemOverview,
          aiOrchestration: entryAiOrchestration,
          architecture: entry.architecture,
          results: entryResults,
          learnings: entryLearnings,
          demo: entry.demo,
          // Prefer the README's image_url; otherwise fall back to a locally
          // generated branded banner so the carousel never shows a broken
          // dark fallback.
          imageUrl: entry.imageUrl ?? meta?.image_url ?? `/images/banners/${id}.svg`,

          badges: entry.badges ?? meta?.badges,
          autoInactiveThresholdDays:
            entry.autoInactiveThresholdDays ?? meta?.auto_inactive_threshold_days,

          githubStars:
            stars ??
            (typeof meta?.githubStars === "number" &&
            Number.isFinite(meta.githubStars)
              ? meta.githubStars
              : undefined),
          githubForks:
            forks ??
            (typeof meta?.githubForks === "number" &&
            Number.isFinite(meta.githubForks)
              ? meta.githubForks
              : undefined),
          downloads:
            downloads ??
            (typeof meta?.downloads === "number" &&
            Number.isFinite(meta.downloads)
              ? meta.downloads
              : undefined),

          repoDescription,
          repoHomepage,
          repoTopics,
          repoLicense,
          repoCreatedAt,
          repoPushedAt,
          githubLatestReleaseTag: latestReleaseTag,
          githubLatestReleaseName: latestReleaseName,
          githubLatestReleasePublishedAt: latestReleasePublishedAt,

          githubRepoUrl: entry.repo_url,

          // cached README (plain + HTML)
          readmePlainExcerpt: plainExcerpt,
          readmePlainFull: plainFull,
          readmeHtmlExcerpt: htmlExcerpt,
          readmeHtmlFull: htmlFull,

          _priority: entry.priority ?? idx + 1,
        } as CaseItem & { _priority?: number };
      } catch {
        const fallbackName = entry.repo_url.split("/").pop() || "Project";
        return {
          id: fallbackName.toLowerCase(),
          name: fallbackName,
          summary: "Project",
          start: "",
          end: "",
          githubRepoUrl: entry.repo_url,
          _priority: entry.priority ?? idx + 1,
        } as CaseItem & { _priority?: number };
      }
    })
  );

  // 2) Local projects (optional GitHub stats + README via githubRepoUrl)
  const locals: (CaseItem & { _priority?: number })[] = await Promise.all(
    (cfg.local_projects || []).map(async (p, idx) => {
      let stars: number | undefined;
      let forks: number | undefined;
      let downloads: number | undefined;

      let repoDescription: string | undefined = p.repoDescription;
      let repoHomepage: string | undefined = p.repoHomepage;
      let repoTopics: string[] | undefined = p.repoTopics;
      let repoLicense: string | undefined = p.repoLicense;
      let repoCreatedAt: string | undefined = p.repoCreatedAt;
      let repoPushedAt: string | undefined = p.repoPushedAt;
      let latestReleaseTag: string | undefined = p.githubLatestReleaseTag;
      let latestReleaseName: string | undefined = p.githubLatestReleaseName;
      let latestReleasePublishedAt: string | undefined =
        p.githubLatestReleasePublishedAt;

      // Defaults (so we can merge with any pre-filled values on p)
      let plainExcerpt: string | undefined = p.readmePlainExcerpt;
      let plainFull: string | undefined = p.readmePlainFull;
      let htmlExcerpt: string | undefined = p.readmeHtmlExcerpt;
      let htmlFull: string | undefined = p.readmeHtmlFull;

      if (p.githubRepoUrl) {
        try {
          const { owner, repo } = parseOwnerRepo(p.githubRepoUrl);

          // Always fetch repo metadata; flags only control stats & releases
          const statResult = await fetchGithubStats(
            owner,
            repo,
            {
              stats_stars: !!p.stats?.stars,
              stats_forks: !!p.stats?.forks,
              stats_downloads: !!p.stats?.downloads,
            },
            revalidateSeconds
          );
          stars = statResult.stars;
          forks = statResult.forks;
          downloads = statResult.downloads;

          repoDescription = repoDescription ?? statResult.repoDescription;
          repoHomepage = repoHomepage ?? statResult.repoHomepage;
          repoTopics = repoTopics ?? statResult.repoTopics;
          repoLicense = repoLicense ?? statResult.license;
          repoCreatedAt = repoCreatedAt ?? statResult.createdAt;
          repoPushedAt = repoPushedAt ?? statResult.pushedAt;
          latestReleaseTag = latestReleaseTag ?? statResult.latestReleaseTag;
          latestReleaseName = latestReleaseName ?? statResult.latestReleaseName;
          latestReleasePublishedAt =
            latestReleasePublishedAt ?? statResult.latestReleasePublishedAt;

          // README cache (optional)
          if (!plainExcerpt || !htmlExcerpt) {
            const readmeRes = await fetch(
              `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/README.md`,
              {
                headers: githubHeaders(),
                next: { revalidate: revalidateSeconds },
              }
            ).catch(() => null);

            if (readmeRes && readmeRes.ok) {
              const md = await readmeRes.text();
              const clipped =
                md.length > MAX_README_BYTES
                  ? md.slice(0, MAX_README_BYTES)
                  : md;

              const sliced = sliceReadmeWithBase(clipped, owner, repo);
              plainExcerpt = plainExcerpt ?? sliced.plainExcerpt;
              plainFull = plainFull ?? sliced.plainFull;
              htmlExcerpt = htmlExcerpt ?? sliced.htmlExcerpt;
              htmlFull = htmlFull ?? sliced.htmlFull;
            }
          }
        } catch {
          // ignore errors for locals; keep whatever was in p
        }
      }

      return {
        ...p,
        format: p.format,
        githubStars:
          stars ??
          (typeof p.githubStars === "number" && Number.isFinite(p.githubStars)
            ? p.githubStars
            : undefined),
        githubForks:
          forks ??
          (typeof p.githubForks === "number" && Number.isFinite(p.githubForks)
            ? p.githubForks
            : undefined),
        downloads:
          downloads ??
          (typeof p.downloads === "number" && Number.isFinite(p.downloads)
            ? p.downloads
            : undefined),

        repoDescription,
        repoHomepage,
        repoTopics,
        repoLicense,
        repoCreatedAt,
        repoPushedAt,
        githubLatestReleaseTag: latestReleaseTag,
        githubLatestReleaseName: latestReleaseName,
        githubLatestReleasePublishedAt: latestReleasePublishedAt,

        // merge any pre-filled values with what we sliced
        readmePlainExcerpt: plainExcerpt,
        readmePlainFull: plainFull,
        readmeHtmlExcerpt: htmlExcerpt,
        readmeHtmlFull: htmlFull,

        _priority: p.priority ?? 500 + idx,
      };
    })
  );

  // 3) Merge + sort by priority, strip internal field
  const merged = [...fromGithub, ...locals];
  const sorted = sortByPriority(merged);
  return sorted.map((item) => {
    const rest: CaseItem & { _priority?: number } = { ...item };
    delete rest._priority;
    return {
      ...rest,
      customerStory: rest.customerStory ?? caseStories[rest.id],
    };
  });
}

export const loadProjects = loadCases;
