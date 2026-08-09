import { describe, expect, it, vi } from "vitest";

import { createArticleWorkflow } from "@/lib/article-workbench/core";
import { createPersonalWebsitePublisher } from "@/lib/article-workbench/publisher";
import { defaultArticleBusinessProfile } from "@/config/article-business-profile";
import type {
  ArticleWorkbenchArtifact,
  ArticleWorkbenchRun,
  BusinessProfile,
  ModelPort,
  PublisherPort,
  ResearchPlan,
  RunStorePort,
  SearchPort,
  SourcePacketResult,
  ArticlePublicationRecord,
} from "@/lib/article-workbench/contracts";

const sources = [
  { id: "S001", title: "Primary source", url: "https://example.com/one", excerpt: "Evidence one", content: "Evidence one" },
  { id: "S002", title: "Standard", url: "https://example.com/two", excerpt: "Evidence two", content: "Evidence two" },
] as const;

class MemoryStore implements RunStorePort {
  readonly runs = new Map<string, ArticleWorkbenchRun>();
  readonly artifacts = new Map<string, unknown>();
  readonly claims = new Set<string>();
  readonly events: string[] = [];
  failNextPublicationReceiptSave = false;

  async createRun(): Promise<ArticleWorkbenchRun> {
    const run = { id: "awr_aaaaaaaaaaaaaaaaaaaaaaaa", status: "created" as const };
    this.runs.set(run.id, run);
    this.events.push("store:create");
    return run;
  }
  async getRun(id: string) { return this.runs.get(id) ?? null; }
  async updateRunStatus(id: string, status: ArticleWorkbenchRun["status"], failure?: ArticleWorkbenchRun["failure"]) {
    const current = this.runs.get(id);
    if (!current) throw new Error("missing run");
    if (current.status === status) throw new Error("ARTICLE_WORKBENCH_TRANSITION_INVALID");
    this.runs.set(id, { ...current, status, ...(failure ? { failure } : {}) });
    this.events.push(`store:status:${status}`);
  }
  async saveArtifact(id: string, artifact: ArticleWorkbenchArtifact, value: unknown) {
    if (artifact === "publicationReceipt" && this.failNextPublicationReceiptSave) {
      this.failNextPublicationReceiptSave = false;
      throw new Error("receipt persistence interrupted");
    }
    this.artifacts.set(`${id}:${artifact}`, value);
    this.events.push(`store:artifact:${artifact}`);
  }
  async loadArtifact(id: string, artifact: ArticleWorkbenchArtifact) {
    return this.artifacts.get(`${id}:${artifact}`) ?? null;
  }
  async claimPublication(id: string, record: { slug?: string; contentHash?: string }) {
    const key = `${id}:${record.slug}:${record.contentHash}`;
    if (this.claims.has(key)) return { status: "already_claimed" as const };
    this.claims.add(key);
    return { status: "claimed" as const };
  }
}

const publicationRecord = { title: "Evidence-led article", body: "Rendered article", slug: "evidence-led-article", contentHash: "sha256:abc", path: "content/articles/2026-08-09-evidence-led-article.mdx" };

async function confirmAndSeedPublication(store: MemoryStore, workflow: ReturnType<typeof createArticleWorkflow>, runId: string) {
  await workflow.saveArticleEdits(runId, { confirmations: [{ sourceId: "S001", confirmed: true }, { sourceId: "S002", confirmed: true }] });
}

