# AI Crawler Identity Verification V2.1 Implementation Plan

> 历史实施记录：仅用于追溯该子系统的设计与验收背景，不是当前品牌或视觉权威；当前实现以代码、`DESIGN.md`、`docs/architecture.md` 和 `docs/PROJECT-STATE.md` 为准。

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在不改变 V1 正式统计和官网响应的前提下，为 OpenAI、Perplexity 和首批中国爬虫增加四级身份验证影子统计与最小后台预览。

**Architecture:** 继续使用现有 Cloudflare Worker、D1、Cron、HMAC 私有读取接口和 Basic Auth 后台。新增纯函数候选目录、官方 IP 规则同步器、独立 V2 影子聚合表和严格响应 schema；V1 仍是正式数据，V2.1 先观察 7 天。

**Tech Stack:** TypeScript 5.9、Cloudflare Workers、D1、Wrangler 4.119、Vitest 4、Next.js 16、React 19、Zod 3、`ipaddr.js@2.5.0`。

## Global Constraints

- 权威设计：`docs/superpowers/specs/2026-08-06-ai-crawler-identity-verification-v2-design.md`。
- 当前计划基线为 `main` 上的 `c0fba2c0efcdfb01f22205a2cb78b154702b71ad`；执行前必须重新核对本地 HEAD、`origin/main`、remote 和脏状态。若基线已变化，先重审计划涉及的行号和接口。
- 不触碰用户现有脏文件：`.gitignore`、`.codegraph/`、`.codex/`、`.mimocode/`、`docs/superpowers/specs/2026-08-05-shijie-intelligence-brand-design.md`、`scripts/sync_feishu_progress.py`。
- 不保存或记录原始 IP、IP 哈希、完整 User-Agent、query string、远端规则响应正文或读取密钥。
- V2 验证和写入继续通过 `ctx.waitUntil()` 尽力完成；失败不得改变源站响应、状态码或响应头。
- V1 `crawler_counts`、当前 API 字段和当前后台语义在 7 天影子期内保持兼容。
- V2.1 不引入 KV、队列、外部数据库、付费 Cloudflare 产品、实时 DNS 或 Open GEO Console 改动。
- 只有 HTTPS 固定官方来源可以产生 `verified_official` 或 `suspected_spoof`；规则缺失、过期或同步失败一律降级为 `declared_unverified`。
- 最近有效规则最多沿用最后成功同步后的 7 天。
- 每个任务结束后先审查 diff 和测试。计划中的 commit、push、D1 remote migration、Worker deploy 和 Vercel production 均为独立授权门槛；未获得相应授权时保持复选框未完成并停止。

## File Map

- Create `workers/crawler-observer/src/identity.ts`: V2 身份类型、候选目录和 User-Agent 候选匹配。
- Create `workers/crawler-observer/src/official-ip-rules.ts`: 官方 CIDR 解析、匹配、D1 最近有效版本和同步。
- Create `workers/crawler-observer/migrations/0002_identity_shadow.sql`: V2 规则状态、影子起点和聚合表。
- Create `workers/crawler-observer/test/identity.test.ts`: 身份目录和四级判定单元测试。
- Create `workers/crawler-observer/test/official-ip-rules.test.ts`: IPv4/IPv6、同步、失效和隐私测试。
- Modify `workers/crawler-observer/src/core.ts`: 保留 V1，接入 V2 分类、影子写入、Cron 同步和私有聚合。
- Modify `workers/crawler-observer/test/contract.test.ts`: V1 兼容、V2 D1 集成、定时任务和隐私合同。
- Modify `workers/crawler-observer/package.json` and `package-lock.json`: 固定 `ipaddr.js@2.5.0`。
- Modify `lib/crawler-analytics/worker-schema.ts`: 严格校验 `identityPreview`。
- Modify `lib/crawler-analytics/types.ts`: 导出 V2 类型别名。
- Modify `components/admin/crawlers/CrawlerDashboard.tsx`: 最小影子预览卡片和身份列。
- Modify `config/copy/crawler-dashboard.ts`: V2.1 中文文案。
- Modify existing crawler analytics, API, page and component tests to include the strict V2.1 fixture.

---

### Task 0: Freeze and Re-Verify the V1 Baseline

**Files:** None.

**Interfaces:**
- Consumes: current repository and production-independent test commands.
- Produces: a read-only baseline receipt for the execution turn.

- [ ] **Step 1: Verify repository identity and preserve dirty files**

Run from `E:\project\personal-website`:

```powershell
git branch --show-current
git rev-parse HEAD
git rev-parse origin/main
git remote -v
git status --short
```

Expected: branch `main`; HEAD and `origin/main` both equal the approved baseline or a newly reviewed successor; no task step may stage user-owned paths listed in Global Constraints.

- [ ] **Step 2: Run the current Worker baseline**

```powershell
Set-Location E:\project\personal-website\workers\crawler-observer
npm test
npm run typecheck
npm run dry-run
```

Expected: all current Worker tests pass, typecheck exits 0, Wrangler dry-run exits 0.

- [ ] **Step 3: Run the current application baseline**

```powershell
Set-Location E:\project\personal-website
npm test -- tests/lib/crawler-analytics-worker-schema.test.ts tests/lib/crawler-analytics-service.test.ts tests/components/admin/crawlers/CrawlerDashboard.test.tsx tests/crawler-dashboard-page.test.tsx tests/api/admin-crawlers.test.ts
npm run typecheck
```

Expected: selected crawler tests and typecheck pass. Any failure stops Task 1; do not repair unrelated baseline failures under this plan.

---

### Task 1: Define the V2 Identity Contract and Candidate Matcher

**Files:**
- Create: `workers/crawler-observer/src/identity.ts`
- Create: `workers/crawler-observer/test/identity.test.ts`

**Interfaces:**
- Consumes: `@geosuite/ai-crawler-bots/bots.json` for fallback declared AI crawler candidates.
- Produces: `VerificationStatus`, `VerificationMethod`, `CrawlerPurpose`, `CrawlerRegion`, `RuleSourceId`, `IdentityCandidate`, `IdentityResult`, `findIdentityCandidate()` and `otherAutomationIdentity()`.

- [ ] **Step 1: Write the failing identity contract tests**

Create `workers/crawler-observer/test/identity.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  findIdentityCandidate,
  otherAutomationIdentity,
  type IdentityCandidate,
} from "../src/identity";

const fixture: readonly IdentityCandidate[] = [
  {
    botId: "oai-searchbot",
    botName: "OAI-SearchBot",
    providerId: "openai",
    providerName: "OpenAI",
    region: "global",
    purpose: "ai_search",
    uaToken: "OAI-SearchBot",
    ruleSourceId: "openai_searchbot",
  },
];

describe("crawler identity contract", () => {
  it("matches a candidate case-insensitively without storing the raw UA", () => {
    expect(findIdentityCandidate("Mozilla compatible oai-searchbot/1.0", fixture)).toEqual(fixture[0]);
  });

  it("returns null for an ordinary browser", () => {
    expect(findIdentityCandidate("Mozilla/5.0 Chrome/124.0", fixture)).toBeNull();
  });

  it("keeps an existing AI catalog entry as a declared candidate", () => {
    expect(findIdentityCandidate("ClaudeBot/1.0")).toMatchObject({
      botId: "claudebot",
      providerName: "Anthropic",
      ruleSourceId: null,
    });
  });

  it("returns the locked other-automation identity", () => {
    expect(otherAutomationIdentity()).toEqual({
      botId: "other-bot",
      botName: "Other automation bot",
      providerId: "unknown",
      providerName: "Unknown",
      region: "global",
      purpose: "unknown",
      verificationStatus: "other_automation",
      verificationMethod: "generic_bot",
    });
  });
});
```

- [ ] **Step 2: Run the test and confirm the missing module failure**

```powershell
Set-Location E:\project\personal-website\workers\crawler-observer
npm test -- test/identity.test.ts
```

Expected: FAIL because `../src/identity` does not exist.

- [ ] **Step 3: Add the complete identity types and generic matcher**

Create `workers/crawler-observer/src/identity.ts`:

