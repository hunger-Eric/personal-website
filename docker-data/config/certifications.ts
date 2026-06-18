// config/certifications.ts
import raw from "./certifications.json";

export type Certification = {
  name: string;
  issuer: string;
  date: string;
  description: string;
  imageUrl: string;
  link: string;
};

// If you want to validate/transform, do it here.
// For now we trust the JSON file shape.
export const certifications = raw as Certification[];
