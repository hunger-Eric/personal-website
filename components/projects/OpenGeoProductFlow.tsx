import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";

import { localizePublicPath, type Locale } from "@/config/locale";
import { openGeoProductCopy } from "@/config/open-geo-product";

export function OpenGeoProductFlow({
  locale,
  liveUrl,
}: {
  locale: Locale;
  liveUrl: string;
}) {
  const copy = openGeoProductCopy[locale];

  return (
    <section
      id="open-geo-product-flow"
      className="mt-10 border-y border-hairline py-9"
      aria-labelledby="open-geo-product-flow-title"
    >
      <header className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            {copy.eyebrow}
          </p>
          <h2
            id="open-geo-product-flow-title"
            className="mt-3 max-w-4xl text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl"
          >
            {copy.heading}
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground">
            {copy.description}
          </p>
        </div>
        <a
          href={liveUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center justify-center gap-2 bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground hover:bg-accent-hover"
        >
          {copy.primaryAction}
          <ExternalLink className="h-4 w-4" aria-hidden />
        </a>
      </header>

      <ol
        className="mt-9 grid gap-px border border-hairline bg-hairline md:grid-cols-4"
        aria-label={copy.stepsLabel}
      >
        {copy.steps.map((step, index) => (
          <li
            key={step.title}
            className="relative min-h-56 bg-surface-paper-elevated p-6"
          >
            <span className="font-mono text-xs font-semibold text-accent">
              0{index + 1}
            </span>
            <h3 className="mt-10 text-xl font-semibold text-foreground">
              {step.title}
            </h3>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              {step.description}
            </p>
            {index < copy.steps.length - 1 ? (
              <ArrowRight
                className="absolute -right-3 top-8 z-10 hidden h-6 w-6 bg-surface-paper text-accent md:block"
                aria-hidden
              />
            ) : null}
          </li>
        ))}
      </ol>

      <div className="mt-6 grid bg-surface-graphite text-surface-graphite-foreground lg:grid-cols-[0.72fr_1.28fr]">
        <div className="border-b border-border-inverse p-6 lg:border-b-0 lg:border-r">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-accent-light">
            {copy.outputsEyebrow}
          </p>
          <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
            {copy.outputsHeading}
          </h3>
        </div>
        <ul className="grid sm:grid-cols-2">
          {copy.outputs.map((output, index) => (
            <li
              key={output}
              className="flex min-h-20 items-center gap-3 border-b border-border-inverse px-6 py-4 last:border-b-0 sm:[&:nth-child(odd)]:border-r sm:[&:nth-last-child(-n+2)]:border-b-0"
            >
              <span className="font-mono text-xs text-accent-light">
                0{index + 1}
              </span>
              <span className="text-sm font-semibold">{output}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 grid gap-5 border-l-2 border-accent pl-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {copy.boundaryLabel}
          </h3>
          <p className="mt-2 max-w-4xl text-sm leading-7 text-muted-foreground">
            {copy.boundary}
          </p>
        </div>
        <Link
          href={localizePublicPath(
            "/articles/ai-search-visibility-audit-geo",
            locale
          )}
          className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-foreground hover:text-accent"
        >
          {copy.secondaryAction}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
