const OWNER = "hunger-Eric";
const REPO = "personal-website";

export const DEFAULT_REPO_BRANCH = "main";

type GitHubContent = {
  sha?: string;
  content?: string;
  encoding?: string;
  path: string;
};

export interface RepoFileWriteReceipt {
  contentSha: string;
  commitSha: string;
  path: string;
}

type GitHubWriteResponse = {
  content?: { sha?: unknown; path?: unknown };
  commit?: { sha?: unknown };
};

export function isValidRepoBranch(branch: string): boolean {
  return /^[A-Za-z0-9][A-Za-z0-9._/-]{0,255}$/.test(branch)
    && !branch.includes("..")
    && !branch.includes("//")
    && !/[./]$/.test(branch);
}

function validatedRepoBranch(branch: string): string {
  if (!isValidRepoBranch(branch)) throw new Error("GITHUB_BRANCH_INVALID");
  return branch;
}

function getToken(): string {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN not set");
  return token;
}

export async function getRepoFile(
  path: string,
  branch: string = DEFAULT_REPO_BRANCH,
): Promise<GitHubContent | null> {
  const url = new URL(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`);
  url.search = new URLSearchParams({ ref: validatedRepoBranch(branch) }).toString();
  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`GitHub API error (${response.status}): ${await response.text()}`);
  }
  return response.json();
}

export async function createRepoFile(
  path: string,
  content: string | Buffer,
  message: string,
  encoding: "base64" | "utf-8" = "utf-8",
  branch: string = DEFAULT_REPO_BRANCH,
): Promise<RepoFileWriteReceipt> {
  const body = {
    message,
    branch: validatedRepoBranch(branch),
    content:
      encoding === "base64"
        ? typeof content === "string"
          ? content
          : content.toString("base64")
        : Buffer.from(content).toString("base64"),
  };
  const response = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    throw new Error(`GitHub API error on PUT (${response.status}): ${await response.text()}`);
  }

  const result = await response.json() as GitHubWriteResponse;
  const contentSha = result.content?.sha;
  const commitSha = result.commit?.sha;
  const responsePath = result.content?.path;
  if (
    typeof contentSha !== "string" || !contentSha.trim()
    || typeof commitSha !== "string" || !commitSha.trim()
    || typeof responsePath !== "string" || responsePath !== path
  ) {
    throw new Error("GitHub API invalid write response");
  }
  return { contentSha, commitSha, path: responsePath };
}
