// components/sections/Publications.tsx
import Image from "next/image";
import { FileText, BookOpenText, ArrowUpRight, ScrollText } from "lucide-react";

import publications from "../../config/publications.json";

type PublicationLink = {
  label: string;
  subtitle?: string;
  href: string;
  type?: string;
};

type Publication = {
  id: string;
  title: string;
  venue: string;
  volume?: string;
  publisher?: string;
  year?: string;
  type?: string;
  summary: string;
  image?: string;
  links?: PublicationLink[];
};

function iconForLinkType(type?: string) {
  switch (type) {
    case "pdf":
      return FileText;
    case "publication":
      return BookOpenText;
    case "abstract":
      return ScrollText;
    default:
      return ArrowUpRight;
  }
}

export function PublicationsSection() {
  const list = publications as Publication[];
  if (!list?.length) return null;

  const featured = list[0];
  const primaryHref =
    featured.links?.find((l) => l.type === "publication")?.href ??
    featured.links?.[0]?.href ??
    "#";

  return (
    <section id="publications" className="py-16 scroll-mt-12 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          ~/Publications
        </h2>
        <h3 className="mt-3 text-2xl font-semibold sm:text-3xl">
          Peer-reviewed research.
        </h3>

        <article className="group mt-8 overflow-hidden rounded-lg border border-white/10 bg-white/5 transition-colors duration-200 hover:border-white/20 hover:bg-white/[0.07]">
          <div className="grid gap-0 lg:grid-cols-[1fr_minmax(0,1.4fr)]">
            {featured.image ? (
              <a
                href={primaryHref}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={`Open ${featured.title}`}
                className="relative block aspect-[4/5] w-full overflow-hidden bg-white/5 lg:aspect-auto lg:min-h-[320px]"
              >
                <Image
                  src={featured.image}
                  alt={featured.title}
                  fill
                  sizes="(min-width: 1024px) 420px, 100vw"
                  className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                />
              </a>
            ) : null}

            <div className="flex flex-col p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {featured.type ? (
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-indigo-400/30 bg-indigo-500/10 px-2 py-1 text-indigo-300">
                    <BookOpenText className="h-3.5 w-3.5" />
                    {featured.type}
                  </span>
                ) : null}
                {featured.year ? (
                  <span className="text-muted-foreground/80">
                    {featured.year}
                  </span>
                ) : null}
              </div>

              <h4 className="mt-3 text-lg font-semibold leading-snug text-foreground sm:text-xl">
                <a
                  href={primaryHref}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="bg-[length:0%_2px] bg-left-bottom bg-no-repeat bg-gradient-to-r from-white/70 to-white/70 transition-[background-size] duration-300 ease-out group-hover:bg-[length:100%_2px]"
                >
                  {featured.title}
                </a>
              </h4>

              <div className="mt-2 text-[13px] text-muted-foreground sm:text-sm">
                <span className="text-slate-200/90">{featured.venue}</span>
                {featured.volume ? <span> · {featured.volume}</span> : null}
                {featured.publisher ? (
                  <span> · {featured.publisher}</span>
                ) : null}
              </div>

              <p className="mt-4 text-[14px] leading-6 text-muted-foreground sm:text-[15px]">
                {featured.summary}
              </p>

              {featured.links?.length ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {featured.links.map((link) => {
                    const Icon = iconForLinkType(link.type);
                    return (
                      <a
                        key={`${featured.id}-${link.label}`}
                        href={link.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-transparent px-2.5 py-1 text-[12px] text-muted-foreground transition-colors hover:border-accent hover:text-foreground"
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <span className="font-semibold">{link.label}</span>
                        {link.subtitle ? (
                          <span className="text-[11px] text-muted-foreground/80">
                            · {link.subtitle}
                          </span>
                        ) : null}
                      </a>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
