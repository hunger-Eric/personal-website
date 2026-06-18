// config/aboutConfig.ts
import raw from "./about.json";

export type AboutProfileLink = {
  type:
    | "school"
    | "location"
    | "email"
    | "website"
    | "linkedin"
    | "github"
    | "youtube"
    | "x"
    | "instagram"
    | "tiktok";
  label: string;
  href?: string;
};

export type AboutSnapshotStat = {
  icon: string;
  label: string;
  value: string;
};

export type AboutSnapshotCard = {
  title: string;
  // ✅ optional (your current JSON cards don't have it)
  value?: string;
  description?: string;
  icon: string;
  stats?: AboutSnapshotStat[];
};

export type AboutConfig = {
  handle: string;
  displayName: string;
  roleLine: string;
  schoolName?: string;

  avatarUrl?: string;

  cta: {
    primary: { label: string; href: string; external?: boolean };
    secondary: { label: string; href: string; external?: boolean };
  };

  followers?: { followers: number; following: number };

  profileLinks: AboutProfileLink[];

  readme: {
    fileLabel: string;
    paragraphs: string[];
    afterTechParagraph?: string;
  };

  techUsed: string[];

  snapshot: {
    title: string;
    cards: AboutSnapshotCard[];
  };

  // ✅ NEW optional dedicated About page content (doesn't affect home AboutSection)
  aboutPage?: {
    hero?: {
      headline?: string;
      subheadline?: string;
      proofChips?: string[];
      locationLabel?: string;
      portraitUrl?: string;
      primaryCta?: {
        label: string;
        href: string;
        external?: boolean;
        icon?: string;
      };
      secondaryCta?: {
        label: string;
        href: string;
        external?: boolean;
        icon?: string;
      };
    };

    story?: {
      paragraphs?: string[];
      timeline?: Array<{ title: string; desc?: string }>;
    };

    now?: { items?: Array<{ title: string; bullets: string[] }> };

    values?: {
      principles?: Array<{ title: string; desc?: string }>;
      workflow?: string[];
      notAbout?: string[];
    };

    skills?: {
      groups?: Array<{ label: string; items: string[] }>;
      exploring?: string[];
    };

    socials?: { items?: AboutProfileLink[] };

    funFacts?: { items?: string[] };

    faq?: { items?: Array<{ q: string; a: string }> };

    closer?: { line?: string };
  };

  contentSource?: {
    mode?: "local" | "notion";
    notion?: { enabled?: boolean; databaseId?: string; cacheSeconds?: number };
  };
};

export const aboutConfig = raw as AboutConfig satisfies AboutConfig;
