import matter from "gray-matter";

import { createRepoFile, getRepoFile, type RepoFileWriteReceipt } from "@/lib/github-photo";
import { SITE_URL } from "@/lib/site-url";

import { PublisherConflictError, type ArticlePublicationRecord, type PublicationReceipt, type PublisherPort } from "./contracts";

type RepoFile = Awaited<ReturnType<typeof getRepoFile>>;

export interface PersonalWebsitePublisherOptions {
  siteUrl?: string;
  getRepoFile?: (path: string) => Promise<RepoFile>;
  createRepoFile?: (
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
    createRepoFile: options.createRepoFile ?? createRepoFile,
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
      const recovered = await this.recover(article);
      if (recovered) return recovered;
      try {
        const write = await this.options.createRepoFile(article.path, article.body, `feat(article): publish ${article.slug}`, "utf-8");
        return receiptFromWrite(write, article);
      } catch {
        const afterCreateFailure = await this.recover(article);
        if (afterCreateFailure) return afterCreateFailure;
        throw providerFailure();
      }
    } catch (error) {
      if (isKnownPublisherError(error)) throw error;
      throw providerFailure();
    }
  }

  async recover(article: ArticlePublicationRecord): Promise<PublicationReceipt | null> {
    try {
      const existing = await this.options.getRepoFile(article.path);
      return existing ? existingReceipt(existing, article) : null;
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

function receiptFromWrite(write: RepoFileWriteReceipt, article: ArticlePublicationRecord): PublicationReceipt {
  if (write.path !== article.path || !write.commitSha || !write.contentSha) throw providerFailure();
  return { id: write.commitSha, slug: article.slug, contentHash: article.contentHash, status: "submitted" };
}

function existingReceipt(existing: NonNullable<RepoFile>, article: ArticlePublicationRecord): PublicationReceipt {
  if (existing.path !== article.path) throw providerFailure();
  const observedContentHash = existingHash(existing);
  if (!observedContentHash) throw providerFailure();
  if (observedContentHash !== article.contentHash) {
    throw new PublisherConflictError({
      expectedContentHash: article.contentHash,
      observedContentHash,
      slug: article.slug,
      path: article.path,
      ...(existing.sha ? { remoteId: existing.sha } : {}),
    });
  }
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
  const match = /<meta(?=\s|\/?>)[^>]*>/gi;
  for (const tag of html.match(match) ?? []) {
    const attributes = new Map<string, string>();
    for (const attribute of tag.matchAll(/([^\s=/>]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)) {
      attributes.set(attribute[1].toLowerCase(), attribute[2] ?? attribute[3] ?? attribute[4]);
    }
    if (attributes.get("name") === "article-content-hash" && attributes.get("content")) {
      return attributes.get("content");
    }
  }
  return undefined;
}

function providerFailure(): Error {
  return new Error("PUBLISHER_PROVIDER_FAILED");
}

function isKnownPublisherError(error: unknown): error is Error {
  return error instanceof PublisherConflictError || (error instanceof Error && /^(PUBLISHER_PROVIDER_FAILED|PUBLISHER_CONFIGURATION_INVALID)$/.test(error.message));
}
