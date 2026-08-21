// lib/structured-data.ts
// JSON-LD Structured Data generators for SEO
// Reference: https://schema.org/

import { siteConfig } from "@/config/siteConfig";
import { publicContent } from "@/config/public-content";
import { publicIdentity } from "@/config/public-identity";
import { serviceMethod } from "@/config/service-method";
import { SITE_URL } from "@/lib/site-url";

/**
 * Person schema - for the portfolio owner
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
 * WebSite schema - for the portfolio site
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
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: project.name,
    description: project.summary || project.description,
    url: project.liveUrl || project.repoUrl || `${SITE_URL}/projects/${project.id}`,
    applicationCategory: "DeveloperApplication",
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
    author: {
      "@type": "Person",
      name: siteConfig.name,
      url: SITE_URL,
    },
    ...(project.dateCreated && { dateCreated: project.dateCreated }),
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
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
}) {
  const url = `${SITE_URL}${article.publicPath ?? `/articles/${article.slug}`}`;
  const publisher = {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: publicIdentity.canonicalName,
    url: SITE_URL,
  };
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    headline: article.title,
    description: article.summary,
    url,
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
  }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE_URL}/articles#collection`,
    name: `${publicIdentity.canonicalName}文章与系统实践`,
    description: "企业 AI 系统、自动化、知识工作流与交付边界的实践文章。",
    url: `${SITE_URL}/articles`,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: articles.length,
      itemListElement: articles.map((article, index) => {
        const url = `${SITE_URL}${article.publicPath ?? `/articles/${article.slug}`}`;
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
 * ProfilePage schema - for the main portfolio page
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

export function generatePublicPersonSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: publicIdentity.canonicalName,
    url: SITE_URL,
    description: publicIdentity.positioning.zh,
    knowsLanguage: publicIdentity.languages,
  };
}

export function generatePublicWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: `${publicIdentity.canonicalName} — ${publicIdentity.category.zh}`,
    alternateName: publicIdentity.slogan.zh,
    url: SITE_URL,
    description: publicIdentity.positioning.zh,
    inLanguage: publicIdentity.languages,
    author: { "@id": `${SITE_URL}/#organization` },
    dateModified: publicContent.updatedAt,
  };
}

export function generateProfessionalServiceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: `${publicIdentity.canonicalName} — ${publicIdentity.category.zh}`,
    url: SITE_URL,
    description: publicIdentity.description.zh,
    serviceType: serviceMethod.suitableWork.map((item) => item.zh),
    provider: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "CommunicateAction",
      target: `${SITE_URL}${publicIdentity.contact.page}`,
      description: publicIdentity.contact.promise.zh,
    },
  };
}