function createWorkflow(options: {
  profile?: BusinessProfile;
  packet?: SourcePacketResult;
  plan?: unknown;
  article?: unknown;
  submitted?: (record: { slug?: string; contentHash?: string }) => unknown;
  recovered?: (record: { slug?: string; contentHash?: string }) => unknown;
  publisher?: PublisherPort;
  verified?: (receipt: { id?: string; slug?: string; contentHash?: string; status?: "submitted" | "published" }) => unknown;
} = {}) {
  const profile = options.profile ?? defaultArticleBusinessProfile;
  const packet = options.packet ?? { status: "ok" as const, sources: [...sources] };
  const store = new MemoryStore();
  const model: ModelPort = {
    async proposeResearchPlan() {
      expect(store.events).toContain("store:artifact:input");
      store.events.push("model:plan");
      return (options.plan ?? { queries: [{ query: "official guidance", type: "general" }, { query: "primary research", type: "academic" }] }) as never;
    },
    async writeSourceBoundArticle() {
      expect(store.events).toContain("store:status:sources_ready");
      store.events.push("model:write");
      return (options.article ?? {
        title: "Evidence-led article",
        slugProposal: "evidence-led-article",
        summary: "A source-bound summary.",
        tags: ["research"],
        body: "Supported claim [[S001]] and corroboration [[S002]].",
        sourceAssessments: [
          { sourceId: "S001", category: "official", rationale: "Primary authority", claimsSupported: ["Supported claim"] },
          { sourceId: "S002", category: "standard", rationale: "Published standard", claimsSupported: ["Corroboration"] },
        ],
      }) as never;
    },
  };
  const search: SearchPort = {
    async collect(plan: ResearchPlan) {
      expect(plan.queries.map((query) => query.id)).toEqual(["Q001", "Q002"]);
      expect(store.events).toContain("store:status:research_planned");
      store.events.push("search:collect");
      return packet;
    },
  };
  let submissions = 0;
  let submittedRecord: unknown;
  let verifications = 0;
  let recoveries = 0;
  const fakePublisher: PublisherPort = {
    async submit(record) {
      submissions += 1;
      submittedRecord = record;
      return (options.submitted?.(record) ?? { id: "publication-1", slug: record.slug, contentHash: record.contentHash, status: "submitted" }) as never;
    },
    async recover(record) { recoveries += 1; return (options.recovered?.(record) ?? null) as never; },
    async verify(receipt) { verifications += 1; return (options.verified?.(receipt) ?? { ...receipt, status: "published" }) as never; },
  };
  const publisher = options.publisher ?? fakePublisher;
  return { store, publisher, submissions: () => submissions, recoveries: () => recoveries, submittedRecord: () => submittedRecord, verifications: () => verifications, workflow: createArticleWorkflow({ profile: { getProfile: async () => profile }, model, search, store, publisher, publicationDefaults: { date: "2026-08-09", author: "fengc" } }) };
}

