import { createHash } from "node:crypto";

import {
  ExtractedSourceSchema,
  SourceBoundArticleProposalSchema,
  type ArticlePublicationRecord,
  type ExtractedSource,
  type SourceBoundArticleProposal,
} from "./contracts";
import { canonicalizePublicHttpUrl } from "./safe-url";

const FORMAT_ERROR = "ARTICLE_FORMAT_INVALID";

export interface ArticlePublicationDefaults {
  date: string;
  author: string;
}

export interface FormattedArticle {
  publicationRecord: ArticlePublicationRecord;
  renderedMdx: string;
}

/**
 * The hash is SHA-256 of the LF-normalized final document with the
 * `contentHash` frontmatter line omitted. This makes the representation stable
 * without making the hash self-referential.
 */
export function formatArticle(input: {
  article: SourceBoundArticleProposal;
  sources: readonly ExtractedSource[];
  defaults: ArticlePublicationDefaults;
}): FormattedArticle {
  const article = parseArticle(input.article);
  const sources = parseSources(input.sources);
  const defaults = parseDefaults(input.defaults);
  rejectExtractedSourceReplay(article, sources);
  const body = normalizeBody(article.body);
  validateSafeMdxBody(body);
  const citedSourceIds = citationIds(body, sources, article);
  const renderedBody = renderBody(body, citedSourceIds, sources);
  const frontmatterWithoutHash = renderFrontmatter(article, defaults);
  const canonicalWithoutHash = `${frontmatterWithoutHash}---\n\n${renderedBody}`;
  const contentHash = `sha256:${createHash("sha256").update(canonicalWithoutHash, "utf8").digest("hex")}`;
  const renderedMdx = `${frontmatterWithoutHash}contentHash: ${yamlString(contentHash)}\n---\n\n${renderedBody}`;
  const slug = article.slugProposal;

  return { publicationRecord: { title: article.title, body: renderedMdx, slug, contentHash, path: `content/articles/${defaults.date}-${slug}.mdx` }, renderedMdx };
}

/**
 * The model owns prose, but source-page text is evidence, not browser output.
 * This deliberately only normalizes whitespace before comparing; it never
 * synthesizes substitute wording for the model or an editor.
 */
function rejectExtractedSourceReplay(article: SourceBoundArticleProposal, sources: readonly ExtractedSource[]): void {
  const sourceTexts = sources.map((source) => normalizedEvidence(source.content));
  const browserText = [
    article.title,
    article.summary,
    ...article.tags,
    article.body.replace(/\[\[S\d{3}\]\]/g, ""),
    ...article.sourceAssessments.map((assessment) => assessment.rationale),
  ].map(normalizedEvidence);
  const claims = article.sourceAssessments.flatMap((assessment) => assessment.claimsSupported);
  const claimTexts = [claims.join(" "), claims.join("")].map(normalizedEvidence);
  if (sourceTexts.some((sourceText) => sourceText && [...browserText, ...claimTexts].some((text) => text.includes(sourceText)))) throw formatError();
}

function normalizedEvidence(value: string): string {
  return value.replace(/\r\n?/g, "\n").replace(/\s+/g, " ").trim();
}

function parseArticle(input: SourceBoundArticleProposal): SourceBoundArticleProposal {
  try {
    return SourceBoundArticleProposalSchema.parse({ ...input, slugProposal: normalizeSlug(input.slugProposal) });
  } catch {
    throw formatError();
  }
}

function parseSources(input: readonly ExtractedSource[]): ExtractedSource[] {
  try {
    const sources = input.map((source) => ExtractedSourceSchema.parse(source));
    const ids = new Set(sources.map((source) => source.id));
    if (sources.length < 2 || ids.size !== sources.length) throw formatError();
    return sources.map((source) => ({ ...source, url: canonicalizePublicHttpUrl(source.url), title: safeSourceLabel(source.title), ...(source.publisher ? { publisher: safeSourceLabel(source.publisher) } : {}) }));
  } catch {
    throw formatError();
  }
}

