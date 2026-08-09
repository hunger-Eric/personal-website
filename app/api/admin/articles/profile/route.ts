import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-guard";
import { articleApiError, getArticleWorkbenchServer, readJsonBody } from "@/lib/article-workbench/server";
import { BusinessProfileSchema } from "@/lib/article-workbench/contracts";

export async function GET(request: NextRequest) { const guard = adminGuard(request); if (guard) return guard; try { return NextResponse.json({ profile: await getArticleWorkbenchServer().getProfile() }); } catch (error) { const result = articleApiError(error); return NextResponse.json(result.body, { status: result.status }); } }
export async function PUT(request: NextRequest) { const guard = adminGuard(request); if (guard) return guard; try { const profile = BusinessProfileSchema.parse(await readJsonBody(request)); return NextResponse.json({ profile: await getArticleWorkbenchServer().saveProfile(profile) }); } catch (error) { const result = articleApiError(error); return NextResponse.json(result.body, { status: result.status }); } }
