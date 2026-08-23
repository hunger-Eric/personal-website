// components/JsonLd.tsx
// Component to inject JSON-LD structured data into pages

interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * Component to inject JSON-LD structured data into the page.
 * Can accept a single schema object or an array of schema objects.
 *
 * @example
 * // Single schema
 * <JsonLd data={generatePersonSchema()} />
 *
 * @example
 * // Multiple schemas
 * <JsonLd data={[generatePersonSchema(), generateWebSiteSchema()]} />
 */
export function JsonLd({ data }: JsonLdProps) {
  // If it's an array, wrap in @graph
  const structuredData = Array.isArray(data)
    ? {
        "@context": "https://schema.org",
        "@graph": data.map((item) => {
          // Remove @context from individual items since we have it at top level
          const rest = { ...item };
          delete rest["@context"];
          return rest;
        }),
      }
    : data;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 0),
      }}
    />
  );
}

export default JsonLd;