function parseDefaults(input: ArticlePublicationDefaults): ArticlePublicationDefaults {
  const date = input.date?.trim();
  const author = input.author?.trim();
  if (!date || !author || !isIsoDate(date)) throw formatError();
  return { date, author };
}

function normalizeSlug(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function normalizeBody(value: string): string {
  return value.replace(/\r\n?/g, "\n").trim();
}

function citationIds(
  body: string,
  sources: readonly ExtractedSource[],
  article: SourceBoundArticleProposal
): string[] {
  const sourceIds = new Set(sources.map((source) => source.id));
  const tokens = [...body.matchAll(/\[\[([^\]]*)\]\]/g)].map((match) => match[1]);
  if (!tokens.length || tokens.some((id) => !/^S\d{3}$/.test(id) || !sourceIds.has(id))) throw formatError();
  if (body.replace(/\[\[S\d{3}\]\]/g, "").includes("[[") || body.replace(/\[\[S\d{3}\]\]/g, "").includes("]]")) throw formatError();

  const cited = [...new Set(tokens)];
  const assessed = new Set(article.sourceAssessments.map((assessment) => assessment.sourceId));
  if (
    cited.length < 2 ||
    assessed.size !== article.sourceAssessments.length ||
    assessed.size !== sourceIds.size ||
    cited.length !== assessed.size ||
    cited.some((id) => !assessed.has(id)) ||
    [...assessed].some((id) => !sourceIds.has(id))
  ) throw formatError();
  return cited;
}

function validateSafeMdxBody(body: string): void {
  const executableText = maskCode(body);
  if (
    /^\s*#(?!#)\s+/m.test(executableText) ||
    /^\s*#{1,6}\s*(?:sources|参考来源|相关链接)\s*[:：]?\s*$/im.test(executableText) ||
    /https?:\/\/|(^|[^:])\/\/\S|(?:^|[\s(\[])www\./im.test(executableText) ||
    /^\s*(?:import|export)\b/m.test(executableText) ||
    /<\/?[A-Za-z][^>]*>/m.test(executableText) ||
    /[{}]/.test(executableText)
  ) {
    throw formatError();
  }
}

function renderBody(body: string, citedIds: readonly string[], sources: readonly ExtractedSource[]): string {
  const citationNumber = new Map(citedIds.map((id, index) => [id, index + 1]));
  const citedSources = citedIds.map((id) => sources.find((source) => source.id === id)!);
  const citedBody = body.replace(/\[\[(S\d{3})\]\]/g, (_token, id: string) => `〔${citationNumber.get(id)}〕`);
  const references = citedSources.map((source, index) => `${index + 1}. [${source.title}](${markdownDestination(source.url)})${source.publisher ? `（${source.publisher}）` : ""}`).join("\n");
  return `${citedBody}\n\n## 参考来源\n\n${references}\n\n## 相关链接\n\n- [项目](/projects)\n- [服务](/services)\n- [联系](/contact)\n`;
}

function renderFrontmatter(article: SourceBoundArticleProposal, defaults: ArticlePublicationDefaults): string {
  return `---\ntitle: ${yamlString(article.title)}\nslug: ${yamlString(article.slugProposal)}\nsummary: ${yamlString(article.summary)}\ndate: ${yamlString(defaults.date)}\ncategory: "企业 AI 工作流"\ntags: [${article.tags.map(yamlString).join(", ")}]\nfeatured: false\ndraft: false\nauthor: ${yamlString(defaults.author)}\n`;
}

function yamlString(value: string): string {
  return JSON.stringify(value.replace(/\s+/g, " ").trim());
}

function safeSourceLabel(value: string): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (!normalized || /[\r\n\x00-\x1f{}<>\[\]()`]/.test(normalized)) throw formatError();
  return normalized.replace(/\\/g, "\\\\");
}

function markdownDestination(url: string): string {
  return url.replace(/[()\\\s]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase().padStart(2, "0")}`);
}

function maskCode(body: string): string {
  return body.replace(/```[\s\S]*?```|`[^`]*`/g, (code) => code.replace(/[^\n]/g, " "));
}

function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

function formatError(): Error {
  return new Error(FORMAT_ERROR);
}
