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
  const value = ipv4ToNumber(octets);
  return (
    isInIpv4Range(value, "0.0.0.0", 8) ||
    isInIpv4Range(value, "10.0.0.0", 8) ||
    isInIpv4Range(value, "100.64.0.0", 10) ||
    isInIpv4Range(value, "127.0.0.0", 8) ||
    isInIpv4Range(value, "169.254.0.0", 16) ||
    isInIpv4Range(value, "172.16.0.0", 12) ||
    isInIpv4Range(value, "192.0.0.0", 24) ||
    isInIpv4Range(value, "192.0.2.0", 24) ||
    isInIpv4Range(value, "192.88.99.0", 24) ||
    isInIpv4Range(value, "192.168.0.0", 16) ||
    isInIpv4Range(value, "198.18.0.0", 15) ||
    isInIpv4Range(value, "198.51.100.0", 24) ||
    isInIpv4Range(value, "203.0.113.0", 24) ||
    isInIpv4Range(value, "224.0.0.0", 4) ||
    isInIpv4Range(value, "240.0.0.0", 4)
  );
}

function isPrivateIpv6(host: string): boolean {
  const groups = expandIpv6(host).map((group) => Number.parseInt(group, 16));
  if (groups.every((group) => group === 0) || groups.slice(0, 7).every((group) => group === 0) && groups[7] === 1) {
    return true;
  }

  if ((groups[0] & 0xfe00) === 0xfc00) return true; // fc00::/7 unique local
  if ((groups[0] & 0xffc0) === 0xfe80) return true; // fe80::/10
  if ((groups[0] & 0xffc0) === 0xfec0) return true; // fec0::/10 site-local
  if ((groups[0] & 0xff00) === 0xff00) return true; // ff00::/8 multicast
  if (groups[0] === 0x2001 && groups[1] === 0x0db8) return true; // 2001:db8::/32 documentation
  if (groups[0] === 0x0100 && groups.slice(1, 4).every((group) => group === 0)) return true; // 100::/64 discard-only

  // IPv4-compatible and IPv4-mapped IPv6 addresses must obey IPv4 restrictions too.
  if (groups.slice(0, 6).every((group) => group === 0) || groups.slice(0, 5).every((group) => group === 0) && groups[5] === 0xffff) {
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

function ipv4ToNumber(octets: number[]): number {
  return (((octets[0] << 24) >>> 0) + (octets[1] << 16) + (octets[2] << 8) + octets[3]) >>> 0;
}

function isInIpv4Range(value: number, base: string, prefixLength: number): boolean {
  const mask = prefixLength === 0 ? 0 : (0xffffffff << (32 - prefixLength)) >>> 0;
  return (value & mask) === (ipv4ToNumber(base.split(".").map(Number)) & mask);
}

function expandIpv6(host: string): string[] {
  const [left, right = ""] = host.split("::", 2);
  const leftParts = left ? left.split(":") : [];
  const rightParts = right ? right.split(":") : [];
  return [...leftParts, ...Array(Math.max(0, 8 - leftParts.length - rightParts.length)).fill("0"), ...rightParts];
}
