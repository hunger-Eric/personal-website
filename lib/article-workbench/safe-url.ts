import { isIP } from "node:net";

const unsafeUrlError = () => new Error("Unsafe source URL");

/**
 * Validates URLs submitted to the external extraction provider. This module does
 * not fetch the returned URL and therefore cannot observe or validate a target
 * site's redirect chain.
 */
export function canonicalizePublicHttpUrl(input: string): string {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    throw unsafeUrlError();
  }

  if ((url.protocol !== "http:" && url.protocol !== "https:") || url.username || url.password) {
    throw unsafeUrlError();
  }

  const host = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (!host || host === "localhost" || host.endsWith(".local") || isNonPublicIp(host)) {
    throw unsafeUrlError();
  }

  url.hash = "";
  return url.toString();
}

function isNonPublicIp(host: string): boolean {
  const version = isIP(host);
  if (version === 4) return isPrivateIpv4(host);
  if (version === 6) return isPrivateIpv6(host);
  return false;
}

function isPrivateIpv4(host: string): boolean {
  const octets = host.split(".").map(Number);
  const [first, second] = octets;
  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168)
  );
}

function isPrivateIpv6(host: string): boolean {
  const groups = expandIpv6(host).map((group) => Number.parseInt(group, 16));
  if (groups.every((group) => group === 0) || groups.slice(0, 7).every((group) => group === 0) && groups[7] === 1) {
    return true;
  }

  if ((groups[0] & 0xfe00) === 0xfc00) return true; // fc00::/7 unique local
  if ((groups[0] & 0xffc0) === 0xfe80) return true; // fe80::/10

  // IPv4-mapped IPv6 addresses must obey the IPv4 restrictions too.
  if (groups.slice(0, 5).every((group) => group === 0) && groups[5] === 0xffff) {
    const ipv4 = (groups[6] << 16) + groups[7];
    return isPrivateIpv4([
      (ipv4 >>> 24) & 0xff,
      (ipv4 >>> 16) & 0xff,
      (ipv4 >>> 8) & 0xff,
      ipv4 & 0xff,
    ].join("."));
  }
  return false;
}

function expandIpv6(host: string): string[] {
  const [left, right = ""] = host.split("::", 2);
  const leftParts = left ? left.split(":") : [];
  const rightParts = right ? right.split(":") : [];
  return [...leftParts, ...Array(Math.max(0, 8 - leftParts.length - rightParts.length)).fill("0"), ...rightParts];
}
