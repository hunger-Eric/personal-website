// app/admin/(dashboard)/layout.tsx
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { isAdminEnabled, verifyAdminToken } from "@/lib/admin-guard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin | fengc",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isAdminEnabled()) {
    notFound();
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  if (!verifyAdminToken(token ?? null)) {
    redirect("/admin/login");
  }

  return <>{children}</>;
}
