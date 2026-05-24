// app/api/admin/[key]/route.ts
import { NextRequest, NextResponse } from "next/server";

// Dynamic import of config files
const CONFIG_MODULES: Record<string, () => any> = {
  site: () => require("@/config/site.json"),
  navbar: () => require("@/config/navbar.json"),
  about: () => require("@/config/about.json"),
  theme: () => require("@/config/theme.json"),
  photography: () => require("@/config/photography.json"),
  pages: () => require("@/config/pages.json"),
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;
  const loader = CONFIG_MODULES[key];
  if (!loader) {
    return NextResponse.json({ error: "Unknown config" }, { status: 404 });
  }
  try {
    const config = loader();
    return NextResponse.json({ config });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to load" },
      { status: 500 }
    );
  }
}