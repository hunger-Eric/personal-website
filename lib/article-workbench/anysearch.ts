import type { ResearchPlan } from "./contracts";
import { canonicalizePublicHttpUrl } from "./safe-url";

const ENDPOINT = "https://api.anysearch.com/mcp";
const MAX_ACCEPTED_SOURCES = 8;
const EXTRACTION_CONCURRENCY = 3;
const MAX_SOURCE_CHARACTERS = 20_000;
const MAX_PACKET_CHARACTERS = 80_000;
const MIN_EXTRACTED_SOURCES = 4;
const secretKeyPattern = /api[-_]?key|authorization|token|secret|cookie|password|passphrase|credential|private[-_]?key|access[-_]?key|session[-_]?key/i;

type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

export interface ExtractedSource {
  id: string;
  title: string;
  url: string;
  content: string;
}

export type SourcePacketResult =
  | { status: "ok"; sources: ExtractedSource[] }
  | { status: "insufficient_sources"; sources: ExtractedSource[] };

export interface AnySearchResearchAdapterOptions {
  fetch?: FetchLike;
  apiKey?: string;
  /** Caller supplies a current-run-only persistence boundary. Responses are redacted before this hook. */
  persistRawResponse?: (response: unknown) => Promise<void> | void;
}

interface SearchHeading {
  title: string;
  url: string;
}

interface AcademicContract {
  subDomain: string;
  params: Array<{ name: string; required: boolean }>;
}

export function createAnySearchResearchAdapter(
  options: AnySearchResearchAdapterOptions = {}
): AnySearchResearchAdapter {
  return new AnySearchResearchAdapter(options);
}

export class AnySearchResearchAdapter {
  private readonly fetcher: FetchLike;
  private readonly apiKey?: string;
  private readonly persistRawResponse?: (response: unknown) => Promise<void> | void;
  private nextRequestId = 1;

  constructor({ fetch: fetcher = globalThis.fetch, apiKey, persistRawResponse }: AnySearchResearchAdapterOptions = {}) {
    if (!fetcher) throw new Error("ANYSEARCH_FETCH_UNAVAILABLE");
    this.fetcher = fetcher;
    this.apiKey = apiKey;
    this.persistRawResponse = persistRawResponse;
  }

  async collect(plan: ResearchPlan): Promise<SourcePacketResult> {
    const academicQueries = plan.queries.filter((query) => query.type === "academic");
    const academic = academicQueries.length ? await this.getAcademicContract() : null;
    const searchResponse = await this.rpc("batch_search", {
      queries: plan.queries.map((query) =>
        query.type === "academic" && academic
          ? {
              id: query.id,
              query: query.query,
              domain: "academic",
              sub_domain: academic.subDomain,
              sub_domain_params: academicParams(academic),
            }
          : { id: query.id, query: query.query }
      ),
    });

    const accepted = dedupeAcceptedSources(parseNumberedMarkdownResults(responseText(searchResponse)));
    const extracted = await mapWithConcurrency(accepted, EXTRACTION_CONCURRENCY, async (candidate) => {
      try {
        const response = await this.rpc("extract", { url: candidate.url });
        const content = responseText(response).slice(0, MAX_SOURCE_CHARACTERS);
        return content.trim() ? { ...candidate, content } : null;
      } catch {
        return null;
      }
    });

    let remaining = MAX_PACKET_CHARACTERS;
    const sources: ExtractedSource[] = [];
    for (const source of extracted) {
      if (!source || remaining <= 0) continue;
      const content = source.content.slice(0, remaining);
      if (!content) continue;
      remaining -= content.length;
      sources.push({ id: `S${String(sources.length + 1).padStart(3, "0")}`, ...source, content });
    }

    return sources.length >= MIN_EXTRACTED_SOURCES
      ? { status: "ok", sources }
      : { status: "insufficient_sources", sources };
  }

  private async getAcademicContract(): Promise<AcademicContract> {
    const response = await this.rpc("get_sub_domains", { domain: "academic" });
    const contract = findAcademicContract(parseJsonContent(responseText(response)));
    if (!contract) throw new Error("ANYSEARCH_ACADEMIC_CONTRACT_INVALID");
    return contract;
  }

