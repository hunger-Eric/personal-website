import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-guard";

const OWNER = "hunger-Eric";
const REPO = "personal-website";
const WORKFLOW_FILE = "test.yml";

export async function GET(request: NextRequest) {
  const guard = adminGuard(request);
  if (guard) return guard;

  const token =
    process.env.GITHUB_TOKEN ||
    process.env.PHOTO_GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "GitHub token not configured" },
      { status: 500 }
    );
  }

  try {
    const branch = request.nextUrl.searchParams.get("branch") || "main";
    const url =
      `https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/${WORKFLOW_FILE}/runs` +
      `?branch=${encodeURIComponent(branch)}&per_page=1`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `GitHub API error (${res.status}): ${text}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    const run = Array.isArray(data?.workflow_runs) ? data.workflow_runs[0] : null;
    if (!run) {
      return NextResponse.json({ status: "NOT_FOUND" });
    }

    return NextResponse.json({
      status: run.status || "unknown",
      conclusion: run.conclusion || null,
      runNumber: run.run_number || null,
      htmlUrl: run.html_url || "",
      updatedAt: run.updated_at || null,
      headSha: run.head_sha || null,
      name: run.name || "CI",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch CI status";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
