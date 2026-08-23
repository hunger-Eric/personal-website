// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createRepoFile, getRepoFile, isValidRepoBranch } from "@/lib/github-repository";

beforeEach(() => {
  process.env.GITHUB_TOKEN = "test-token";
});

afterEach(() => {
  vi.restoreAllMocks();
  delete process.env.GITHUB_TOKEN;
});

describe("GitHub repository content helper", () => {
  it("validates repository branches", () => {
    expect(isValidRepoBranch("release/2026")).toBe(true);
    expect(isValidRepoBranch("main?token=secret")).toBe(false);
    expect(isValidRepoBranch("../main")).toBe(false);
  });

  it("reads a file from the selected branch", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ path: "content/articles/example.mdx", sha: "abc" })),
    );

    await expect(getRepoFile("content/articles/example.mdx", "release/2026")).resolves.toMatchObject({
      path: "content/articles/example.mdx",
    });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.github.com/repos/hunger-Eric/personal-website/contents/content/articles/example.mdx?ref=release%2F2026",
      expect.any(Object),
    );
  });

  it("requires a complete write receipt for the requested path", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({
        content: { sha: "content-sha", path: "content/articles/example.mdx" },
        commit: { sha: "commit-sha" },
      }), { status: 201 }),
    );

    await expect(createRepoFile("content/articles/example.mdx", "Body", "create")).resolves.toEqual({
      contentSha: "content-sha",
      commitSha: "commit-sha",
      path: "content/articles/example.mdx",
    });
  });
});
