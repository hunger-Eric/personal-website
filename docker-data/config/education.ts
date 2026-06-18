// config/education.ts
import raw from "./education.json";

export type EducationItem = {
  id: string;
  school: string;
  degree: string; // e.g. "Bachelor of Science - BS"
  major?: string;
  minor?: string;
  location?: string;
  start?: string;
  end?: string;
  expectedGraduation?: string;
  gpa?: string;
  coursework?: string[];
  activities?: string[];
  awards?: string[];
  imageUrl?: string;
};

// If you want a runtime guard, you can add one here; for now we trust the JSON.
export const education = raw as EducationItem[];