```ts
import bots from "@geosuite/ai-crawler-bots/bots.json";

export type VerificationStatus =
  | "verified_official"
  | "declared_unverified"
  | "suspected_spoof"
  | "other_automation";

export type VerificationMethod =
  | "official_ip_range"
  | "signed_hmac"
  | "ua_only"
  | "generic_bot";

export type CrawlerPurpose =
  | "ai_training"
  | "ai_search"
  | "user_fetch"
  | "search_index"
  | "self_test"
  | "unknown";

export type CrawlerRegion = "global" | "cn";

export type RuleSourceId =
  | "openai_gptbot"
  | "openai_searchbot"
  | "openai_chatgpt_user"
  | "perplexity_bot"
  | "perplexity_user";

export type IdentityCandidate = {
  botId: string;
  botName: string;
  providerId: string;
  providerName: string;
  region: CrawlerRegion;
  purpose: CrawlerPurpose;
  uaToken: string;
  ruleSourceId: RuleSourceId | null;
};

export type IdentityResult = Omit<IdentityCandidate, "uaToken" | "ruleSourceId"> & {
  verificationStatus: VerificationStatus;
  verificationMethod: VerificationMethod;
};

const EXPLICIT_IDENTITY_CATALOG: readonly IdentityCandidate[] = [];

function providerId(owner: string): string {
  return owner.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "unknown";
}

function purpose(value: string): CrawlerPurpose {
  if (value === "training") return "ai_training";
  if (value === "search") return "ai_search";
  if (value === "user-agent") return "user_fetch";
  return "unknown";
}

const FALLBACK_AI_CATALOG: readonly IdentityCandidate[] = bots
  .filter((bot) => bot.uaToken !== null)
  .map((bot) => ({
    botId: bot.id,
    botName: bot.name,
    providerId: providerId(bot.owner),
    providerName: bot.owner,
    region: "global" as const,
    purpose: purpose(bot.purpose),
    uaToken: bot.uaToken as string,
    ruleSourceId: null,
  }));

export const IDENTITY_CATALOG: readonly IdentityCandidate[] = [
  ...EXPLICIT_IDENTITY_CATALOG,
  ...FALLBACK_AI_CATALOG,
];

export function findIdentityCandidate(
  userAgent: string,
  catalog: readonly IdentityCandidate[] = IDENTITY_CATALOG,
): IdentityCandidate | null {
  const normalized = userAgent.toLowerCase();
  return [...catalog]
    .sort((left, right) => right.uaToken.length - left.uaToken.length)
    .find((candidate) => normalized.includes(candidate.uaToken.toLowerCase())) ?? null;
}

export function otherAutomationIdentity(): IdentityResult {
  return {
    botId: "other-bot",
    botName: "Other automation bot",
    providerId: "unknown",
    providerName: "Unknown",
    region: "global",
    purpose: "unknown",
    verificationStatus: "other_automation",
    verificationMethod: "generic_bot",
  };
}
```

- [ ] **Step 4: Run the identity test and Worker typecheck**

```powershell
npm test -- test/identity.test.ts
npm run typecheck
```

Expected: PASS and exit 0.

- [ ] **Step 5: Review and gated commit**

```powershell
git diff --check
git diff -- workers/crawler-observer/src/identity.ts workers/crawler-observer/test/identity.test.ts
git add workers/crawler-observer/src/identity.ts workers/crawler-observer/test/identity.test.ts
git commit -m "feat: define crawler identity contract"
```

Expected: only the two Task 1 files are staged. Run `git add` and `git commit` only after explicit commit authorization.

---

### Task 2: Add the Local-Only V2 D1 Schema

**Files:**
- Create: `workers/crawler-observer/migrations/0002_identity_shadow.sql`
- Modify: `workers/crawler-observer/test/contract.test.ts`

**Interfaces:**
- Consumes: Task 1 string unions.
- Produces: `crawler_identity_meta`, `crawler_rule_sets`, and `crawler_identity_counts`. This task creates a migration file and exercises it locally; it does not apply a remote migration.

- [ ] **Step 1: Write the failing migration integration test**

Add an import beside the existing migration import:

```ts
import identityMigrationSql from "../migrations/0002_identity_shadow.sql?raw";
```

Add this test inside the Miniflare D1 describe block:

```ts
it("creates privacy-preserving V2 shadow tables", async () => {
  for (const statement of identityMigrationSql.split(/;\s*(?:\r?\n|$)/).map((item) => item.trim()).filter(Boolean)) {
    await env.DB.prepare(statement).run();
  }
  const columns = await env.DB.prepare("PRAGMA table_info(crawler_identity_counts)").all<{ name: string }>();
  const names = columns.results.map((column) => column.name);
  expect(names).toContain("verification_status");
  expect(names).toContain("verification_method");
  expect(names).not.toContain("ip");
  expect(names).not.toContain("ip_hash");
  expect(names).not.toContain("user_agent");
  const meta = await env.DB.prepare("SELECT value FROM crawler_identity_meta WHERE key = 'shadow_started_at'").first<{ value: string }>();
  expect(meta?.value).toMatch(/Z$/);
});
```

- [ ] **Step 2: Run the test and confirm the missing migration failure**

```powershell
npm test -- test/contract.test.ts
```

Expected: FAIL because `0002_identity_shadow.sql` does not exist.

- [ ] **Step 3: Create the V2 migration**

Create `workers/crawler-observer/migrations/0002_identity_shadow.sql`:

```sql
CREATE TABLE IF NOT EXISTS crawler_identity_meta (
  key TEXT PRIMARY KEY NOT NULL CHECK (key = 'shadow_started_at'),
  value TEXT NOT NULL CHECK (value GLOB '????-??-??T??:??:??*Z')
) WITHOUT ROWID;

INSERT OR IGNORE INTO crawler_identity_meta (key, value)
VALUES ('shadow_started_at', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));

CREATE TABLE IF NOT EXISTS crawler_rule_sets (
  source_id TEXT PRIMARY KEY NOT NULL CHECK (length(source_id) BETWEEN 1 AND 80),
  source_url TEXT NOT NULL CHECK (substr(source_url, 1, 8) = 'https://'),
  prefixes_json TEXT CHECK (prefixes_json IS NULL OR json_valid(prefixes_json)),
  content_sha256 TEXT CHECK (content_sha256 IS NULL OR length(content_sha256) = 64),
  source_created_at TEXT,
  last_attempt_at TEXT NOT NULL CHECK (last_attempt_at GLOB '????-??-??T??:??:??*Z'),
  last_success_at TEXT,
  last_error_code TEXT CHECK (last_error_code IS NULL OR last_error_code IN (
    'fetch_failed', 'http_status', 'response_too_large', 'invalid_json',
    'invalid_schema', 'invalid_cidr', 'empty_prefixes'
  )),
  CHECK (
    (prefixes_json IS NULL AND content_sha256 IS NULL AND source_created_at IS NULL AND last_success_at IS NULL)
    OR
    (prefixes_json IS NOT NULL AND content_sha256 IS NOT NULL AND source_created_at IS NOT NULL AND last_success_at IS NOT NULL)
  )
) WITHOUT ROWID;

CREATE TABLE IF NOT EXISTS crawler_identity_counts (
  bucket_start INTEGER NOT NULL CHECK (bucket_start >= 0 AND bucket_start % 3600 = 0),
  bot_id TEXT NOT NULL CHECK (length(bot_id) BETWEEN 1 AND 80),
  bot_name TEXT NOT NULL CHECK (length(bot_name) BETWEEN 1 AND 120),
  provider_id TEXT NOT NULL CHECK (length(provider_id) BETWEEN 1 AND 80),
  provider_name TEXT NOT NULL CHECK (length(provider_name) BETWEEN 1 AND 120),
  region TEXT NOT NULL CHECK (region IN ('global', 'cn')),
  purpose TEXT NOT NULL CHECK (purpose IN ('ai_training', 'ai_search', 'user_fetch', 'search_index', 'self_test', 'unknown')),
  verification_status TEXT NOT NULL CHECK (verification_status IN ('verified_official', 'declared_unverified', 'suspected_spoof', 'other_automation')),
  verification_method TEXT NOT NULL CHECK (verification_method IN ('official_ip_range', 'signed_hmac', 'ua_only', 'generic_bot')),
  path TEXT NOT NULL CHECK (length(path) BETWEEN 1 AND 2048 AND substr(path, 1, 1) = '/'),
  status INTEGER NOT NULL CHECK (status BETWEEN 100 AND 599),
  count INTEGER NOT NULL DEFAULT 1 CHECK (count > 0),
  PRIMARY KEY (
    bucket_start, bot_id, provider_id, purpose, verification_status,
    verification_method, path, status
  )
) WITHOUT ROWID;
```

- [ ] **Step 4: Run the local D1 contract and dry-run**

```powershell
npm test -- test/contract.test.ts
npm run dry-run
```

Expected: PASS. Do not run `wrangler d1 migrations apply --remote` in this task.

- [ ] **Step 5: Review and gated commit**

```powershell
git diff --check
git add workers/crawler-observer/migrations/0002_identity_shadow.sql workers/crawler-observer/test/contract.test.ts
git commit -m "feat: add crawler identity shadow schema"
```

