import { MdxRenderer } from "@/components/mdx/MdxRenderer";
import matter from "gray-matter";

export function ArticlePreview({ source }: { source: string }) {
  let content: string;
  try {
    content = matter(source).content;
  } catch {
    return (
      <section aria-label="文章本地预览" className="border-t border-border pt-6">
        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">本地预览，尚未发布</p>
        <p role="alert" className="text-sm text-destructive">预览内容格式无效，请返回编辑后再试。</p>
      </section>
    );
  }
  return (
    <section aria-label="文章本地预览" className="border-t border-border pt-6">
      <p className="mb-5 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        本地预览，尚未发布
      </p>
      <article className="min-w-0">
        <MdxRenderer source={content} />
      </article>
    </section>
  );
}