  private async rpc(toolName: string, toolArgs: Record<string, unknown>): Promise<unknown> {
    const headers: Record<string, string> = { "content-type": "application/json" };
    if (this.apiKey) headers.authorization = `Bearer ${this.apiKey}`;
    let response: Response;
    try {
      response = await this.fetcher(ENDPOINT, {
        method: "POST",
        headers,
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: this.nextRequestId++,
          method: "tools/call",
          params: { name: toolName, arguments: toolArgs },
        }),
      });
    } catch {
      throw new Error("ANYSEARCH_REQUEST_FAILED");
    }
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      throw new Error("ANYSEARCH_RESPONSE_INVALID");
    }
    if (!response.ok || !body || typeof body !== "object" || "error" in body) {
      throw new Error("ANYSEARCH_REQUEST_FAILED");
    }
    if (!("result" in body)) throw new Error("ANYSEARCH_RESPONSE_INVALID");
    try {
      await this.persistRawResponse?.(redactSecretLikeValues(body));
    } catch {
      throw new Error("ANYSEARCH_PERSISTENCE_FAILED");
    }
    return (body as { result: unknown }).result;
  }
}

export function parseNumberedMarkdownResults(markdown: string): SearchHeading[] {
  const results: SearchHeading[] = [];
  const lines = markdown.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const linked = lines[index].match(/^#{2,6}\s+\d+[.)]\s+\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)\s*$/i);
    if (linked) {
      results.push({ title: linked[1].trim(), url: linked[2] });
      continue;
    }
    const plain = lines[index].match(/^#{2,6}\s+\d+[.)]\s+(.+?)\s*$/);
    const url = lines[index + 1]?.trim();
    if (plain && url && /^https?:\/\/\S+$/i.test(url)) {
      results.push({ title: plain[1].trim(), url });
      index += 1;
    }
  }
  return results;
}

function dedupeAcceptedSources(headings: SearchHeading[]): Array<SearchHeading & { url: string }> {
  const seen = new Set<string>();
  const accepted: Array<SearchHeading & { url: string }> = [];
  for (const heading of headings) {
    try {
      const url = canonicalizePublicHttpUrl(heading.url);
      if (seen.has(url)) continue;
      seen.add(url);
      accepted.push({ title: heading.title, url });
      if (accepted.length === MAX_ACCEPTED_SOURCES) break;
    } catch {
      // Untrusted discovery results are discarded before an extraction request is created.
    }
  }
  return accepted;
}

function responseText(result: unknown): string {
  if (!result || typeof result !== "object") throw new Error("ANYSEARCH_RESPONSE_INVALID");
  const content = (result as { content?: unknown }).content;
  if (!Array.isArray(content)) throw new Error("ANYSEARCH_RESPONSE_INVALID");
  const text = content.find(
    (item): item is { type: string; text: string } =>
      Boolean(item && typeof item === "object" && (item as { type?: unknown }).type === "text" && typeof (item as { text?: unknown }).text === "string")
  );
  if (!text) throw new Error("ANYSEARCH_RESPONSE_INVALID");
  return text.text;
}

function parseJsonContent(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("ANYSEARCH_ACADEMIC_CONTRACT_INVALID");
  }
}

function findAcademicContract(value: unknown): AcademicContract | null {
  const items = Array.isArray(value)
    ? value
    : value && typeof value === "object" && Array.isArray((value as { sub_domains?: unknown }).sub_domains)
      ? (value as { sub_domains: unknown[] }).sub_domains
      : [];
  for (const item of items) {
    if (!item || typeof item !== "object") continue;
    const record = item as { sub_domain?: unknown; name?: unknown; params?: unknown };
    const subDomain = typeof record.sub_domain === "string" ? record.sub_domain : record.name;
    if (typeof subDomain !== "string" || !subDomain.trim()) continue;
    const params = Array.isArray(record.params)
      ? record.params.flatMap((param) => {
          if (!param || typeof param !== "object") return [];
          const parameter = param as { name?: unknown; required?: unknown };
          return typeof parameter.name === "string"
            ? [{ name: parameter.name, required: parameter.required === true || parameter.required === "required" }]
            : [];
        })
      : [];
    return { subDomain, params };
  }
  return null;
}

function academicParams(contract: AcademicContract): Record<string, string | boolean> {
  return Object.fromEntries(
    contract.params.flatMap((param) =>
      param.required || param.name === "open_access"
        ? [[param.name, param.name === "open_access" ? true : ""]]
        : []
    )
  );
}

async function mapWithConcurrency<T, R>(items: T[], concurrency: number, operation: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;
  async function worker(): Promise<void> {
    while (true) {
      const index = cursor++;
      if (index >= items.length) return;
      results[index] = await operation(items[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()));
  return results;
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
