import { NextRequest, NextResponse } from "next/server";

import photographyData from "@/config/photography.json";
import { adminGuard } from "@/lib/admin-guard";
import {
  deleteRepoFile,
  getRepoFile,
  listRepoDir,
  saveConfig,
  uploadPhoto,
} from "@/lib/github-photo";

type Photo = {
  id: string;
  title: string;
  description: string;
  src: string;
  width: number;
  height: number;
  date: string;
  private: boolean;
};

type Project = {
  id: string;
  photos: Photo[];
  photoCount: number;
  [key: string]: unknown;
};

type Config = {
  description: string;
  projects: Project[];
  [key: string]: unknown;
};

type DraftMeta = {
  id?: string;
  projectId?: string;
  order?: number;
  title?: string;
  description?: string;
  width?: number;
  height?: number;
  date?: string;
  private?: boolean;
};

function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function buildPhotoFromDraft(meta: DraftMeta, src: string, fileName: string): Photo {
  return {
    id: meta.id || fileName,
    title: meta.title || fileName.replace(/\.[^/.]+$/, ""),
    description: meta.description || "",
    src,
    width: meta.width || 16,
    height: meta.height || 9,
    date: meta.date || new Date().toISOString().slice(0, 7),
    private: meta.private === true,
  };
}

async function listRepoDirOrWarning(dir: string) {
  try {
    return {
      files: await listRepoDir(dir),
      warning: null,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load file listing";
    return {
      files: [] as string[],
      warning: `${dir}: ${message}`,
    };
  }
}

export async function GET(request: NextRequest) {
  const guard = adminGuard(request);
  if (guard) return guard;

  const [publicListing, privateListing] = await Promise.all([
    listRepoDirOrWarning("public/images/photography"),
    listRepoDirOrWarning("private-photos"),
  ]);
  const warnings = [
    publicListing.warning,
    privateListing.warning,
  ].filter((warning): warning is string => Boolean(warning));

  return NextResponse.json({
    config: photographyData.zh,
    locales: photographyData,
    files: {
      public: publicListing.files,
      private: privateListing.files,
    },
    warnings,
  });
}

export async function POST(request: NextRequest) {
  const guard = adminGuard(request);
  if (guard) return guard;

  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const configStr = formData.get("config") as string | null;

      if (!configStr) {
        return NextResponse.json({ error: "Missing config data" }, { status: 400 });
      }

      const config = JSON.parse(configStr) as Config;
      const photoEntries = formData.getAll("photo") as File[];
      const photoMeta = formData.getAll("photo_meta") as string[];

      const uploaded: Array<{
        id: string;
        path: string;
        url: string;
        projectId?: string;
      }> = [];

      for (let i = 0; i < photoEntries.length; i++) {
        const file = photoEntries[i];
        const meta = safeJsonParse<DraftMeta>(photoMeta[i], {});
        const buffer = Buffer.from(await file.arrayBuffer());
        const base64 = buffer.toString("base64");

        const result = await uploadPhoto(file.name, base64, meta.private === true);
        uploaded.push({
          id: meta.id || file.name,
          path: result.path,
          url: result.url,
          projectId: meta.projectId,
        });

        if (!meta.projectId) continue;
        const project = config.projects.find((p) => p.id === meta.projectId);
        if (!project) continue;

        const photo = buildPhotoFromDraft(meta, result.url, file.name);
        const insertAt =
          typeof meta.order === "number"
            ? Math.max(0, Math.min(meta.order, project.photos.length))
            : project.photos.length;

        project.photos.splice(insertAt, 0, photo);
        project.photoCount = project.photos.length;
      }

      await saveConfig(config);

      return NextResponse.json({
        success: true,
        uploaded,
        config,
        message: `已保存，新增 ${uploaded.length} 张照片`,
      });
    }

    const body = await request.json();

    if (!body || !body.config) {
      return NextResponse.json({ error: "Missing config payload" }, { status: 400 });
    }

    await saveConfig(body.config);

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
  } catch (err: unknown) {
    console.error("Admin photo API error:", err);
    const message = err instanceof Error ? err.message : "保存失败";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
