import type { ComponentPropsWithoutRef, ReactNode } from "react";

type SurfaceTone = "paper" | "graphite" | "admin" | "default";
type SurfaceElement = "div" | "article" | "section";

type SurfaceProps = ComponentPropsWithoutRef<"div"> & {
  as?: SurfaceElement;
  tone?: SurfaceTone;
  children: ReactNode;
};

const toneClass: Record<SurfaceTone, string> = {
  paper: "border-hairline bg-surface-paper-elevated text-surface-paper-foreground",
  graphite: "border-inverse bg-surface-graphite text-surface-graphite-foreground",
  admin: "border-border bg-surface-admin text-foreground",
  default: "border-border bg-surface-paper text-foreground",
};

export function Surface({
  as: Component = "div",
  tone = "default",
  className = "",
  children,
  ...props
}: SurfaceProps) {
  return (
    <Component
      className={[
        "rounded-card border",
        toneClass[tone],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </Component>
  );
}
