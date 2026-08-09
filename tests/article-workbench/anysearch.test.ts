import { describe, expect, it, vi } from "vitest";

import type { ResearchPlan } from "@/lib/article-workbench/contracts";
import {
  AnySearchResearchAdapter,
  createAnySearchResearchAdapter,
  parseNumberedMarkdownResults,
} from "@/lib/article-workbench/anysearch";

const plan: ResearchPlan = {
  queries: [
    { id: "Q001", query: "public evidence", type: "general" },
    { id: "Q002", query: "academic evidence", type: "academic" },
  ],
};

function jsonResponse(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function rpcText(text: string): Response {
  return jsonResponse({ result: { content: [{ type: "text", text }] } });
}

const searchMarkdown = [
  "## 1. [First source](https://example.com/first#fragment)",
  "Discovery only.",
  "## 2. [Duplicate](https://example.com/first)",
  "Duplicate discovery only.",
  "## 3. [Second source](https://example.org/second)",
  "## 4. [Third source](https://example.net/third)",
  "## 5. [Fourth source](https://iana.org/fourth)",
  "## 6. [Unsafe source](http://127.0.0.1/admin)",
].join("\n");

describe("AnySearch research adapter", () => {
  it("parses numbered Markdown result headings without treating snippets as evidence", () => {
    expect(
      parseNumberedMarkdownResults(
        "## 1. [A source](https://example.com/a)\nSnippet text\n### 2. B source\nhttps://example.org/b"
      )
    ).toEqual([
      { title: "A source", url: "https://example.com/a" },
      { title: "B source", url: "https://example.org/b" },
    ]);
  });

  it("uses only the fixed provider endpoint, discovers academic constraints first, and sends exact RPC envelopes", async () => {
    const calls: Array<{ url: string; init: RequestInit }> = [];
    const fetch = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
      calls.push({ url: String(url), init: init ?? {} });
      const request = JSON.parse(String(init?.body));
      if (request.method === "tools/call" && request.params.name === "get_sub_domains") {
        return rpcText(JSON.stringify([
          {
            sub_domain: "academic.current",
            params: [
              { name: "topic", required: true },
              { name: "open_access", required: false },
            ],
          },
        ]));
      }
      if (request.method === "tools/call" && request.params.name === "batch_search") return rpcText(searchMarkdown);
      return rpcText(`Full extracted content for ${request.params.arguments.url}`);
    });

    const adapter = createAnySearchResearchAdapter({ fetch, apiKey: "test-key" });
    const result = await adapter.collect(plan);

    expect(result.status).toBe("ok");
    if (result.status !== "ok") throw new Error("Expected extracted packet");
    expect(result.sources.map((source) => source.id)).toEqual(["S001", "S002", "S003", "S004"]);
    expect(result.sources[0]).toMatchObject({
      title: "First source",
      url: "https://example.com/first",
      content: "Full extracted content for https://example.com/first",
    });
    expect(result.sources.every((source) => !source.content.includes("Discovery only"))).toBe(true);
    expect(calls.map((call) => call.url)).toEqual(
      Array.from({ length: calls.length }, () => "https://api.anysearch.com/mcp")
    );
    expect(calls[0].init.headers).toEqual({
      "content-type": "application/json",
      authorization: "Bearer test-key",
    });
    expect(JSON.parse(String(calls[0].init.body))).toEqual({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: { name: "get_sub_domains", arguments: { domain: "academic" } },
    });
    expect(JSON.parse(String(calls[1].init.body))).toEqual({
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: {
        name: "batch_search",
        arguments: { queries: [
          { id: "Q001", query: "public evidence" },
          {
            id: "Q002",
            query: "academic evidence",
            domain: "academic",
            sub_domain: "academic.current",
            sub_domain_params: { topic: "", open_access: true },
          },
        ] },
      },
    });
    expect(calls.slice(2).map((call) => JSON.parse(String(call.init.body)).params)).toEqual([
      { name: "extract", arguments: { url: "https://example.com/first" } },
      { name: "extract", arguments: { url: "https://example.org/second" } },
      { name: "extract", arguments: { url: "https://example.net/third" } },
      { name: "extract", arguments: { url: "https://iana.org/fourth" } },
    ]);
    expect(calls.slice(2).map((call) => JSON.parse(String(call.init.body)).params.arguments.url)).toEqual([
      "https://example.com/first",
      "https://example.org/second",
      "https://example.net/third",
      "https://iana.org/fourth",
    ]);
  });

  it("caps accepted sources and extraction concurrency while truncating page and packet content", async () => {
    let inFlight = 0;
    let maximumInFlight = 0;
    const markdown = Array.from(
      { length: 10 },
      (_, index) => `## ${index + 1}. [Source ${index + 1}](https://example.com/${index + 1})`
    ).join("\n");
    const fetch = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      const request = JSON.parse(String(init?.body));
      if (request.method === "tools/call" && request.params.name === "batch_search") return rpcText(markdown);
      inFlight += 1;
      maximumInFlight = Math.max(maximumInFlight, inFlight);
      await new Promise((resolve) => setTimeout(resolve, 5));
      inFlight -= 1;
      return rpcText("x".repeat(25_000));
    });
    const result = await createAnySearchResearchAdapter({ fetch }).collect({
      queries: [{ id: "Q001", query: "evidence", type: "general" }],
    });

    expect(result.status).toBe("ok");
    if (result.status !== "ok") throw new Error("Expected extracted packet");
    expect(maximumInFlight).toBeLessThanOrEqual(3);
    expect(result.sources).toHaveLength(4);
    expect(result.sources.every((source) => source.content.length === 20_000)).toBe(true);
    expect(result.sources.reduce((total, source) => total + source.content.length, 0)).toBeLessThanOrEqual(
      80_000
    );
    expect(fetch.mock.calls.filter(([, init]) => JSON.parse(String(init?.body)).params.name === "extract")).toHaveLength(8);
  });

  it("returns insufficient_sources when fewer than four full-page extractions succeed and does not retry", async () => {
    let extractionCalls = 0;
    const fetch = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      const request = JSON.parse(String(init?.body));
      if (request.method === "tools/call" && request.params.name === "get_sub_domains") {
        return rpcText(JSON.stringify([{ sub_domain: "academic.current", params: [] }]));
      }
      if (request.method === "tools/call" && request.params.name === "batch_search") return rpcText(searchMarkdown);
      extractionCalls += 1;
      return extractionCalls <= 3 ? rpcText("complete source") : jsonResponse({ error: { message: "nope" } }, 502);
    });

    const result = await createAnySearchResearchAdapter({ fetch }).collect(plan);

    expect(result).toMatchObject({ status: "insufficient_sources" });
    expect(extractionCalls).toBe(4);
    expect(fetch).toHaveBeenCalledTimes(6);
  });

  it("filters too-short extracted pages and reports typed insufficient_sources", async () => {
    const fetch = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      const request = JSON.parse(String(init?.body));
      if (request.params.name === "batch_search") return rpcText(searchMarkdown);
      return rpcText(request.params.arguments.url.endsWith("1") ? "AI" : "2024");
    });
    await expect(createAnySearchResearchAdapter({ fetch }).collect({ queries: [{ id: "Q001", query: "evidence", type: "general" }] })).resolves.toMatchObject({ status: "insufficient_sources", sources: [] });
  });

  it("omits authorization when unconfigured and redacts provider responses before current-run persistence", async () => {
    const persisted: unknown[] = [];
    const fetch = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      const request = JSON.parse(String(init?.body));
      if (request.method === "tools/call" && request.params.name === "batch_search") {
        return jsonResponse({
          result: { content: [{ type: "text", text: searchMarkdown }] },
          metadata: {
            apiKey: "must-not-persist",
            nested: {
              authorization: "must-not-persist",
              password: "must-not-persist",
              passphrase: "must-not-persist",
              credentials: "must-not-persist",
              privateKey: "must-not-persist",
              clientSecret: "must-not-persist",
              accessKey: "must-not-persist",
              refreshToken: "must-not-persist",
              session_key: "must-not-persist",
            },
          },
        });
      }
      return rpcText("full extracted content with enough public evidence detail");
    });

    const result = await createAnySearchResearchAdapter({
      fetch,
      persistRawResponse: (response) => {
        persisted.push(response);
      },
    }).collect({ queries: [{ id: "Q001", query: "evidence", type: "general" }] });

    expect(result.status).toBe("ok");
    expect(fetch.mock.calls[0][1]?.headers).toEqual({ "content-type": "application/json" });
    expect(JSON.stringify(persisted)).not.toContain("must-not-persist");
  });

  it("fails closed for an unavailable transport and malformed provider envelopes", async () => {
    expect(() => new AnySearchResearchAdapter({ fetch: null as never })).toThrow("ANYSEARCH_FETCH_UNAVAILABLE");

    for (const response of [
      new Response("not-json", { status: 200 }),
      jsonResponse({ error: { message: "provider error" } }, 200),
      jsonResponse({ unexpected: true }),
    ]) {
      const adapter = createAnySearchResearchAdapter({ fetch: vi.fn().mockResolvedValue(response) });
      await expect(adapter.collect({ queries: [{ id: "Q001", query: "evidence", type: "general" }] })).rejects.toMatchObject({ message: expect.stringMatching(/^ANYSEARCH_(REQUEST_FAILED|RESPONSE_INVALID)$/) });
    }
  });

  it("fails closed when academic discovery is malformed or receipt persistence fails", async () => {
    const invalidAcademic = createAnySearchResearchAdapter({
      fetch: vi.fn().mockResolvedValue(rpcText("not json")),
    });
    await expect(invalidAcademic.collect(plan)).rejects.toThrow("ANYSEARCH_ACADEMIC_CONTRACT_INVALID");

    const persistenceFailure = createAnySearchResearchAdapter({
      fetch: vi.fn().mockResolvedValue(rpcText(searchMarkdown)),
      persistRawResponse: () => { throw new Error("disk unavailable"); },
    });
    await expect(persistenceFailure.collect({ queries: [{ id: "Q001", query: "evidence", type: "general" }] })).rejects.toThrow("ANYSEARCH_PERSISTENCE_FAILED");
  });

  it("accepts only the first valid academic sub-domain contract and emits its required parameters", async () => {
    const calls: unknown[] = [];
    const adapter = createAnySearchResearchAdapter({
      fetch: async (_url, init) => {
        const request = JSON.parse(String(init?.body));
        calls.push(request);
        if (request.params.name === "get_sub_domains") {
          return rpcText(JSON.stringify({ sub_domains: [null, { sub_domain: "" }, {
            name: "fallback-academic",
            params: [null, { required: true }, { name: "required", required: "required" }, { name: "optional", required: false }, { name: "open_access", required: false }],
          }] }));
        }
        return rpcText("");
      },
    });

    await expect(adapter.collect({ queries: [{ id: "Q001", query: "academic evidence", type: "academic" }] })).resolves.toEqual({ status: "insufficient_sources", sources: [] });
    expect((calls[1] as { params: { arguments: { queries: Array<Record<string, unknown>> } } }).params.arguments.queries[0]).toMatchObject({
      domain: "academic", sub_domain: "fallback-academic", sub_domain_params: { required: "", open_access: true },
    });
  });

  it.each([
    ["a non-object result", null],
    ["a non-array content field", { content: {} }],
    ["a content list without text", { content: [{ type: "image", data: "ignored" }] }],
  ])("rejects %s before attempting extraction", async (_label, result) => {
    const adapter = createAnySearchResearchAdapter({ fetch: async () => jsonResponse({ result }) });
    await expect(adapter.collect({ queries: [{ id: "Q001", query: "evidence", type: "general" }] })).rejects.toThrow("ANYSEARCH_RESPONSE_INVALID");
  });
});