describe("article workbench workflow", () => {
  it("persists each checkpoint before the next provider boundary and reaches validated", async () => {
    const { store, workflow } = createWorkflow();
    const run = await workflow.generateArticle({ topic: "Research controls", articleRules: ["Use supplied sources only"] });

    expect(run.status).toBe("validated");
    expect(store.events).toEqual([
      "store:create", "store:artifact:input", "model:plan",
      "store:artifact:researchPlan", "store:status:research_planned", "search:collect",
      "store:artifact:sourcePacket", "store:status:sources_ready", "model:write",
      "store:artifact:modelResponse", "store:status:article_generated", "store:artifact:validatedArticle", "store:artifact:renderedMdx", "store:artifact:publicationRecord", "store:status:validated",
    ]);
  });

  it("stops at the first typed failure without calling downstream ports", async () => {
    const { store, workflow } = createWorkflow({ profile: { ...defaultArticleBusinessProfile, identity: { ...defaultArticleBusinessProfile.identity, name: "" } } as BusinessProfile });
    await expect(workflow.generateArticle({ topic: "Research controls", articleRules: ["Use supplied sources only"] })).rejects.toThrow("BUSINESS_PROFILE_INVALID");

    const run = [...store.runs.values()][0];
    expect(run).toMatchObject({ status: "failed", failure: { stage: "profile", code: "BUSINESS_PROFILE_INVALID", userActionRequired: true } });
    expect(store.events).not.toContain("model:plan");
  });

  it("records insufficient sources at the source stage without calling the writer", async () => {
    const { store, workflow } = createWorkflow({ packet: { status: "insufficient_sources", sources: [...sources] } });
    await expect(workflow.generateArticle({ topic: "Research controls", articleRules: ["Use supplied sources only"] })).rejects.toThrow("SOURCES_INSUFFICIENT");

    expect([...store.runs.values()][0]).toMatchObject({ status: "failed", failure: { stage: "sources", code: "SOURCES_INSUFFICIENT" } });
    expect(store.events).not.toContain("model:write");
    expect(store.artifacts.get(`${[...store.runs.keys()][0]}:sourcePacket`)).toEqual({ status: "insufficient_sources", sources: [...sources] });
  });

  it("persists an invalid research plan failure exactly once and never calls search", async () => {
    const { store, workflow } = createWorkflow({ plan: { queries: [{ query: "only one", type: "general" }] } });
    await expect(workflow.generateArticle({ topic: "Research controls", articleRules: ["Use supplied sources only"] })).rejects.toThrow("RESEARCH_PLAN_INVALID");

    expect(store.events.filter((event) => event === "store:status:failed")).toHaveLength(1);
    expect([...store.runs.values()][0]).toMatchObject({ failure: { stage: "research_plan", code: "RESEARCH_PLAN_INVALID" } });
    expect(store.events).not.toContain("search:collect");
  });

  it("persists invalid model output once at the article stage", async () => {
    const { store, workflow } = createWorkflow({ article: { title: "bad" } });
    await expect(workflow.generateArticle({ topic: "Research controls", articleRules: ["Use supplied sources only"] })).rejects.toThrow("ARTICLE_MODEL_OUTPUT_INVALID");

    expect(store.events.filter((event) => event === "store:status:failed")).toHaveLength(1);
    expect([...store.runs.values()][0]).toMatchObject({ failure: { stage: "article", code: "ARTICLE_MODEL_OUTPUT_INVALID" } });
  });

  it("requires human confirmation of two authoritative sources before idempotent publication", async () => {
    const { store, workflow, submissions } = createWorkflow();
    const run = await workflow.generateArticle({ topic: "Research controls", articleRules: ["Use supplied sources only"] });
    await expect(workflow.submitPublication(run.id)).rejects.toThrow("PUBLICATION_CONFIRMATION_REQUIRED");

    await confirmAndSeedPublication(store, workflow, run.id);
    const first = await workflow.submitPublication(run.id);
    const repeated = await workflow.submitPublication(run.id);

    expect(first).toEqual(repeated);
    expect(submissions()).toBe(1);
    expect(store.runs.get(run.id)?.status).toBe("publish_submitted");
  });

  it("recovers a GitHub-successful receipt after local persistence interruption without a second submit", async () => {
    const { store, workflow, submissions, recoveries } = createWorkflow({
      recovered: (record) => ({ id: "remote-commit", slug: record.slug, contentHash: record.contentHash, status: "submitted" }),
    });
    const run = await workflow.generateArticle({ topic: "Research controls", articleRules: ["Use supplied sources only"] });
    await confirmAndSeedPublication(store, workflow, run.id);
    store.failNextPublicationReceiptSave = true;

    await expect(workflow.submitPublication(run.id)).rejects.toThrow("receipt persistence interrupted");
    await expect(workflow.submitPublication(run.id)).resolves.toMatchObject({ id: "remote-commit", status: "submitted" });
    expect(submissions()).toBe(1);
    expect(recoveries()).toBe(1);
    expect(store.runs.get(run.id)?.status).toBe("publish_submitted");
  });

  it("keeps a recovered remote receipt submitted until public verification", async () => {
    const { store, workflow } = createWorkflow({
      recovered: (record) => ({ id: "remote-commit", slug: record.slug, contentHash: record.contentHash, status: "published" }),
    });
    const run = await workflow.generateArticle({ topic: "Research controls", articleRules: ["Use supplied sources only"] });
    await confirmAndSeedPublication(store, workflow, run.id);
    const record = store.artifacts.get(`${run.id}:publicationRecord`) as { slug: string; contentHash: string };
    store.claims.add(`${run.id}:${record.slug}:${record.contentHash}`);

    await expect(workflow.submitPublication(run.id)).resolves.toMatchObject({ status: "submitted" });
    expect(store.runs.get(run.id)?.status).toBe("publish_submitted");
  });

  it("does not submit again when an already-claimed record cannot be recovered", async () => {
    const { store, workflow, submissions, recoveries } = createWorkflow();
    const run = await workflow.generateArticle({ topic: "Research controls", articleRules: ["Use supplied sources only"] });
    await confirmAndSeedPublication(store, workflow, run.id);
    const record = store.artifacts.get(`${run.id}:publicationRecord`) as { slug: string; contentHash: string };
    store.claims.add(`${run.id}:${record.slug}:${record.contentHash}`);

    await expect(workflow.submitPublication(run.id)).rejects.toThrow("PUBLICATION_ALREADY_CLAIMED");
    expect(submissions()).toBe(0);
    expect(recoveries()).toBe(1);
  });

  it("persists safe real-publisher conflict evidence without a create or overwrite", async () => {
    let remoteFile: { sha: string; path: string; encoding: string; content: string } | null = null;
    const getRepoFile = vi.fn(async () => remoteFile);
    const createRepoFile = vi.fn();
    const publisher = createPersonalWebsitePublisher({ siteUrl: "https://example.com", getRepoFile, createRepoFile });
    const { store, workflow } = createWorkflow({ publisher });
    const run = await workflow.generateArticle({ topic: "Research controls", articleRules: ["Use supplied sources only"] });
    await confirmAndSeedPublication(store, workflow, run.id);
    const record = store.artifacts.get(`${run.id}:publicationRecord`) as ArticlePublicationRecord;
    store.claims.add(`${run.id}:${record.slug}:${record.contentHash}`);
    remoteFile = {
      sha: "remote-content-sha",
      path: record.path,
      encoding: "base64",
      content: Buffer.from(`---\ntitle: \"Evidence-led article\"\ndate: \"2026-08-09\"\ncontentHash: \"sha256:different\"\n---\n\nBody`).toString("base64"),
    };

    await expect(workflow.submitPublication(run.id)).rejects.toThrow("PUBLISHER_CONFLICT");
    expect(createRepoFile).not.toHaveBeenCalled();
    expect(store.artifacts.get(`${run.id}:publicationConflictEvidence`)).toEqual({
      expectedContentHash: record.contentHash,
      observedContentHash: "sha256:different",
      slug: record.slug,
      path: record.path,
      remoteId: "remote-content-sha",
    });
    expect(store.runs.get(run.id)?.status).toBe("failed");
  });

  it("rejects confirmations that are not in the validated model assessments", async () => {
    const { store, workflow } = createWorkflow();
    const run = await workflow.generateArticle({ topic: "Research controls", articleRules: ["Use supplied sources only"] });
    await expect(workflow.saveArticleEdits(run.id, { confirmations: [{ sourceId: "S999", confirmed: true }] })).rejects.toThrow("SOURCE_CONFIRMATION_INVALID");
    expect(store.artifacts.get(`${run.id}:articleEdits`)).toBeUndefined();
  });

  it("rejects forged publication fields without changing artifacts", async () => {
    const { workflow, store } = createWorkflow();
    const run = await workflow.generateArticle({ topic: "Research controls", articleRules: ["Use supplied sources only"] });
    const before = store.artifacts.get(`${run.id}:publicationRecord`);
    await expect(workflow.saveArticleEdits(run.id, { confirmations: [], publicationRecord } as never)).rejects.toThrow();
    expect(store.artifacts.get(`${run.id}:publicationRecord`)).toBe(before);
  });

  it("reformats partial human edits and gives the publisher the formatter path", async () => {
    const { workflow, store, submittedRecord } = createWorkflow();
    const run = await workflow.generateArticle({ topic: "Research controls", articleRules: ["Use supplied sources only"] });
    const before = store.artifacts.get(`${run.id}:publicationRecord`) as { contentHash: string };
    await workflow.saveArticleEdits(run.id, { confirmations: [{ sourceId: "S001", confirmed: true }, { sourceId: "S002", confirmed: true }], title: "Edited article" });
    const record = store.artifacts.get(`${run.id}:publicationRecord`) as { title: string; path: string; contentHash: string };
    expect(record).toMatchObject({ title: "Edited article", path: "content/articles/2026-08-09-evidence-led-article.mdx" });
    expect(record.contentHash).not.toBe(before.contentHash);
    await workflow.submitPublication(run.id);
    expect(submittedRecord()).toMatchObject({ path: record.path, contentHash: record.contentHash });
  });

  it("keeps earlier human fields when a later partial edit changes the body", async () => {
    const { workflow, store } = createWorkflow();
    const run = await workflow.generateArticle({ topic: "Research controls", articleRules: ["Use supplied sources only"] });
    await workflow.saveArticleEdits(run.id, { confirmations: [], title: "First edit" });
    await workflow.saveArticleEdits(run.id, { confirmations: [], body: "Edited claim [[S001]] and corroboration [[S002]]." });
    expect(store.artifacts.get(`${run.id}:validatedArticle`)).toMatchObject({ title: "First edit", body: "Edited claim [[S001]] and corroboration [[S002]]." });
  });

  it("persists the formatter-normalized slug across later edits and publication", async () => {
    const { workflow, store, submittedRecord } = createWorkflow();
    const run = await workflow.generateArticle({ topic: "Research controls", articleRules: ["Use supplied sources only"] });
    await workflow.saveArticleEdits(run.id, { confirmations: [{ sourceId: "S001", confirmed: true }, { sourceId: "S002", confirmed: true }], slugProposal: "New Slug" });
    await workflow.saveArticleEdits(run.id, { confirmations: [{ sourceId: "S001", confirmed: true }, { sourceId: "S002", confirmed: true }], title: "Later edit" });
    const article = store.artifacts.get(`${run.id}:validatedArticle`) as { slugProposal: string };
    const record = store.artifacts.get(`${run.id}:publicationRecord`) as { slug: string; path: string; contentHash: string };
    expect(article.slugProposal).toBe("new-slug");
    expect(record).toMatchObject({ slug: "new-slug", path: "content/articles/2026-08-09-new-slug.mdx" });
    await workflow.submitPublication(run.id);
    expect(submittedRecord()).toMatchObject({ slug: record.slug, path: record.path, contentHash: record.contentHash });
  });

  it("fails unsafe prose before validated artifacts are written", async () => {
    const { workflow, store } = createWorkflow({ article: { title: "Evidence-led article", slugProposal: "evidence-led-article", summary: "A source-bound summary.", tags: ["research"], body: "{\nprocess.env.SECRET\n}\n\n[[S001]] [[S002]]", sourceAssessments: [{ sourceId: "S001", category: "official", rationale: "Primary", claimsSupported: ["A"] }, { sourceId: "S002", category: "standard", rationale: "Standard", claimsSupported: ["B"] }] } });
    await expect(workflow.generateArticle({ topic: "Research controls", articleRules: ["Use supplied sources only"] })).rejects.toThrow("ARTICLE_MODEL_OUTPUT_INVALID");
    expect(store.artifacts.get("awr_aaaaaaaaaaaaaaaaaaaaaaaa:publicationRecord")).toBeUndefined();
  });

  it("allows only one concurrent publisher submission for a claimed run", async () => {
    const { store, workflow, submissions } = createWorkflow();
    const run = await workflow.generateArticle({ topic: "Research controls", articleRules: ["Use supplied sources only"] });
    await confirmAndSeedPublication(store, workflow, run.id);
    const outcomes = await Promise.allSettled([workflow.submitPublication(run.id), workflow.submitPublication(run.id)]);

    expect(outcomes.filter((outcome) => outcome.status === "fulfilled")).toHaveLength(1);
    expect(outcomes.filter((outcome) => outcome.status === "rejected")).toHaveLength(1);
    expect(submissions()).toBe(1);
  });

  it("rejects publication before validated and does not call the publisher", async () => {
    const { store, workflow, submissions } = createWorkflow();
    const run = await store.createRun();
    await expect(workflow.submitPublication(run.id)).rejects.toThrow("PUBLICATION_STATE_INVALID");
    expect(submissions()).toBe(0);
  });

  it("persists a mismatched publisher receipt once and does not permit refresh", async () => {
    const { store, workflow, submissions } = createWorkflow({ submitted: (record) => ({ id: "publication-1", slug: "wrong-slug", contentHash: record.contentHash, status: "submitted" }) });
    const run = await workflow.generateArticle({ topic: "Research controls", articleRules: ["Use supplied sources only"] });
    await confirmAndSeedPublication(store, workflow, run.id);
    await expect(workflow.submitPublication(run.id)).rejects.toThrow("PUBLISHER_CONFLICT");
    await expect(workflow.refreshPublication(run.id)).rejects.toThrow("PUBLICATION_REFRESH_STATE_INVALID");
    expect(submissions()).toBe(1);
    expect(store.events.filter((event) => event === "store:status:failed")).toHaveLength(1);
    expect(store.artifacts.get(`${run.id}:publicationAttempt`)).toMatchObject({ slug: "wrong-slug" });
    expect(store.artifacts.get(`${run.id}:publicationReceipt`)).toBeUndefined();
  });

  it("rejects a verification mismatch once and does not reverify published receipts", async () => {
    const { store, workflow } = createWorkflow({ verified: (receipt) => ({ ...receipt, contentHash: "sha256:other", status: "published" }) });
    const run = await workflow.generateArticle({ topic: "Research controls", articleRules: ["Use supplied sources only"] });
    await confirmAndSeedPublication(store, workflow, run.id);
    await workflow.submitPublication(run.id);
    await expect(workflow.refreshPublication(run.id)).rejects.toThrow("VERIFICATION_MISMATCH");
    expect(store.events.filter((event) => event === "store:status:failed")).toHaveLength(1);
    expect(store.artifacts.get(`${run.id}:verificationAttempt`)).toMatchObject({ contentHash: "sha256:other" });
  });

  it("returns a published receipt without another verification", async () => {
    const { store, workflow, verifications } = createWorkflow();
    const run = await workflow.generateArticle({ topic: "Research controls", articleRules: ["Use supplied sources only"] });
    await confirmAndSeedPublication(store, workflow, run.id);
    await workflow.submitPublication(run.id);
    const first = await workflow.refreshPublication(run.id);
    const repeated = await workflow.refreshPublication(run.id);

    expect(repeated).toEqual(first);
    expect(verifications()).toBe(1);
  });

  it("keeps a submitted verification pending until a later refresh publishes it", async () => {
    let responseCount = 0;
    const { store, workflow, verifications } = createWorkflow({ verified: (receipt) => {
      responseCount += 1;
      return { ...receipt, status: responseCount === 1 ? "submitted" : "published" };
    } });
    const run = await workflow.generateArticle({ topic: "Research controls", articleRules: ["Use supplied sources only"] });
    await confirmAndSeedPublication(store, workflow, run.id);
    await workflow.submitPublication(run.id);

    const pending = await workflow.refreshPublication(run.id);
    expect(pending.status).toBe("submitted");
    expect(store.runs.get(run.id)?.status).toBe("publish_submitted");
    const published = await workflow.refreshPublication(run.id);

    expect(published.status).toBe("published");
    expect(store.runs.get(run.id)?.status).toBe("published");
    expect(verifications()).toBe(2);
  });
});