Expected: only the migration and its local integration test are staged; commit requires explicit authorization.

---

### Task 3: Implement the Generic Official IP Rule Engine

**Files:**
- Create: `workers/crawler-observer/src/official-ip-rules.ts`
- Create: `workers/crawler-observer/test/official-ip-rules.test.ts`
- Modify: `workers/crawler-observer/package.json`
- Modify: `workers/crawler-observer/package-lock.json`

**Interfaces:**
- Consumes: `RuleSourceId` from Task 1 and `crawler_rule_sets` from Task 2.
- Produces: `OfficialRuleSource`, `RuleSyncErrorCode`, `parseOfficialPrefixPayload()`, `isIpInPrefixes()`, `syncRuleSource()`, and `loadUsableRuleSet()`.

- [ ] **Step 1: Add the pinned CIDR dependency**

```powershell
Set-Location E:\project\personal-website\workers\crawler-observer
npm install --save-exact ipaddr.js@2.5.0
```

Expected: only Worker `package.json` and `package-lock.json` change; no root dependency changes.

- [ ] **Step 2: Write failing parser, matcher, and sync tests**

Create `workers/crawler-observer/test/official-ip-rules.test.ts` with tests that assert:

```ts
import { env } from "cloudflare:test";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  isIpInPrefixes,
  loadUsableRuleSet,
  parseOfficialPrefixPayload,
  syncRuleSource,
  type OfficialRuleSource,
} from "../src/official-ip-rules";
import initialSql from "../migrations/0001_initial.sql?raw";
import identitySql from "../migrations/0002_identity_shadow.sql?raw";

const source: OfficialRuleSource = {
  id: "openai_gptbot",
  url: "https://openai.com/gptbot.json",
};

async function apply(sql: string) {
  for (const statement of sql.split(/;\s*(?:\r?\n|$)/).map((item) => item.trim()).filter(Boolean)) {
    await env.DB.prepare(statement).run();
  }
}

describe("official crawler IP rules", () => {
  beforeEach(async () => {
    await apply(initialSql);
    await apply(identitySql);
    await env.DB.prepare("DELETE FROM crawler_rule_sets").run();
  });

  it("normalizes IPv4 and IPv6 prefixes and matches boundaries", () => {
    const parsed = parseOfficialPrefixPayload({
      creationTime: "2026-08-06T00:00:00.000000",
      prefixes: [{ ipv4Prefix: "203.0.113.0/24" }, { ipv6Prefix: "2001:db8::/32" }],
    });
    expect(parsed.prefixes).toEqual(["2001:db8::/32", "203.0.113.0/24"]);
    expect(isIpInPrefixes("203.0.113.255", parsed.prefixes)).toBe(true);
    expect(isIpInPrefixes("203.0.114.0", parsed.prefixes)).toBe(false);
    expect(isIpInPrefixes("2001:db8::1", parsed.prefixes)).toBe(true);
  });

  it("stores a validated version and serves it for seven days", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      creationTime: "2026-08-06T00:00:00.000000",
      prefixes: [{ ipv4Prefix: "203.0.113.0/24" }],
    }), { status: 200 }));
    const now = new Date("2026-08-06T12:00:00.000Z");
    await syncRuleSource(env.DB, source, fetcher, now);
    await expect(loadUsableRuleSet(env.DB, source.id, new Date("2026-08-13T11:59:59.000Z"))).resolves.toMatchObject({
      prefixes: ["203.0.113.0/24"], usingLastKnownGood: true,
    });
    await expect(loadUsableRuleSet(env.DB, source.id, new Date("2026-08-13T12:00:01.000Z"))).resolves.toBeNull();
  });

  it("preserves the last good version after a bad response without logging its body", async () => {
    const now = new Date("2026-08-06T12:00:00.000Z");
    await syncRuleSource(env.DB, source, vi.fn().mockResolvedValue(new Response(JSON.stringify({
      creationTime: "2026-08-06T00:00:00.000000",
      prefixes: [{ ipv4Prefix: "203.0.113.0/24" }],
    }))), now);
    const secretBody = "remote-response-must-not-log";
    await syncRuleSource(env.DB, source, vi.fn().mockResolvedValue(new Response(secretBody, { status: 503 })), new Date("2026-08-07T12:00:00.000Z"));
    const row = await env.DB.prepare("SELECT prefixes_json, last_error_code FROM crawler_rule_sets WHERE source_id = ?").bind(source.id).first<{ prefixes_json: string; last_error_code: string }>();
    expect(row).toMatchObject({ prefixes_json: '["203.0.113.0/24"]', last_error_code: "http_status" });
    expect(JSON.stringify(row)).not.toContain(secretBody);
  });
});
```

- [ ] **Step 3: Run the tests and confirm missing exports**

```powershell
npm test -- test/official-ip-rules.test.ts
```

Expected: FAIL because `official-ip-rules.ts` does not exist.

- [ ] **Step 4: Implement parsing and CIDR matching**

Create `workers/crawler-observer/src/official-ip-rules.ts` with these public types and functions:

```ts
import ipaddr from "ipaddr.js";
import type { RuleSourceId } from "./identity";

const MAX_RESPONSE_BYTES = 256 * 1024;
const MAX_RULE_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export type RuleSyncErrorCode =
  | "fetch_failed" | "http_status" | "response_too_large" | "invalid_json"
  | "invalid_schema" | "invalid_cidr" | "empty_prefixes";

export type OfficialRuleSource = { id: RuleSourceId; url: string };
export type ParsedRuleSet = { creationTime: string; prefixes: string[] };
export type UsableRuleSet = ParsedRuleSet & {
  sourceId: RuleSourceId;
  lastSuccessAt: string;
  usingLastKnownGood: boolean;
};

function prefixFrom(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const row = value as { ipv4Prefix?: unknown; ipv6Prefix?: unknown };
  const ipv4 = typeof row.ipv4Prefix === "string" ? row.ipv4Prefix : null;
  const ipv6 = typeof row.ipv6Prefix === "string" ? row.ipv6Prefix : null;
  return (ipv4 === null) === (ipv6 === null) ? null : (ipv4 ?? ipv6);
}

export function parseOfficialPrefixPayload(value: unknown): ParsedRuleSet {
  if (!value || typeof value !== "object") throw new Error("invalid_schema");
  const body = value as { creationTime?: unknown; prefixes?: unknown };
  if (typeof body.creationTime !== "string" || Number.isNaN(Date.parse(body.creationTime)) || !Array.isArray(body.prefixes)) {
    throw new Error("invalid_schema");
  }
  const parsedRows = body.prefixes.map(prefixFrom);
  if (parsedRows.some((prefix) => prefix === null)) throw new Error("invalid_schema");
  const prefixes = [...new Set(parsedRows as string[])].sort();
  if (prefixes.length === 0) throw new Error("empty_prefixes");
  for (const prefix of prefixes) {
    try { ipaddr.parseCIDR(prefix); } catch { throw new Error("invalid_cidr"); }
  }
  return { creationTime: new Date(body.creationTime).toISOString(), prefixes };
}

export function isIpInPrefixes(ip: string, prefixes: readonly string[]): boolean {
  let address: ReturnType<typeof ipaddr.process>;
  try { address = ipaddr.process(ip); } catch { return false; }
  return prefixes.some((prefix) => {
    const [network, length] = ipaddr.parseCIDR(prefix);
    return address.kind() === network.kind() && address.match(network, length);
  });
}
```

- [ ] **Step 5: Implement D1 success, failure, and freshness behavior**

Add the following exported functions in the same file. `syncRuleSource()` must use `redirect: "error"`, reject a `Content-Length` or decoded text above `MAX_RESPONSE_BYTES`, hash only normalized `prefixes`, and update failure metadata without replacing a previous valid `prefixes_json`:

