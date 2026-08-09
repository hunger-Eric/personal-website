import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { defaultArticleBusinessProfile } from "@/config/article-business-profile";
import {
  createArticleWorkbenchRunStore,
  generateArticleWorkbenchRunId,
} from "@/lib/article-workbench/run-store";

const temporaryRoots: string[] = [];

async function createTemporaryRoot(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "article-workbench-store-"));
  temporaryRoots.push(root);
  return root;
}

async function captureError(operation: Promise<void>): Promise<Error> {
  try {
    await operation;
  } catch (error) {
    if (error instanceof Error) return error;
    throw new Error("Expected an Error instance");
  }
  throw new Error("Expected the operation to fail");
}

afterEach(async () => {
  await Promise.all(
    temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true }))
  );
});

describe("article workbench run store", () => {
  it("generates canonical run identifiers", () => {
    expect(generateArticleWorkbenchRunId()).toMatch(/^awr_[a-f0-9]{24}$/);
  });

  it("round-trips a validated profile", async () => {
    const root = await createTemporaryRoot();
    const store = createArticleWorkbenchRunStore({ rootDir: root });

    await store.saveProfile(defaultArticleBusinessProfile);

    await expect(store.loadProfile()).resolves.toEqual(defaultArticleBusinessProfile);
  });

  it("rejects an on-disk profile with unknown keys", async () => {
    const root = await createTemporaryRoot();
    const store = createArticleWorkbenchRunStore({ rootDir: root });
    await mkdir(root, { recursive: true });
    await writeFile(
      path.join(root, "profile.json"),
      JSON.stringify({ ...defaultArticleBusinessProfile, unexpected: true }),
      "utf8"
    );

    await expect(store.loadProfile()).rejects.toThrow();
  });

  it("redacts nested secret-like artifact fields before persistence", async () => {
    const root = await createTemporaryRoot();
    const store = createArticleWorkbenchRunStore({ rootDir: root });
    const run = await store.createRun();

    await store.saveArtifact(run.id, "modelResponse", {
      metadata: {
        apiKey: "do-not-persist",
        nested: {
          authorization: "Bearer do-not-persist",
          token: "do-not-persist",
          secret: "do-not-persist",
          cookie: "do-not-persist",
          kept: "safe",
        },
      },
    });

    await expect(store.loadArtifact(run.id, "modelResponse")).resolves.toEqual({
      metadata: { nested: { kept: "safe" } },
    });
    await expect(
      readFile(path.join(root, "runs", run.id, "model-response.json"), "utf8")
    ).resolves.not.toContain("do-not-persist");
  });

  it("creates and round-trips a run manifest under its canonical directory", async () => {
    const root = await createTemporaryRoot();
    const store = createArticleWorkbenchRunStore({ rootDir: root });

    const created = await store.createRun();
    await store.updateRunStatus(created.id, "research_planned");

    await expect(store.getRun(created.id)).resolves.toEqual({
      id: created.id,
      status: "research_planned",
    });
    await expect(
      readFile(path.join(root, "runs", created.id, "run.json"), "utf8")
    ).resolves.toContain('"status": "research_planned"');
  });

  it("rejects illegal status jumps and failed states without a typed failure", async () => {
    const root = await createTemporaryRoot();
    const store = createArticleWorkbenchRunStore({ rootDir: root });
    const run = await store.createRun();

    await expect(store.updateRunStatus(run.id, "published")).rejects.toThrow("ARTICLE_WORKBENCH_TRANSITION_INVALID");
    await expect(store.updateRunStatus(run.id, "failed")).rejects.toThrow("ARTICLE_WORKBENCH_FAILURE_STATE_INVALID");
    await store.updateRunStatus(run.id, "failed", {
      stage: "profile", code: "BUSINESS_PROFILE_INVALID", message: "business profile invalid.", occurredAt: "2026-08-09T00:00:00.000Z", userActionRequired: true,
    });
    await expect(store.updateRunStatus(run.id, "created")).rejects.toThrow("ARTICLE_WORKBENCH_TRANSITION_INVALID");
  });

  it("rejects malformed or unknown failures before changing the manifest", async () => {
    const root = await createTemporaryRoot();
    const store = createArticleWorkbenchRunStore({ rootDir: root });
    const run = await store.createRun();
    const manifest = path.join(root, "runs", run.id, "run.json");
    const before = await readFile(manifest, "utf8");

    await expect(store.updateRunStatus(run.id, "failed", { stage: "profile", code: "NOT_A_CODE", message: "bad.", occurredAt: "2026-08-09T00:00:00.000Z", userActionRequired: true } as never)).rejects.toThrow();
    await expect(store.updateRunStatus(run.id, "failed", { stage: "profile", code: "BUSINESS_PROFILE_INVALID", message: "", occurredAt: "not-a-date", userActionRequired: true } as never)).rejects.toThrow();
    await expect(readFile(manifest, "utf8")).resolves.toBe(before);
  });

  it("does not allow a terminal failure to be overwritten", async () => {
    const root = await createTemporaryRoot();
    const store = createArticleWorkbenchRunStore({ rootDir: root });
    const run = await store.createRun();
    const failure = { stage: "profile" as const, code: "BUSINESS_PROFILE_INVALID" as const, message: "business profile invalid.", occurredAt: "2026-08-09T00:00:00.000Z", userActionRequired: true };
    await store.updateRunStatus(run.id, "failed", failure);

    await expect(store.updateRunStatus(run.id, "failed", { ...failure, code: "RESEARCH_PLAN_INVALID" })).rejects.toThrow("ARTICLE_WORKBENCH_TRANSITION_INVALID");
    await expect(store.getRun(run.id)).resolves.toMatchObject({ status: "failed", failure });
  });

  it("rejects manifests whose failure does not match their status", async () => {
    const root = await createTemporaryRoot();
    const store = createArticleWorkbenchRunStore({ rootDir: root });
    const runId = "awr_aaaaaaaaaaaaaaaaaaaaaaaa";
    await mkdir(path.join(root, "runs", runId), { recursive: true });
    await writeFile(path.join(root, "runs", runId, "run.json"), JSON.stringify({ id: runId, status: "validated", failure: { stage: "profile", code: "BUSINESS_PROFILE_INVALID", message: "business profile invalid.", occurredAt: "2026-08-09T00:00:00.000Z", userActionRequired: true } }), "utf8");

    await expect(store.getRun(runId)).rejects.toThrow("ARTICLE_WORKBENCH_READ_FAILED");
  });

  it("atomically gives one claimant ownership of a publication record", async () => {
    const root = await createTemporaryRoot();
    const store = createArticleWorkbenchRunStore({ rootDir: root });
    const run = await store.createRun();
    const record = { title: "Title", body: "Body", slug: "title", contentHash: "sha256:abc", path: "content/articles/2026-08-09-title.mdx" };

    const claims = await Promise.all([store.claimPublication(run.id, record), store.claimPublication(run.id, record)]);

    expect(claims.map((claim) => claim.status).sort()).toEqual(["already_claimed", "claimed"]);
  });

  it("rejects malformed on-disk profile JSON", async () => {
    const root = await createTemporaryRoot();
    const store = createArticleWorkbenchRunStore({ rootDir: root });
    await mkdir(root, { recursive: true });
    await writeFile(path.join(root, "profile.json"), "{ malformed", "utf8");

    await expect(store.loadProfile()).rejects.toThrow("ARTICLE_WORKBENCH_READ_FAILED");
  });

  it("rejects an on-disk manifest with an invalid run id", async () => {
    const root = await createTemporaryRoot();
    const store = createArticleWorkbenchRunStore({ rootDir: root });
    const runId = "awr_aaaaaaaaaaaaaaaaaaaaaaaa";
    const runDirectory = path.join(root, "runs", runId);
    await mkdir(runDirectory, { recursive: true });
    await writeFile(
      path.join(runDirectory, "run.json"),
      JSON.stringify({ id: "awr_not-hex", status: "created" }),
      "utf8"
    );

    await expect(store.getRun(runId)).rejects.toThrow("ARTICLE_WORKBENCH_READ_FAILED");
  });

  it("rejects a canonical manifest id that differs from its requested directory", async () => {
    const root = await createTemporaryRoot();
    const store = createArticleWorkbenchRunStore({ rootDir: root });
    const requestedRunId = "awr_aaaaaaaaaaaaaaaaaaaaaaaa";
    const runDirectory = path.join(root, "runs", requestedRunId);
    await mkdir(runDirectory, { recursive: true });
    await writeFile(
      path.join(runDirectory, "run.json"),
      JSON.stringify({ id: "awr_bbbbbbbbbbbbbbbbbbbbbbbb", status: "created" }),
      "utf8"
    );

    await expect(store.getRun(requestedRunId)).rejects.toThrow(
      "ARTICLE_WORKBENCH_READ_FAILED"
    );
  });

  it("rejects traversal-shaped run identifiers before constructing a path", async () => {
    const root = await createTemporaryRoot();
    const store = createArticleWorkbenchRunStore({ rootDir: root });

    await expect(store.getRun("../outside")).rejects.toThrow(/run id/i);
    await expect(store.updateRunStatus("awr_aaaaaaaaaaaaaaaaaaaaaaaa/..", "failed")).rejects.toThrow(
      /run id/i
    );
  });

  it("returns null for a missing canonical run", async () => {
    const root = await createTemporaryRoot();
    const store = createArticleWorkbenchRunStore({ rootDir: root });

    await expect(store.getRun("awr_aaaaaaaaaaaaaaaaaaaaaaaa")).resolves.toBeNull();
  });

  it("atomically replaces a persisted artifact", async () => {
    const root = await createTemporaryRoot();
    const store = createArticleWorkbenchRunStore({ rootDir: root });
    const run = await store.createRun();

    await store.saveArtifact(run.id, "researchPlan", { version: 1 });
    await store.saveArtifact(run.id, "researchPlan", { version: 2 });

    await expect(store.loadArtifact(run.id, "researchPlan")).resolves.toEqual({ version: 2 });
  });

  it("preserves the last valid artifact when the atomic rename is interrupted", async () => {
    const root = await createTemporaryRoot();
    const stableStore = createArticleWorkbenchRunStore({ rootDir: root });
    const run = await stableStore.createRun();
    await stableStore.saveArtifact(run.id, "sourcePacket", { version: "stable" });

    const interruptedStore = createArticleWorkbenchRunStore({
      rootDir: root,
      filesystem: {
        rename: async () => {
          throw new Error("simulated interruption");
        },
      },
    });

    await expect(
      interruptedStore.saveArtifact(run.id, "sourcePacket", { version: "new" })
    ).rejects.toThrow("ARTICLE_WORKBENCH_PERSISTENCE_FAILED");
    await expect(stableStore.loadArtifact(run.id, "sourcePacket")).resolves.toEqual({
      version: "stable",
    });
  });

  it("rejects unsafe artifact names", async () => {
    const root = await createTemporaryRoot();
    const store = createArticleWorkbenchRunStore({ rootDir: root });
    const run = await store.createRun();

    await expect(store.saveArtifact(run.id, "../escape" as never, { value: true })).rejects.toThrow(
      /artifact/i
    );
  });

  it("does not expose secrets when artifact preparation throws", async () => {
    const root = await createTemporaryRoot();
    const store = createArticleWorkbenchRunStore({ rootDir: root });
    const run = await store.createRun();
    const secret = "actual-token";
    const unsafeArtifact = {
      toJSON() {
        throw new Error(`Authorization: Bearer ${secret}`);
      },
    };

    const error = await captureError(store.saveArtifact(run.id, "modelResponse", unsafeArtifact));

    expect(error.message).toBe("ARTICLE_WORKBENCH_PERSISTENCE_FAILED");
    expect(error.message).not.toContain(secret);
    expect(error.message).not.toContain("Bearer");
  });

  it("does not expose secrets from accessors or filesystem failures", async () => {
    const root = await createTemporaryRoot();
    const stableStore = createArticleWorkbenchRunStore({ rootDir: root });
    const run = await stableStore.createRun();
    const accessorSecret = "actual-token";
    const unsafeArtifact = Object.defineProperty({}, "token", {
      enumerable: true,
      get() {
        throw new Error(`Authorization: Bearer ${accessorSecret}`);
      },
    });
    const accessorError = await captureError(
      stableStore.saveArtifact(run.id, "modelResponse", unsafeArtifact)
    );

    const failingStore = createArticleWorkbenchRunStore({
      rootDir: root,
      filesystem: {
        writeFile: async () => {
          throw new Error("apiKey=api-key-value token=token-value cookie=cookie-value");
        },
      },
    });
    const filesystemError = await captureError(
      failingStore.saveArtifact(run.id, "modelResponse", { value: "safe" })
    );

    for (const error of [accessorError, filesystemError]) {
      expect(error.message).toBe("ARTICLE_WORKBENCH_PERSISTENCE_FAILED");
      expect(error.message).not.toContain("actual-token");
      expect(error.message).not.toContain("api-key-value");
      expect(error.message).not.toContain("token-value");
      expect(error.message).not.toContain("cookie-value");
    }
  });
});
