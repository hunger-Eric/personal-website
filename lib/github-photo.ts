// lib/github-photo.ts
// GitHub API helpers for managing photos in the repo

const OWNER = "hunger-Eric";
const REPO = "personal-website";
const BRANCH = "main";

type GitHubContent = {
  sha?: string;
  content?: string;
  encoding?: string;
  path: string;
};

type GitHubDirectoryItem = {
  name: string;
};

/**
 * Get the GitHub API token from env.
 */
function getToken(): string {
  const token =
    process.env.GITHUB_TOKEN ||
    process.env.PHOTO_GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN not set");
  return token;
}

/**
 * Fetch a file from the GitHub repo. Returns null if not found.
 */
export async function getRepoFile(path: string): Promise<GitHubContent | null> {
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        Accept: "application/vnd.github.v3+json",
      },
    }
  );
  if (res.status === 404) return null;
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub API error (${res.status}): ${err}`);
  }
  return res.json();
}

/**
 * Create or update a file in the repo.
 */
export async function upsertRepoFile(
  path: string,
  content: string | Buffer,
  message: string,
  encoding: "base64" | "utf-8" = "utf-8",
  existingSha?: string
): Promise<void> {
  const body: {
    message: string;
    branch: string;
    content: string;
    sha?: string;
  } = {
    message,
    branch: BRANCH,
    content:
      encoding === "base64"
        ? typeof content === "string"
          ? content
          : content.toString("base64")
        : Buffer.from(content).toString("base64"),
  };
  if (existingSha) body.sha = existingSha;

  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub API error on PUT (${res.status}): ${err}`);
  }
}

/**
 * Delete a file from the repo.
 */
export async function deleteRepoFile(
  path: string,
  sha: string,
  message: string
): Promise<void> {
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        branch: BRANCH,
        sha,
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub API error on DELETE (${res.status}): ${err}`);
  }
}

/**
 * Save a new photo file to the repo.
 * The caller is expected to pass the original file bytes unchanged; this helper
 * only base64-encodes them for the GitHub Contents API.
 * Returns the raw GitHub URL and the path.
 */
export async function uploadPhoto(
  fileName: string,
  base64Data: string,
  isPrivate: boolean
): Promise<{ path: string; url: string }> {
  const dir = isPrivate ? "private-photos" : "public/images/photography";
  const path = `${dir}/${fileName}`;
  const message = `feat(photo): add ${fileName}${isPrivate ? " [private]" : ""}`;

  await upsertRepoFile(path, base64Data, message, "base64");

  if (isPrivate) {
    return { path, url: `./private-photos/${fileName}` };
  }
  return { path, url: `/images/photography/${fileName}` };
}

/**
 * Save the full photography config to the repo.
 */
export async function saveConfig(config: Record<string, unknown>): Promise<void> {
  // Get the current sha for the config file
  const existing = await getRepoFile("config/photography.json");
  await upsertRepoFile(
    "config/photography.json",
    JSON.stringify(config, null, 2),
    "feat(photo): update photography config",
    "utf-8",
    existing?.sha
  );
}

/**
 * List all files in a directory via GitHub API.
 */
export async function listRepoDir(dir: string): Promise<string[]> {
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${dir}`,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        Accept: "application/vnd.github.v3+json",
      },
    }
  );
  if (res.status === 404) return [];
  if (!res.ok) return [];
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data
    .filter((item): item is GitHubDirectoryItem => Boolean(item) && typeof item.name === "string")
    .map((item) => item.name);
}

/**
 * Get the raw URL for a file in the repo.
 */
export function rawUrl(path: string): string {
  return `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${path}`;
}