```ts
function iso(now: Date): string { return now.toISOString(); }

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function errorCode(error: unknown): RuleSyncErrorCode {
  const code = error instanceof Error ? error.message : "fetch_failed";
  return ["http_status", "response_too_large", "invalid_json", "invalid_schema", "invalid_cidr", "empty_prefixes"].includes(code)
    ? code as RuleSyncErrorCode : "fetch_failed";
}

export async function syncRuleSource(
  db: D1Database,
  source: OfficialRuleSource,
  fetcher: typeof fetch = fetch,
  now = new Date(),
): Promise<void> {
  try {
    const response = await fetcher(source.url, {
      method: "GET",
      redirect: "error",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error("http_status");
    const declaredLength = Number(response.headers.get("content-length") ?? 0);
    if (declaredLength > MAX_RESPONSE_BYTES) throw new Error("response_too_large");
    const text = await response.text();
    if (new TextEncoder().encode(text).byteLength > MAX_RESPONSE_BYTES) throw new Error("response_too_large");
    let body: unknown;
    try { body = JSON.parse(text); } catch { throw new Error("invalid_json"); }
    const parsed = parseOfficialPrefixPayload(body);
    const prefixesJson = JSON.stringify(parsed.prefixes);
    await db.prepare(
      "INSERT INTO crawler_rule_sets (source_id, source_url, prefixes_json, content_sha256, source_created_at, last_attempt_at, last_success_at, last_error_code) VALUES (?, ?, ?, ?, ?, ?, ?, NULL) ON CONFLICT(source_id) DO UPDATE SET source_url = excluded.source_url, prefixes_json = excluded.prefixes_json, content_sha256 = excluded.content_sha256, source_created_at = excluded.source_created_at, last_attempt_at = excluded.last_attempt_at, last_success_at = excluded.last_success_at, last_error_code = NULL"
    ).bind(source.id, source.url, prefixesJson, await sha256(prefixesJson), parsed.creationTime, iso(now), iso(now)).run();
  } catch (error) {
    await db.prepare(
      "INSERT INTO crawler_rule_sets (source_id, source_url, prefixes_json, content_sha256, source_created_at, last_attempt_at, last_success_at, last_error_code) VALUES (?, ?, NULL, NULL, NULL, ?, NULL, ?) ON CONFLICT(source_id) DO UPDATE SET source_url = excluded.source_url, last_attempt_at = excluded.last_attempt_at, last_error_code = excluded.last_error_code"
    ).bind(source.id, source.url, iso(now), errorCode(error)).run();
  }
}

export async function loadUsableRuleSet(db: D1Database, sourceId: RuleSourceId, now = new Date()): Promise<UsableRuleSet | null> {
  const row = await db.prepare("SELECT prefixes_json, source_created_at, last_success_at FROM crawler_rule_sets WHERE source_id = ?").bind(sourceId).first<{ prefixes_json: string | null; source_created_at: string | null; last_success_at: string | null }>();
  if (!row?.prefixes_json || !row.source_created_at || !row.last_success_at) return null;
  const age = now.getTime() - Date.parse(row.last_success_at);
  if (!Number.isFinite(age) || age < 0 || age > MAX_RULE_AGE_MS) return null;
  let prefixes: unknown;
  try { prefixes = JSON.parse(row.prefixes_json); } catch { return null; }
  if (!Array.isArray(prefixes) || prefixes.length === 0 || prefixes.some((prefix) => typeof prefix !== "string")) return null;
  try { for (const prefix of prefixes) ipaddr.parseCIDR(prefix); } catch { return null; }
  return {
    sourceId,
    creationTime: row.source_created_at,
    prefixes: prefixes as string[],
    lastSuccessAt: row.last_success_at,
    usingLastKnownGood: age >= 24 * 60 * 60 * 1000,
  };
}
```

- [ ] **Step 6: Run tests, typecheck, and privacy scan**

```powershell
npm test -- test/official-ip-rules.test.ts
npm run typecheck
rg -n "console\.(log|error)|response\.text|CF-Connecting-IP" src/official-ip-rules.ts
```

Expected: tests and typecheck pass; source contains no console call and never logs fetched text.

- [ ] **Step 7: Review and gated commit**

```powershell
git diff --check
git add workers/crawler-observer/package.json workers/crawler-observer/package-lock.json workers/crawler-observer/src/official-ip-rules.ts workers/crawler-observer/test/official-ip-rules.test.ts
git commit -m "feat: add official crawler IP rule engine"
```

Expected: only Task 3 files are staged; commit requires explicit authorization.

---

### Task 4: Add OpenAI Candidates and Daily Rule Synchronization

**Files:**
- Modify: `workers/crawler-observer/src/identity.ts`
- Modify: `workers/crawler-observer/src/official-ip-rules.ts`
- Modify: `workers/crawler-observer/src/core.ts`
- Modify: `workers/crawler-observer/test/identity.test.ts`
- Modify: `workers/crawler-observer/test/official-ip-rules.test.ts`
- Modify: `workers/crawler-observer/test/contract.test.ts`

**Interfaces:**
- Consumes: Task 1 catalog, Task 3 `syncRuleSource()`.
- Produces: three OpenAI candidate entries, `OPENAI_RULE_SOURCES`, and `syncOpenAiRuleSources()` called by the existing daily Cron.

- [ ] **Step 1: Add failing OpenAI catalog and URL isolation tests**

Assert these exact mappings:

```ts
expect(findIdentityCandidate("GPTBot/1.1")).toMatchObject({ botId: "gptbot", purpose: "ai_training", ruleSourceId: "openai_gptbot" });
expect(findIdentityCandidate("OAI-SearchBot/1.0")).toMatchObject({ botId: "oai-searchbot", purpose: "ai_search", ruleSourceId: "openai_searchbot" });
expect(findIdentityCandidate("ChatGPT-User/1.0")).toMatchObject({ botId: "chatgpt-user", purpose: "user_fetch", ruleSourceId: "openai_chatgpt_user" });
```

Assert `syncOpenAiRuleSources()` fetches exactly:

```ts
expect(fetcher.mock.calls.map(([url]) => url)).toEqual([
  "https://openai.com/gptbot.json",
  "https://openai.com/searchbot.json",
  "https://openai.com/chatgpt-user.json",
]);
```

- [ ] **Step 2: Add the OpenAI candidates and source definitions**

Replace the empty `EXPLICIT_IDENTITY_CATALOG` with:

```ts
const EXPLICIT_IDENTITY_CATALOG: readonly IdentityCandidate[] = [
  { botId: "oai-searchbot", botName: "OAI-SearchBot", providerId: "openai", providerName: "OpenAI", region: "global", purpose: "ai_search", uaToken: "OAI-SearchBot", ruleSourceId: "openai_searchbot" },
  { botId: "chatgpt-user", botName: "ChatGPT-User", providerId: "openai", providerName: "OpenAI", region: "global", purpose: "user_fetch", uaToken: "ChatGPT-User", ruleSourceId: "openai_chatgpt_user" },
  { botId: "gptbot", botName: "GPTBot", providerId: "openai", providerName: "OpenAI", region: "global", purpose: "ai_training", uaToken: "GPTBot", ruleSourceId: "openai_gptbot" },
];
```

Add in `official-ip-rules.ts`:

```ts
export const OPENAI_RULE_SOURCES: readonly OfficialRuleSource[] = [
  { id: "openai_gptbot", url: "https://openai.com/gptbot.json" },
  { id: "openai_searchbot", url: "https://openai.com/searchbot.json" },
  { id: "openai_chatgpt_user", url: "https://openai.com/chatgpt-user.json" },
];

export async function syncOpenAiRuleSources(db: D1Database, fetcher: typeof fetch = fetch, now = new Date()): Promise<void> {
  for (const source of OPENAI_RULE_SOURCES) await syncRuleSource(db, source, fetcher, now);
}
```

- [ ] **Step 3: Add OpenAI sync to the existing scheduled handler without coupling it to purge success**

In `core.ts`, add:

```ts
export async function scheduledMaintenance(env: ObserverEnv): Promise<void> {
  const results = await Promise.allSettled([purge(env), syncOpenAiRuleSources(env.DB)]);
  for (const result of results) if (result.status === "rejected") safeLog(result.reason);
}
```

Change only the handler body:

```ts
scheduled(_event, env, ctx): void {
  ctx.waitUntil(scheduledMaintenance(env));
},
```

- [ ] **Step 4: Run focused Worker tests**

```powershell
npm test -- test/identity.test.ts test/official-ip-rules.test.ts test/contract.test.ts
npm run typecheck
```

Expected: OpenAI candidate/source tests pass; the scheduled handler still purges old V1 counts when a mocked source fails.

- [ ] **Step 5: Review and gated commit**

```powershell
git diff --check
git add workers/crawler-observer/src/identity.ts workers/crawler-observer/src/official-ip-rules.ts workers/crawler-observer/src/core.ts workers/crawler-observer/test/identity.test.ts workers/crawler-observer/test/official-ip-rules.test.ts workers/crawler-observer/test/contract.test.ts
git commit -m "feat: sync official OpenAI crawler ranges"
```

Expected: only Task 4 files staged; commit requires explicit authorization.

---

### Task 5: Add Perplexity Sources as an Independent Adapter Increment

