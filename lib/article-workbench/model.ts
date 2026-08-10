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
  provider: string;
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
  promptContractVersion: "editorial.v1";
  promptContractHash: string;
  requestHash: string;
  responseId?: string;
  outcome: "success" | "failure";
  errorCode?: "ARTICLE_MODEL_REQUEST_FAILED" | "ARTICLE_MODEL_RESPONSE_INVALID" | "ARTICLE_MODEL_OUTPUT_INVALID";
  status?: number;
  responseHash?: string;
  durationMs: number;
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
    !provider?.trim() || protocol !== "openai_compatible" || !baseUrl || !model || !apiKey ||
    !["prompt_only", "json_object", "json_schema"].includes(structuredOutputMode ?? "")
  ) throw new Error("ARTICLE_MODEL_CONFIG_INVALID");
  let parsed: URL;
  try { parsed = new URL(baseUrl); } catch { throw new Error("ARTICLE_MODEL_CONFIG_INVALID"); }
  if (parsed.protocol !== "https:" || /\/chat\/completions$/i.test(parsed.pathname)) {
    throw new Error("ARTICLE_MODEL_CONFIG_INVALID");
  }
  return { provider: provider.trim(), protocol, baseUrl, model, apiKey, structuredOutputMode: structuredOutputMode as StructuredOutputMode };
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
      messages: editorialMessages(task, input),
      ...responseFormat(this.options.config.structuredOutputMode, task),
    };
    const startedAt = Date.now();
    let response: Response;
    try {
      response = await this.fetcher(`${this.options.config.baseUrl}/chat/completions`, {
        method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${this.options.config.apiKey}` }, body: JSON.stringify(payload),
      });
    } catch { return this.fail(task, payload, startedAt, "ARTICLE_MODEL_REQUEST_FAILED"); }
    let responseText: string;
    try { responseText = await response.text(); } catch { return this.fail(task, payload, startedAt, "ARTICLE_MODEL_RESPONSE_INVALID", response.status); }
    if (!response.ok) return this.fail(task, payload, startedAt, "ARTICLE_MODEL_REQUEST_FAILED", response.status, responseText);
    let envelope: unknown;
    try { envelope = JSON.parse(responseText); } catch { return this.fail(task, payload, startedAt, "ARTICLE_MODEL_RESPONSE_INVALID", response.status, responseText); }
    const responseId = envelope && typeof envelope === "object" && typeof (envelope as { id?: unknown }).id === "string" ? (envelope as { id: string }).id : undefined;
    const content = envelope && typeof envelope === "object"
      ? (envelope as { choices?: Array<{ message?: { content?: unknown } }> }).choices?.[0]?.message?.content
      : undefined;
    if (typeof content !== "string") return this.fail(task, payload, startedAt, "ARTICLE_MODEL_RESPONSE_INVALID", response.status, responseText, responseId);
    let output: unknown;
    try { output = JSON.parse(content); } catch { return this.fail(task, payload, startedAt, "ARTICLE_MODEL_RESPONSE_INVALID", response.status, responseText, responseId); }
    let result: T;
    try { result = validate(output); } catch { return this.fail(task, payload, startedAt, "ARTICLE_MODEL_OUTPUT_INVALID", response.status, responseText, responseId); }
    await this.persist({ provider: this.options.config.provider, model: this.options.config.model, protocol: this.options.config.protocol, task, promptContractVersion: "editorial.v1", promptContractHash: promptContractHash(task), requestHash: hash(JSON.stringify(payload)), responseId, outcome: "success", status: response.status, responseHash: hash(responseText), durationMs: Date.now() - startedAt });
    return result;
  }

  private async fail<T>(task: SafeModelReceipt["task"], payload: unknown, startedAt: number, errorCode: NonNullable<SafeModelReceipt["errorCode"]>, status?: number, responseText?: string, responseId?: string): Promise<T> {
    try {
      await this.persist({ provider: this.options.config.provider, model: this.options.config.model, protocol: this.options.config.protocol, task, promptContractVersion: "editorial.v1", promptContractHash: promptContractHash(task), requestHash: hash(JSON.stringify(payload)), responseId, outcome: "failure", errorCode, status, responseHash: responseText === undefined ? undefined : hash(responseText), durationMs: Date.now() - startedAt });
    } catch {
      // The provider error is the primary failure. Receipt storage must never mask it.
    }
    throw new Error(errorCode);
  }

  private async persist(receipt: SafeModelReceipt): Promise<void> {
    try { await this.persistReceipt?.(receipt); } catch { throw new Error("ARTICLE_MODEL_PERSISTENCE_FAILED"); }
  }
}

export function runResearchPlanning(port: ModelPort, input: ArticleResearchPlanInput): Promise<ResearchPlanProposal> {
  return port.proposeResearchPlan(input);
}

export const EDITORIAL_SYSTEM_PROMPT = "editorial.v1 You are an editorial model. Return one JSON object only. The article serves SME owners and operations leaders. Use approved business evidence as business facts and supplied public sources as external facts. Never invent first-person experience, discuss GEO or prompting, use marketing/template language, emit URLs, or format a source list. Material insufficiency is a failure: do not pad prose.";
export const EDITORIAL_TASK_PROMPTS = {
  article_research_plan: "Create an editorial brief with readerQuestion, centralThesis, and 3-8 evidenceNeeds. Let those evidenceNeeds drive 2-5 research queries with query and type (general or academic). Do not assign query IDs.",
  article_source_bound_write: "Write one coherent Chinese business article from the exact editorialBrief and supplied evidence. Open with a concrete problem, fact, or judgment. Every paragraph must advance a new fact, action, distinction, or consequence; use natural headings only; every substantive external claim needs an adjacent [[S001]] citation. If the thesis cannot be supported, fail rather than revise it in code. Return title, slugProposal, summary, tags, body, sourceAssessments.",
} as const;

function editorialMessages(task: SafeModelReceipt["task"], input: unknown): Array<{ role: "system" | "user"; content: string }> {
  return [{ role: "system", content: EDITORIAL_SYSTEM_PROMPT }, { role: "user", content: EDITORIAL_TASK_PROMPTS[task] + " Input: " + JSON.stringify(input) }];
}

function promptContractHash(task: SafeModelReceipt["task"]): string {
  return hash(JSON.stringify([{ role: "system", content: EDITORIAL_SYSTEM_PROMPT }, { role: "user", content: EDITORIAL_TASK_PROMPTS[task] }]));
}

function responseFormat(mode: StructuredOutputMode, task: SafeModelReceipt["task"]): Record<string, unknown> {
  if (mode === "prompt_only") return {};
  if (mode === "json_object") return { response_format: { type: "json_object" } };
  return { response_format: { type: "json_schema", json_schema: { name: task, strict: true, schema: task === "article_research_plan" ? researchPlanJsonSchema : sourceBoundArticleJsonSchema } } };
}

function hash(value: string): string { return createHash("sha256").update(value).digest("hex"); }

const researchPlanJsonSchema = {
  type: "object", additionalProperties: false, required: ["editorialBrief", "queries"],
  properties: { editorialBrief: { type: "object", additionalProperties: false, required: ["readerQuestion", "centralThesis", "evidenceNeeds"], properties: { readerQuestion: { type: "string", minLength: 1, maxLength: 500 }, centralThesis: { type: "string", minLength: 1, maxLength: 1000 }, evidenceNeeds: { type: "array", minItems: 3, maxItems: 8, items: { type: "string", minLength: 1, maxLength: 500 } } } }, queries: { type: "array", minItems: 2, maxItems: 5, items: { type: "object", additionalProperties: false, required: ["query", "type"], properties: { query: { type: "string", minLength: 1, maxLength: 2000 }, type: { type: "string", enum: ["general", "academic"] } } } } },
};
const sourceBoundArticleJsonSchema = {
  type: "object", additionalProperties: false, required: ["title", "slugProposal", "summary", "tags", "body", "sourceAssessments"],
  properties: {
    title: { type: "string", minLength: 1, maxLength: 200 }, slugProposal: { type: "string", pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$", maxLength: 160 }, summary: { type: "string", minLength: 1, maxLength: 2000 },
    tags: { type: "array", minItems: 1, maxItems: 10, items: { type: "string", minLength: 1, maxLength: 100 } }, body: { type: "string", minLength: 1, maxLength: 40000 },
    sourceAssessments: { type: "array", minItems: 1, maxItems: 8, items: { type: "object", additionalProperties: false, required: ["sourceId", "category", "rationale", "claimsSupported"], properties: { sourceId: { type: "string", pattern: "^S\\d{3}$" }, category: { type: "string", enum: ["official", "standard", "original_research", "peer_reviewed"] }, rationale: { type: "string", minLength: 1, maxLength: 2000 }, claimsSupported: { type: "array", minItems: 1, maxItems: 20, items: { type: "string", minLength: 1, maxLength: 2000 } } } } },
  },
};
