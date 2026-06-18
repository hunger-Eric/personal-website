import type { ReactNode } from "react";

type AdminPanelProps = {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function AdminPanel({
  title,
  description,
  actions,
  children,
  className = "",
}: AdminPanelProps) {
  return (
    <section
      className={[
        "rounded-card border border-border bg-surface-admin",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div className="min-w-0">
          <h2 className="text-base font-semibold tracking-tight text-foreground">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex gap-2">{actions}</div> : null}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}
