// app/api/admin/save/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getRepoFile, upsertRepoFile } from "@/lib/github-photo";

// Map of config key → repo file path
const CONFIG_PATHS: Record<string, string> = {
  site: "config/site.json",
  navbar: "config/navbar.json",
  about: "config/about.json",
  theme: "config/theme.json",
  photography: "config/photography.json",
  pages: "config/pages.json",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, content, message } = body;

    if (!key || !content) {
      return NextResponse.json(
        { error: "Missing key or content" },
        { status: 400 }
      );
    }

    const path = CONFIG_PATHS[key];
    if (!path) {
      return NextResponse.json(
        { error: `Unknown config key: ${key}` },
        { status: 400 }
      );
    }

    // Get existing file SHA for update
    const existing = await getRepoFile(path);

    // Save to GitHub
    await upsertRepoFile(
      path,
      JSON.stringify(content, null, 2),
      message || `feat: update ${key} config via admin panel`,
      "utf-8",
      existing?.sha
    );

    return NextResponse.json({
      success: true,
      message: `${key} 配置已保存并推送到 GitHub`,
    });
  } catch (err: any) {
    console.error("Admin save API error:", err);
    return NextResponse.json(
      { error: err.message || "保存失败" },
      { status: 500 }
    );
  }
}