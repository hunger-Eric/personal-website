// app/api/admin/[key]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-guard";
import site from "@/config/site.json";
import navbar from "@/config/navbar.json";
import about from "@/config/about.json";
import theme from "@/config/theme.json";
import photography from "@/config/photography.json";
import pages from "@/config/pages.json";

type ConfigPayload = Record<string, unknown> | unknown[];

const CONFIG_MODULES: Record<string, ConfigPayload> = {
  site,
  navbar,
  about,
  theme,
  photography,
  pages,
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const guard = adminGuard(request);
  if (guard) return guard;

  const { key } = await params;
  const loader = CONFIG_MODULES[key];
  if (!loader) {
    return NextResponse.json({ error: "Unknown config" }, { status: 404 });
  }
  try {
    return NextResponse.json({ config: loader });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
