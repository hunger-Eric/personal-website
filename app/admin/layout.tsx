// app/admin/layout.tsx
import type { Metadata } from "next/metadata";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { isAdminEnabled, verifyAdminToken } from "@/lib/admin-guard";

export const metadata: Metadata = {
  title: "Admin | fengc",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Master switch
  if (!isAdminEnabled()) {
    notFound();
  }

  // Check token from cookie
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  if (!verifyAdminToken(token ?? null)) {
    // Redirect to login page preserving the intended path
    redirect("/admin/login");
  }

  return <>{children}</>;
}
