import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { ArticlePreview } from "@/components/admin/ArticlePreview";
import { isAdminEnabled, verifyAdminToken } from "@/lib/admin-guard";
import { getArticleWorkbenchServer } from "@/lib/article-workbench/server";

export const dynamic = "force-dynamic";

export default async function ArticlePreviewPage({ params, searchParams }: { params: Promise<{ runId: string }>; searchParams?: Promise<{ embed?: string | string[] }> }) {
  if (!isAdminEnabled()) notFound();
  const token = (await cookies()).get("admin_token")?.value;
  const [{ runId }, query]: [{ runId: string }, { embed?: string | string[] }] = await Promise.all([params, searchParams ?? Promise.resolve({})]);
  const embedded = query.embed === "1";
  if (!verifyAdminToken(token ?? null)) redirect(`/admin/login?redirect=/admin/articles/preview/${runId}`);
  const run = await getArticleWorkbenchServer().getRun(runId).catch(() => null);
  if (!run?.previewMdx) notFound();

  return (
    <main className={`mx-auto max-w-3xl px-5 sm:px-8 ${embedded ? "py-6" : "py-10"}`}>
      {!embedded ? <Link href={`/admin/articles?run=${encodeURIComponent(runId)}`} className="text-sm font-semibold text-muted-foreground hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent">
        返回文章工作台
      </Link> : null}
      <div className={embedded ? "" : "mt-8"}>
        <ArticlePreview source={run.previewMdx} />
      </div>
    </main>
  );
}
