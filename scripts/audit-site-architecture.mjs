import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const includeExt = new Set([".ts", ".tsx", ".js", ".jsx", ".css", ".json"]);
const skipDirs = new Set([
  ".git",
  ".next",
  ".open-next",
  ".codegraph",
  ".artifacts",
  ".private",
  "node_modules",
  "docker-data",
]);

const patterns = {
  mojibake: /鈥|�|杩|鏌|銆|锛|涓|绯|瀹|鍙|鐨|鍏/g,
  localeBranch: /locale\s*(===|!==)\s*["'](?:zh|en)["']/g,
  hardcodedHex: /#[0-9a-fA-F]{3,8}\b/g,
  visualResidue: /border-white\/10|bg-white\/5|bg-card|rounded-2xl|\bshadow-(?:sm|md|lg|xl|2xl)\b/g,
};

const tokenSourceFiles = new Set([
  "app/globals.css",
  "config/caseTheme.ts",
  "config/ogTheme.ts",
  "config/theme.json",
  "config/theme.ts",
  "config/visualTokens.ts",
  "public/manifest.json",
  "tailwind.config.js",
]);

function categoryFor(file) {
  if (tokenSourceFiles.has(file)) return "token-source";
  if (file.startsWith("scripts/")) return "tooling";
  if (file.startsWith("tests/")) return "test-fixture";
  return "ui-source";
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skipDirs.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
      continue;
    }
    if (includeExt.has(path.extname(entry.name))) files.push(full);
  }
  return files;
}

function countMatches(text, regex) {
  regex.lastIndex = 0;
  return text.match(regex)?.length || 0;
}

function rel(file) {
  return path.relative(root, file).replace(/\\/g, "/");
}

const files = walk(root);
const findings = [];

for (const file of files) {
  if (rel(file) === "scripts/audit-site-architecture.mjs") continue;
  const text = fs.readFileSync(file, "utf8");
  const counts = Object.fromEntries(
    Object.entries(patterns)
      .map(([name, regex]) => [name, countMatches(text, regex)])
      .filter(([, count]) => count > 0)
  );
  if (Object.keys(counts).length) {
    const relativeFile = rel(file);
    findings.push({ file: relativeFile, category: categoryFor(relativeFile), counts });
  }
}

const requiredFiles = [
  "DESIGN.md",
  "docs/PROJECT-STATE.md",
  "components/system/index.ts",
  "components/motion/index.ts",
  "lib/ai-readable/routes.ts",
  "app/.well-known/brand-facts.json/route.ts",
];

const missingRequired = requiredFiles.filter((file) => !fs.existsSync(path.join(root, file)));
const sitemap = fs.existsSync(path.join(root, "app/sitemap.ts"))
  ? fs.readFileSync(path.join(root, "app/sitemap.ts"), "utf8")
  : "";
const robots = fs.existsSync(path.join(root, "app/robots.ts"))
  ? fs.readFileSync(path.join(root, "app/robots.ts"), "utf8")
  : "";
const llms = fs.existsSync(path.join(root, "app/llms.txt/route.ts"))
  ? fs.readFileSync(path.join(root, "app/llms.txt/route.ts"), "utf8")
  : "";

const aiReadableChecks = [
  {
    name: "sitemap uses readable inventory",
    pass: sitemap.includes("getReadableRoutes"),
  },
  {
    name: "robots blocks admin",
    pass: robots.includes('"/admin/"') || robots.includes("'/admin/'"),
  },
  {
    name: "llms references route groups",
    pass: llms.includes("groupReadableRoutes") && llms.includes("Do not index"),
  },
];

function sumCounts(items) {
  return items.reduce((acc, item) => {
    for (const [name, count] of Object.entries(item.counts)) {
      acc[name] = (acc[name] || 0) + count;
    }
    return acc;
  }, {});
}

function sortByFindingWeight(items) {
  return [...items].sort((a, b) => {
    const aa = Object.values(a.counts).reduce((sum, count) => sum + count, 0);
    const bb = Object.values(b.counts).reduce((sum, count) => sum + count, 0);
    return bb - aa;
  });
}

const uiDebtFindings = findings.filter((item) => item.category === "ui-source");
const summary = {
  scannedFiles: files.length,
  requiredFiles: {
    missing: missingRequired,
  },
  aiReadableChecks,
  findingCounts: sumCounts(findings),
  debtFindingCounts: sumCounts(uiDebtFindings),
  topFindings: sortByFindingWeight(findings).slice(0, 20),
  topDebtFindings: sortByFindingWeight(uiDebtFindings).slice(0, 20),
};

console.log(JSON.stringify(summary, null, 2));

const hardFailures =
  missingRequired.length > 0 ||
  aiReadableChecks.some((check) => !check.pass) ||
  (summary.findingCounts.mojibake || 0) > 0;

if (hardFailures) process.exit(1);
