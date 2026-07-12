import { publicContent } from "@/config/public-content";
import { serviceMethod } from "@/config/service-method";
import { publicJsonResponse } from "@/lib/ai-readable/response";

export const dynamic = "force-static";
export const revalidate = 21600;

function localizedLists<T extends { zh: string; en: string }>(
  values: readonly T[]
) {
  return {
    zh: values.map((value) => value.zh),
    en: values.map((value) => value.en),
  };
}

export function GET() {
  return publicJsonResponse(
    {
      schemaVersion: publicContent.schemaVersion,
      updatedAt: publicContent.updatedAt,
      service: {
        problemSignals: {
          zh: serviceMethod.problemSignals.map((item) => ({
            id: item.id,
            title: item.title.zh,
            description: item.description.zh,
          })),
          en: serviceMethod.problemSignals.map((item) => ({
            id: item.id,
            title: item.title.en,
            description: item.description.en,
          })),
        },
        method: {
          zh: serviceMethod.method.map((item) => ({
            id: item.id,
            title: item.title.zh,
            description: item.description.zh,
          })),
          en: serviceMethod.method.map((item) => ({
            id: item.id,
            title: item.title.en,
            description: item.description.en,
          })),
        },
        suitableWork: localizedLists(serviceMethod.suitableWork),
        boundaries: localizedLists(serviceMethod.boundaries),
      },
      contact: "/contact",
    },
    { contentLocation: "/ai/services.json" }
  );
}
