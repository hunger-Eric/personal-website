import { randomBytes } from "node:crypto";
import {
  mkdir,
  readFile,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

import {
  ArticleRunStatusSchema,
  ArticleWorkbenchRunSchema,
  BusinessProfileSchema,
  type ArticleWorkbenchArtifact,
  type ArticleWorkbenchRun,
  type ArticleRunFailure,
  type ArticleRunStatus,
  type ArticlePublicationRecord,
  type PublicationClaimResult,
  type BusinessProfile,
  type RunStorePort,
} from "./contracts";

const RUN_ID_PATTERN = /^awr_[a-f0-9]{24}$/;
const secretKeyPattern = /api[-_]?key|authorization|token|secret|cookie/i;

const artifactFiles = {
  input: "input.json",
  researchPlan: "research-plan.json",
  sourcePacket: "source-packet.json",
  modelResponse: "model-response.json",
  validatedArticle: "validated-article.json",
  articleEdits: "article-edits.json",
  publicationRecord: "publication-record.json",
  publicationAttempt: "publication-attempt.json",
  renderedMdx: "rendered.mdx",
  publicationReceipt: "publication-receipt.json",
} as const;

type FileOperations = Pick<typeof import("node:fs/promises"), "mkdir" | "readFile" | "rename" | "rm" | "writeFile">;

export interface ArticleWorkbenchRunStoreOptions {
  rootDir?: string;
  filesystem?: Partial<FileOperations>;
}

export function generateArticleWorkbenchRunId(): string {
  return `awr_${randomBytes(12).toString("hex")}`;
}

export function createArticleWorkbenchRunStore(
  options: ArticleWorkbenchRunStoreOptions = {}
): ArticleWorkbenchRunStore {
  return new ArticleWorkbenchRunStore(options);
}

export class ArticleWorkbenchRunStore implements RunStorePort {
  private readonly rootDir: string;
  private readonly filesystem: FileOperations;

  constructor({ rootDir, filesystem = {} }: ArticleWorkbenchRunStoreOptions = {}) {
    this.rootDir = rootDir ?? path.join(process.cwd(), "output", "article-workbench");
    this.filesystem = { mkdir, readFile, rename, rm, writeFile, ...filesystem };
  }

  async saveProfile(profile: unknown): Promise<void> {
    const validated = BusinessProfileSchema.parse(profile);
    await this.writeJsonAtomically(path.join(this.rootDir, "profile.json"), validated);
  }

  async loadProfile(): Promise<BusinessProfile | null> {
    return this.readJsonIfPresent(path.join(this.rootDir, "profile.json"), BusinessProfileSchema);
  }

  async createRun(): Promise<ArticleWorkbenchRun> {
    const run: ArticleWorkbenchRun = { id: generateArticleWorkbenchRunId(), status: "created" };
    await this.writeJsonAtomically(this.runManifestPath(run.id), run);
    return run;
  }

  async getRun(id: string): Promise<ArticleWorkbenchRun | null> {
    const runId = this.validateRunId(id);
    const run = await this.readJsonIfPresent(
      this.runManifestPath(runId),
      ArticleWorkbenchRunSchema as z.ZodType<ArticleWorkbenchRun>
    );
    if (run && run.id !== runId) {
      throw readError();
    }
    return run;
  }

  async updateRunStatus(id: string, status: ArticleRunStatus, failure?: ArticleRunFailure): Promise<void> {
    const runId = this.validateRunId(id);
    const nextStatus = ArticleRunStatusSchema.parse(status);
    const current = await this.getRun(runId);
    if (!current) {
      throw new Error(`Article workbench run not found: ${runId}`);
    }
    if (!isLegalTransition(current.status, nextStatus)) throw new Error("ARTICLE_WORKBENCH_TRANSITION_INVALID");
    if ((nextStatus === "failed") !== Boolean(failure)) throw new Error("ARTICLE_WORKBENCH_FAILURE_STATE_INVALID");
    await this.writeJsonAtomically(this.runManifestPath(runId), { id: current.id, status: nextStatus, ...(failure ? { failure } : {}) });
  }

  async saveArtifact(id: string, artifact: ArticleWorkbenchArtifact, value: unknown): Promise<void> {
    const artifactPath = this.artifactPath(id, artifact);
    try {
      const safeValue = redactSecretLikeValues(value);
      const serialized = artifact === "renderedMdx" && typeof safeValue === "string"
        ? safeValue
        : JSON.stringify(safeValue, null, 2) + "\n";
      await this.writeAtomically(artifactPath, serialized);
    } catch {
      throw persistenceError();
    }
  }

  async loadArtifact(id: string, artifact: ArticleWorkbenchArtifact): Promise<unknown | null> {
    const artifactPath = this.artifactPath(id, artifact);
    try {
      const content = await this.filesystem.readFile(artifactPath, "utf8");
      return artifact === "renderedMdx" ? content : JSON.parse(content);
    } catch (error) {
      if (isMissingFileError(error)) return null;
      throw readError();
    }
  }

  async claimPublication(id: string, record: ArticlePublicationRecord): Promise<PublicationClaimResult> {
    const runId = this.validateRunId(id);
    const claimPath = path.join(this.rootDir, "runs", runId, "publication-claim.json");
    const serialized = JSON.stringify({ slug: record.slug, contentHash: record.contentHash }, null, 2) + "\n";
    try {
      await this.filesystem.mkdir(path.dirname(claimPath), { recursive: true });
      await this.filesystem.writeFile(claimPath, serialized, { encoding: "utf8", flag: "wx" });
      return { status: "claimed" };
    } catch (error) {
      if (!isExistsFileError(error)) throw persistenceError();
      const existing = await this.readJsonIfPresent(claimPath, z.object({ slug: z.string(), contentHash: z.string() }).strict());
      if (!existing || existing.slug !== record.slug || existing.contentHash !== record.contentHash) throw new Error("PUBLICATION_CLAIM_CONFLICT");
      return { status: "already_claimed" };
    }
  }

  private validateRunId(id: string): string {
    if (!RUN_ID_PATTERN.test(id)) {
      throw new Error("Invalid article workbench run id");
    }
    return id;
  }

  private runManifestPath(id: string): string {
    return path.join(this.rootDir, "runs", this.validateRunId(id), "run.json");
  }

  private artifactPath(id: string, artifact: ArticleWorkbenchArtifact): string {
    const fileName = artifactFiles[artifact];
    if (!fileName) throw new Error("Invalid article workbench artifact name");
    return path.join(this.rootDir, "runs", this.validateRunId(id), fileName);
  }

  private async readJsonIfPresent<T>(filePath: string, schema: z.ZodType<T>): Promise<T | null> {
    try {
      const raw = await this.filesystem.readFile(filePath, "utf8");
      return schema.parse(JSON.parse(raw));
    } catch (error) {
      if (isMissingFileError(error)) return null;
      throw readError();
    }
  }

  private async writeJsonAtomically(filePath: string, value: unknown): Promise<void> {
    await this.writeAtomically(filePath, JSON.stringify(value, null, 2) + "\n");
  }

  private async writeAtomically(filePath: string, contents: string): Promise<void> {
    const directory = path.dirname(filePath);
    const temporaryPath = path.join(directory, `.${path.basename(filePath)}.${randomBytes(8).toString("hex")}.tmp`);
    try {
      await this.filesystem.mkdir(directory, { recursive: true });
      await this.filesystem.writeFile(temporaryPath, contents, "utf8");
      await this.filesystem.rename(temporaryPath, filePath);
    } catch {
      await this.filesystem.rm(temporaryPath, { force: true }).catch(() => undefined);
      throw persistenceError();
    }
  }
}

function redactSecretLikeValues(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redactSecretLikeValues);
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value).flatMap(([key, nestedValue]) =>
      secretKeyPattern.test(key) ? [] : [[key, redactSecretLikeValues(nestedValue)]]
    )
  );
}

function isMissingFileError(error: unknown): error is NodeJS.ErrnoException {
  return Boolean(error && typeof error === "object" && "code" in error && error.code === "ENOENT");
}

function isExistsFileError(error: unknown): error is NodeJS.ErrnoException {
  return Boolean(error && typeof error === "object" && "code" in error && error.code === "EEXIST");
}

function isLegalTransition(current: ArticleRunStatus, next: ArticleRunStatus): boolean {
  if (current === next) return true;
  return ({
    created: ["research_planned", "failed"], research_planned: ["sources_ready", "failed"],
    sources_ready: ["article_generated", "failed"], article_generated: ["validated", "failed"],
    validated: ["publish_submitted", "failed"], publish_submitted: ["published", "failed"],
    published: [], failed: [],
  } satisfies Record<ArticleRunStatus, ArticleRunStatus[]>)[current].includes(next);
}

function persistenceError(): Error {
  return new Error("ARTICLE_WORKBENCH_PERSISTENCE_FAILED");
}

function readError(): Error {
  return new Error("ARTICLE_WORKBENCH_READ_FAILED");
}