**Files:**
- Modify: `workers/crawler-observer/src/identity.ts`
- Modify: `workers/crawler-observer/src/official-ip-rules.ts`
- Modify: `workers/crawler-observer/src/core.ts`
- Modify: `workers/crawler-observer/test/identity.test.ts`
- Modify: `workers/crawler-observer/test/official-ip-rules.test.ts`
- Modify: `workers/crawler-observer/test/contract.test.ts`

**Interfaces:**
- Consumes: the generic rule engine and scheduled source loop.
- Produces: `perplexity_bot`, `perplexity_user`, and `syncPerplexityRuleSources()`.

- [ ] **Step 1: Add failing candidate and source tests**

```ts
expect(findIdentityCandidate("PerplexityBot/1.0")).toMatchObject({ botId: "perplexitybot", purpose: "ai_search", ruleSourceId: "perplexity_bot" });
expect(findIdentityCandidate("Perplexity-User/1.0")).toMatchObject({ botId: "perplexity-user", purpose: "user_fetch", ruleSourceId: "perplexity_user" });
```

Expected official URLs:

```ts
expect(PERPLEXITY_RULE_SOURCES).toEqual([
  { id: "perplexity_bot", url: "https://www.perplexity.com/perplexitybot.json" },
  { id: "perplexity_user", url: "https://www.perplexity.com/perplexity-user.json" },
]);
```

- [ ] **Step 2: Add exact Perplexity entries and sources**

Append to `EXPLICIT_IDENTITY_CATALOG` before its closing bracket:

```ts
{ botId: "perplexity-user", botName: "Perplexity-User", providerId: "perplexity", providerName: "Perplexity", region: "global", purpose: "user_fetch", uaToken: "Perplexity-User", ruleSourceId: "perplexity_user" },
{ botId: "perplexitybot", botName: "PerplexityBot", providerId: "perplexity", providerName: "Perplexity", region: "global", purpose: "ai_search", uaToken: "PerplexityBot", ruleSourceId: "perplexity_bot" },
```

Add:

```ts
export const PERPLEXITY_RULE_SOURCES: readonly OfficialRuleSource[] = [
  { id: "perplexity_bot", url: "https://www.perplexity.com/perplexitybot.json" },
  { id: "perplexity_user", url: "https://www.perplexity.com/perplexity-user.json" },
];

export async function syncPerplexityRuleSources(db: D1Database, fetcher: typeof fetch = fetch, now = new Date()): Promise<void> {
  for (const source of PERPLEXITY_RULE_SOURCES) await syncRuleSource(db, source, fetcher, now);
}
```

Add `syncPerplexityRuleSources(env.DB)` as a third independent promise in `scheduledMaintenance()`.

- [ ] **Step 3: Run focused tests and typecheck**

```powershell
npm test -- test/identity.test.ts test/official-ip-rules.test.ts test/contract.test.ts
npm run typecheck
```

Expected: Perplexity tests pass; an OpenAI sync failure cannot prevent Perplexity sync or purge.

- [ ] **Step 4: Review and gated commit**

```powershell
git diff --check
git add workers/crawler-observer/src/identity.ts workers/crawler-observer/src/official-ip-rules.ts workers/crawler-observer/src/core.ts workers/crawler-observer/test/identity.test.ts workers/crawler-observer/test/official-ip-rules.test.ts workers/crawler-observer/test/contract.test.ts
git commit -m "feat: sync official Perplexity crawler ranges"
```

Expected: only Task 5 deltas are staged; commit requires explicit authorization.

---

### Task 6: Add China-Focused Declared-UA Candidates Without Strong Claims

**Files:**
- Modify: `workers/crawler-observer/src/identity.ts`
- Modify: `workers/crawler-observer/test/identity.test.ts`

**Interfaces:**
- Consumes: Task 1 catalog.
- Produces: four China-region candidates with `ruleSourceId: null`.

- [ ] **Step 1: Add failing exact-status tests**

```ts
it.each([
  ["Bytespider", "bytespider", "ai_training"],
  ["Baiduspider", "baiduspider", "search_index"],
  ["Sogou web spider", "sogou", "search_index"],
  ["360Spider", "360spider", "search_index"],
] as const)("recognizes %s as a China-region UA-only candidate", (ua, botId, purpose) => {
  expect(findIdentityCandidate(ua)).toMatchObject({ botId, region: "cn", purpose, ruleSourceId: null });
});
```

- [ ] **Step 2: Append the four catalog entries to `EXPLICIT_IDENTITY_CATALOG`**

```ts
{ botId: "bytespider", botName: "Bytespider", providerId: "bytedance", providerName: "ByteDance", region: "cn", purpose: "ai_training", uaToken: "Bytespider", ruleSourceId: null },
{ botId: "baiduspider", botName: "Baiduspider", providerId: "baidu", providerName: "Baidu", region: "cn", purpose: "search_index", uaToken: "Baiduspider", ruleSourceId: null },
{ botId: "sogou", botName: "Sogou Spider", providerId: "sogou", providerName: "Sogou", region: "cn", purpose: "search_index", uaToken: "Sogou", ruleSourceId: null },
{ botId: "360spider", botName: "360Spider", providerId: "360", providerName: "360 Search", region: "cn", purpose: "search_index", uaToken: "360Spider", ruleSourceId: null },
```

- [ ] **Step 3: Run the focused test**

```powershell
npm test -- test/identity.test.ts
npm run typecheck
```

Expected: all four entries resolve with `ruleSourceId: null`; no test labels them official.

- [ ] **Step 4: Review and gated commit**

```powershell
git diff --check
git add workers/crawler-observer/src/identity.ts workers/crawler-observer/test/identity.test.ts
git commit -m "feat: recognize major China crawler UAs"
```

Expected: only catalog and catalog tests staged; commit requires explicit authorization.

---

### Task 7: Write V2 Shadow Classification Without Changing V1

**Files:**
- Modify: `workers/crawler-observer/src/identity.ts`
- Modify: `workers/crawler-observer/src/core.ts`
- Modify: `workers/crawler-observer/test/identity.test.ts`
- Modify: `workers/crawler-observer/test/contract.test.ts`

**Interfaces:**
- Consumes: `findIdentityCandidate()`, `loadUsableRuleSet()`, `isIpInPrefixes()`, existing `classify()` and `observedPath()`.
- Produces: `classifyIdentity()`, independent `crawler_identity_counts` upsert, and V2 purge.

- [ ] **Step 1: Write failing four-level classification tests**

Tests must cover these exact results:

```ts
await expect(classifyIdentity({ userAgent: "GPTBot", clientIp: "203.0.113.8", openGeoVerified: false, genericAutomation: true }, db, now))
  .resolves.toMatchObject({ verificationStatus: "verified_official", verificationMethod: "official_ip_range" });

await expect(classifyIdentity({ userAgent: "GPTBot", clientIp: "198.51.100.8", openGeoVerified: false, genericAutomation: true }, db, now))
  .resolves.toMatchObject({ verificationStatus: "suspected_spoof" });

await expect(classifyIdentity({ userAgent: "ClaudeBot", clientIp: "198.51.100.8", openGeoVerified: false, genericAutomation: true }, db, now))
  .resolves.toMatchObject({ verificationStatus: "declared_unverified", verificationMethod: "ua_only" });

await expect(classifyIdentity({ userAgent: "curl/8.4.0", clientIp: "198.51.100.8", openGeoVerified: false, genericAutomation: true }, db, now))
  .resolves.toMatchObject({ verificationStatus: "other_automation", verificationMethod: "generic_bot" });
```

Add a stale-rule test proving GPTBot becomes `declared_unverified`, not `suspected_spoof`.

- [ ] **Step 2: Implement `classifyIdentity()`**

Add to `identity.ts`:

```ts
import { isIpInPrefixes, loadUsableRuleSet } from "./official-ip-rules";

export type IdentityInput = {
  userAgent: string;
  clientIp: string | null;
  openGeoVerified: boolean;
  genericAutomation: boolean;
};

function fromCandidate(candidate: IdentityCandidate, verificationStatus: VerificationStatus, verificationMethod: VerificationMethod): IdentityResult {
  const { uaToken: _uaToken, ruleSourceId: _ruleSourceId, ...identity } = candidate;
  return { ...identity, verificationStatus, verificationMethod };
}

export async function classifyIdentity(input: IdentityInput, db: D1Database, now = new Date()): Promise<IdentityResult | null> {
  if (input.openGeoVerified) {
    return { botId: "open-geo-self-test", botName: "Open GEO self-test", providerId: "open-geo", providerName: "Open GEO", region: "global", purpose: "self_test", verificationStatus: "verified_official", verificationMethod: "signed_hmac" };
  }
  const candidate = findIdentityCandidate(input.userAgent);
  if (!candidate) return input.genericAutomation ? otherAutomationIdentity() : null;
  if (!candidate.ruleSourceId || !input.clientIp) return fromCandidate(candidate, "declared_unverified", "ua_only");
  const ruleSet = await loadUsableRuleSet(db, candidate.ruleSourceId, now);
  if (!ruleSet) return fromCandidate(candidate, "declared_unverified", "ua_only");
  return fromCandidate(candidate, isIpInPrefixes(input.clientIp, ruleSet.prefixes) ? "verified_official" : "suspected_spoof", "official_ip_range");
}
```

