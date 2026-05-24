// lib/photo-auth.ts
// HMAC-based token signing for private photo access
import { createHmac, timingSafeEqual } from "crypto";

const SECRET_KEY = process.env.PHOTO_AUTH_SECRET || "dev-secret-change-in-production";
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24h

export type PhotoToken = {
  photoId: string;
  expiresAt: number; // ms timestamp
};

/**
 * Sign a session bundle: grants the bearer access to private photos.
 * Returns base64url-encoded token.
 */
export function signSessionToken(): string {
  const payload = JSON.stringify({
    t: Date.now() + SESSION_TTL_MS,
    r: crypto.randomUUID(),
  });
  const sig = createHmac("sha256", SECRET_KEY)
    .update(payload)
    .digest("base64url");
  return `${Buffer.from(payload).toString("base64url")}.${sig}`;
}

/**
 * Verify a session token. Returns true if valid and not expired.
 */
export function verifySessionToken(token: string): boolean {
  try {
    const dot = token.lastIndexOf(".");
    if (dot === -1) return false;
    const payloadB64 = token.slice(0, dot);
    const sig = token.slice(dot + 1);
    const expectedSig = createHmac("sha256", SECRET_KEY)
      .update(Buffer.from(payloadB64, "base64url"))
      .digest("base64url");
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
      return false;
    }
    const payload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf-8")
    );
    if (!payload || payload.t < Date.now()) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Sign a single photo access token embedded in a session-authenticated context.
 * The photo token is short-lived (1h) so even if leaked, exposure is limited.
 */
export function signPhotoToken(photoId: string): string {
  const expiresAt = Date.now() + 60 * 60 * 1000; // 1h
  const raw = `${photoId}:${expiresAt}`;
  const sig = createHmac("sha256", SECRET_KEY)
    .update(raw)
    .digest("base64url");
  return `${Buffer.from(raw).toString("base64url")}.${sig}`;
}

/**
 * Verify a photo token. Returns the photoId if valid, null otherwise.
 */
export function verifyPhotoToken(token: string): string | null {
  try {
    const dot = token.lastIndexOf(".");
    if (dot === -1) return null;
    const rawB64 = token.slice(0, dot);
    const sig = token.slice(dot + 1);
    const raw = Buffer.from(rawB64, "base64url").toString("utf-8");
    const expectedSig = createHmac("sha256", SECRET_KEY)
      .update(raw)
      .digest("base64url");
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
      return null;
    }
    const colon = raw.lastIndexOf(":");
    if (colon === -1) return null;
    const photoId = raw.slice(0, colon);
    const expiresAt = parseInt(raw.slice(colon + 1), 10);
    if (isNaN(expiresAt) || expiresAt < Date.now()) return null;
    return photoId;
  } catch {
    return null;
  }
}