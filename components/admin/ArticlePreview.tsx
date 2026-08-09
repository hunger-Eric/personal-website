import { MdxRenderer } from "@/components/mdx/MdxRenderer";

export function ArticlePreview({ source }: { source: string }) {
  return (
    <section aria-label="文章本地预览" className="border-t border-border pt-6">
      <p className="mb-5 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        本地预览，尚未发布
      </p>
      <article className="min-w-0">
        <MdxRenderer source={source} />
      </article>
    </section>
  );
}