- [ ] **Step 3: Integrate V2 after the V1 write and keep failures isolated**

In `observe()`, preserve the existing V1 classification and upsert first. Then compute V2 using only an in-memory client IP:

```ts
const legacy = await classify(request, env);
if (legacy) {
  await env.DB.prepare(
    "INSERT INTO crawler_counts (bucket_start, bot_id, bot_name, category, path, status, count) VALUES (?, ?, ?, ?, ?, ?, 1) ON CONFLICT(bucket_start, bot_id, category, path, status) DO UPDATE SET count = count + 1, bot_name = excluded.bot_name"
  ).bind(bucketStart(), legacy.id, legacy.name, legacy.category, observedPath(url.pathname), originResponse.status).run();
}

const identity = await classifyIdentity({
  userAgent: request.headers.get("User-Agent") ?? "",
  clientIp: request.headers.get("CF-Connecting-IP"),
  openGeoVerified: legacy?.category === "open_geo_self_test",
  genericAutomation: legacy?.category === "other_automation",
}, env.DB);

if (identity) {
  await env.DB.prepare(
    "INSERT INTO crawler_identity_counts (bucket_start, bot_id, bot_name, provider_id, provider_name, region, purpose, verification_status, verification_method, path, status, count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1) ON CONFLICT(bucket_start, bot_id, provider_id, purpose, verification_status, verification_method, path, status) DO UPDATE SET count = count + 1, bot_name = excluded.bot_name, provider_name = excluded.provider_name"
  ).bind(bucketStart(), identity.botId, identity.botName, identity.providerId, identity.providerName, identity.region, identity.purpose, identity.verificationStatus, identity.verificationMethod, observedPath(url.pathname), originResponse.status).run();
}
```

Keep the V1 upsert SQL semantically identical to the current query. If V2 classification or write throws after V1 succeeds, the outer `waitUntil(...catch(safeLog))` may log only the safe error name; the origin response remains unchanged.

- [ ] **Step 4: Extend purge and privacy tests**

Update `purge()` to delete old rows from both tables using `DB.batch()`:

```ts
await env.DB.batch([
  env.DB.prepare("DELETE FROM crawler_counts WHERE bucket_start < ?").bind(cutoff),
  env.DB.prepare("DELETE FROM crawler_identity_counts WHERE bucket_start < ?").bind(cutoff),
]);
```

Add a contract assertion that bound values and captured logs do not contain a test client IP, full UA suffix, query value, or rule response body.

- [ ] **Step 5: Run Worker integration tests**

```powershell
npm test -- test/identity.test.ts test/official-ip-rules.test.ts test/contract.test.ts
npm run typecheck
```

Expected: all pass; V1 count still increments when V2 is absent or fails; ordinary browser traffic writes neither V1 nor V2.

- [ ] **Step 6: Review and gated commit**

```powershell
git diff --check
git add workers/crawler-observer/src/identity.ts workers/crawler-observer/src/core.ts workers/crawler-observer/test/identity.test.ts workers/crawler-observer/test/contract.test.ts
git commit -m "feat: record crawler identity shadow results"
```

Expected: only Task 7 files staged; commit requires explicit authorization.

---

### Task 8: Extend the Private Worker Analytics Contract

**Files:**
- Modify: `workers/crawler-observer/src/core.ts`
- Modify: `workers/crawler-observer/test/contract.test.ts`
- Modify: `lib/crawler-analytics/worker-schema.ts`
- Modify: `lib/crawler-analytics/types.ts`
- Modify: `tests/lib/crawler-analytics-worker-schema.test.ts`
- Modify: `tests/lib/crawler-analytics-service.test.ts`
- Modify: `tests/api/admin-crawlers.test.ts`
- Modify: `tests/crawler-dashboard-page.test.tsx`
- Modify: `tests/components/admin/crawlers/CrawlerDashboard.test.tsx`

**Interfaces:**
- Consumes: Task 7 `crawler_identity_counts` and rule status rows.
- Produces: strict `identityPreview` on every successful V2 Worker analytics response, while the Next.js parser temporarily accepts a V1 response with the field absent so an automatic Vercel deployment cannot break the existing dashboard before the D1 migration and Worker rollout finish.

- [ ] **Step 1: Lock the new response shape in Worker and Zod tests**

Use this exact shape in all fixtures:

```ts
identityPreview: {
  mode: "shadow",
  shadowStartedAt: "2026-08-06T00:00:00.000Z",
  summary: {
    requests: 4,
    verifiedOfficial: 1,
    declaredUnverified: 1,
    suspectedSpoof: 1,
    otherAutomation: 1,
  },
  bots: [{
    id: "gptbot",
    name: "GPTBot",
    providerId: "openai",
    providerName: "OpenAI",
    verificationStatus: "verified_official",
    verificationMethod: "official_ip_range",
    requests: 1,
  }],
  rules: [
    { sourceId: "openai_gptbot", lastAttemptAt: "2026-08-06T00:00:00.000Z", lastSuccessAt: "2026-08-06T00:00:00.000Z", state: "fresh" },
    { sourceId: "openai_searchbot", lastAttemptAt: null, lastSuccessAt: null, state: "unavailable" },
    { sourceId: "openai_chatgpt_user", lastAttemptAt: null, lastSuccessAt: null, state: "unavailable" },
    { sourceId: "perplexity_bot", lastAttemptAt: null, lastSuccessAt: null, state: "unavailable" },
    { sourceId: "perplexity_user", lastAttemptAt: null, lastSuccessAt: null, state: "unavailable" },
  ],
},
```

Add negative tests for a summary whose four statuses do not sum to `requests`, unknown status/method values, more than 100 bot rows, and a rule row containing any unexpected property such as `prefixes`.

- [ ] **Step 2: Add Worker D1 queries and response mapping**

Append these exact statements to the existing `statements` array, binding `queryStart` and `queryEnd` to the first two:

```ts
env.DB.prepare(
  "SELECT verification_status, SUM(count) requests FROM crawler_identity_counts WHERE bucket_start >= ? AND bucket_start < ? GROUP BY verification_status"
).bind(queryStart, queryEnd),
env.DB.prepare(
  "SELECT bot_id, bot_name, provider_id, provider_name, verification_status, verification_method, SUM(count) requests FROM crawler_identity_counts WHERE bucket_start >= ? AND bucket_start < ? GROUP BY bot_id, bot_name, provider_id, provider_name, verification_status, verification_method ORDER BY requests DESC LIMIT 100"
).bind(queryStart, queryEnd),
env.DB.prepare(
  "SELECT source_id, last_attempt_at, last_success_at, last_error_code FROM crawler_rule_sets ORDER BY source_id"
),
env.DB.prepare(
  "SELECT value FROM crawler_identity_meta WHERE key = 'shadow_started_at'"
),
```

Keep the original six statement indexes unchanged and assign the new rows to indexes 6 through 9.

Build the response against the locked five-source list, not only the rows returned by D1. This guarantees that a source which has never synchronized is still visible as `unavailable`:

```ts
const RULE_SOURCE_IDS = [
  "openai_gptbot",
  "openai_searchbot",
  "openai_chatgpt_user",
  "perplexity_bot",
  "perplexity_user",
] as const;

const identityStatuses: Record<VerificationStatus, number> = {
  verified_official: 0,
  declared_unverified: 0,
  suspected_spoof: 0,
  other_automation: 0,
};
for (const item of rows(6)) {
  const status = stringValue(item, "verification_status");
  if (status in identityStatuses) {
    identityStatuses[status as VerificationStatus] = numberValue(item, "requests");
  }
}

const ruleRows = new Map(rows(8).map((item) => [stringValue(item, "source_id"), item]));
const shadowStartedAt = stringValue(rows(9)[0] ?? {}, "value");
if (Number.isNaN(Date.parse(shadowStartedAt))) {
  return jsonResponse({ error: "identity_shadow_not_initialized" }, 503);
}
```

Add `identityPreview` to the existing success object with this exact mapping:

