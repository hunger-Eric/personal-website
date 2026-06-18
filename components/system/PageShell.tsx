import type { ComponentPropsWithoutRef, ReactNode } from "react";

type PageShellTone = "public" | "admin" | "default";

type PageShellProps = ComponentPropsWithoutRef<"div"> & {
  tone?: PageShellTone;
  children: ReactNode;
};

const toneClass: Record<PageShellTone, string> = {
  public: "bg-surface-paper text-surface-paper-foreground",
  admin: "bg-background text-foreground",
  default: "bg-background text-foreground",
};

export function PageShell({
  tone = "default",
  className = "",
  children,
  ...props
}: PageShellProps) {
  return (
    <div className={[toneClass[tone], className].filter(Boolean).join(" ")} {...props}>
      {children}
    </div>
  );
}

