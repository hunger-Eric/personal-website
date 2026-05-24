// app/api/photo/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, signPhotoToken, verifyPhotoToken } from "@/lib/photo-auth";
import photographyData from "@/config/photography.json";
import fs from "fs";
import path from "path";

/** Maximum file size: 20MB */
const MAX_FILE_SIZE = 20 * 1024 * 1024;

// Common image MIME types
const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".heic": "image/heic",
  ".heif": "image/heif",
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = request.nextUrl.searchParams.get("token");

  // Token is required
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 401 });
  }

  // Verify token
  const photoId = verifyPhotoToken(token);
  if (!photoId || photoId !== id) {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 403 }
    );
  }

  // Find the photo in config to get its src
  let photoSrc: string | null = null;
  for (const project of photographyData.projects) {
    for (const photo of project.photos) {
      if (photo.id === id && photo.private) {
        photoSrc = photo.src;
        break;
      }
    }
    if (photoSrc) break;
  }

  if (!photoSrc) {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }

  // If the src is a local file path (starts with / or .)
  if (photoSrc.startsWith("/") || photoSrc.startsWith(".") || photoSrc.startsWith("private-photos")) {
    const localPath = path.resolve(
      process.cwd(),
      photoSrc.startsWith("/") ? photoSrc.slice(1) : photoSrc
    );

    try {
      const stat = fs.statSync(localPath);
      if (!stat.isFile()) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
      }
      if (stat.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: "File too large" }, { status: 413 });
      }

      const ext = path.extname(localPath).toLowerCase();
      const mimeType = MIME[ext] || "application/octet-stream";
      const data = fs.readFileSync(localPath);

      return new NextResponse(data, {
        headers: {
          "Content-Type": mimeType,
          "Cache-Control": "private, max-age=3600",
          "Content-Length": String(stat.size),
        },
      });
    } catch (err) {
      console.error(`[photo-api] Failed to read ${localPath}:`, err);
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
  }

  // External URL — redirect (less secure but works as fallback)
  return NextResponse.redirect(photoSrc, 307);
}