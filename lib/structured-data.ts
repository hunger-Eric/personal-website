// lib/structured-data.ts
// JSON-LD Structured Data generators for SEO
// Reference: https://schema.org/

import { siteConfig } from "@/config/siteConfig";
import { publicContent } from "@/config/public-content";
import { publicIdentity } from "@/config/public-identity";
import { serviceMethod } from "@/config/service-method";
import { localizePublicPath, type Locale } from "@/config/locale";
import { SITE_URL } from "@/lib/site-url";

/**
 * Person schema - for the service owner
 */
export function generatePersonSchema() {
  const githubSocial = siteConfig.socialsList.find((s) => s.key === "github");
  const linkedinSocial = siteConfig.socialsList.find(
    (s) => s.key === "linkedin"
  );
  const youtubeSocial = siteConfig.socialsList.find((s) => s.key === "youtube");

  const sameAs: string[] = [];
  if (githubSocial?.href) sameAs.push(githubSocial.href);
  if (linkedinSocial?.href) sameAs.push(linkedinSocial.href);
  if (youtubeSocial?.href) sameAs.push(youtubeSocial.href);

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.name,
    url: SITE_URL,
    jobTitle: siteConfig.title,
    description: siteConfig.tagline,
    ...(siteConfig.location && {
      address: {
        "@type": "PostalAddress",
        addressLocality: siteConfig.location,
      },
    }),
    sameAs,
  };
}

/**
 * WebSite schema - for the public service site
 */
export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: `${siteConfig.name} Website`,
    alternateName: siteConfig.name,
    url: SITE_URL,
    description: siteConfig.tagline,
    author: {
      "@type": "Person",
      name: siteConfig.name,
    },
  };
}

/**
 * SoftwareApplication schema - for individual projects
 */
export function generateProjectSchema(project: {
  id: string;
  name: string;
  summary?: string;
  description?: string;
  repoUrl?: string;
  liveUrl?: string;
  imageSrc?: string;
  technologies?: string[];
  stars?: number;
  dateCreated?: string;
}, locale: Locale = "zh") {
  const canonicalPath = localizePublicPath(`/projects/${project.id}`, locale);
  const canonicalUrl = `${SITE_URL}${canonicalPath}`;
  const sameAs = [project.liveUrl, project.repoUrl].filter(
    (url): url is string => Boolean(url)
  );

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${canonicalUrl}#software`,
    name: project.name,
    description: project.summary || project.description,
    url: canonicalUrl,
    applicationCategory: "BusinessApplication",
    provider: { "@id": `${SITE_URL}/#organization` },
    ...(sameAs.length > 0 && { sameAs }),
    ...(project.imageSrc && {
      image: project.imageSrc.startsWith("http")
        ? project.imageSrc
        : `${SITE_URL}${project.imageSrc}`,
    }),
    ...(project.repoUrl && { codeRepository: project.repoUrl }),
    ...(project.technologies &&
      project.technologies.length > 0 && {
        programmingLanguage: project.technologies,
      }),
    ...(project.dateCreated && { dateCreated: project.dateCreated }),
  };
}

export function generateProjectCollectionSchema(
  projects: Array<Parameters<typeof generateProjectSchema>[0]>,
  locale: Locale = "zh"
) {
  const path = localizePublicPath("/projects", locale);
  const brandName = publicIdentity.names[locale];
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE_URL}${path}#collection`,
    name: locale === "zh" ? `${brandName}项目库` : `${brandName} projects`,
    description:
      locale === "zh"
        ? "实解智能公开的企业 AI 系统项目、产品状态与使用边界。"
        : "Enterprise AI systems, product status, and operating boundaries published by SolveReal Systems.",
    url: `${SITE_URL}${path}`,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: projects.length,
      itemListElement: projects.map((project, index) => {
        const item = Object.fromEntries(
          Object.entries(generateProjectSchema(project, locale)).filter(
            ([key]) => key !== "@context"
          )
        );
        return {
          "@type": "ListItem",
          position: index + 1,
          url: `${SITE_URL}${path}#${project.id}`,
          item,
        };
      }),
    },
  };
}

/**
 * BlogPosting schema - for blog posts.
 * Google specifically prefers BlogPosting over the more generic Article for
 * articles published on a blog; mainEntityOfPage anchors the canonical URL.
 */
