import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-guard";
import { articleApiError, GenerateRequestSchema, getArticleWorkbenchServer, readJsonBody } from "@/lib/article-workbench/server";
export async function POST(request: NextRequest) { const guard = adminGuard(request); if (guard) return guard; try { const run = await getArticleWorkbenchServer().generate(GenerateRequestSchema.parse(await readJsonBody(request))); return NextResponse.json({ run: { id: run.id, status: run.status, ...(run.failure ? { failure: run.failure } : {}) } }, { status: 201 }); } catch (error) { const result = articleApiError(error); return NextResponse.json(result.body, { status: result.status }); } }
