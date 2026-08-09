// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

import type { ArticlePublicationRecord } from "@/lib/article-workbench/contracts";
import { createPersonalWebsitePublisher } from "@/lib/article-workbench/publisher";

const article: ArticlePublicationRecord = {
  title: "Evidence-led article",
  body: "Body",
  slug: "evidence-led-article",
  contentHash: "sha256:expected",
  path: "content/articles/2026-08-09-evidence-led-article.mdx",
};

function existing(contentHash: string) {
  return {
    sha: "existing-content-sha",
    path: article.path,
    encoding: "base64",
    content: Buffer.from(`---\ntitle: \"Evidence-led article\"\ndate: \"2026-08-09\"\ncontentHash: \"${contentHash}\"\n---\n\nBody`).toString("base64"),
  };
}

function publisher(options: Partial<Parameters<typeof createPersonalWebsitePublisher>[0]> = {}) {
  const getRepoFile = vi.fn().mockResolvedValue(null);
  const upsertRepoFile = vi.fn().mockResolvedValue({ contentSha: "content-sha", commitSha: "commit-sha", path: article.path });
  const fetch = vi.fn();
  const dependencies = { siteUrl: "https://example.com", getRepoFile, upsertRepoFile, fetch, ...options };
  return {
    getRepoFile: dependencies.getRepoFile,
    upsertRepoFile: dependencies.upsertRepoFile,
    fetch: dependencies.fetch,
    publisher: createPersonalWebsitePublisher(dependencies),
  };
}

describe("PersonalWebsitePublisher", () => {
  it("creates exactly the record-owned path and returns a submitted receipt", async () => {
    const { publisher: subject, upsertRepoFile, fetch } = publisher();

    await expect(subject.submit(article)).resolves.toEqual({ id: "commit-sha", slug: article.slug, contentHash: article.contentHash, status: "submitted" });
    expect(upsertRepoFile).toHaveBeenCalledWith(article.path, expect.any(String), "feat(article): publish evidence-led-article", "utf-8");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("recovers a same-hash GitHub file without overwriting it", async () => {
    const { publisher: subject, upsertRepoFile } = publisher({ getRepoFile: vi.fn().mockResolvedValue(existing(article.contentHash)) });

    await expect(subject.submit(article)).resolves.toEqual({ id: "existing-content-sha", slug: article.slug, contentHash: article.contentHash, status: "submitted" });
    expect(upsertRepoFile).not.toHaveBeenCalled();
  });

  it("rejects a different-hash existing file without overwriting it", async () => {
    const { publisher: subject, upsertRepoFile } = publisher({ getRepoFile: vi.fn().mockResolvedValue(existing("sha256:different")) });

    await expect(subject.submit(article)).rejects.toThrow("PUBLISHER_CONFLICT");
    expect(upsertRepoFile).not.toHaveBeenCalled();
  });

  it("maps provider failures to a fixed safe error", async () => {
    const { publisher: subject } = publisher({ getRepoFile: vi.fn().mockRejectedValue(new Error("token=secret body")) });

    await expect(subject.submit(article)).rejects.toThrow("PUBLISHER_PROVIDER_FAILED");
  });

  it("keeps a 404 public page pending", async () => {
    const { publisher: subject, fetch } = publisher({ fetch: vi.fn().mockResolvedValue(new Response("missing", { status: 404 })) });

    await expect(subject.verify({ id: "commit-sha", slug: article.slug, contentHash: article.contentHash, status: "submitted" })).resolves.toMatchObject({ status: "submitted" });
    expect(fetch).toHaveBeenCalledWith("https://example.com/articles/evidence-led-article", { cache: "no-store" });
  });

  it("keeps stale or unavailable public pages pending across repeated polls", async () => {
    const { publisher: subject, fetch } = publisher({ fetch: vi.fn()
      .mockResolvedValueOnce(new Response('<meta name="article-content-hash" content="sha256:stale">', { status: 200 }))
      .mockRejectedValueOnce(new Error("network")) });
    const receipt = { id: "commit-sha", slug: article.slug, contentHash: article.contentHash, status: "submitted" as const };

    await expect(subject.verify(receipt)).resolves.toMatchObject({ status: "submitted" });
    await expect(subject.verify(receipt)).resolves.toMatchObject({ status: "submitted" });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("marks an exact public metadata hash as published", async () => {
    const { publisher: subject } = publisher({ fetch: vi.fn().mockResolvedValue(new Response('<meta content="sha256:expected" name="article-content-hash">', { status: 200 })) });

    await expect(subject.verify({ id: "commit-sha", slug: article.slug, contentHash: article.contentHash, status: "submitted" })).resolves.toEqual({ id: "commit-sha", slug: article.slug, contentHash: article.contentHash, status: "published" });
  });
});
