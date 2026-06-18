import type { ReactNode } from "react";

type FormFieldProps = {
  label: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function FormField({
  label,
  description,
  error,
  children,
  className = "",
}: FormFieldProps) {
  return (
    <label className={["block space-y-2", className].filter(Boolean).join(" ")}>
      <span className="block text-sm font-semibold text-foreground">{label}</span>
      {description ? (
        <span className="block text-xs leading-5 text-muted-foreground">{description}</span>
      ) : null}
      {children}
      {error ? <span className="block text-xs text-destructive">{error}</span> : null}
    </label>
  );
}

