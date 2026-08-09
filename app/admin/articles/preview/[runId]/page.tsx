import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { ArticlePreview } from "@/components/admin/ArticlePreview";
import { isAdminEnabled, verifyAdminToken } from "@/lib/admin-guard";
import { getArticleWorkbenchServer } from "@/lib/article-workbench/server";

export const dynamic = "force-dynamic";

export default async function ArticlePreviewPage({ params }: { params: Promise<{ runId: string }> }) {
  if (!isAdminEnabled()) notFound();
  const token = (await cookies()).get("admin_token")?.value;
  const { runId } = await params;
  if (!verifyAdminToken(token ?? null)) redirect(`/admin/login?redirect=/admin/articles/preview/${runId}`);
  const run = await getArticleWorkbenchServer().getRun(runId).catch(() => null);
  if (!run?.previewMdx) notFound();

  return (
    <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
      <Link href={`/admin/articles?run=${encodeURIComponent(runId)}`} className="text-sm font-semibold text-muted-foreground hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent">
        返回文章工作台
      </Link>
      <div className="mt-8">
        <ArticlePreview source={run.previewMdx} />
      </div>
    </main>
  );
}
