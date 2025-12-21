// config/aboutConfig.ts
import raw from "./about.json";

export type AboutProfileLink = {
  type: "school" | "location" | "email" | "website" | "linkedin" | "youtube";
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
  value: string;
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
  };

  techUsed: string[];

  snapshot: {
    title: string;
    cards: AboutSnapshotCard[];
  };

  contentSource?: {
    mode?: "local" | "notion";
    notion?: { enabled?: boolean; databaseId?: string; cacheSeconds?: number };
  };
};

export const aboutConfig = raw as AboutConfig satisfies AboutConfig;
