"use client";

import { useMemo } from "react";
import { Boxes, FolderOpen } from "lucide-react";

import { useLocale } from "@/components/LocaleProvider";
import { getSiteCopy } from "@/config/contentCopy";
import type { CaseItem } from "../../config/cases";
import { CaseCard } from "./CaseCard";

type Props = {
  cases: CaseItem[];
};

export function CasesBrowser({ cases }: Props) {
  const { locale } = useLocale();
  const copy = getSiteCopy(locale);

  const groups = useMemo(() => {
    const featured = cases.filter((caseItem) => caseItem.featured);
    const archive = cases.filter((caseItem) => !caseItem.featured);
    return { featured: featured.length ? featured : cases.slice(0, 1), archive };
  }, [cases]);

  if (!cases.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <FolderOpen className="mb-4 h-12 w-12 text-muted-foreground/50" />
        <h3 className="mb-1 text-lg font-semibold">{copy.cases.emptyTitle}</h3>
        <p className="text-sm text-muted-foreground">{copy.cases.emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <section>
        <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          <Boxes className="h-4 w-4" />
          <span>{locale === "zh" ? "精选案例" : copy.cases.featuredBadge}</span>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {groups.featured.map((caseItem) => (
            <CaseCard key={caseItem.id} caseItem={caseItem} featured />
          ))}
        </div>
      </section>

      {groups.archive.length ? (
        <section>
          <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <FolderOpen className="h-4 w-4" />
            <span>{locale === "zh" ? "系统档案" : "System Archive"}</span>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {groups.archive.map((caseItem) => (
              <CaseCard key={caseItem.id} caseItem={caseItem} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
