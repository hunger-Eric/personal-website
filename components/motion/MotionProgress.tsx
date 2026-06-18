type MotionProgressProps = {
  value: number;
  className?: string;
  barClassName?: string;
};

export function MotionProgress({
  value,
  className = "",
  barClassName = "",
}: MotionProgressProps) {
  const width = `${Math.max(0, Math.min(100, value))}%`;

  return (
    <div
      className={[
        "h-1.5 overflow-hidden rounded-full bg-muted/25",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden="true"
    >
      <div
        className={[
          "h-full rounded-full bg-accent transition-[width] duration-500 motion-reduce:transition-none",
          barClassName,
        ]
          .filter(Boolean)
          .join(" ")}
        style={{ width }}
      />
    </div>
  );
}

