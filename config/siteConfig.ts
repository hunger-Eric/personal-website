import raw from "./site.json";

export type SocialItem = {
  key: string;
  label: string;
  href: string;
  description?: string;
  qrImage?: string;
  qrAlt?: string;
  copyValue?: string;
  isCopy: boolean;
};

type SiteJson = {
  name: string;
  title: string;
  tagline: string;
  location?: string;
  socials: Array<Omit<SocialItem, "isCopy">>;
};

const data = raw as SiteJson;
const socialsList: SocialItem[] = data.socials.map((social) => ({
  ...social,
  isCopy: social.href.startsWith("copy:"),
  copyValue: social.copyValue ?? (
    social.href.startsWith("copy:") ? social.href.slice("copy:".length) : undefined
  ),
}));

export const siteConfig = {
  name: data.name,
  title: data.title,
  tagline: data.tagline,
  location: data.location ?? "",
  socialsList,
} as const;

export type SiteConfig = typeof siteConfig;
