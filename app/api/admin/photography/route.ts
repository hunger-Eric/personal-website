// app/api/admin/photography/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getRepoFile, saveConfig, uploadPhoto, deleteRepoFile, listRepoDir } from "@/lib/github-photo";
import photographyData from "@/config/photography.json";
import { adminGuard } from "@/lib/admin-guard";

/**
 * GET: return the current photography config + available photos in repo
 */
export async function GET(request: NextRequest) {
  const guard = adminGuard(request);
  if (guard) return guard;

  try {
    const publicPhotos = await listRepoDir("public/images/photography");
    const privatePhotos = await listRepoDir("private-photos");
    return NextResponse.json({
      config: photographyData,
      files: {
        public: publicPhotos,
        private: privatePhotos,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to load config" },
      { status: 500 }
    );
  }
}

/**
 * POST: save updated config + upload new photos
 * Expects multipart/form-data or JSON body
 */
export async function POST(request: NextRequest) {
  const guard = adminGuard(request);
  if (guard) return guard;

  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      // Handle form data: config.json + photo files
      const formData = await request.formData();

      // Get the config update
      const configStr = formData.get("config") as string;
      if (!configStr) {
        return NextResponse.json(
          { error: "Missing config data" },
          { status: 400 }
        );
      }
      const config = JSON.parse(configStr);

      // Upload new photo files
      const photoEntries = formData.getAll("photo") as File[];
      const photoMeta = formData.getAll("photo_meta") as string[];

      const uploaded: Array<{ id: string; path: string; url: string }> = [];

      for (let i = 0; i < photoEntries.length; i++) {
        const file = photoEntries[i];
        const meta = photoMeta[i] ? JSON.parse(photoMeta[i]) : {};
        const buffer = Buffer.from(await file.arrayBuffer());
        const base64 = buffer.toString("base64");

        const result = await uploadPhoto(
          file.name,
          base64,
          meta.private === true
        );
        uploaded.push({
          id: meta.id || file.name,
          path: result.path,
          url: result.url,
        });
      }

      // Save the config file
      await saveConfig(config);

      return NextResponse.json({
        success: true,
        uploaded,
        message: `已保存，新增 ${uploaded.length} 张照片`,
      });
    } else {
      // Handle JSON body: just config update (no new photos)
      const body = await request.json();

      // Validate
      if (!body || !body.config) {
        return NextResponse.json(
          { error: "Missing config payload" },
          { status: 400 }
        );
      }

      await saveConfig(body.config);

      // Handle deleted photos - remove files from repo
      if (body.deletedPhotos && Array.isArray(body.deletedPhotos)) {
        for (const photo of body.deletedPhotos) {
          try {
            const existing = await getRepoFile(photo.path);
            if (existing?.sha) {
              await deleteRepoFile(
                photo.path,
                existing.sha,
                `feat(photo): remove ${photo.path}`
              );
            }
          } catch (e) {
            console.warn(`Failed to delete ${photo.path}:`, e);
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: "配置已保存并推送到 GitHub",
      });
    }
  } catch (err: any) {
    console.error("Admin photo API error:", err);
    return NextResponse.json(
      { error: err.message || "保存失败" },
      { status: 500 }
    );
  }
}