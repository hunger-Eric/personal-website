// lib/mdx/toc.ts
// Parses the markdown source of an article and returns the H2/H3 outline,
// using github-slugger to generate the same IDs that rehype-slug will emit.
import GithubSlugger from "github-slugger";

export type TocEntry = {
  level: 2 | 3;
  text: string;
  id: string;
};

/**
 * Extract TOC entries from markdown source. Only H2 + H3 (deeper headings
 * tend to clutter the sidebar). Skips fenced code blocks so any "## " inside
 * code samples doesn't pollute the outline.
 */
export function extractToc(source: string): TocEntry[] {
  const slugger = new GithubSlugger();
  const lines = source.split("\n");
  const entries: TocEntry[] = [];

  let inFence = false;

  for (const raw of lines) {
    const line = raw.trimEnd();

    // Toggle code fences
    if (/^\s*```/.test(line) || /^\s*~~~/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const m = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!m) continue;

    const level = m[1].length as 2 | 3;
    // Strip basic markdown emphasis from heading text for cleaner labels
    const text = m[2]
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/\*(.+?)\*/g, "$1")
      .replace(/_(.+?)_/g, "$1")
      .replace(/\[(.+?)\]\([^)]+\)/g, "$1")
      .trim();
    if (!text) continue;

    const id = slugger.slug(text);
    entries.push({ level, text, id });
  }

  return entries;
}
