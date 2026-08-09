import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createArticleWorkbenchServer } from "@/lib/article-workbench/server";

const fixtureEnvironment = {
  ARTICLE_WORKBENCH_OFFLINE_FIXTURES: "true",
  NODE_ENV: "test",
  ENABLE_ADMIN: "true",
  NEXT_PUBLIC_BASE_URL: "https://example.test",
};

describe("offline article workbench fixtures", () => {
  const roots: string[] = [];
  afterEach(async () => {
    vi.restoreAllMocks();
    await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
  });

  it("are rejected in production instead of falling back to real providers", () => {
    expect(() => createArticleWorkbenchServer({ ...fixtureEnvironment, NODE_ENV: "production" })).toThrow("ARTICLE_OFFLINE_FIXTURES_DISABLED");
    expect(() => createArticleWorkbenchServer({ ...fixtureEnvironment, ENABLE_ADMIN: "false" })).toThrow("ARTICLE_OFFLINE_FIXTURES_DISABLED");
  });

  it("runs the persisted fixture workflow without network access and stays pending after submit and refresh", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "article-offline-fixture-"));
    roots.push(root);
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const server = createArticleWorkbenchServer(fixtureEnvironment, { rootDir: root });
    const profile = await server.getProfile();
    await expect(server.saveProfile(profile)).resolves.toEqual(profile);
    const generated = await server.generate({ topic: "本地验收", articleRules: ["只使用已提供来源"] });
    expect(generated.status).toBe("validated");
    const beforeEdits = await server.getRun(generated.id);
    expect(beforeEdits?.sources).toHaveLength(4);
    expect(beforeEdits?.previewMdx).toContain("本地验收");

    await server.saveEdits(generated.id, { confirmations: [{ sourceId: "S001", confirmed: true }, { sourceId: "S002", confirmed: true }], title: "本地验收编辑后的标题" });
    const afterEdits = await server.getRun(generated.id);
    expect(afterEdits?.article?.title).toBe("本地验收编辑后的标题");
    expect(afterEdits?.confirmations).toEqual([{ sourceId: "S001", confirmed: true }, { sourceId: "S002", confirmed: true }]);
    expect(afterEdits?.previewMdx).toContain("本地验收编辑后的标题");

    const reloaded = createArticleWorkbenchServer(fixtureEnvironment, { rootDir: root });
    expect((await reloaded.getRun(generated.id))?.article?.title).toBe("本地验收编辑后的标题");
    const submitted = await reloaded.submit(generated.id);
    const refreshed = await reloaded.refresh(generated.id);
    expect(submitted.status).toBe("submitted");
    expect(refreshed).toEqual(submitted);
    expect((await reloaded.getRun(generated.id))?.status).toBe("publish_submitted");
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
