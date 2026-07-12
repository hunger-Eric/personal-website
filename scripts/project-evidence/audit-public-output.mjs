import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const sensitivePatterns = [
  /^[a-z]:[\\/]/i,
  /^\/(?:home|users|private|var|srv|opt|workspace)\//i,
  /\bghp_[a-z0-9]{20,}\b/i,
  /\bgithub_pat_[a-z0-9_]{20,}\b/i,
  /\bsk-[a-z0-9_-]{16,}\b/i,
  /\bbearer\s+[a-z0-9._~+\/-]{8,}\b/i,
  /(?:api[_ -]?key|secret|token)\s*[:=]\s*[a-z0-9._~+\/-]{8,}/i,
];

function collectStrings(value, output = []) {
  if (typeof value === "string") output.push(value.trim());
  else if (Array.isArray(value)) value.forEach((item) => collectStrings(item, output));
  else if (value && typeof value === "object") {
    Object.values(value).forEach((item) => collectStrings(item, output));
  }
  return output;
}

export function auditPublicCases(cases) {
  if (!Array.isArray(cases)) throw new Error("Public case output must be an array");
  let stringCount = 0;
  for (const project of cases) {
    const values = collectStrings(project);
    stringCount += values.length;
    const unsafe = values.find((value) =>
      sensitivePatterns.some((pattern) => pattern.test(value))
    );
    if (unsafe) {
      throw new Error(`Public case ${project?.id ?? "unknown"} contains unsafe data`);
    }
    if (
      project?.sourceVisibility === "private-curated" &&
      values.some((value) => /^https:\/\/(?:www\.)?github\.com\//i.test(value))
    ) {
      throw new Error(
        `Public case ${project?.id ?? "unknown"} exposes a private source link`
      );
    }
  }
  return { caseCount: cases.length, stringCount };
}

const isCli =
  process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]);

if (isCli) {
  const publicCasesPath = resolve("config/public-project-cases.json");
  const cases = JSON.parse(await readFile(publicCasesPath, "utf8"));
  process.stdout.write(`${JSON.stringify(auditPublicCases(cases))}\n`);
}
