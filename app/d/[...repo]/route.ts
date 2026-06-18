// app/d/[...repo]/route.ts
import { NextResponse } from "next/server";

type GitHubReleaseAsset = {
  browser_download_url?: unknown;
};

type GitHubRelease = {
  assets?: GitHubReleaseAsset[];
};

function parseGithubRepo(
  input: string
): { owner: string; repo: string } | null {
  const trimmed = input.trim();

  // Case 1: plain "owner/repo"
  if (!trimmed.includes("://") && !trimmed.includes("github.com")) {
    const clean = trimmed.replace(/^\/+|\/+$/g, ""); // trim leading/trailing slashes
    const parts = clean.split("/");
    if (parts.length >= 2) {
      let repo = parts[1];
      if (repo.endsWith(".git")) repo = repo.slice(0, -4);
      return { owner: parts[0], repo };
    }
    return null;
  }

  // Case 2: full URL or "github.com/owner/repo"
  try {
    const url = trimmed.includes("://")
      ? new URL(trimmed)
      : new URL(`https://${trimmed}`);

    if (!url.hostname.includes("github.com")) return null;

    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;

    const owner = parts[0];
    let repo = parts[1];

    if (repo.endsWith(".git")) repo = repo.slice(0, -4);

    return { owner, repo };
  } catch {
    return null;
  }
}

export async function GET(
  request: Request,
  // In Next 16, params is a Promise and must be awaited
  context: { params: Promise<{ repo: string[] }> }
) {
  const { repo } = await context.params;
  const segments = repo;

  // /d/... must have at least "owner/repo"
  if (!segments || segments.length < 2) {
    return new NextResponse(
      "Missing repo path. Expected /d/OWNER/REPO or /d/github.com/OWNER/REPO",
      { status: 400 }
    );
  }

  // Join path segments back into a single string:
  // - /d/KevinTrinhDev/DevfolioX
  //      => "KevinTrinhDev/DevfolioX"
  // - /d/github.com/KevinTrinhDev/DevfolioX
  //      => "github.com/KevinTrinhDev/DevfolioX"
  const repoInput = segments.join("/");

  const parsed = parseGithubRepo(repoInput);
  if (!parsed) {
    return new NextResponse(
      `Invalid GitHub value "${repoInput}". Expected OWNER/REPO or github.com/OWNER/REPO`,
      { status: 400 }
    );
  }

  const { owner, repo: repoName } = parsed;

  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repoName}/releases/latest`,
      {
        headers: { Accept: "application/vnd.github+json" },
        cache: "no-store", // always fresh
      }
    );

    // If there is no latest release at all, send them to the releases page
    if (!res.ok) {
      return NextResponse.redirect(
        `https://github.com/${owner}/${repoName}/releases`,
        302
      );
    }

    const data = (await res.json()) as GitHubRelease;
    const assets = Array.isArray(data.assets) ? data.assets : [];

    // 1) Prefer a .zip asset if present
    const zipAsset =
      assets.find(
        (a) =>
          typeof a.browser_download_url === "string" &&
          a.browser_download_url.toLowerCase().endsWith(".zip")
      ) ??
      // 2) Otherwise fall back to the first asset
      assets[0];

    // If there are no assets, DON'T fall back to tag/main zips,
    // because those don't increment download stats.
    // Just send the user to the release page so you can see it's misconfigured.
    if (!zipAsset || !zipAsset.browser_download_url) {
      return NextResponse.redirect(
        `https://github.com/${owner}/${repoName}/releases/latest`,
        302
      );
    }

    const downloadUrl = String(zipAsset.browser_download_url);

    // This URL IS counted in GitHub's "Downloads" stats for that asset.
    return NextResponse.redirect(downloadUrl, 302);
  } catch {
    // On network/API error, just send them to the repo's releases page
    return NextResponse.redirect(
      `https://github.com/${owner}/${repoName}/releases`,
      302
    );
  }
}
