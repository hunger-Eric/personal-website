import type { Metadata } from "next";

import { AboutPageClient } from "@/components/about/AboutPageClient";

export const metadata: Metadata = {
  title: "关于",
  description: "了解实解智能适合处理的问题、项目负责人和具体合作方式。",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return <AboutPageClient />;
}
