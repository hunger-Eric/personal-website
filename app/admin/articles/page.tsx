import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { ArticleWorkbench } from "@/components/admin/ArticleWorkbench";
import { isAdminEnabled, verifyAdminToken } from "@/lib/admin-guard";
import { getArticleWorkbenchServer } from "@/lib/article-workbench/server";
import { DEFAULT_SITE_URL } from "@/lib/site-url";

export const dynamic = "force-dynamic";

export default async function AdminArticlesPage({ searchParams }: { searchParams: Promise<{ run?: string }> }) {
  if (!isAdminEnabled()) notFound();
  const token = (await cookies()).get("admin_token")?.value;
  if (!verifyAdminToken(token ?? null)) redirect("/admin/login?redirect=/admin/articles");
  const requestedRunId = (await searchParams).run;
  const initialRun = requestedRunId && /^awr_[a-f0-9]{24}$/.test(requestedRunId)
    ? await getArticleWorkbenchServer().getRun(requestedRunId).catch(() => null)
    : null;
  return <ArticleWorkbench initialRun={initialRun ?? undefined} defaultSourceUrl={DEFAULT_SITE_URL} />;
}
