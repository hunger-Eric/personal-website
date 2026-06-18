// src/config/navbarConfig.ts
import raw from "./navbar.json";
import type { Locale } from "./locale";

export type NavDropdownItemCfg = {
  id?: string;
  label: string;
  href: string;
  description?: string;
  icon?: string; // lucide-react icon name
  external?: boolean;
  column?: "left" | "right";
};

export type NavDropdownFooterCfg = {
  text: string;
  linkLabel: string;
  href: string;
  external?: boolean;
};

export type NavItemCfg = {
  id?: string;
  label: string;
  href: string;
  show?: boolean;
  external?: boolean;
  children?: NavDropdownItemCfg[];
  dropdownFooter?: NavDropdownFooterCfg;
};

export type NavbarLogoCfg = {
  label: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
};

export type NavbarCtaCfg = {
  label: string;
  href: string;
  show?: boolean;
  external?: boolean;
};

export type NavbarJson = {
  logo: NavbarLogoCfg;
  center: { items: NavItemCfg[] };
  cta: {
    contact: NavbarCtaCfg;
    primary: NavbarCtaCfg;
  };
};

function isExternalHref(href: string) {
  return (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  );
}

const PUBLIC_CONTACT_EMAIL = (process.env.NEXT_PUBLIC_CONTACT_EMAIL || "").trim();

function normalizeCtaHref(href: string) {
  const rawHref = (href || "").trim();
  if (rawHref !== "mailto:") return rawHref;
  if (!PUBLIC_CONTACT_EMAIL) return "";
  return `mailto:${PUBLIC_CONTACT_EMAIL}`;
}

// Resolve locale-specific data from zh/en keys
type RawWithLocale = typeof raw & {
  center?: NavbarJson["center"];
  cta?: NavbarJson["cta"];
  zh?: { center?: NavbarJson["center"]; cta?: NavbarJson["cta"] };
  en?: { center?: NavbarJson["center"]; cta?: NavbarJson["cta"] };
};

const data = raw as unknown as RawWithLocale;

function getLocalizedNavData(locale: Locale): NavbarJson {
  const localized = data[locale] || {};
  const center = localized.center || data.center || { items: [] };
  const cta = localized.cta || data.cta || {
    contact: { label: "Email", href: "mailto:", show: false },
    primary: { label: "Contact", href: "/links", show: true },
  };
  return { logo: data.logo, center, cta };
}

// Build computed navbar config for a given locale
export function getNavbarConfig(locale: Locale = "zh") {
  const navData = getLocalizedNavData(locale);

  return {
    logo: navData.logo,
    centerItems: (navData.center?.items ?? [])
      .filter((it) => it && it.show !== false)
      .map((it) => ({
        ...it,
        external: it.external ?? isExternalHref(it.href),
        children: (it.children ?? []).filter(Boolean).map((c) => ({
          ...c,
          external: c.external ?? isExternalHref(c.href),
        })),
        dropdownFooter: it.dropdownFooter
          ? {
              ...it.dropdownFooter,
              external:
                it.dropdownFooter.external ??
                isExternalHref(it.dropdownFooter.href),
            }
          : undefined,
      })),

    cta: {
      contact: {
        ...navData.cta.contact,
        href: normalizeCtaHref(navData.cta.contact?.href || ""),
        show: navData.cta.contact?.show !== false,
        external:
          navData.cta.contact?.external ??
          isExternalHref(normalizeCtaHref(navData.cta.contact?.href || "")),
      },
      primary: {
        ...navData.cta.primary,
        show: navData.cta.primary?.show !== false,
        external:
          navData.cta.primary?.external ??
          isExternalHref(navData.cta.primary?.href || ""),
      },
    },
  } as const;
}

export type NavbarConfig = ReturnType<typeof getNavbarConfig>;
export { isExternalHref };
