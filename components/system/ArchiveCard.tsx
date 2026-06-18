import Link from "next/link";
import type { ReactNode } from "react";

type ArchiveCardProps = {
  href: string;
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function ArchiveCard({
  href,
  title,
  description,
  meta,
  action,
  className = "",
}: ArchiveCardProps) {
  return (
    <article
      className={[
        "border-t border-hairline py-4 first:border-t-0",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Link href={href} className="group grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
        <div className="min-w-0">
          {meta ? (
            <div className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {meta}
            </div>
          ) : null}
          <h3 className="text-lg font-semibold tracking-tight text-foreground group-hover:text-accent">
            {title}
          </h3>
          {description ? (
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action ? <div className="text-sm font-semibold text-muted-foreground">{action}</div> : null}
      </Link>
    </article>
  );
}

