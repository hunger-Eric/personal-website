// app/api/admin/save/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getRepoFile, upsertRepoFile } from "@/lib/github-photo";
import { adminGuard } from "@/lib/admin-guard";

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
  const guard = adminGuard(request);
  if (guard) return guard;

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

    let deployId: string | null = null;

    // Trigger Vercel deployment after successful save
    const vercelToken = process.env.VERCEL_TOKEN;
    const teamId = process.env.VERCEL_TEAM_ID;
    const projectId = process.env.VERCEL_PROJECT_ID || "prj_eybWuVuRiAOtdFQTAz9rA63LPT41";

    if (vercelToken) {
      try {
        const url = teamId
          ? `https://api.vercel.com/v13/deployments?teamId=${teamId}`
          : "https://api.vercel.com/v13/deployments";
        const deployRes = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${vercelToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: "personal-website",
            project: projectId,
            target: "production",
            gitSource: {
              type: "github",
              repo: "hunger-Eric/personal-website",
              ref: "main",
              repoId: 1247962453,
            },
          }),
        });
        const deployData = await deployRes.json();
        deployId = deployData.id || deployData.uid || null;
      } catch (_err) {
        console.error("Vercel deploy trigger failed (non-fatal):", _err);
      }
    }

    return NextResponse.json({
      success: true,
      message: `${key} 配置已保存并推送，正在自动部署到 Vercel`,
      deployId,
    });
  } catch (err: any) {
    console.error("Admin save API error:", err);
    return NextResponse.json(
      { error: err.message || "保存失败" },
      { status: 500 }
    );
  }
}