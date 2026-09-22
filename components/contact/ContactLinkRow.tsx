import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

type ContactLinkRowProps = {
  href: string;
  label: string;
  value: string;
  actionLabel: string;
  accessibleLabel: string;
  icon: ReactNode;
};

export function ContactLinkRow({
  href,
  label,
  value,
  actionLabel,
  accessibleLabel,
  icon,
}: ContactLinkRowProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={accessibleLabel}
      className="group grid w-full grid-cols-[48px_minmax(0,1fr)] items-center gap-4 border-b border-hairline py-5 text-left transition-colors hover:bg-surface-paper-elevated focus:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:grid-cols-[48px_minmax(0,1fr)_auto]"
    >
      <span className="flex h-12 w-12 items-center justify-center bg-surface-paper-elevated text-accent" aria-hidden>
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-medium text-muted-foreground">{label}</span>
        <span className="mt-1 block truncate text-base font-medium text-foreground">{value}</span>
      </span>
      <span className="col-start-2 inline-flex items-center gap-2 text-sm font-semibold text-accent transition-colors group-hover:text-accent-hover sm:col-start-auto">
        {actionLabel}
        <ArrowUpRight className="h-4 w-4" aria-hidden />
      </span>
    </a>
  );
}
