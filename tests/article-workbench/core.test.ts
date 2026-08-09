import { describe, expect, it } from "vitest";

import { createArticleWorkflow } from "@/lib/article-workbench/core";
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

const publicationRecord = { title: "Evidence-led article", body: "Rendered article", slug: "evidence-led-article", contentHash: "sha256:abc" };

async function confirmAndSeedPublication(store: MemoryStore, workflow: ReturnType<typeof createArticleWorkflow>, runId: string) {
  await workflow.saveArticleEdits(runId, { confirmations: [{ sourceId: "S001", confirmed: true }, { sourceId: "S002", confirmed: true }] });
  await store.saveArtifact(runId, "publicationRecord", publicationRecord);
}

function createWorkflow(options: {
  profile?: BusinessProfile;
  packet?: SourcePacketResult;
  plan?: unknown;
  article?: unknown;
  submitted?: (record: { slug?: string; contentHash?: string }) => unknown;
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
  let verifications = 0;
  const publisher: PublisherPort = {
    async submit(record) {
      submissions += 1;
      return (options.submitted?.(record) ?? { id: "publication-1", slug: record.slug, contentHash: record.contentHash, status: "submitted" }) as never;
    },
    async verify(receipt) { verifications += 1; return (options.verified?.(receipt) ?? { ...receipt, status: "published" }) as never; },
  };
  return { store, publisher, submissions: () => submissions, verifications: () => verifications, workflow: createArticleWorkflow({ profile: { getProfile: async () => profile }, model, search, store, publisher }) };
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
      "store:artifact:modelResponse", "store:status:article_generated", "store:artifact:validatedArticle", "store:status:validated",
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

  it("rejects confirmations that are not in the validated model assessments", async () => {
    const { store, workflow } = createWorkflow();
    const run = await workflow.generateArticle({ topic: "Research controls", articleRules: ["Use supplied sources only"] });
    await expect(workflow.saveArticleEdits(run.id, { confirmations: [{ sourceId: "S999", confirmed: true }] })).rejects.toThrow("SOURCE_CONFIRMATION_INVALID");
    expect(store.artifacts.get(`${run.id}:articleEdits`)).toBeUndefined();
  });

  it("requires the Task 6 publication artifact even when edit input carries a forged record", async () => {
    const { workflow } = createWorkflow();
    const run = await workflow.generateArticle({ topic: "Research controls", articleRules: ["Use supplied sources only"] });
    await workflow.saveArticleEdits(run.id, { confirmations: [{ sourceId: "S001", confirmed: true }, { sourceId: "S002", confirmed: true }], publication: publicationRecord } as never);
    await expect(workflow.submitPublication(run.id)).rejects.toThrow("PUBLICATION_RECORD_REQUIRED");
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
