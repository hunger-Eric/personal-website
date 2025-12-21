// components/sections/Blog.tsx
import { ExternalLink } from "lucide-react";
import { blogPosts } from "../../config/articles";
import { siteConfig } from "../../config/siteConfig";

export function BlogSection() {
  if (!blogPosts.length) return null;

  const featured = blogPosts.find((post) => post.featured) ?? blogPosts[0];
  const recentList = blogPosts.filter((post) => post.id !== featured.id);
  const recent = recentList[0] ?? featured;

  const devtoUrl = siteConfig.socials?.devto;
  const mediumUrl = siteConfig.socials?.medium;

  return (
    <section id="blog" className="py-16 scroll-mt-12">
      <div className="mx-auto w-full max-w-6xl px-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          ~/Blogs
        </h2>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-2xl font-semibold sm:text-3xl">
            My blog posts, articles, and dev notes.
          </h3>

          <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
            {devtoUrl && (
              <a
                href={devtoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-accent/90 sm:text-sm"
              >
                <span>View my writing</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
            {mediumUrl && (
              <a
                href={mediumUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border border-white/20 px-3 py-1.5 text-xs font-medium text-white/85 transition hover:border-accent hover:bg-white/10 sm:text-sm"
              >
                <span>View Medium profile</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <ArticleCard label="Featured article" post={featured} />
          <ArticleCard label="Recent article" post={recent} />
        </div>
      </div>
    </section>
  );
}

type BlogPost = (typeof blogPosts)[number];
type Platform = "devto" | "medium";

function ArticleCard({ label, post }: { label: string; post: BlogPost }) {
  return (
    <article className="flex flex-col rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-muted-foreground sm:p-5 sm:text-base">
      <p className="text-xs font-semibold uppercase tracking-wide text-accent sm:text-sm">
        {label}
      </p>

      <h4 className="mt-2 text-lg font-semibold text-foreground sm:text-xl">
        {post.title}
      </h4>

      <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground sm:text-xs">
        <PlatformBadge platform={post.platform} />
        {post.date && <span>{post.date}</span>}
        {post.date && post.readTime && <span>·</span>}
        {post.readTime && <span>{post.readTime}</span>}
      </div>

      {post.summary && (
        <p className="mt-3 text-xs text-muted-foreground sm:text-sm">
          {post.summary}
        </p>
      )}

      {post.tags && post.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-muted-foreground sm:text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4">
        <a
          href={post.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-accent/90 sm:text-sm"
        >
          <span>Read article</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </article>
  );
}

function PlatformBadge({ platform }: { platform: Platform }) {
  const label = platform === "devto" ? "Dev.to" : "Medium";

  return (
    <span className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/70 sm:text-[11px]">
      {label}
    </span>
  );
}
