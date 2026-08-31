import { serveOpenGeoReportEvidence } from "@/lib/open-geo-report-sample";

export const revalidate = 21600;

export async function GET(_request: Request, context: { params: Promise<{ asset: string }> }) {
  const { asset } = await context.params;
  return serveOpenGeoReportEvidence("zh", asset);
}
