import { NextRequest, NextResponse } from "next/server";

import { adminGuard } from "@/lib/admin-guard";
import { encodeOpenGeoCapability, openGeoCapabilityCookieName } from "@/lib/article-workbench/open-geo-local";
import { OpenGeoGenerationRequestSchema, articleApiError, getArticleWorkbenchServer, readJsonBody } from "@/lib/article-workbench/server";

export async function POST(request: NextRequest) {
  const guard = adminGuard(request);
  if (guard) return guard;
  try {
    const input = OpenGeoGenerationRequestSchema.parse(await readJsonBody(request));
    const result = await getArticleWorkbenchServer().startOpenGeoGeneration(input);
    const response = NextResponse.json({ run: result.run }, { status: 201, headers: { "Cache-Control": "private, no-store" } });
    response.cookies.set(openGeoCapabilityCookieName(result.run.id), encodeOpenGeoCapability(result.capability), {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: `/api/admin/articles/runs/${result.run.id}/open-geo`,
      maxAge: 24 * 60 * 60,
    });
    return response;
  } catch (error) {
    const result = articleApiError(error);
    return NextResponse.json(result.body, { status: result.status });
  }
}
