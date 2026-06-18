import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type ButtonTone = "primary" | "secondary" | "ghost";

type CommonProps = {
  tone?: ButtonTone;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
};

type ActionButtonProps =
  | (CommonProps & ComponentPropsWithoutRef<"button"> & { href?: never })
  | (CommonProps & ComponentPropsWithoutRef<typeof Link> & { href: string });

const toneClass: Record<ButtonTone, string> = {
  primary: "border-accent bg-accent text-accent-foreground hover:bg-accent-hover",
  secondary: "border-border bg-surface-paper text-foreground hover:bg-muted",
  ghost: "border-transparent bg-transparent text-foreground hover:bg-muted",
};

export function ActionButton({
  tone = "secondary",
  icon,
  children,
  className = "",
  ...props
}: ActionButtonProps) {
  const classes = [
    "inline-flex items-center justify-center gap-2 rounded-control border px-3.5 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50",
    toneClass[tone],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if ("href" in props && props.href) {
    return (
      <Link {...props} className={classes}>
        {icon}
        <span>{children}</span>
      </Link>
    );
  }

  return (
    <button {...props} className={classes}>
      {icon}
      <span>{children}</span>
    </button>
  );
}
