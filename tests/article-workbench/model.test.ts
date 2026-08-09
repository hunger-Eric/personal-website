import { describe, expect, it, vi } from "vitest";

import type {
  ArticleResearchPlanInput,
  ArticleSourceBoundWriteInput,
  ModelPort,
  ResearchPlanProposal,
  SourceBoundArticleProposal,
} from "@/lib/article-workbench/contracts";
import {
  OpenAICompatibleModelProvider,
  createArticleModelConfig,
  runResearchPlanning,
} from "@/lib/article-workbench/model";

type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

const profile = {
  identity: { name: "Example", category: "Consulting", positioning: "Practical AI", description: "We help teams." },
  services: ["AI strategy"], audience: "Operations leaders", geographicScope: ["China"],
  differentiators: ["Hands-on"], approvedEvidence: [], disallowedClaims: ["best"],
};
const planInput: ArticleResearchPlanInput = { profile, topic: "AI workflow controls" };
const writeInput: ArticleSourceBoundWriteInput = {
  profile, topic: "AI workflow controls", articleRules: ["Use a practical tone."],
  sources: [
    { id: "S001", title: "Official guide", url: "https://example.com/guide", excerpt: "Guide", content: "Official evidence with a complete public explanation." },
    { id: "S002", title: "Research", url: "https://example.org/study", excerpt: "Study", content: "Research evidence with a complete public explanation." },
  ],
};

function completion(content: unknown, status = 200): Response {
  return new Response(JSON.stringify({ id: "chatcmpl-safe", choices: [{ message: { content: typeof content === "string" ? content : JSON.stringify(content) } }] }), { status, headers: { "content-type": "application/json" } });
}

const validPlan: ResearchPlanProposal = { queries: [{ query: "AI workflow controls official guidance", type: "general" }, { query: "AI workflow controls peer reviewed research", type: "academic" }] };
const validArticle: SourceBoundArticleProposal = {
  title: "AI workflow controls that teams can use", slugProposal: "ai-workflow-controls", summary: "A practical guide.", tags: ["AI", "operations"],
  body: "Teams should document controls [[S001]] and evaluate outcomes [[S002]].",
  sourceAssessments: [
    { sourceId: "S001", category: "official", rationale: "Published by the responsible body.", claimsSupported: ["Teams should document controls."] },
    { sourceId: "S002", category: "peer_reviewed", rationale: "Peer-reviewed research.", claimsSupported: ["Teams should evaluate outcomes."] },
  ],
};

