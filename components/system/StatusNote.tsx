import type { ReactNode } from "react";

type StatusNoteTone = "info" | "success" | "warning" | "danger";

type StatusNoteProps = {
  tone?: StatusNoteTone;
  title?: ReactNode;
  children: ReactNode;
  className?: string;
};

const toneClass: Record<StatusNoteTone, string> = {
  info: "border-border bg-surface-admin text-foreground",
  success: "border-success/40 bg-success/10 text-foreground",
  warning: "border-warning/40 bg-warning/10 text-foreground",
  danger: "border-destructive/40 bg-destructive/10 text-foreground",
};

export function StatusNote({
  tone = "info",
  title,
  children,
  className = "",
}: StatusNoteProps) {
  return (
    <div
      className={[
        "rounded-card border px-4 py-3 text-sm leading-6",
        toneClass[tone],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {title ? <p className="font-semibold">{title}</p> : null}
      <div className={title ? "mt-1 text-muted-foreground" : "text-muted-foreground"}>
        {children}
      </div>
    </div>
  );
}
