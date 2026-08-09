import { describe, expect, it } from "vitest";

import { canonicalizePublicHttpUrl } from "@/lib/article-workbench/safe-url";

describe("canonicalizePublicHttpUrl", () => {
  it.each([
    ["https://example.com/report", "https://example.com/report"],
    ["HTTP://EXAMPLE.COM:80/a#section", "http://example.com/a"],
    ["https://8.8.8.8/research", "https://8.8.8.8/research"],
    ["https://[2606:4700:4700::1111]/", "https://[2606:4700:4700::1111]/"],
    ["http://[::ffff:0:8.8.8.8]/", "http://[::ffff:0:808:808]/"],
  ])("accepts a public URL: %s", (input, expected) => {
    expect(canonicalizePublicHttpUrl(input)).toBe(expected);
  });

  it.each([
    "file:///etc/passwd",
    "ftp://example.com/file",
    "https://user:pass@example.com/",
    "https://user%3Apass@example.com/",
    "http://127.0.0.1/",
    "http://127.0.0.2/",
    "http://0x7f000001/",
    "http://2130706433/",
    "http://169.254.169.254/latest/meta-data",
    "http://10.0.0.1/",
    "http://172.16.0.1/",
    "http://192.168.1.1/",
    "http://100.64.0.1/",
    "http://100.127.255.254/",
    "http://198.18.0.1/",
    "http://198.19.255.254/",
    "http://192.0.2.1/",
    "http://198.51.100.1/",
    "http://203.0.113.1/",
    "http://224.0.0.1/",
    "http://240.0.0.1/",
    "http://[::1]/",
    "http://[::2]/",
    "http://[fe80::1]/",
    "http://[fc00::1]/",
    "http://[ff02::1]/",
    "http://[fec0::1]/",
    "http://[2001:db8::1]/",
    "http://[::127.0.0.1]/",
    "http://[::ffff:127.0.0.1]/",
    "http://[::ffff:0:127.0.0.1]/",
    "http://[::ffff:0:10.0.0.1]/",
    "http://localhost/",
    "http://printer.local/",
  ])("rejects a non-public target URL: %s", (input) => {
    expect(() => canonicalizePublicHttpUrl(input)).toThrow("Unsafe source URL");
  });
});
