import publicProjectCasesJson from "./public-project-cases.json";
import { publicIdentity } from "./public-identity";
import {
  getPublishedProjectCases,
  parsePublicProjectCases,
  type PublicProjectCase,
} from "./project-case-schema";
import { serviceMethod } from "./service-method";
import type { Locale } from "./locale";

type LocalizedText = { zh?: string; en?: string };

const projects = getPublishedProjectCases(
  parsePublicProjectCases(publicProjectCasesJson)
);

export const publicContent = {
  schemaVersion: "1.0",
  updatedAt: "2026-07-12",
  identity: publicIdentity,
  service: serviceMethod,
  projects,
  cta: {
    primary: {
      label: { zh: "提交你的流程问题", en: "Submit your workflow problem" },
      href: "/contact",
    },
    secondary: {
      label: { zh: "看系统如何接管流程", en: "See how the system takes over" },
      href: "/#case-theatre",
    },
  },
} as const;

function text(value: LocalizedText, locale: Locale): string {
  const localized = value[locale];
  if (!localized) {
    throw new Error(`Missing ${locale} public copy`);
  }
  return localized;
}

function textList(values: readonly LocalizedText[] | undefined, locale: Locale) {
  return values?.map((value) => text(value, locale)) ?? [];
}

function localizeProject(project: PublicProjectCase, locale: Locale) {
  return {
    ...project,
    name: text(project.name, locale),
    purpose: project.purpose ? text(project.purpose, locale) : undefined,
    originalWorkflow: textList(project.originalWorkflow, locale),
    workflowBreakpoints: textList(project.workflowBreakpoints, locale),
    systemBoundary: project.systemBoundary
      ? text(project.systemBoundary, locale)
      : undefined,
    inputs: textList(project.inputs, locale),
    processing: textList(project.processing, locale),
    humanReview: textList(project.humanReview, locale),
    outputs: textList(project.outputs, locale),
    failureRecovery: textList(project.failureRecovery, locale),
    currentStatus: project.currentStatus
      ? text(project.currentStatus, locale)
      : undefined,
    transferableCapabilities: textList(
      project.transferableCapabilities,
      locale
    ),
    limitations: textList(project.limitations, locale),
    evidenceArtifacts:
      project.evidenceArtifacts?.map((artifact) => ({
        ...artifact,
        label: text(artifact.label, locale),
        description: artifact.description
          ? text(artifact.description, locale)
          : undefined,
        alt: artifact.alt ? text(artifact.alt, locale) : undefined,
      })) ?? [],
    visual: project.visual
      ? {
          ...project.visual,
          alt: project.visual.alt ? text(project.visual.alt, locale) : undefined,
        }
      : undefined,
  };
}

export function getLocalizedPublicContent(locale: Locale) {
  return {
    schemaVersion: publicContent.schemaVersion,
    updatedAt: publicContent.updatedAt,
    identity: {
      name: publicIdentity.canonicalName,
      category: text(publicIdentity.category, locale),
      positioning: text(publicIdentity.positioning, locale),
      audience: text(publicIdentity.audience, locale),
      description: text(publicIdentity.description, locale),
      contactPromise: text(publicIdentity.contact.promise, locale),
    },
    service: {
      problemSignals: serviceMethod.problemSignals.map((signal) => ({
        id: signal.id,
        title: text(signal.title, locale),
        description: text(signal.description, locale),
      })),
      method: serviceMethod.method.map((step) => ({
        id: step.id,
        title: text(step.title, locale),
        description: text(step.description, locale),
      })),
      suitableWork: textList(serviceMethod.suitableWork, locale),
      boundaries: textList(serviceMethod.boundaries, locale),
    },
    projects: projects.map((project) => localizeProject(project, locale)),
    cta: {
      primary: {
        label: text(publicContent.cta.primary.label, locale),
        href: publicContent.cta.primary.href,
      },
      secondary: {
        label: text(publicContent.cta.secondary.label, locale),
        href: publicContent.cta.secondary.href,
      },
    },
  };
}
