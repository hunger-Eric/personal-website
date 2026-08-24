#!/usr/bin/env node

import { runIndexNowNotification } from "../lib/indexnow.mjs";

function parseArguments(argv) {
  const urls = [];
  let submit = false;
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--url" && argv[index + 1]) {
      urls.push(argv[index + 1]);
      index += 1;
    } else if (argument === "--submit") {
      submit = true;
    } else {
      throw new Error(`Unknown or incomplete argument: ${argument}`);
    }
  }
  return { urls, submit };
}

try {
  const { urls, submit } = parseArguments(process.argv.slice(2));
  const result = await runIndexNowNotification(
    {
      siteUrl: process.env.NEXT_PUBLIC_BASE_URL || "https://me.itheheda.online",
      key: process.env.INDEXNOW_KEY,
      urls,
    },
    {
      submit,
      allowExternalSubmission: process.env.INDEXNOW_ALLOW_SUBMIT === "true",
    }
  );
  process.stdout.write(`${JSON.stringify(result)}\n`);
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : "IndexNow failed"}\n`);
  process.exitCode = 1;
}
