// app/api/auth/photo-session/route.ts
import { NextRequest, NextResponse } from "next/server";
import { signSessionToken, signPhotoToken } from "@/lib/photo-auth";
import photographyData from "@/config/photography.json";

const PIN = process.env.PRIVATE_PHOTO_PIN;

type Photo = {
  id: string;
  private?: boolean;
};

type Project = {
  photos?: Photo[];
};

type PhotographyConfig = {
  projects?: Project[];
  zh?: { projects?: Project[] };
};

// Photography data is locale-keyed: { zh: { projects: [...] }, en: { projects: [...] } }
const typedPhotographyData = photographyData as PhotographyConfig;
const allProjects =
  typedPhotographyData.zh?.projects ?? typedPhotographyData.projects ?? [];

export async function POST(request: NextRequest) {
  // If no PIN is configured, private photos are effectively disabled
  if (!PIN) {
    return NextResponse.json(
      { error: "Private photos not configured" },
      { status: 501 }
    );
  }

  let body: { pin?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Validate PIN (timing-safe comparison not critical for a personal site PIN)
  if (body.pin !== PIN) {
    return NextResponse.json({ error: "Invalid PIN" }, { status: 403 });
  }

  // Generate session token
  const sessionToken = signSessionToken();

  // Collect all private photo IDs and sign each
  const privatePhotos: Array<{ id: string; token: string }> = [];
  for (const project of allProjects) {
    for (const photo of project.photos) {
      if (photo.private) {
        privatePhotos.push({
          id: photo.id,
          token: signPhotoToken(photo.id),
        });
      }
    }
  }

  return NextResponse.json({
    sessionToken,
    photos: privatePhotos,
    expiresIn: 24 * 60 * 60, // seconds
  });
}