```ts
identityPreview: {
  mode: "shadow",
  shadowStartedAt,
  summary: {
    requests: Object.values(identityStatuses).reduce((total, count) => total + count, 0),
    verifiedOfficial: identityStatuses.verified_official,
    declaredUnverified: identityStatuses.declared_unverified,
    suspectedSpoof: identityStatuses.suspected_spoof,
    otherAutomation: identityStatuses.other_automation,
  },
  bots: rows(7).map((item) => ({
    id: stringValue(item, "bot_id"),
    name: stringValue(item, "bot_name"),
    providerId: stringValue(item, "provider_id"),
    providerName: stringValue(item, "provider_name"),
    verificationStatus: stringValue(item, "verification_status"),
    verificationMethod: stringValue(item, "verification_method"),
    requests: numberValue(item, "requests"),
  })),
  rules: RULE_SOURCE_IDS.map((sourceId) => {
    const row = ruleRows.get(sourceId);
    const lastAttemptAt = row ? stringValue(row, "last_attempt_at") : null;
    const lastSuccessAt = row ? stringValue(row, "last_success_at") || null : null;
    const lastErrorCode = row ? stringValue(row, "last_error_code") || null : null;
    return {
      sourceId,
      lastAttemptAt,
      lastSuccessAt,
      state: ruleState(lastSuccessAt, lastErrorCode, generatedAt),
    };
  }),
},
```

Because a never-attempted source has no timestamp, its `lastAttemptAt` is `null`; do not fabricate a timestamp from migration or request time.

Map rule state exactly:

```ts
type RuleState = "fresh" | "last_known_good" | "unavailable";

function ruleState(lastSuccessAt: string | null, lastErrorCode: string | null, now: Date): RuleState {
  if (lastSuccessAt === null) return "unavailable";
  const age = now.getTime() - Date.parse(lastSuccessAt);
  if (!Number.isFinite(age) || age < 0 || age > 7 * 24 * 60 * 60 * 1000) return "unavailable";
  return lastErrorCode !== null || age >= 24 * 60 * 60 * 1000 ? "last_known_good" : "fresh";
}
```

Do not return source URLs, CIDRs, hashes, IPs, UA strings or remote bodies.

- [ ] **Step 3: Implement the strict Zod schema and sum invariant**

Add these exported enums and the `identityPreview` object to `crawlerAnalyticsWorkerSchema`. Keep the object internally strict, but mark the whole field `.optional()` during the V1-to-V2 rollout window; the dashboard renders it only when present. Add schema, service and component tests proving a field-absent V1 response remains valid and does not render the V2 section:

```ts
export const verificationStatusSchema = z.enum([
  "verified_official",
  "declared_unverified",
  "suspected_spoof",
  "other_automation",
]);
export const verificationMethodSchema = z.enum([
  "official_ip_range",
  "signed_hmac",
  "ua_only",
  "generic_bot",
]);
export const ruleSourceIdSchema = z.enum([
  "openai_gptbot",
  "openai_searchbot",
  "openai_chatgpt_user",
  "perplexity_bot",
  "perplexity_user",
]);
```

The rule row schema is strict and uses `sourceId: ruleSourceIdSchema`, `lastAttemptAt: z.string().datetime().nullable()`, `lastSuccessAt: z.string().datetime().nullable()`, and `state: z.enum(["fresh", "last_known_good", "unavailable"])`. A never-attempted source returns both timestamps as `null`; an unavailable source with no successful sync returns `lastSuccessAt: null`. The `rules` array has exactly five rows (`.length(5)`), and the `bots` array is limited to 100 rows. In `superRefine`, compare `new Set(value.identityPreview.rules.map((rule) => rule.sourceId))` with `ruleSourceIdSchema.options`; reject duplicates or any missing source so all five locked sources appear exactly once.

```ts
const identityTotal = value.identityPreview.summary.verifiedOfficial
  + value.identityPreview.summary.declaredUnverified
  + value.identityPreview.summary.suspectedSpoof
  + value.identityPreview.summary.otherAutomation;
if (value.identityPreview.summary.requests !== identityTotal) {
  context.addIssue({
    code: z.ZodIssueCode.custom,
    path: ["identityPreview", "summary", "requests"],
    message: "identity preview total must equal verification status totals",
  });
}
```

- [ ] **Step 4: Update every typed fixture and service/API contract test**

Add the same valid `identityPreview` fixture to the five root test files listed above. Keep the observer URL, HMAC canonical string, Basic Auth, `private, no-store`, 401/405 behavior and V1 fields unchanged.

- [ ] **Step 5: Run Worker and root contract tests**

```powershell
Set-Location E:\project\personal-website\workers\crawler-observer
npm test -- test/contract.test.ts
npm run typecheck
Set-Location E:\project\personal-website
npm test -- tests/lib/crawler-analytics-worker-schema.test.ts tests/lib/crawler-analytics-service.test.ts tests/api/admin-crawlers.test.ts tests/crawler-dashboard-page.test.tsx tests/components/admin/crawlers/CrawlerDashboard.test.tsx
npm run typecheck
```

Expected: all tests pass; a response containing raw verification rules is rejected by Zod.

- [ ] **Step 6: Review and gated commit**

```powershell
git diff --check
git add workers/crawler-observer/src/core.ts workers/crawler-observer/test/contract.test.ts lib/crawler-analytics/worker-schema.ts lib/crawler-analytics/types.ts tests/lib/crawler-analytics-worker-schema.test.ts tests/lib/crawler-analytics-service.test.ts tests/api/admin-crawlers.test.ts tests/crawler-dashboard-page.test.tsx tests/components/admin/crawlers/CrawlerDashboard.test.tsx
git commit -m "feat: expose crawler identity shadow analytics"
```

Expected: only Task 8 contract files staged; commit requires explicit authorization.

---

### Task 9: Render the Minimal V2.1 Shadow Preview

**Files:**
- Modify: `components/admin/crawlers/CrawlerDashboard.tsx`
- Modify: `config/copy/crawler-dashboard.ts`
- Modify: `tests/components/admin/crawlers/CrawlerDashboard.test.tsx`

**Interfaces:**
- Consumes: strict `identityPreview` from Task 8.
- Produces: four preview cards, identity table column, rule freshness text, and no new navigation layer.

- [ ] **Step 1: Write failing accessible UI tests**

Add assertions for:

```ts
expect(screen.getByText("V2 身份验证预览")).toBeInTheDocument();
expect(screen.getByText("官方可信")).toBeInTheDocument();
expect(screen.getByText("仅声明身份")).toBeInTheDocument();
expect(screen.getByText("疑似伪装")).toBeInTheDocument();
expect(screen.getByText("其他自动化")).toBeInTheDocument();
expect(screen.getByText("官方 IP 范围")).toBeInTheDocument();
expect(screen.getByText(/影子模式不会改变当前正式统计/)).toBeInTheDocument();
expect(screen.getByText(/2026-08-06T00:00:00.000Z/)).toBeInTheDocument();
```

Also assert that rendered text does not include `203.0.113.8`, CIDR syntax, `CF-Connecting-IP`, or a complete User-Agent fixture.

- [ ] **Step 2: Add locked Chinese copy**

Add these keys in `crawler-dashboard.ts`:

```ts
identityPreview: {
  title: "V2 身份验证预览",
  description: "影子模式不会改变当前正式统计；验证结果仅用于 7 天观察。",
  total: "V2 自动化请求",
  statuses: {
    verified_official: "官方可信",
    declared_unverified: "仅声明身份",
    suspected_spoof: "疑似伪装",
    other_automation: "其他自动化",
  },
  methods: {
    official_ip_range: "官方 IP 范围",
    signed_hmac: "签名验证",
    ua_only: "User-Agent 声明",
    generic_bot: "通用自动化识别",
  },
  rules: {
    fresh: "规则今天同步成功",
    last_known_good: "正在使用最近有效规则",
    unavailable: "官方规则当前不可用",
  },
  ruleUpdatedAt: "规则最近更新时间",
  neverSynced: "尚无成功同步",
  ruleSources: {
    openai_gptbot: "OpenAI GPTBot",
    openai_searchbot: "OpenAI OAI-SearchBot",
    openai_chatgpt_user: "OpenAI ChatGPT-User",
    perplexity_bot: "PerplexityBot",
    perplexity_user: "Perplexity-User",
  },
},
```

- [ ] **Step 3: Render only the approved minimal UI**

In `CrawlerDashboard.tsx`, add this component and render it after the current V1 cards and before the trend:

