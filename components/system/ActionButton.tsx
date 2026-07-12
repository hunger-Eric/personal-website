import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type ButtonTone = "primary" | "secondary" | "ghost";

type CommonProps = {
  tone?: ButtonTone;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
};

type ButtonActionProps = CommonProps &
  Omit<ComponentPropsWithoutRef<"button">, keyof CommonProps | "href"> & {
    href?: undefined;
  };

type LinkActionProps = CommonProps &
  Omit<ComponentPropsWithoutRef<typeof Link>, keyof CommonProps | "href"> & {
    href: string;
  };

type ActionButtonProps = ButtonActionProps | LinkActionProps;

function isLinkAction(props: ActionButtonProps): props is LinkActionProps {
  return typeof props.href === "string" && props.href.length > 0;
}

function stripCommonProps<T extends CommonProps>(
  props: T
): Omit<T, keyof CommonProps> {
  const rest = { ...props } as T & Record<string, unknown>;
  Reflect.deleteProperty(rest, "tone");
  Reflect.deleteProperty(rest, "icon");
  Reflect.deleteProperty(rest, "children");
  Reflect.deleteProperty(rest, "className");
  return rest;
}

const toneClass: Record<ButtonTone, string> = {
  primary: "border-accent bg-accent text-accent-foreground hover:bg-accent-hover",
  secondary: "border-border bg-surface-paper text-foreground hover:bg-muted",
  ghost: "border-transparent bg-transparent text-foreground hover:bg-muted",
};

export function ActionButton(allProps: ActionButtonProps) {
  const {
    tone = "secondary",
    icon,
    children,
    className = "",
  } = allProps;
  const classes = [
    "inline-flex items-center justify-center gap-2 rounded-control border px-3.5 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50",
    toneClass[tone],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (isLinkAction(allProps)) {
    const linkProps = stripCommonProps(allProps);
    return (
      <Link {...linkProps} className={classes}>
        {icon}
        <span>{children}</span>
      </Link>
    );
  }

  const buttonProps = stripCommonProps(allProps);
  return (
    <button {...buttonProps} className={classes}>
      {icon}
      <span>{children}</span>
    </button>
  );
}
