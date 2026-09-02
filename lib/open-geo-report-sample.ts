import fs from "node:fs";
import path from "node:path";

export type OpenGeoReportSampleLocale = "en" | "zh";

const REPORT_HEADERS = {
  "Cache-Control": "public, max-age=0, s-maxage=21600",
  "Content-Security-Policy":
    "default-src 'none'; img-src 'self' https: data:; style-src 'unsafe-inline'; font-src 'self' data:; connect-src 'none'; script-src 'none'; frame-ancestors 'self'; base-uri 'none'; form-action 'none'",
  "Content-Type": "text/html; charset=utf-8",
  "X-Content-Type-Options": "nosniff",
};

const REPORT_LANG = {
  en: "en",
  zh: "zh-CN",
} as const satisfies Record<OpenGeoReportSampleLocale, string>;

function preparePublicReportHtml(html: string, locale: OpenGeoReportSampleLocale) {
  return html
    .replace(/<html\s+lang="[^"]+">/u, `<html lang="${REPORT_LANG[locale]}">`)
    .replace(
      /<div class="no-print mx-auto max-w-\[1120px\] px-8 pt-6">[\s\S]*?<\/div>(?=<main\b)/u,
      ""
    )
    .replace(
      /<link\b(?=[^>]*\bhref=["']\/api\/reports\/[^"']+\/evidence\/[^"']+["'])(?=[^>]*\bas=["']image["'])[^>]*>/giu,
      ""
    )
    .replace(/<link\b[^>]*\bas=["']script["'][^>]*>/giu, "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/giu, "");
}

export function serveOpenGeoReportSample(locale: OpenGeoReportSampleLocale) {
  const html = preparePublicReportHtml(fs.readFileSync(
    path.join(process.cwd(), "content", "report-samples", `open-geo-personal-site-${locale}.html`),
    "utf8"
  ), locale);

  return new Response(html, {
    headers: {
      ...REPORT_HEADERS,
      "Content-Language": REPORT_LANG[locale],
    },
  });
}

export function serveOpenGeoReportEvidence(locale: OpenGeoReportSampleLocale, asset: string) {
  if (!/^[a-f0-9]{64}\.jpg$/u.test(asset)) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const bytes = fs.readFileSync(path.join(
      process.cwd(), "content", "report-samples", `open-geo-personal-site-${locale}-evidence`, asset
    ));
    return new Response(bytes, {
      headers: {
        "Cache-Control": "public, max-age=0, s-maxage=21600",
        "Content-Type": "image/jpeg",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return new Response("Not found", { status: 404 });
    }
    throw error;
  }
}
