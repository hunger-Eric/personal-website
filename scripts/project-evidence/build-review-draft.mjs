import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { fetchSourceDocuments } from "./fetch-github-docs.mjs";
import { readSourceManifest } from "./read-source-manifest.mjs";

const outputRoot = resolve(".artifacts/project-evidence");
const manifest = await readSourceManifest();
await mkdir(outputRoot, { recursive: true });

const summary = [];
for (const source of manifest.sources) {
  const documents = fetchSourceDocuments(source);
  const draft = {
    generatedAt: new Date().toISOString(),
    source: {
      id: source.id,
      repository: source.repository,
      ref: source.ref,
      visibility: source.visibility,
    },
    documents,
    candidatePublicFacts: {},
    reviewChecklist: {
      currentStateReconciled: false,
      runtimeEvidenceChecked: false,
      privacyReviewed: false,
      wordingApprovedBySiteOwner: false,
    },
  };
  const outputPath = resolve(outputRoot, `${source.id}.review.json`);
  await writeFile(outputPath, `${JSON.stringify(draft, null, 2)}\n`, "utf8");
  summary.push({ id: source.id, documentCount: documents.length });
}

process.stdout.write(
  `${JSON.stringify({ outputRoot, sourceCount: summary.length, sources: summary })}\n`
);
