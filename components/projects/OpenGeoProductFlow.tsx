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

      {copy.reportShowcase ? (
        <section
          id="open-geo-report-sample"
          className="mt-6 grid overflow-hidden border border-hairline bg-surface-paper-elevated lg:grid-cols-[1.18fr_0.82fr]"
          aria-labelledby="open-geo-report-sample-title"
        >
          <div className="overflow-hidden border-b border-hairline bg-[#e9e5db] p-3 sm:p-5 lg:min-h-[36rem] lg:border-b-0 lg:border-r">
            <div
              data-report-preview-lang={locale}
              aria-label={copy.reportShowcase.preview.label}
              className="grid min-h-full overflow-hidden border border-[#c8c2b5] bg-[#f7f4ec] shadow-[0_18px_45px_-32px_rgba(34,62,55,0.55)] sm:grid-cols-[10rem_minmax(0,1fr)]"
            >
              <aside className="border-b border-[#d8d2c6] bg-[#173f37] p-5 text-[#f8f4ea] sm:border-b-0 sm:border-r">
                <p className="text-lg font-semibold tracking-[-0.03em]">Open GEO</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-[#c8ddd5]">
                  {copy.reportShowcase.preview.brandLine}
                </p>
                <ol className="mt-8 hidden space-y-3 sm:block">
                  {copy.reportShowcase.preview.sections.map((section, index) => (
                    <li
                      key={section}
                      className={`grid grid-cols-[1.5rem_1fr] gap-2 border-t pt-3 text-[10px] leading-4 ${
                        index === 0
                          ? "border-[#8bb5a7] text-white"
                          : "border-white/15 text-[#c8ddd5]"
                      }`}
                    >
                      <span className="font-mono">{String(index).padStart(2, "0")}</span>
                      <span>{section}</span>
                    </li>
                  ))}
                </ol>
              </aside>
              <article className="flex min-w-0 flex-col justify-between p-6 sm:p-8 lg:p-10">
                <div>
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#2f7465]">
                    00 / {copy.reportShowcase.preview.title}
                  </p>
                  <h4 className="mt-5 text-3xl font-semibold tracking-[-0.045em] text-[#173f37] sm:text-4xl">
                    {copy.reportShowcase.preview.title}
                  </h4>
                  <p className="mt-6 max-w-xl text-sm leading-7 text-[#526760] sm:text-base sm:leading-8">
                    {copy.reportShowcase.preview.summary}
                  </p>
                  <div className="mt-8 h-px bg-[#d8d2c6]" />
                  <p className="mt-6 text-xs font-semibold leading-6 text-[#173f37]">
                    {copy.reportShowcase.preview.sections.slice(1, 4).join(" · ")}
                  </p>
                </div>
                <dl className="mt-10 grid gap-px border border-[#d8d2c6] bg-[#d8d2c6] sm:grid-cols-3">
                  {[
                    [copy.reportShowcase.preview.targetLabel, copy.reportShowcase.preview.target],
                    [copy.reportShowcase.preview.generatedLabel, copy.reportShowcase.preview.generated],
                    [copy.reportShowcase.preview.questionsLabel, copy.reportShowcase.preview.questions],
                  ].map(([label, value]) => (
                    <div key={label} className="min-w-0 bg-[#fbf8f1] p-3 sm:p-4">
                      <dt className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#708078]">
                        {label}
                      </dt>
                      <dd className="mt-2 whitespace-nowrap font-mono text-[9px] font-semibold text-[#173f37] sm:text-[10px]">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </article>
            </div>
          </div>
          <div className="flex flex-col justify-between p-6 sm:p-8 lg:p-10">
            <div>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
                {copy.reportShowcase.eyebrow}
              </p>
              <h3
                id="open-geo-report-sample-title"
                className="mt-4 text-2xl font-semibold tracking-[-0.035em] text-foreground sm:text-3xl"
              >
                {copy.reportShowcase.heading}
              </h3>
              <p className="mt-5 text-sm leading-7 text-muted-foreground">
                {copy.reportShowcase.description}
              </p>
              <dl className="mt-7 grid gap-px border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {copy.reportShowcase.facts.map((fact) => (
                  <div key={fact.label} className="bg-surface-paper p-4">
                    <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      {fact.label}
                    </dt>
                    <dd className="mt-2 text-sm font-semibold text-foreground">
                      {fact.value}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-5 text-xs leading-6 text-muted-foreground">
                {copy.reportShowcase.disclaimer}
              </p>
            </div>
            <Link
              href={copy.reportShowcase.path}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex min-h-11 items-center justify-between gap-3 border-t border-hairline pt-5 text-sm font-semibold text-foreground hover:text-accent"
            >
              {copy.reportShowcase.action}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </section>
      ) : null}

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
