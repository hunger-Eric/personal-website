import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createArticleWorkbenchServer } from "@/lib/article-workbench/server";
import { createArticleWorkbenchRunStore } from "@/lib/article-workbench/run-store";

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
    const body = beforeEdits?.article?.body ?? "";
    const visible = body.replace(/\[\[S\d{3}\]\]/g, "").replace(/^#{1,6}\s+.*$/gm, "").replace(/\s+/g, "").trim();
    const paragraphs = body.split(/\n\s*\n/).filter((block) => !/^#{1,6}\s+/.test(block) && block.replace(/\[\[S\d{3}\]\]/g, "").trim().length >= 60);
    expect(visible.length).toBeGreaterThanOrEqual(500);
    expect(paragraphs.length).toBeGreaterThanOrEqual(4);
    expect(beforeEdits?.article?.summary).not.toContain("本地浏览器验收");
    expect(body).not.toBe("## 先明确可检查的责任\n\n将 AI 使用场景、负责人和风险记录在同一份流程中，能让团队从试用阶段开始保留核验依据。[[S001]]\n\n## 用公开原则校准决策\n\n把透明度、稳健性和问责要求转化为上线前检查项，有助于让业务目标与可信使用保持一致。[[S002]]\n\n## 让管理动作持续发生\n\n管理体系需要周期性复盘，而不是一次性的合规文件；团队可以把复盘结果纳入日常运营节奏。[[S003]]\n\n## 为变化保留更新入口\n\n外部规则与业务实践会变化，保留负责人与修订记录能让治理流程持续更新。[[S004]]");

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

  it("captures a fresh publication date for each run while edits retain the original path", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "article-offline-dates-"));
    roots.push(root);
    let now = new Date("2026-08-09T23:59:59.000Z");
    const server = createArticleWorkbenchServer(fixtureEnvironment, { rootDir: root, now: () => now });
    const first = await server.generate({ topic: "First run", articleRules: ["Use supplied sources only"] });
    now = new Date("2026-08-10T00:00:01.000Z");
    const second = await server.generate({ topic: "Second run", articleRules: ["Use supplied sources only"] });
    const store = createArticleWorkbenchRunStore({ rootDir: root });

    expect(await store.loadArtifact(first.id, "publicationRecord")).toMatchObject({ path: expect.stringMatching(/^content\/articles\/2026-08-09-/) });
    expect(await store.loadArtifact(second.id, "publicationRecord")).toMatchObject({ path: expect.stringMatching(/^content\/articles\/2026-08-10-/) });
    now = new Date("2026-08-11T00:00:01.000Z");
    await server.saveEdits(first.id, { confirmations: [], title: "Edited after midnight" });
    expect(await store.loadArtifact(first.id, "publicationRecord")).toMatchObject({ title: "Edited after midnight", path: expect.stringMatching(/^content\/articles\/2026-08-09-/) });
  });
});
