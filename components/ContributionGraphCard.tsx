// components/ContributionGraphCard.tsx
// Lightweight, image-only contribution graph. Pulls a static SVG from
// ghchart.rshah.org so we skip the GitHub API call, avoid client-side state,
// and let the browser cache it. Year switching was removed since this is a
// filler section — adding it back would re-introduce the heavier dynamic
// component this replaced.

const GH_USERNAME =
  process.env.NEXT_PUBLIC_GITHUB_USERNAME?.trim() || "KevinTrinhDev";

// Indigo-500 (#6366f1) without the leading hash — the chart service expects raw hex.
const CELL_COLOR = "6366f1";

const CHART_URL = `https://ghchart.rshah.org/${CELL_COLOR}/${GH_USERNAME}`;

interface ContributionGraphCardProps {
  title?: string;
  className?: string;
}

export function ContributionGraphCard({
  title = "Contribution Graph",
  className,
}: ContributionGraphCardProps) {
  return (
    <section className={`mt-10 ${className ?? ""}`}>
      <div className="flex items-center gap-4">
        <h2 className="font-mono text-[13px] font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:text-lg">
          ~/{title}
        </h2>
        <div className="hidden h-px w-40 bg-white/15 sm:block sm:w-72" aria-hidden />
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={CHART_URL}
        alt={`${GH_USERNAME}'s contribution graph for the last year`}
        loading="lazy"
        className="mt-4 w-full max-w-full rounded-md"
      />
    </section>
  );
}
