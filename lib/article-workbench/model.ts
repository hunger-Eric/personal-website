import { createHash } from "node:crypto";

import {
  ArticleResearchPlanInputSchema,
  ArticleSourceBoundWriteInputSchema,
  ResearchPlanProposalSchema,
  validateSourceBoundArticleProposal,
  type ArticleResearchPlanInput,
  type ArticleSourceBoundWriteInput,
  type ModelPort,
  type ResearchPlanProposal,
  type SourceBoundArticleProposal,
} from "./contracts";

type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;
type StructuredOutputMode = "prompt_only" | "json_object" | "json_schema";

export interface ArticleModelConfig {
  provider: "opencode_zen";
  protocol: "openai_compatible";
  baseUrl: string;
  model: string;
  apiKey: string;
  structuredOutputMode: StructuredOutputMode;
}

export interface SafeModelReceipt {
  provider: string;
  model: string;
  protocol: string;
  task: "article_research_plan" | "article_source_bound_write";
  requestHash: string;
  responseId?: string;
  responseHash: string;
  durationMs: number;
  responseText: string;
}

export interface OpenAICompatibleModelProviderOptions {
  config: ArticleModelConfig;
  fetch?: FetchLike;
  persistReceipt?: (receipt: SafeModelReceipt) => Promise<void> | void;
}

export function createArticleModelConfig(environment: Record<string, string | undefined>): ArticleModelConfig {
  const provider = environment.ARTICLE_MODEL_PROVIDER;
  const protocol = environment.ARTICLE_MODEL_PROTOCOL;
  const baseUrl = environment.ARTICLE_MODEL_BASE_URL?.replace(/\/+$/, "");
  const model = environment.ARTICLE_MODEL_NAME?.trim();
  const apiKey = environment.ARTICLE_MODEL_API_KEY?.trim();
  const structuredOutputMode = environment.ARTICLE_MODEL_STRUCTURED_OUTPUT_MODE;
  if (
    provider !== "opencode_zen" || protocol !== "openai_compatible" || !baseUrl || !model || !apiKey ||
    !["prompt_only", "json_object", "json_schema"].includes(structuredOutputMode ?? "")
  ) throw new Error("ARTICLE_MODEL_CONFIG_INVALID");
  let parsed: URL;
  try { parsed = new URL(baseUrl); } catch { throw new Error("ARTICLE_MODEL_CONFIG_INVALID"); }
  if (parsed.protocol !== "https:" || /\/chat\/completions$/i.test(parsed.pathname)) {
    throw new Error("ARTICLE_MODEL_CONFIG_INVALID");
  }
  return { provider, protocol, baseUrl, model, apiKey, structuredOutputMode: structuredOutputMode as StructuredOutputMode };
}

export class OpenAICompatibleModelProvider implements ModelPort {
  private readonly fetcher: FetchLike;
  private readonly persistReceipt?: (receipt: SafeModelReceipt) => Promise<void> | void;

  constructor(private readonly options: OpenAICompatibleModelProviderOptions) {
    if (!options.fetch && !globalThis.fetch) throw new Error("ARTICLE_MODEL_CONFIG_INVALID");
    this.fetcher = options.fetch ?? globalThis.fetch;
    this.persistReceipt = options.persistReceipt;
  }

  async proposeResearchPlan(input: ArticleResearchPlanInput): Promise<ResearchPlanProposal> {
    const validatedInput = ArticleResearchPlanInputSchema.parse(input);
    return this.request("article_research_plan", validatedInput, 0.2, (output) => ResearchPlanProposalSchema.parse(output));
  }

  async writeSourceBoundArticle(input: ArticleSourceBoundWriteInput): Promise<SourceBoundArticleProposal> {
    const validatedInput = ArticleSourceBoundWriteInputSchema.parse(input);
    return this.request("article_source_bound_write", validatedInput, 0.4, (output) => validateSourceBoundArticleProposal(output, validatedInput.sources));
  }

  private async request<T>(
    task: SafeModelReceipt["task"], input: unknown, temperature: number, validate: (output: unknown) => T
  ): Promise<T> {
    const payload = {
      model: this.options.config.model,
      temperature,
      messages: [{ role: "user", content: promptFor(task, input) }],
      ...responseFormat(this.options.config.structuredOutputMode, task),
    };
    const startedAt = Date.now();
    let response: Response;
    try {
      response = await this.fetcher(`${this.options.config.baseUrl}/chat/completions`, {
        method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${this.options.config.apiKey}` }, body: JSON.stringify(payload),
      });
    } catch { throw new Error("ARTICLE_MODEL_REQUEST_FAILED"); }
    let envelope: unknown;
    try { envelope = await response.json(); } catch { throw new Error("ARTICLE_MODEL_RESPONSE_INVALID"); }
    if (!response.ok) throw new Error("ARTICLE_MODEL_REQUEST_FAILED");
    const responseId = envelope && typeof envelope === "object" && typeof (envelope as { id?: unknown }).id === "string" ? (envelope as { id: string }).id : undefined;
    const content = envelope && typeof envelope === "object"
      ? (envelope as { choices?: Array<{ message?: { content?: unknown } }> }).choices?.[0]?.message?.content
      : undefined;
    if (typeof content !== "string") throw new Error("ARTICLE_MODEL_RESPONSE_INVALID");
    let output: unknown;
    try { output = JSON.parse(content); } catch { throw new Error("ARTICLE_MODEL_RESPONSE_INVALID"); }
    let result: T;
    try { result = validate(output); } catch { throw new Error("ARTICLE_MODEL_OUTPUT_INVALID"); }
    try {
      await this.persistReceipt?.({ provider: this.options.config.provider, model: this.options.config.model, protocol: this.options.config.protocol, task, requestHash: hash(JSON.stringify(payload)), responseId, responseHash: hash(content), durationMs: Date.now() - startedAt, responseText: content });
    } catch { throw new Error("ARTICLE_MODEL_PERSISTENCE_FAILED"); }
    return result;
  }
}

export function runResearchPlanning(port: ModelPort, input: ArticleResearchPlanInput): Promise<ResearchPlanProposal> {
  return port.proposeResearchPlan(input);
}

function responseFormat(mode: StructuredOutputMode, task: SafeModelReceipt["task"]): Record<string, unknown> {
  if (mode === "prompt_only") return {};
  if (mode === "json_object") return { response_format: { type: "json_object" } };
  return { response_format: { type: "json_schema", json_schema: { name: task, strict: true, schema: { type: "object" } } } };
}

function promptFor(task: SafeModelReceipt["task"], input: unknown): string {
  return task === "article_research_plan"
    ? `Task: ${task}. Return only one JSON object with 2-5 research queries, each query and type (general or academic). Do not assign IDs. Input: ${JSON.stringify(input)}`
    : `Task: ${task}. Return only one JSON object with title, slugProposal, summary, tags, body, sourceAssessments. Cite only supplied source IDs as [[S001]]. Do not emit URLs or a Sources/参考来源 heading. Each source assessment must include sourceId, category, rationale, claimsSupported. Input: ${JSON.stringify(input)}`;
}

function hash(value: string): string { return createHash("sha256").update(value).digest("hex"); }
