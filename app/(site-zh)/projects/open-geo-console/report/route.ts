import fs from "node:fs";
import path from "node:path";

const reportPath = path.join(
  process.cwd(),
  "content",
  "report-samples",
  "open-geo-personal-site-zh.html"
);

export const revalidate = 21600;

export async function GET() {
  const html = fs.readFileSync(reportPath, "utf8");

  return new Response(html, {
    headers: {
      "Cache-Control": "public, max-age=0, s-maxage=21600",
      "Content-Security-Policy":
        "default-src 'none'; img-src 'self' https: data:; style-src 'unsafe-inline'; font-src 'self' data:; connect-src 'none'; script-src 'none'; frame-ancestors 'self'; base-uri 'none'; form-action 'none'",
      "Content-Type": "text/html; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