```tsx
function IdentityPreview({ preview }: { preview: CrawlerAnalyticsResponse["identityPreview"] }) {
  const cards = [
    [copy.identityPreview.statuses.verified_official, preview.summary.verifiedOfficial],
    [copy.identityPreview.statuses.declared_unverified, preview.summary.declaredUnverified],
    [copy.identityPreview.statuses.suspected_spoof, preview.summary.suspectedSpoof],
    [copy.identityPreview.statuses.other_automation, preview.summary.otherAutomation],
  ] as const;
  return <section aria-labelledby="identity-preview-title" className="border-t border-hairline pt-5">
    <h2 id="identity-preview-title" className="text-lg font-semibold">{copy.identityPreview.title}</h2>
    <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy.identityPreview.description}</p>
    <div className="mt-4 grid grid-cols-1 gap-px border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(([label, value]) => <section key={label} className="bg-surface-paper p-5"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-3 text-3xl font-semibold">{value}</p></section>)}
    </div>
    <DataTable title={copy.bots}>
      <table className={tableClass}><thead className="text-muted-foreground"><tr><th className={cellClass}>名称</th><th className={cellClass}>厂商</th><th className={cellClass}>身份</th><th className={cellClass}>验证方法</th><th className={cellClass}>{copy.requests}</th></tr></thead>
        <tbody>{preview.bots.map((row) => <tr key={`${row.id}:${row.providerId}:${row.verificationStatus}:${row.verificationMethod}`}><td className={cellClass}>{row.name}</td><td className={cellClass}>{row.providerName}</td><td className={cellClass}>{copy.identityPreview.statuses[row.verificationStatus]}</td><td className={cellClass}>{copy.identityPreview.methods[row.verificationMethod]}</td><td className={cellClass}>{row.requests}</td></tr>)}</tbody>
      </table>
    </DataTable>
    <div className="mt-4 space-y-1 text-sm text-muted-foreground">
      {preview.rules.map((rule) => <p key={rule.sourceId}>{copy.identityPreview.ruleSources[rule.sourceId]}：{copy.identityPreview.rules[rule.state]}；{copy.identityPreview.ruleUpdatedAt}：{rule.lastSuccessAt ?? copy.identityPreview.neverSynced}</p>)}
    </div>
  </section>;
}
```

Do not add filters, drawers, modals, alerts, exports or new routes. Keep the identity table inside the existing `overflow-x-auto` `DataTable` wrapper.

- [ ] **Step 4: Run component, page and API tests**

```powershell
Set-Location E:\project\personal-website
npm test -- tests/components/admin/crawlers/CrawlerDashboard.test.tsx tests/crawler-dashboard-page.test.tsx tests/api/admin-crawlers.test.ts
npm run typecheck
```

Expected: tests pass; current 24h/7d/30d links and V1 sections remain present.

- [ ] **Step 5: Review and gated commit**

```powershell
git diff --check
git add components/admin/crawlers/CrawlerDashboard.tsx config/copy/crawler-dashboard.ts tests/components/admin/crawlers/CrawlerDashboard.test.tsx
git commit -m "feat: preview crawler identity verification"
```

Expected: only UI/copy/test files staged; commit requires explicit authorization.

---

### Task 10: Run the Complete Local Acceptance Gate

**Files:** No new files unless a test failure proves an in-scope implementation defect. Do not create evidence documents.

**Interfaces:**
- Consumes: Tasks 1-9.
- Produces: a local implementation receipt and exact diff boundary.

- [ ] **Step 1: Run the full Worker suite**

```powershell
Set-Location E:\project\personal-website\workers\crawler-observer
npm test
npm run typecheck
npm run dry-run
```

Expected: all Worker tests pass, typecheck passes, dry-run succeeds without creating remote state.

- [ ] **Step 2: Run the full application suite**

```powershell
Set-Location E:\project\personal-website
npm test
npm run typecheck
npm run lint
npm run build
```

Expected: tests, typecheck and build pass; lint has no new errors. Existing warnings must be reported separately and not repaired unless caused by V2.1.

- [ ] **Step 3: Run privacy and scope scans**

```powershell
rg -n "CF-Connecting-IP|prefixes_json|source_url|content_sha256" components app lib
rg -n "console\.(log|error).*User-Agent|console\.(log|error).*CF-Connecting-IP" workers/crawler-observer/src
git diff --check
git status --short
git diff --stat
```

Expected: frontend/server response code contains none of the Worker-only rule fields; no log statement includes raw UA or client IP; user-owned dirty files remain unstaged and unchanged by the task.

- [ ] **Step 4: Stop for review**

Report: exact changed files, test results, unresolved warnings, and the boundary “implemented locally; not committed/pushed/deployed” unless the user separately authorized those actions.

---

### Task 11: Commit, Push, Migrate, and Deploy Only Under Separate Gates

**Files:** No additional source changes expected.

**Interfaces:**
- Consumes: a clean reviewed Task 10 implementation and explicit authorization for each external action.
- Produces: deployed V2.1 shadow mode without changing V1 default semantics.

- [ ] **Step 1: Git preflight and task-only commit sequence**

The `git_operator` must re-check branch, full HEAD, remote and staged files. Use the task commit messages from Tasks 1-9 or a user-approved squash strategy. Never stage the user-owned paths in Global Constraints.

- [ ] **Step 2: Push only after explicit push authorization**

```powershell
git push origin main
```

Expected: remote `main` advances only to the reviewed task commit; record the full pushed SHA.

Because pushing `main` can automatically deploy Next.js before the Worker is migrated, wait for that Vercel deployment and perform an authenticated read-only check against the still-V1 Worker response. The dashboard/API must remain healthy and must omit the V2 preview rather than return 502. Do not begin the D1 migration until this compatibility check passes.

- [ ] **Step 3: Cloudflare identity and migration preflight**

Run from `workers/crawler-observer` as `release_operator`:

```powershell
npx wrangler whoami
npx wrangler d1 migrations list personal-website-crawler-observer --remote
npm run dry-run
```

Expected: authenticated account and D1 binding match the current personal website project; `0002_identity_shadow.sql` is pending; dry-run passes. A mismatch stops deployment.

- [ ] **Step 4: Apply exactly migration 0002 and deploy the Worker**

Only after explicit Cloudflare production authorization:

```powershell
npx wrangler d1 migrations apply personal-website-crawler-observer --remote
npx wrangler deploy
```

Expected: migration 0002 applied once; Worker deploy produces a current version receipt. Do not change routes, secrets, DNS, Bot Fight Mode, WAF or DDoS settings.

- [ ] **Step 5: Confirm the Vercel deployment for the pushed SHA**

The `release_operator` must verify that `me.itheheda.online` serves the pushed SHA through the repository's existing automatic deployment path. Do not create a manual production deployment if the automatic deployment is healthy.

- [ ] **Step 6: Execute production read-only QA**

Validate:

- homepage, About, robots.txt and representative static assets return their previous successful status;
- unauthenticated dashboard/API remain 401 with Basic challenge and no-store;
- authenticated 24h/7d/30d API responses pass the strict V1 + `identityPreview` schema;
- Worker custom-domain unauthenticated read remains 401, POST remains 405 with `Allow: GET`, other paths remain 404, all no-store and no CORS;
- V2 preview states `mode: shadow` and V1 numbers remain the default official statistics;
- desktop and 390×844 mobile layouts have no page-level overflow or fixed obstruction.

Any first divergence stops the rollout. Do not delete D1 data or alter security controls as an automatic rollback.

---

### Task 12: Observe Seven Days and Decide Whether to Promote

**Files:** No code change during observation unless a confirmed V2.1 defect receives a new repair authorization.

**Interfaces:**
- Consumes: production `shadowStartedAt`, V1 aggregates, V2 aggregates and rule status.
- Produces: a user decision to continue shadow mode, repair, or promote.

- [ ] **Step 1: Record the authoritative shadow start**

Read `identityPreview.shadowStartedAt` from the authenticated production API and record it in the task commentary/receipt. Do not reconstruct it from deployment time or chat history.

- [ ] **Step 2: Perform read-only checks during the seven-day window**

At minimum inspect the first day and the seventh day:

- V2 total equals its four statuses;
- every V1 identified crawler has an explainable V2 result;
- stale or unavailable sources never produce trusted or spoofed conclusions;
- rule rows contain no prefix/IP data;
- public site and authenticated dashboard remain healthy.

Monitoring does not authorize configuration changes, retries of failed deployments, or WAF changes.

- [ ] **Step 3: Present the promotion decision**

Report observed counts, classification gaps, rule freshness, production health and any unverified boundary. Ask the user to choose one action:

1. keep V2.1 in shadow mode;
2. authorize a scoped repair;
3. approve a separate design for promoting V2 to default semantics.

Do not promote automatically.
