import { readFile } from "node:fs/promises";
import { isAbsolute, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const REPOSITORY_PATTERN = /^[a-z0-9_.-]+\/[a-z0-9_.-]+$/i;
const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function assertLocalOnlyPath(manifestPath) {
  const resolved = resolve(manifestPath);
  const segments = normalize(resolved).split(sep);
  if (!segments.includes(".private")) {
    throw new Error("Project source manifests must stay inside a .private directory");
  }
  return resolved;
}

function validateDocumentPath(documentPath, sourceId) {
  if (
    typeof documentPath !== "string" ||
    !documentPath.trim() ||
    isAbsolute(documentPath) ||
    documentPath.includes("\\") ||
    documentPath.split("/").includes("..")
  ) {
    throw new Error(`Invalid document path for ${sourceId}`);
  }
  return documentPath;
}

function validateSource(source) {
  if (!source || typeof source !== "object") {
    throw new Error("Each project source must be an object");
  }
  if (!ID_PATTERN.test(source.id ?? "")) {
    throw new Error("Each project source requires a stable kebab-case id");
  }
  if (!REPOSITORY_PATTERN.test(source.repository ?? "")) {
    throw new Error(`Invalid repository identifier for ${source.id}`);
  }
  if (typeof source.ref !== "string" || !source.ref.trim()) {
    throw new Error(`Missing ref for ${source.id}`);
  }
  if (source.visibility !== "public" && source.visibility !== "private") {
    throw new Error(`Invalid visibility for ${source.id}`);
  }
  if (!Array.isArray(source.documents) || source.documents.length === 0) {
    throw new Error(`No source documents configured for ${source.id}`);
  }
  if (source.documents.length > 30) {
    throw new Error(`Too many source documents configured for ${source.id}`);
  }

  return {
    id: source.id,
    repository: source.repository,
    ref: source.ref,
    visibility: source.visibility,
    documents: source.documents.map((path) =>
      validateDocumentPath(path, source.id)
    ),
  };
}

export async function readSourceManifest(
  manifestPath = resolve(".private/project-sources.json")
) {
  const localPath = assertLocalOnlyPath(manifestPath);
  const input = JSON.parse(await readFile(localPath, "utf8"));
  if (input?.version !== 1 || !Array.isArray(input.sources)) {
    throw new Error("Project source manifest must use version 1 and a sources array");
  }

  const sources = input.sources.map(validateSource);
  const ids = new Set();
  for (const source of sources) {
    if (ids.has(source.id)) throw new Error(`Duplicate source id: ${source.id}`);
    ids.add(source.id);
  }

  return { version: 1, sources };
}

const isCli =
  process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]);

if (isCli) {
  const manifest = await readSourceManifest();
  process.stdout.write(
    `${JSON.stringify({ version: manifest.version, sourceCount: manifest.sources.length })}\n`
  );
}
