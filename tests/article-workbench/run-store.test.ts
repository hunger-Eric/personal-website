import { mkdtemp, readFile, rm } from "node:fs/promises";
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
    ).rejects.toThrow("simulated interruption");
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
});
