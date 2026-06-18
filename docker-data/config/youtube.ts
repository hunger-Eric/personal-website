// config/youtube.ts
import raw from "./youtube.json";

export type YouTubeVideoCategory = "Project" | "Tutorial" | "Dev Log" | "Other";

export type YouTubeVideo = {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnailUrl: string;
  category?: YouTubeVideoCategory;
  duration?: string;
  date?: string;
  views?: string;
};

// Optionally validate/transform here if needed.
// For now we trust the JSON file shape.
export const youtubeVideos = raw as YouTubeVideo[];
