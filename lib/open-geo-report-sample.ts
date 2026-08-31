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

export function serveOpenGeoReportSample(locale: OpenGeoReportSampleLocale) {
  const html = fs.readFileSync(
    path.join(process.cwd(), "content", "report-samples", `open-geo-personal-site-${locale}.html`),
    "utf8"
  );

  return new Response(html, { headers: REPORT_HEADERS });
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
