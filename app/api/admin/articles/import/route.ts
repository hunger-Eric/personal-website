import { NextRequest, NextResponse } from "next/server";

import { adminGuard } from "@/lib/admin-guard";
import {
  ImportOpenGeoMarkdownRequestSchema,
  articleApiError,
  getArticleWorkbenchServer,
  readJsonBody,
} from "@/lib/article-workbench/server";

export async function POST(request: NextRequest) {
  const guard = adminGuard(request);
  if (guard) return guard;
  try {
    const input = ImportOpenGeoMarkdownRequestSchema.parse(await readJsonBody(request));
    const run = await getArticleWorkbenchServer().importOpenGeoMarkdown(input);
    return NextResponse.json({ run: { id: run.id, status: run.status } }, { status: 201 });
  } catch (error) {
    const result = articleApiError(error);
    return NextResponse.json(result.body, { status: result.status });
  }
}
