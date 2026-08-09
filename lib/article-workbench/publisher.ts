import matter from "gray-matter";

import { getRepoFile, upsertRepoFile, type RepoFileWriteReceipt } from "@/lib/github-photo";
import { SITE_URL } from "@/lib/site-url";

import type { ArticlePublicationRecord, PublicationReceipt, PublisherPort } from "./contracts";

type RepoFile = Awaited<ReturnType<typeof getRepoFile>>;

export interface PersonalWebsitePublisherOptions {
  siteUrl?: string;
  getRepoFile?: (path: string) => Promise<RepoFile>;
  upsertRepoFile?: (
    path: string,
    content: string | Buffer,
    message: string,
    encoding?: "base64" | "utf-8",
    existingSha?: string,
  ) => Promise<RepoFileWriteReceipt>;
  fetch?: typeof globalThis.fetch;
}

export function createPersonalWebsitePublisher(options: PersonalWebsitePublisherOptions = {}): PublisherPort {
  return new PersonalWebsitePublisher({
    siteUrl: options.siteUrl ?? SITE_URL,
    getRepoFile: options.getRepoFile ?? getRepoFile,
    upsertRepoFile: options.upsertRepoFile ?? upsertRepoFile,
    fetch: options.fetch ?? globalThis.fetch,
  });
}

class PersonalWebsitePublisher implements PublisherPort {
  private readonly siteUrl: URL;

  constructor(private readonly options: Required<PersonalWebsitePublisherOptions>) {
    this.siteUrl = canonicalSiteUrl(options.siteUrl);
  }

  async submit(article: ArticlePublicationRecord): Promise<PublicationReceipt> {
    try {
      const existing = await this.options.getRepoFile(article.path);
      if (existing) return existingReceipt(existing, article);
      const write = await this.options.upsertRepoFile(article.path, article.body, `feat(article): publish ${article.slug}`, "utf-8");
      if (write.path !== article.path || !write.commitSha) throw providerFailure();
      return { id: write.commitSha, slug: article.slug, contentHash: article.contentHash, status: "submitted" };
    } catch (error) {
      if (isKnownPublisherError(error)) throw error;
      throw providerFailure();
    }
  }

  async verify(receipt: PublicationReceipt): Promise<PublicationReceipt> {
    try {
      const response = await this.options.fetch(this.publicArticleUrl(receipt.slug), { cache: "no-store" });
      if (!response.ok) return receipt;
      const contentHash = publicContentHash(await response.text());
      return contentHash === receipt.contentHash ? { ...receipt, status: "published" } : receipt;
    } catch {
      return receipt;
    }
  }

  private publicArticleUrl(slug: string): string {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error("PUBLISHER_CONFIGURATION_INVALID");
    return new URL(`/articles/${slug}`, this.siteUrl).toString();
  }
}

function existingReceipt(existing: NonNullable<RepoFile>, article: ArticlePublicationRecord): PublicationReceipt {
  if (existing.path !== article.path) throw providerFailure();
  if (existingHash(existing) !== article.contentHash) throw new Error("PUBLISHER_CONFLICT");
  if (!existing.sha) throw providerFailure();
  return { id: existing.sha, slug: article.slug, contentHash: article.contentHash, status: "submitted" };
}

function existingHash(file: NonNullable<RepoFile>): string | undefined {
  if (file.encoding !== "base64" || typeof file.content !== "string") throw providerFailure();
  try {
    const parsed = matter(Buffer.from(file.content.replace(/\s/g, ""), "base64").toString("utf8"));
    return typeof parsed.data.contentHash === "string" ? parsed.data.contentHash : undefined;
  } catch {
    throw providerFailure();
  }
}

function canonicalSiteUrl(value: string): URL {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash || url.pathname !== "/") throw new Error();
    return url;
  } catch {
    throw new Error("PUBLISHER_CONFIGURATION_INVALID");
  }
}

function publicContentHash(html: string): string | undefined {
  const match = /<meta\b[^>]*>/gi;
  for (const tag of html.match(match) ?? []) {
    const name = /\bname\s*=\s*(["'])article-content-hash\1/i.test(tag);
    const content = /\bcontent\s*=\s*(["'])([^"']*)\1/i.exec(tag)?.[2];
    if (name && content) return content;
  }
  return undefined;
}

function providerFailure(): Error {
  return new Error("PUBLISHER_PROVIDER_FAILED");
}

function isKnownPublisherError(error: unknown): error is Error {
  return error instanceof Error && /^(PUBLISHER_CONFLICT|PUBLISHER_PROVIDER_FAILED|PUBLISHER_CONFIGURATION_INVALID)$/.test(error.message);
}
