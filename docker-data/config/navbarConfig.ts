// src/config/navbarConfig.ts
import raw from "./navbar.json";

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

const data = (raw as unknown as NavbarJson) ?? ({} as NavbarJson);
const PUBLIC_CONTACT_EMAIL = (process.env.NEXT_PUBLIC_CONTACT_EMAIL || "").trim();

function normalizeCtaHref(href: string) {
  const rawHref = (href || "").trim();
  if (rawHref !== "mailto:") return rawHref;
  if (!PUBLIC_CONTACT_EMAIL) return "";
  return `mailto:${PUBLIC_CONTACT_EMAIL}`;
}

// Normalize + provide computed external defaults
export const navbarConfig = {
  logo: data.logo,
  centerItems: (data.center?.items ?? [])
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
      ...data.cta.contact,
      href: normalizeCtaHref(data.cta.contact?.href || ""),
      show: data.cta.contact?.show !== false,
      external:
        data.cta.contact?.external ??
        isExternalHref(normalizeCtaHref(data.cta.contact?.href || "")),
    },
    primary: {
      ...data.cta.primary,
      show: data.cta.primary?.show !== false,
      external:
        data.cta.primary?.external ??
        isExternalHref(data.cta.primary?.href || ""),
    },
  },
} as const;

export type NavbarConfig = typeof navbarConfig;
export { isExternalHref };
