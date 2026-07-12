import { z } from "zod";

const idSchema = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use a stable kebab-case id");

export const localizedPublicTextSchema = z
  .object({
    zh: z.string().trim().min(1).max(2_000),
    en: z.string().trim().min(1).max(2_000),
  })
  .strict();

const localizedListSchema = z.array(localizedPublicTextSchema).max(20);

const evidenceArtifactSchema = z
  .object({
    id: idSchema,
    label: localizedPublicTextSchema,
    description: localizedPublicTextSchema.optional(),
    kind: z.enum(["interface", "demo", "document", "validation", "image"]),
    href: z
      .string()
      .max(500)
      .refine(
        (value) => value.startsWith("/") || z.string().url().safeParse(value).success,
        "Use an absolute URL or a root-relative public path"
      )
      .optional(),
    imageSrc: z.string().trim().min(1).max(500).optional(),
    alt: localizedPublicTextSchema.optional(),
  })
  .strict();

const publicReviewSchema = z
  .object({
    approvedForPublic: z.literal(true),
    approvedBy: z.literal("site-owner"),
  })
  .strict();

const publicVisualSchema = z
  .object({
    posterSrc: z.string().trim().min(1).max(500).optional(),
    animationSrc: z.string().trim().min(1).max(500).optional(),
    alt: localizedPublicTextSchema.optional(),
  })
  .strict();

const sensitiveStringPatterns = [
  /^[a-z]:[\\/]/i,
  /^\/(?:home|users|private|var|srv|opt|workspace)\//i,
  /\bghp_[a-z0-9]{20,}\b/i,
  /\bgithub_pat_[a-z0-9_]{20,}\b/i,
  /\bsk-[a-z0-9_-]{16,}\b/i,
  /\bbearer\s+[a-z0-9._~+\/-]{8,}\b/i,
  /(?:api[_ -]?key|secret|token)\s*[:=]\s*[a-z0-9._~+\/-]{8,}/i,
];

function collectStrings(value: unknown, output: string[] = []): string[] {
  if (typeof value === "string") {
    output.push(value.trim());
    return output;
  }

  if (Array.isArray(value)) {
    for (const item of value) collectStrings(item, output);
    return output;
  }

  if (value && typeof value === "object") {
    for (const item of Object.values(value)) collectStrings(item, output);
  }

  return output;
}

function getHostname(value: string | undefined): string {
  if (!value?.startsWith("http")) return "";
  try {
    return new URL(value).hostname;
  } catch {
    return "";
  }
}

export const publicProjectCaseSchema = z
  .object({
    id: idSchema,
    name: localizedPublicTextSchema,
    publicStatus: z.enum(["draft", "in-review", "published", "retired"]),
    sourceVisibility: z.enum(["public", "private-curated"]),
    purpose: localizedPublicTextSchema.optional(),
    originalWorkflow: localizedListSchema.optional(),
    workflowBreakpoints: localizedListSchema.optional(),
    systemBoundary: localizedPublicTextSchema.optional(),
    inputs: localizedListSchema.optional(),
    processing: localizedListSchema.optional(),
    humanReview: localizedListSchema.optional(),
    outputs: localizedListSchema.optional(),
    failureRecovery: localizedListSchema.optional(),
    currentStatus: localizedPublicTextSchema.optional(),
    transferableCapabilities: localizedListSchema.optional(),
    evidenceArtifacts: z.array(evidenceArtifactSchema).max(20).optional(),
    limitations: localizedListSchema.optional(),
    reviewedAt: z.string().date().optional(),
    review: publicReviewSchema.optional(),
    featured: z.boolean().optional().default(false),
    sortOrder: z.number().int().min(0).max(1_000).optional(),
    visual: publicVisualSchema.optional(),
  })
  .strict()
  .superRefine((project, context) => {
    if (project.publicStatus === "published") {
      if (!project.reviewedAt || !project.review?.approvedForPublic) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Published cases require explicit human review",
          path: ["review"],
        });
      }

      if (!project.purpose || !project.currentStatus) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Published cases require purpose and currentStatus facts",
          path: ["publicStatus"],
        });
      }
    }

    if (project.sourceVisibility === "private-curated") {
      project.evidenceArtifacts?.forEach((artifact, index) => {
        const hostname = getHostname(artifact.href);
        if (hostname && /(^|\.)github\.com$/i.test(hostname)) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Private-curated cases cannot expose repository links",
            path: ["evidenceArtifacts", index, "href"],
          });
        }
      });
    }

    for (const value of collectStrings(project)) {
      if (sensitiveStringPatterns.some((pattern) => pattern.test(value))) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Public case contains an internal path or credential-like value",
        });
        break;
      }
    }
  });

export const publicProjectCasesSchema = z
  .array(publicProjectCaseSchema)
  .superRefine((projects, context) => {
    const seen = new Set<string>();
    projects.forEach((project, index) => {
      if (seen.has(project.id)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate public case id: ${project.id}`,
          path: [index, "id"],
        });
      }
      seen.add(project.id);
    });
  });

export type PublicProjectCase = z.infer<typeof publicProjectCaseSchema>;

export function parsePublicProjectCases(input: unknown): PublicProjectCase[] {
  return publicProjectCasesSchema.parse(input);
}

export function getPublishedProjectCases(
  projects: PublicProjectCase[]
): PublicProjectCase[] {
  return projects
    .filter((project) => project.publicStatus === "published")
    .sort((a, b) => (a.sortOrder ?? 1_000) - (b.sortOrder ?? 1_000));
}
