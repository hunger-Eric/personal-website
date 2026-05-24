// app/admin/layout.tsx — root layout that just passes through
// Auth checks happen in (dashboard)/layout.tsx, not here
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