export function generateArticleSchema(article: {
  title: string;
  slug: string;
  publicPath?: string;
  summary?: string;
  date: string;
  updated?: string;
  imageSrc?: string;
  tags?: string[];
  readingTime?: number;
}, locale: Locale = "zh") {
  const articlePath = localizePublicPath(
    article.publicPath ?? `/articles/${article.slug}`,
    locale
  );
  const url = `${SITE_URL}${articlePath}`;
  const publisher = {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: publicIdentity.names[locale],
    url: SITE_URL,
  };
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    headline: article.title,
    description: article.summary,
    url,
    inLanguage: locale === "zh" ? "zh-CN" : "en",
    datePublished: article.date,
    dateModified: article.updated || article.date,
    ...(article.imageSrc && {
      image: article.imageSrc.startsWith("http")
        ? article.imageSrc
        : `${SITE_URL}${article.imageSrc}`,
    }),
    author: publisher,
    publisher,
    ...(article.tags && article.tags.length > 0 && { keywords: article.tags.join(", ") }),
    ...(article.readingTime && {
      timeRequired: `PT${article.readingTime}M`,
    }),
  };
}

export function generateArticleCollectionSchema(
  articles: Array<{
    title: string;
    slug: string;
    publicPath?: string;
    summary?: string;
    date: string;
    updated?: string;
  }>,
  locale: Locale = "zh"
) {
  const path = localizePublicPath("/articles", locale);
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE_URL}${path}#collection`,
    name:
      locale === "zh"
        ? `${publicIdentity.names.zh}文章与系统实践`
        : `${publicIdentity.names.en} articles and system practice`,
    description:
      locale === "zh"
        ? "企业 AI 系统、自动化、知识工作流与交付边界的实践文章。"
        : "Reviewed writing about enterprise AI systems, automation, knowledge workflows, and delivery boundaries.",
    url: `${SITE_URL}${path}`,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: articles.length,
      itemListElement: articles.map((article, index) => {
        const url = `${SITE_URL}${localizePublicPath(
          article.publicPath ?? `/articles/${article.slug}`,
          locale
        )}`;
        return {
          "@type": "ListItem",
          position: index + 1,
          url,
          item: {
            "@type": "BlogPosting",
            headline: article.title,
            description: article.summary,
            datePublished: article.date,
            dateModified: article.updated || article.date,
          },
        };
      }),
    },
  };
}

/**
 * VideoObject schema - for YouTube videos
 */
export function generateVideoSchema(video: {
  title: string;
  description?: string;
  thumbnailUrl: string;
  videoUrl: string;
  uploadDate: string;
  duration?: string; // ISO 8601 format: PT1H30M
  viewCount?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.title,
    description: video.description,
    thumbnailUrl: video.thumbnailUrl,
    contentUrl: video.videoUrl,
    embedUrl: video.videoUrl.replace("watch?v=", "embed/"),
    uploadDate: video.uploadDate,
    ...(video.duration && { duration: video.duration }),
    ...(video.viewCount && {
      interactionStatistic: {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/WatchAction",
        userInteractionCount: video.viewCount,
      },
    }),
    author: {
      "@type": "Person",
      name: siteConfig.name,
      url: SITE_URL,
    },
  };
}

/**
 * BreadcrumbList schema - for navigation breadcrumbs
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

/**
 * ProfilePage schema - for the service owner page
 */
export function generateProfilePageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: generatePersonSchema(),
    name: `${siteConfig.name} - ${siteConfig.title}`,
    description: siteConfig.tagline,
    url: SITE_URL,
  };
}

export function generatePublicPersonSchema(locale: Locale = "zh") {
  const otherLocale: Locale = locale === "zh" ? "en" : "zh";
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: publicIdentity.names[locale],
    alternateName: publicIdentity.names[otherLocale],
    url: SITE_URL,
    description: publicIdentity.positioning[locale],
    knowsLanguage: publicIdentity.languages,
  };
}

export function generatePublicWebSiteSchema(locale: Locale = "zh") {
  const url = `${SITE_URL}${localizePublicPath("/", locale)}`;
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: `${publicIdentity.names[locale]} — ${publicIdentity.category[locale]}`,
    alternateName:
      locale === "zh" ? publicIdentity.names.en : publicIdentity.names.zh,
    url,
    description: publicIdentity.positioning[locale],
    inLanguage: locale === "zh" ? "zh-CN" : "en",
    author: { "@id": `${SITE_URL}/#organization` },
    dateModified: publicContent.updatedAt,
  };
}

export function generateProfessionalServiceSchema(locale: Locale = "zh") {
  const url = `${SITE_URL}${localizePublicPath("/", locale)}`;
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${SITE_URL}/#professional-service`,
    name: `${publicIdentity.names[locale]} — ${publicIdentity.category[locale]}`,
    url,
    description: publicIdentity.description[locale],
    serviceType: serviceMethod.suitableWork.map((item) => item[locale]),
    provider: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "CommunicateAction",
      target: `${SITE_URL}${localizePublicPath(publicIdentity.contact.page, locale)}`,
      description: publicIdentity.contact.promise[locale],
    },
  };
}
