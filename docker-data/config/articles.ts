// config/articles.ts
import raw from "./articles.json";

export type Article = {
  id: string;
  slug: string;
  title: string;
  summary?: string;

  /** Prefer ISO (YYYY-MM-DD) */
  date?: string;

  /** Example: "6 min" or "6 min read" */
  readTime?: string;

  category?: string;
  tags?: string[];
  featured?: boolean;

  /** Optional cover */
  imageSrc?: string;
  imageAlt?: string;

  /** Optional override if you ever want custom routes */
  href?: string;

  /** Optional external URL (if ever needed) */
  url?: string;
};

function sortByDateDesc(items: Article[]) {
  return [...items].sort((a, b) => {
    const ad = a.date ? new Date(a.date).getTime() : 0;
    const bd = b.date ? new Date(b.date).getTime() : 0;
    return bd - ad;
  });
}

// Export name kept as `blogPosts` so your existing imports don’t break.
export const blogPosts: Article[] = sortByDateDesc(raw as Article[]);
