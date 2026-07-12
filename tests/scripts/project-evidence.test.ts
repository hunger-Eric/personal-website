import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  assertLocalOnlyPath,
  readSourceManifest,
} from "@/scripts/project-evidence/read-source-manifest.mjs";
import { auditPublicCases } from "@/scripts/project-evidence/audit-public-output.mjs";

describe("project evidence manifest", () => {
  it("accepts a local-only manifest with bounded source documents", async () => {
    const root = await mkdtemp(join(tmpdir(), "project-evidence-"));
    const privateDir = join(root, ".private");
    const manifestPath = join(privateDir, "project-sources.json");
    await import("node:fs/promises").then(({ mkdir }) =>
      mkdir(privateDir, { recursive: true })
    );
    await writeFile(
      manifestPath,
      JSON.stringify({
        version: 1,
        sources: [
          {
            id: "case-source",
            repository: "owner/repository",
            ref: "main",
            visibility: "private",
            documents: ["README.md", "docs/PROJECT-STATE.md"],
          },
        ],
      })
    );

    await expect(readSourceManifest(manifestPath)).resolves.toMatchObject({
      version: 1,
    });
  });

  it("rejects manifests outside the local-only private directory", () => {
    expect(() =>
      assertLocalOnlyPath("E:/project/personal-website/config/project-sources.json")
    ).toThrow(/\.private/);
  });
});

describe("public project evidence audit", () => {
  it("rejects internal paths and credential-like strings recursively", () => {
    expect(() =>
      auditPublicCases([
        {
          id: "unsafe-case",
          limitations: [{ zh: "C:\\Users\\owner\\private", en: "safe" }],
        },
      ])
    ).toThrow(/unsafe-case/);
  });

  it("accepts a public-safe empty collection", () => {
    expect(auditPublicCases([])).toEqual({ caseCount: 0, stringCount: 0 });
  });
});