describe("OpenAI-compatible article model provider", () => {
  it("posts one prompt-only planning request to the configured chat completions endpoint", async () => {
    const fetch = vi.fn<FetchLike>(async () => completion(validPlan));
    const provider = new OpenAICompatibleModelProvider({ fetch, config: createArticleModelConfig({ ARTICLE_MODEL_PROVIDER: "opencode_zen", ARTICLE_MODEL_PROTOCOL: "openai_compatible", ARTICLE_MODEL_BASE_URL: "https://opencode.ai/zen/go/v1", ARTICLE_MODEL_NAME: "deepseek-v4-flash", ARTICLE_MODEL_API_KEY: "test-key", ARTICLE_MODEL_STRUCTURED_OUTPUT_MODE: "prompt_only" }) });

    await expect(provider.proposeResearchPlan(planInput)).resolves.toEqual(validPlan);
    expect(fetch).toHaveBeenCalledTimes(1);
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe("https://opencode.ai/zen/go/v1/chat/completions");
    expect(init.headers).toEqual({ "content-type": "application/json", authorization: "Bearer test-key" });
    expect(JSON.parse(String(init.body))).toMatchObject({ model: "deepseek-v4-flash", temperature: 0.2 });
    expect(JSON.parse(String(init.body))).not.toHaveProperty("response_format");
  });

  it("uses configured native JSON output modes only when supported", async () => {
    const jsonObjectFetch = vi.fn<FetchLike>(async () => completion(validPlan));
    const jsonObject = new OpenAICompatibleModelProvider({ fetch: jsonObjectFetch, config: createArticleModelConfig({ ARTICLE_MODEL_PROVIDER: "opencode_zen", ARTICLE_MODEL_PROTOCOL: "openai_compatible", ARTICLE_MODEL_BASE_URL: "https://opencode.ai/zen/go/v1", ARTICLE_MODEL_NAME: "configured-model", ARTICLE_MODEL_API_KEY: "test-key", ARTICLE_MODEL_STRUCTURED_OUTPUT_MODE: "json_object" }) });
    await jsonObject.proposeResearchPlan(planInput);
    expect(JSON.parse(String(jsonObjectFetch.mock.calls[0][1].body))).toMatchObject({ response_format: { type: "json_object" } });

    const schemaFetch = vi.fn<FetchLike>(async () => completion(validPlan));
    const jsonSchema = new OpenAICompatibleModelProvider({ fetch: schemaFetch, config: createArticleModelConfig({ ARTICLE_MODEL_PROVIDER: "opencode_zen", ARTICLE_MODEL_PROTOCOL: "openai_compatible", ARTICLE_MODEL_BASE_URL: "https://opencode.ai/zen/go/v1", ARTICLE_MODEL_NAME: "configured-model", ARTICLE_MODEL_API_KEY: "test-key", ARTICLE_MODEL_STRUCTURED_OUTPUT_MODE: "json_schema" }) });
    await jsonSchema.proposeResearchPlan(planInput);
    const schemaRequest = JSON.parse(String(schemaFetch.mock.calls[0][1].body));
    expect(schemaRequest.response_format).toMatchObject({ type: "json_schema", json_schema: { strict: true, schema: { additionalProperties: false, required: ["queries"] } } });
    expect(schemaRequest.response_format.json_schema.schema.properties.queries.items).toMatchObject({ additionalProperties: false, required: ["query", "type"], properties: { type: { enum: ["general", "academic"] } } });

    const writerFetch = vi.fn<FetchLike>(async () => completion(validArticle));
    const writer = new OpenAICompatibleModelProvider({ fetch: writerFetch, config: createArticleModelConfig({ ARTICLE_MODEL_PROVIDER: "opencode_zen", ARTICLE_MODEL_PROTOCOL: "openai_compatible", ARTICLE_MODEL_BASE_URL: "https://opencode.ai/zen/go/v1", ARTICLE_MODEL_NAME: "configured-model", ARTICLE_MODEL_API_KEY: "test-key", ARTICLE_MODEL_STRUCTURED_OUTPUT_MODE: "json_schema" }) });
    await writer.writeSourceBoundArticle(writeInput);
    const writerSchema = JSON.parse(String(writerFetch.mock.calls[0][1].body)).response_format.json_schema.schema;
    expect(writerSchema).toMatchObject({ additionalProperties: false, required: ["title", "slugProposal", "summary", "tags", "body", "sourceAssessments"] });
    expect(writerSchema.properties.sourceAssessments.items).toMatchObject({ additionalProperties: false, required: ["sourceId", "category", "rationale", "claimsSupported"], properties: { category: { enum: ["official", "standard", "original_research", "peer_reviewed"] } } });
  });

  it("accepts another configured OpenAI-compatible provider without a shared-contract branch", async () => {
    const fetch = vi.fn<FetchLike>(async () => completion(validPlan));
    const provider = new OpenAICompatibleModelProvider({ fetch, config: createArticleModelConfig({ ARTICLE_MODEL_PROVIDER: "another_provider", ARTICLE_MODEL_PROTOCOL: "openai_compatible", ARTICLE_MODEL_BASE_URL: "https://models.example.test/v2", ARTICLE_MODEL_NAME: "another-model", ARTICLE_MODEL_API_KEY: "test-key", ARTICLE_MODEL_STRUCTURED_OUTPUT_MODE: "prompt_only" }) });
    await expect(provider.proposeResearchPlan(planInput)).resolves.toEqual(validPlan);
    expect(fetch.mock.calls[0][0]).toBe("https://models.example.test/v2/chat/completions");
    expect(JSON.parse(String(fetch.mock.calls[0][1].body))).toMatchObject({ model: "another-model" });
  });

  it("writes once at temperature 0.4 and persists only safe receipt fields", async () => {
    const persisted: unknown[] = [];
    const fetch = vi.fn<FetchLike>(async () => completion(validArticle));
    const provider = new OpenAICompatibleModelProvider({ fetch, persistReceipt: (receipt) => { persisted.push(receipt); }, config: createArticleModelConfig({ ARTICLE_MODEL_PROVIDER: "opencode_zen", ARTICLE_MODEL_PROTOCOL: "openai_compatible", ARTICLE_MODEL_BASE_URL: "https://opencode.ai/zen/go/v1", ARTICLE_MODEL_NAME: "deepseek-v4-flash", ARTICLE_MODEL_API_KEY: "test-key", ARTICLE_MODEL_STRUCTURED_OUTPUT_MODE: "prompt_only" }) });
    await expect(provider.writeSourceBoundArticle(writeInput)).resolves.toEqual(validArticle);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(JSON.parse(String(fetch.mock.calls[0][1].body))).toMatchObject({ model: "deepseek-v4-flash", temperature: 0.4 });
    expect(JSON.stringify(persisted)).not.toContain("test-key");
    expect(persisted[0]).toMatchObject({ provider: "opencode_zen", model: "deepseek-v4-flash", protocol: "openai_compatible", responseId: "chatcmpl-safe" });
  });

  it.each([
    ["non-JSON content", "not JSON"],
    ["unknown keys", { ...validPlan, unexpected: true }],
    ["upstream failure", null, 502],
  ])("fails terminally for %s without retry", async (_label, content, status) => {
    const fetch = vi.fn<FetchLike>(async () => completion(content, status));
    const provider = new OpenAICompatibleModelProvider({ fetch, config: createArticleModelConfig({ ARTICLE_MODEL_PROVIDER: "opencode_zen", ARTICLE_MODEL_PROTOCOL: "openai_compatible", ARTICLE_MODEL_BASE_URL: "https://opencode.ai/zen/go/v1", ARTICLE_MODEL_NAME: "configured-model", ARTICLE_MODEL_API_KEY: "test-key", ARTICLE_MODEL_STRUCTURED_OUTPUT_MODE: "prompt_only" }) });
    await expect(provider.proposeResearchPlan(planInput)).rejects.toThrow();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["invalid source ids", { ...validArticle, sourceAssessments: [{ ...validArticle.sourceAssessments[0], sourceId: "S999" }, validArticle.sourceAssessments[1]] }],
    ["invented URLs", { ...validArticle, body: "Read https://evil.example [[S001]] and [[S002]]." }],
    ["missing assessments", { ...validArticle, sourceAssessments: [validArticle.sourceAssessments[0]] }],
    ["empty prose", { ...validArticle, body: " " }],
    ["human confirmation", { ...validArticle, sourceAssessments: [{ ...validArticle.sourceAssessments[0], confirmed: true }, validArticle.sourceAssessments[1]] }],
  ])("rejects writer output with %s", async (_label, article) => {
    const provider = new OpenAICompatibleModelProvider({ fetch: async () => completion(article), config: createArticleModelConfig({ ARTICLE_MODEL_PROVIDER: "opencode_zen", ARTICLE_MODEL_PROTOCOL: "openai_compatible", ARTICLE_MODEL_BASE_URL: "https://opencode.ai/zen/go/v1", ARTICLE_MODEL_NAME: "configured-model", ARTICLE_MODEL_API_KEY: "test-key", ARTICLE_MODEL_STRUCTURED_OUTPUT_MODE: "prompt_only" }) });
    await expect(provider.writeSourceBoundArticle(writeInput)).rejects.toThrow("ARTICLE_MODEL_OUTPUT_INVALID");
  });

  it.each([
    ["title", { ...validArticle, title: "Read www.evil.example" }],
    ["summary", { ...validArticle, summary: "//evil.example" }],
    ["tags", { ...validArticle, tags: ["https://evil.example"] }],
    ["body protocol-relative Markdown", { ...validArticle, body: "[bad](//evil.example) [[S001]] [[S002]]" }],
    ["assessment rationale", { ...validArticle, sourceAssessments: [{ ...validArticle.sourceAssessments[0], rationale: "See http://evil.example" }, validArticle.sourceAssessments[1]] }],
    ["assessment claims", { ...validArticle, sourceAssessments: [{ ...validArticle.sourceAssessments[0], claimsSupported: ["See www.evil.example"] }, validArticle.sourceAssessments[1]] }],
    ["plain Sources label", { ...validArticle, summary: "Sources" }],
    ["Chinese source label", { ...validArticle, tags: ["参考来源"] }],
    ["malformed citation token", { ...validArticle, body: "Evidence [[S01]] [[S001]] [[S002]]" }],
    ["unmatched opening delimiter", { ...validArticle, body: "Evidence [[S001]] [[S002]] and [[S999" }],
    ["unmatched closing delimiter", { ...validArticle, body: "Evidence [[S001]] [[S002]] and S999]]" }],
  ])("rejects output-wide forbidden content in %s", async (_label, article) => {
    const provider = new OpenAICompatibleModelProvider({ fetch: async () => completion(article), config: createArticleModelConfig({ ARTICLE_MODEL_PROVIDER: "opencode_zen", ARTICLE_MODEL_PROTOCOL: "openai_compatible", ARTICLE_MODEL_BASE_URL: "https://opencode.ai/zen/go/v1", ARTICLE_MODEL_NAME: "configured-model", ARTICLE_MODEL_API_KEY: "test-key", ARTICLE_MODEL_STRUCTURED_OUTPUT_MODE: "prompt_only" }) });
    await expect(provider.writeSourceBoundArticle(writeInput)).rejects.toThrow("ARTICLE_MODEL_OUTPUT_INVALID");
  });

  it("classifies an HTML non-2xx response as request failure and persists one redacted receipt", async () => {
    const receipts: unknown[] = [];
    const provider = new OpenAICompatibleModelProvider({ fetch: async () => new Response("<html>Bearer secret-token</html>", { status: 502 }), persistReceipt: (receipt) => { receipts.push(receipt); }, config: createArticleModelConfig({ ARTICLE_MODEL_PROVIDER: "opencode_zen", ARTICLE_MODEL_PROTOCOL: "openai_compatible", ARTICLE_MODEL_BASE_URL: "https://opencode.ai/zen/go/v1", ARTICLE_MODEL_NAME: "configured-model", ARTICLE_MODEL_API_KEY: "test-key", ARTICLE_MODEL_STRUCTURED_OUTPUT_MODE: "prompt_only" }) });
    await expect(provider.proposeResearchPlan(planInput)).rejects.toThrow("ARTICLE_MODEL_REQUEST_FAILED");
    expect(receipts).toHaveLength(1);
    expect(receipts[0]).toMatchObject({ outcome: "failure", errorCode: "ARTICLE_MODEL_REQUEST_FAILED", status: 502 });
    expect(JSON.stringify(receipts)).not.toContain("secret-token");
  });

  it("persists a no-body request-failure receipt when the network rejects", async () => {
    const receipts: unknown[] = [];
    const provider = new OpenAICompatibleModelProvider({ fetch: async () => { throw new Error("network down"); }, persistReceipt: (receipt) => { receipts.push(receipt); }, config: createArticleModelConfig({ ARTICLE_MODEL_PROVIDER: "opencode_zen", ARTICLE_MODEL_PROTOCOL: "openai_compatible", ARTICLE_MODEL_BASE_URL: "https://opencode.ai/zen/go/v1", ARTICLE_MODEL_NAME: "configured-model", ARTICLE_MODEL_API_KEY: "test-key", ARTICLE_MODEL_STRUCTURED_OUTPUT_MODE: "prompt_only" }) });
    await expect(provider.proposeResearchPlan(planInput)).rejects.toThrow("ARTICLE_MODEL_REQUEST_FAILED");
    expect(receipts).toEqual([expect.objectContaining({ outcome: "failure", errorCode: "ARTICLE_MODEL_REQUEST_FAILED", responseHash: undefined, responseText: undefined })]);
  });

  it.each([
    ["malformed envelope", { id: "request-id" }, "ARTICLE_MODEL_RESPONSE_INVALID"],
    ["malformed content JSON", "not JSON", "ARTICLE_MODEL_RESPONSE_INVALID"],
    ["invalid output", { ...validPlan, extra: true }, "ARTICLE_MODEL_OUTPUT_INVALID"],
  ])("persists one failure receipt for %s", async (_label, content, code) => {
    const receipts: unknown[] = [];
    const provider = new OpenAICompatibleModelProvider({ fetch: async () => _label === "malformed envelope" ? new Response(JSON.stringify(content), { status: 200 }) : completion(content), persistReceipt: (receipt) => { receipts.push(receipt); }, config: createArticleModelConfig({ ARTICLE_MODEL_PROVIDER: "opencode_zen", ARTICLE_MODEL_PROTOCOL: "openai_compatible", ARTICLE_MODEL_BASE_URL: "https://opencode.ai/zen/go/v1", ARTICLE_MODEL_NAME: "configured-model", ARTICLE_MODEL_API_KEY: "test-key", ARTICLE_MODEL_STRUCTURED_OUTPUT_MODE: "prompt_only" }) });
    await expect(provider.proposeResearchPlan(planInput)).rejects.toThrow(code);
    expect(receipts).toHaveLength(1);
    expect(receipts[0]).toMatchObject({ outcome: "failure", errorCode: code });
  });

  it("fails with a fixed error when failure receipt persistence fails", async () => {
    const provider = new OpenAICompatibleModelProvider({ fetch: async () => new Response("not JSON", { status: 502 }), persistReceipt: () => { throw new Error("storage secret"); }, config: createArticleModelConfig({ ARTICLE_MODEL_PROVIDER: "opencode_zen", ARTICLE_MODEL_PROTOCOL: "openai_compatible", ARTICLE_MODEL_BASE_URL: "https://opencode.ai/zen/go/v1", ARTICLE_MODEL_NAME: "configured-model", ARTICLE_MODEL_API_KEY: "test-key", ARTICLE_MODEL_STRUCTURED_OUTPUT_MODE: "prompt_only" }) });
    await expect(provider.proposeResearchPlan(planInput)).rejects.toThrow("ARTICLE_MODEL_PERSISTENCE_FAILED");
  });

  it("redacts quoted secret-like error fields in failure receipts", async () => {
    const receipts: unknown[] = [];
    const provider = new OpenAICompatibleModelProvider({ fetch: async () => new Response('{"error":{"api_key":"quoted-secret"}}', { status: 502 }), persistReceipt: (receipt) => { receipts.push(receipt); }, config: createArticleModelConfig({ ARTICLE_MODEL_PROVIDER: "opencode_zen", ARTICLE_MODEL_PROTOCOL: "openai_compatible", ARTICLE_MODEL_BASE_URL: "https://opencode.ai/zen/go/v1", ARTICLE_MODEL_NAME: "configured-model", ARTICLE_MODEL_API_KEY: "test-key", ARTICLE_MODEL_STRUCTURED_OUTPUT_MODE: "prompt_only" }) });
    await expect(provider.proposeResearchPlan(planInput)).rejects.toThrow("ARTICLE_MODEL_REQUEST_FAILED");
    expect(JSON.stringify(receipts)).not.toContain("quoted-secret");
  });

  it("runs against any provider-neutral ModelPort without a provider branch", async () => {
    const memoryPort: ModelPort = { proposeResearchPlan: async () => validPlan, writeSourceBoundArticle: async () => validArticle };
    await expect(runResearchPlanning(memoryPort, planInput)).resolves.toEqual(validPlan);
  });

  it("rejects unsupported configuration at composition", () => {
    expect(() => createArticleModelConfig({ ARTICLE_MODEL_PROVIDER: "other", ARTICLE_MODEL_PROTOCOL: "other", ARTICLE_MODEL_BASE_URL: "http://example.test/v1/chat/completions", ARTICLE_MODEL_NAME: "model", ARTICLE_MODEL_API_KEY: "key", ARTICLE_MODEL_STRUCTURED_OUTPUT_MODE: "bad" })).toThrow("ARTICLE_MODEL_CONFIG_INVALID");
  });
});
