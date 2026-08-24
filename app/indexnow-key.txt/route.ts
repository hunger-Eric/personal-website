import { normalizeIndexNowKey } from "@/lib/indexnow.mjs";

export function GET() {
  const key = normalizeIndexNowKey(process.env.INDEXNOW_KEY);
  if (!key) return new Response("Not Found", { status: 404 });

  return new Response(key, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
  });
}
