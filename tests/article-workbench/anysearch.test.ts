import { describe, expect, it, vi } from "vitest";

import type { ResearchPlan } from "@/lib/article-workbench/contracts";
import {
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
      if (request.method === "get_sub_domains") {
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
      if (request.method === "batch_search") return rpcText(searchMarkdown);
      return rpcText(`Full extracted content for ${request.params.url}`);
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
      method: "get_sub_domains",
      params: { domain: "academic" },
    });
    expect(JSON.parse(String(calls[1].init.body))).toEqual({
      jsonrpc: "2.0",
      id: 2,
      method: "batch_search",
      params: {
        queries: [
          { id: "Q001", query: "public evidence" },
          {
            id: "Q002",
            query: "academic evidence",
            domain: "academic",
            sub_domain: "academic.current",
            sub_domain_params: { topic: "", open_access: true },
          },
        ],
      },
    });
    expect(calls.slice(2).map((call) => JSON.parse(String(call.init.body)).params.url)).toEqual([
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
      if (request.method === "batch_search") return rpcText(markdown);
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
    expect(fetch.mock.calls.filter(([, init]) => JSON.parse(String(init?.body)).method === "extract")).toHaveLength(8);
  });

  it("returns insufficient_sources when fewer than four full-page extractions succeed and does not retry", async () => {
    let extractionCalls = 0;
    const fetch = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      const request = JSON.parse(String(init?.body));
      if (request.method === "get_sub_domains") {
        return rpcText(JSON.stringify([{ sub_domain: "academic.current", params: [] }]));
      }
      if (request.method === "batch_search") return rpcText(searchMarkdown);
      extractionCalls += 1;
      return extractionCalls <= 3 ? rpcText("complete source") : jsonResponse({ error: { message: "nope" } }, 502);
    });

    const result = await createAnySearchResearchAdapter({ fetch }).collect(plan);

    expect(result).toMatchObject({ status: "insufficient_sources" });
    expect(extractionCalls).toBe(4);
    expect(fetch).toHaveBeenCalledTimes(6);
  });

  it("omits authorization when unconfigured and redacts provider responses before current-run persistence", async () => {
    const persisted: unknown[] = [];
    const fetch = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      const request = JSON.parse(String(init?.body));
      if (request.method === "batch_search") {
        return jsonResponse({
          result: { content: [{ type: "text", text: searchMarkdown }] },
          metadata: { apiKey: "must-not-persist", nested: { authorization: "must-not-persist" } },
        });
      }
      return rpcText("full extracted content");
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
});
