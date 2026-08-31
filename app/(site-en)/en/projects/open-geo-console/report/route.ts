import { serveOpenGeoReportSample } from "@/lib/open-geo-report-sample";

export const revalidate = 21600;

export async function GET() {
  return serveOpenGeoReportSample("en");
}
