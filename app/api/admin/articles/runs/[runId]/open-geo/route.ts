import { NextRequest, NextResponse } from "next/server";

import { adminGuard } from "@/lib/admin-guard";
import { decodeOpenGeoCapability, encodeOpenGeoCapability, openGeoCapabilityCookieName } from "@/lib/article-workbench/open-geo-local";
import { articleApiError, getArticleWorkbenchServer, parseRunId } from "@/lib/article-workbench/server";

type Context = { params: Promise<{ runId: string }> };

export async function GET(request: NextRequest, context: Context) {
  const guard = adminGuard(request);
  if (guard) return guard;
  try {
    const runId = parseRunId((await context.params).runId);
    const capability = decodeOpenGeoCapability(request.cookies.get(openGeoCapabilityCookieName(runId))?.value);
    if (!capability) return NextResponse.json({ error: "Open GEO task capability missing" }, { status: 409 });
    const result = await getArticleWorkbenchServer().refreshOpenGeoGeneration(runId, capability);
    const response = NextResponse.json({ run: result.run }, { headers: { "Cache-Control": "private, no-store" } });
    response.cookies.set(openGeoCapabilityCookieName(runId), encodeOpenGeoCapability(result.capability), {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: `/api/admin/articles/runs/${runId}/open-geo`,
      maxAge: 24 * 60 * 60,
    });
    return response;
  } catch (error) {
    const result = articleApiError(error);
    return NextResponse.json(result.body, { status: result.status });
  }
}
