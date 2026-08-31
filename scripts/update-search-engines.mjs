#!/usr/bin/env node

import { runSearchUpdate } from "../lib/search-update.mjs";
import { parseSearchUpdateArguments } from "../lib/search-update-cli.mjs";

let parsedArguments;
try {
  parsedArguments = parseSearchUpdateArguments(process.argv.slice(2));
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : "Invalid arguments"}\n`);
  process.exit(1);
}

const { urls, submit, engines } = parsedArguments;

if (urls.length === 0) {
  process.stderr.write("Provide at least one changed canonical URL with --url.\n");
  process.exit(1);
}

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://me.itheheda.online";

try {
  const result = await runSearchUpdate(
    {
      siteUrl,
      sitemapUrl: new URL("/sitemap.xml", siteUrl).href,
      urls,
      indexNowKey: process.env.INDEXNOW_KEY,
      baiduSite: process.env.BAIDU_SITE,
      baiduToken: process.env.BAIDU_PUSH_TOKEN,
    },
    {
      submit,
      engines: engines.length > 0 ? engines : undefined,
      allowIndexNowSubmission: process.env.INDEXNOW_ALLOW_SUBMIT === "true",
      allowBaiduSubmission: process.env.BAIDU_ALLOW_SUBMIT === "true",
    }
  );
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : "Search update failed"}\n`);
  process.exitCode = 1;
}
