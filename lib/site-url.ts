export const DEFAULT_SITE_URL = "https://me.itheheda.online";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_BASE_URL || DEFAULT_SITE_URL
).replace(/\/+$/, "");
