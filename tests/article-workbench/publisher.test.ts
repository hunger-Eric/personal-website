// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

import type { ArticlePublicationRecord } from "@/lib/article-workbench/contracts";
import { createWebsitePublisher } from "@/lib/article-workbench/publisher";

const expectedHash = `sha256:${"e".repeat(64)}`;
const differentHash = `sha256:${"d".repeat(64)}`;

const article: ArticlePublicationRecord = {
  title: "Evidence-led article",
  body: "Body",
  slug: "evidence-led-article",
  contentHash: expectedHash,
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

function publisher(options: Partial<Parameters<typeof createWebsitePublisher>[0]> = {}) {
  const getRepoFile = vi.fn().mockResolvedValue(null);
  const createRepoFile = vi.fn().mockResolvedValue({ contentSha: "content-sha", commitSha: "commit-sha", path: article.path });
  const fetch = vi.fn();
  const dependencies = { siteUrl: "https://example.com", getRepoFile, createRepoFile, fetch, ...options };
  return {
    getRepoFile: dependencies.getRepoFile,
    createRepoFile: dependencies.createRepoFile,
    fetch: dependencies.fetch,
    publisher: createWebsitePublisher(dependencies),
  };
}

describe("WebsitePublisher", () => {
  it("creates exactly the record-owned path and returns a submitted receipt", async () => {
    const { publisher: subject, getRepoFile, createRepoFile, fetch } = publisher();

    await expect(subject.submit(article)).resolves.toEqual({ id: "commit-sha", slug: article.slug, contentHash: article.contentHash, status: "submitted" });
    expect(getRepoFile).toHaveBeenCalledWith(article.path, "main");
    expect(createRepoFile).toHaveBeenCalledWith(article.path, article.body, "feat(article): publish evidence-led-article", "utf-8", "main");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("recovers a same-hash GitHub file without overwriting it", async () => {
    const { publisher: subject, createRepoFile } = publisher({ getRepoFile: vi.fn().mockResolvedValue(existing(article.contentHash)) });

    await expect(subject.submit(article)).resolves.toEqual({ id: "existing-content-sha", slug: article.slug, contentHash: article.contentHash, status: "submitted" });
    expect(createRepoFile).not.toHaveBeenCalled();
  });

  it("uses one alternate branch for read and create", async () => {
    const getRepoFile = vi.fn().mockResolvedValue(null);
    const createRepoFile = vi.fn().mockResolvedValue({ contentSha: "content-sha", commitSha: "commit-sha", path: article.path });
    const { publisher: subject } = publisher({ branch: "release/2026", getRepoFile, createRepoFile });

    await subject.submit(article);
    expect(getRepoFile).toHaveBeenCalledWith(article.path, "release/2026");
    expect(createRepoFile).toHaveBeenCalledWith(article.path, article.body, "feat(article): publish evidence-led-article", "utf-8", "release/2026");
  });

  it("fails safely before any provider call for a malformed target branch", () => {
    const getRepoFile = vi.fn();
    const createRepoFile = vi.fn();

    expect(() => publisher({ branch: "main?token=super-secret", getRepoFile, createRepoFile })).toThrow("PUBLISHER_CONFIGURATION_INVALID");
    expect(getRepoFile).not.toHaveBeenCalled();
    expect(createRepoFile).not.toHaveBeenCalled();
  });

  it("rejects a different-hash existing file without overwriting it", async () => {
    const { publisher: subject, createRepoFile } = publisher({ getRepoFile: vi.fn().mockResolvedValue(existing(differentHash)) });

    await expect(subject.submit(article)).rejects.toThrow("PUBLISHER_CONFLICT");
    expect(createRepoFile).not.toHaveBeenCalled();
  });

  it("maps provider failures to a fixed safe error", async () => {
    const { publisher: subject } = publisher({ getRepoFile: vi.fn().mockRejectedValue(new Error("token=secret body")) });

    await expect(subject.submit(article)).rejects.toThrow("PUBLISHER_PROVIDER_FAILED");
  });

  it("recovers a same-hash race after the create request conflicts", async () => {
    const getRepoFile = vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(existing(article.contentHash));
    const createRepoFile = vi.fn().mockRejectedValue(new Error("409 body=secret"));
    const { publisher: subject } = publisher({ getRepoFile, createRepoFile });

    await expect(subject.submit(article)).resolves.toMatchObject({ id: "existing-content-sha", status: "submitted" });
    expect(getRepoFile).toHaveBeenCalledTimes(2);
    expect(createRepoFile).toHaveBeenCalledTimes(1);
    expect(getRepoFile).toHaveBeenNthCalledWith(1, article.path, "main");
    expect(getRepoFile).toHaveBeenNthCalledWith(2, article.path, "main");
    expect(createRepoFile).toHaveBeenCalledWith(article.path, article.body, "feat(article): publish evidence-led-article", "utf-8", "main");
  });

  it.each([
    ["different content", existing(differentHash), "PUBLISHER_CONFLICT"],
    ["no remotely-created file", null, "PUBLISHER_PROVIDER_FAILED"],
  ])("fails safely when a create conflict recovery finds %s", async (_label, recovered, error) => {
    const { publisher: subject } = publisher({
      getRepoFile: vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(recovered),
      createRepoFile: vi.fn().mockRejectedValue(new Error("409")),
    });

    await expect(subject.submit(article)).rejects.toThrow(error);
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
    const { publisher: subject } = publisher({ fetch: vi.fn().mockResolvedValue(new Response(`<meta content="${expectedHash}" name="article-content-hash">`, { status: 200 })) });

    await expect(subject.verify({ id: "commit-sha", slug: article.slug, contentHash: article.contentHash, status: "submitted" })).resolves.toEqual({ id: "commit-sha", slug: article.slug, contentHash: article.contentHash, status: "published" });
  });

  it("ignores data-name and data-content false positives but accepts exact attributes in either order", async () => {
    const { publisher: subject, fetch } = publisher({ fetch: vi.fn()
      .mockResolvedValueOnce(new Response(`<meta data-name="article-content-hash" data-content="${expectedHash}">`, { status: 200 }))
      .mockResolvedValueOnce(new Response(`<meta content='${expectedHash}' name='article-content-hash'>`, { status: 200 })) });
    const receipt = { id: "commit-sha", slug: article.slug, contentHash: article.contentHash, status: "submitted" as const };

    await expect(subject.verify(receipt)).resolves.toMatchObject({ status: "submitted" });
    await expect(subject.verify(receipt)).resolves.toMatchObject({ status: "published" });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("ignores similar element names such as meta-data", async () => {
    const { publisher: subject } = publisher({
      fetch: vi.fn().mockResolvedValue(new Response(`<meta-data name="article-content-hash" content="${expectedHash}">`, { status: 200 })),
    });

    await expect(subject.verify({ id: "commit-sha", slug: article.slug, contentHash: article.contentHash, status: "submitted" })).resolves.toMatchObject({ status: "submitted" });
  });

  it.each(["http://example.com", "https://example.com/path", "https://user@example.com"])
  ("rejects an unsafe canonical site URL: %s", (siteUrl) => {
    expect(() => createWebsitePublisher({ siteUrl })).toThrow("PUBLISHER_CONFIGURATION_INVALID");
  });

  it("fails closed on malformed remote files and incomplete create receipts", async () => {
    const malformedRemote = publisher({
      getRepoFile: vi.fn().mockResolvedValue({ path: article.path, encoding: "utf-8", content: "not-base64", sha: "remote" }),
    });
    await expect(malformedRemote.publisher.submit(article)).rejects.toThrow("PUBLISHER_PROVIDER_FAILED");

    const incompleteWrite = publisher({
      createRepoFile: vi.fn().mockResolvedValue({ contentSha: "", commitSha: "", path: article.path }),
    });
    await expect(incompleteWrite.publisher.submit(article)).rejects.toThrow("PUBLISHER_PROVIDER_FAILED");
  });

  it("rejects provider responses that cannot bind to the record-owned identity", async () => {
    const wrongRemotePath = publisher({
      getRepoFile: vi.fn().mockResolvedValue({ ...existing(article.contentHash), path: "content/articles/other.mdx" }),
    });
    await expect(wrongRemotePath.publisher.recover(article)).rejects.toThrow("PUBLISHER_PROVIDER_FAILED");

    const missingHash = publisher({
      getRepoFile: vi.fn().mockResolvedValue({ ...existing(article.contentHash), content: Buffer.from("---\ntitle: missing hash\n---\nBody").toString("base64") }),
    });
    await expect(missingHash.publisher.recover(article)).rejects.toThrow("PUBLISHER_PROVIDER_FAILED");

    const wrongWritePath = publisher({
      createRepoFile: vi.fn().mockResolvedValue({ contentSha: "content", commitSha: "commit", path: "content/articles/other.mdx" }),
    });
    await expect(wrongWritePath.publisher.submit(article)).rejects.toThrow("PUBLISHER_PROVIDER_FAILED");
  });

  it("keeps a successful public response pending when its exact metadata is absent or the slug is invalid", async () => {
    const { publisher: subject } = publisher({ fetch: vi.fn().mockResolvedValue(new Response("<main>ready</main>", { status: 200 })) });
    await expect(subject.verify({ id: "commit", slug: article.slug, contentHash: article.contentHash, status: "submitted" })).resolves.toMatchObject({ status: "submitted" });
    await expect(subject.verify({ id: "commit", slug: "not safe" as never, contentHash: article.contentHash, status: "submitted" })).resolves.toMatchObject({ status: "submitted" });
  });

  it("keeps the default site configuration local and rejects incomplete same-hash remote identities", async () => {
    expect(() => createWebsitePublisher()).not.toThrow();
    const { publisher: subject } = publisher({
      getRepoFile: vi.fn().mockResolvedValue({ ...existing(article.contentHash), sha: "" }),
    });
    await expect(subject.recover(article)).rejects.toThrow("PUBLISHER_PROVIDER_FAILED");
  });

  it("records a hash conflict even when the remote response has no optional SHA identifier", async () => {
    const remote = existing(differentHash);
    delete (remote as { sha?: string }).sha;
    const { publisher: subject } = publisher({ getRepoFile: vi.fn().mockResolvedValue(remote) });
    await expect(subject.recover(article)).rejects.toThrow("PUBLISHER_CONFLICT");
  });
});
