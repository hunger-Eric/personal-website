import { execFileSync } from "node:child_process";

function encodeRepositoryPath(path) {
  return path.split("/").map(encodeURIComponent).join("/");
}

export function fetchGitHubDocument(source, documentPath) {
  const endpoint = `repos/${source.repository}/contents/${encodeRepositoryPath(
    documentPath
  )}?ref=${encodeURIComponent(source.ref)}`;
  const response = execFileSync("gh", ["api", endpoint], {
    encoding: "utf8",
    maxBuffer: 5 * 1024 * 1024,
    windowsHide: true,
  });
  const payload = JSON.parse(response);
  if (payload.type !== "file" || payload.encoding !== "base64") {
    throw new Error(`GitHub source is not a base64 file: ${documentPath}`);
  }

  return {
    path: documentPath,
    sha: payload.sha,
    content: Buffer.from(payload.content.replace(/\n/g, ""), "base64").toString(
      "utf8"
    ),
  };
}

export function fetchSourceDocuments(source) {
  return source.documents.map((documentPath) =>
    fetchGitHubDocument(source, documentPath)
  );
}
