// app/api/admin/deploy-status/route.ts
// Check Vercel deployment status — called by frontend after save

import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-guard";

export async function GET(request: NextRequest) {
  const guard = adminGuard(request);
  if (guard) return guard;

  const deployId = request.nextUrl.searchParams.get("deployId");
  if (!deployId) {
    return NextResponse.json(
      { error: "Missing deployId parameter" },
      { status: 400 }
    );
  }

  const vercelToken = process.env.VERCEL_TOKEN;
  if (!vercelToken) {
    return NextResponse.json(
      { error: "Vercel token not configured" },
      { status: 500 }
    );
  }

  try {
    const teamId = process.env.VERCEL_TEAM_ID;
    const url = teamId
      ? `https://api.vercel.com/v13/deployments/${deployId}?teamId=${teamId}`
      : `https://api.vercel.com/v13/deployments/${deployId}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${vercelToken}` },
    });

    if (!res.ok) {
      // Deploy might not exist yet (just triggered)
      return NextResponse.json({ status: "PENDING" });
    }

    const data = await res.json();
    return NextResponse.json({
      status: data.state || data.readyState || "UNKNOWN",
      readyAt: data.readyAt || null,
    });
  } catch {
    return NextResponse.json({ status: "UNKNOWN" });
  }
}
