// config/blog.ts
import raw from "./articles.json";

export type BlogPlatform = "devto" | "medium";

export type BlogPost = {
  id: string;
  title: string;
  summary?: string;
  url: string;
  platform: BlogPlatform;
  date?: string;
  readTime?: string;
  tags?: string[];
  featured?: boolean;
};

// Optional: light runtime guard to keep platform values honest
function normalize(items: any[]): BlogPost[] {
  return (items || []).filter(Boolean).map((it) => {
    const platform =
      it.platform === "devto" || it.platform === "medium"
        ? it.platform
        : "devto"; // default/fallback
    return { ...it, platform } as BlogPost;
  });
}

export const blogPosts: BlogPost[] = normalize(raw as any[]);
