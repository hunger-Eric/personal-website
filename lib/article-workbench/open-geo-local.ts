import { z } from "zod";

export interface OpenGeoArticleInput {
  topic: string;
  sourceUrl?: string;
  sourceText?: string;
  targetReader?: string;
  requirements?: string;
}

export interface OpenGeoCapability {
  preflightToken: string;
  projectToken?: string;
}

const openGeoCapabilitySchema = z.object({
  preflightToken: z.string().trim().min(1).max(500),
  projectToken: z.string().trim().min(1).max(500).optional(),
}).strict();

export function openGeoCapabilityCookieName(runId: string): string {
  if (!/^awr_[a-f0-9]{24}$/.test(runId)) throw new Error("ARTICLE_RUN_ID_INVALID");
  return `open_geo_bridge_${runId}`;
}

export function encodeOpenGeoCapability(value: OpenGeoCapability): string {
  return Buffer.from(JSON.stringify(openGeoCapabilitySchema.parse(value)), "utf8").toString("base64url");
}

export function decodeOpenGeoCapability(value: string | undefined): OpenGeoCapability | null {
  if (!value) return null;
  try {
    return openGeoCapabilitySchema.parse(JSON.parse(Buffer.from(value, "base64url").toString("utf8"))) as OpenGeoCapability;
  } catch {
    return null;
  }
}

const preflightResponseSchema = z.object({
  preflightId: z.string().trim().min(1).max(200),
}).passthrough();

const preflightStatusSchema = z.discriminatedUnion("status", [
  z.object({ status: z.literal("checking") }).passthrough(),
  z.object({ status: z.literal("needs_input"), fieldErrors: z.array(z.object({ field: z.string(), level: z.string(), message: z.string() }).passthrough()).max(20) }).passthrough(),
  z.object({ status: z.literal("promoted"), projectId: z.string().trim().min(1).max(200), jobId: z.string().trim().min(1).max(200) }).passthrough(),
  z.object({ status: z.enum(["failed", "expired"]), error: z.string().max(500).optional() }).passthrough(),
]);

const projectStatusSchema = z.object({
  projectStatus: z.string().trim().min(1).max(100),
  job: z.object({
    stage: z.enum(["queued", "collecting_sources", "planning", "writing", "saving", "completed", "failed"]),
    progress: z.number().int().min(0).max(100),
    etaSeconds: z.number().int().min(0).nullable(),
    publicError: z.string().max(500).nullable(),
  }).nullable(),
}).strict();

export const OpenGeoArticleOutputSchema = z.object({
  title: z.string().trim().min(1).max(500),
  summary: z.string().trim().min(1).max(5_000),
  bodyMarkdown: z.string().trim().min(1).max(200_000),
}).strict();
export type OpenGeoArticleOutput = z.infer<typeof OpenGeoArticleOutputSchema>;
export type OpenGeoProjectStatus = z.infer<typeof projectStatusSchema>;
export type OpenGeoPreflightStatus = z.infer<typeof preflightStatusSchema> & { projectToken?: string };

export function createOpenGeoLocalClient({
  baseUrl = "http://127.0.0.1:3000",
  fetcher = globalThis.fetch,
}: {
  baseUrl?: string;
  fetcher?: typeof globalThis.fetch;
} = {}) {
  const base = parseLoopbackBaseUrl(baseUrl);
  return {
    async createPreflight(input: OpenGeoArticleInput, idempotencyKey: string): Promise<{ preflightId: string; preflightToken: string }> {
      const form = new FormData();
      form.set("topic", input.topic);
      if (input.sourceUrl) form.set("sourceUrl", input.sourceUrl);
      if (input.sourceText) form.set("sourceText", input.sourceText);
      if (input.targetReader) form.set("targetReader", input.targetReader);
      if (input.requirements) form.set("requirements", input.requirements);
      form.set("locale", "zh");
      form.set("turnstileToken", "");
      const response = await request(fetcher, new URL("/api/articles/projects", base), {
        method: "POST",
        redirect: "error",
        headers: { "Idempotency-Key": idempotencyKey },
        body: form,
      });
      const payload = preflightResponseSchema.parse(await response.json());
      const preflightToken = cookieValue(response.headers, `ogc_article_preflight_${safeCookieId(payload.preflightId)}`);
      if (!preflightToken) throw new Error("OPEN_GEO_CAPABILITY_MISSING");
      return { preflightId: payload.preflightId, preflightToken };
    },

    async getPreflight(preflightId: string, preflightToken: string): Promise<OpenGeoPreflightStatus> {
      const response = await request(fetcher, new URL(`/api/articles/preflights/${encodeURIComponent(preflightId)}/status`, base), capabilityRequest(preflightToken));
      const payload = preflightStatusSchema.parse(await response.json());
      if (payload.status !== "promoted") return payload;
      const projectToken = cookieValue(response.headers, `ogc_article_${safeCookieId(payload.projectId)}`);
      if (!projectToken) throw new Error("OPEN_GEO_CAPABILITY_MISSING");
      return { ...payload, projectToken };
    },

    async getProjectStatus(projectId: string, projectToken: string): Promise<OpenGeoProjectStatus> {
      const response = await request(fetcher, new URL(`/api/articles/projects/${encodeURIComponent(projectId)}/status`, base), capabilityRequest(projectToken));
      return projectStatusSchema.parse(await response.json());
    },

    async getOutput(projectId: string, projectToken: string): Promise<OpenGeoArticleOutput> {
      const response = await request(fetcher, new URL(`/api/articles/projects/${encodeURIComponent(projectId)}/output`, base), capabilityRequest(projectToken));
      return OpenGeoArticleOutputSchema.parse(await response.json());
    },
  };
}

function parseLoopbackBaseUrl(value: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error("OPEN_GEO_LOCAL_URL_INVALID");
  }
  const allowedHost = parsed.hostname === "127.0.0.1" || parsed.hostname === "localhost" || parsed.hostname === "[::1]" || parsed.hostname === "::1";
  if (!allowedHost || !["http:", "https:"].includes(parsed.protocol) || parsed.username || parsed.password || parsed.pathname !== "/" || parsed.search || parsed.hash) {
    throw new Error("OPEN_GEO_LOCAL_URL_INVALID");
  }
  return parsed;
}

function capabilityRequest(token: string): RequestInit {
  if (!token.trim()) throw new Error("OPEN_GEO_CAPABILITY_MISSING");
  return { redirect: "error", cache: "no-store", headers: { Accept: "application/json", Authorization: `Bearer ${token}` } };
}

async function request(fetcher: typeof globalThis.fetch, url: URL, init: RequestInit): Promise<Response> {
  let response: Response;
  try {
    response = await fetcher(url, init);
  } catch {
    throw new Error("OPEN_GEO_LOCAL_UNAVAILABLE");
  }
  if (!response.ok) throw new Error(response.status === 404 ? "OPEN_GEO_TASK_NOT_FOUND" : "OPEN_GEO_REQUEST_FAILED");
  return response;
}

function safeCookieId(value: string): string {
  return value.replace(/[^A-Za-z0-9_-]/g, "");
}

function cookieValue(headers: Headers, name: string): string | null {
  const raw = headers.get("set-cookie") ?? "";
  const match = new RegExp(`(?:^|,\\s*)${escapeRegExp(name)}=([^;,\\s]+)`).exec(raw);
  return match ? decodeURIComponent(match[1]) : null;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
