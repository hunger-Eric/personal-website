import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-guard";
import { articleApiError, getArticleWorkbenchServer, parseRunId } from "@/lib/article-workbench/server";
type Context = { params: Promise<{ runId: string }> };
export async function POST(request: NextRequest, context: Context) { const guard = adminGuard(request); if (guard) return guard; try { const publication = await getArticleWorkbenchServer().submit(parseRunId((await context.params).runId)); return NextResponse.json({ publication }); } catch (error) { const result = articleApiError(error); return NextResponse.json(result.body, { status: result.status }); } }
