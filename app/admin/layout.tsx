// app/admin/layout.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isAdminEnabled } from "@/lib/admin-guard";

export const metadata: Metadata = {
  title: "Admin | fengc",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isAdminEnabled()) {
    notFound();
  }
  return <>{children}</>;
}