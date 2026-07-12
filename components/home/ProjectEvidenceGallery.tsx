import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

type EvidenceProject = {
  id: string;
  name: string;
  purpose?: string;
  currentStatus?: string;
  transferableCapabilities: string[];
  limitations: string[];
  visual?: { animationSrc?: string; posterSrc?: string; alt?: string };
};

export function ProjectEvidenceGallery({ projects }: { projects: EvidenceProject[] }) {
  return (
    <section id="cases" className="mx-auto max-w-6xl px-4 py-16 lg:py-24">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">Case film</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">真实交付现场</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">案例用于证明不同流程能力，不把任何一个行业写成固定服务模板。</p>
        </div>
        <Link href="/projects" className="inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-accent">
          查看全部案例 <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>

      <div className="mt-8 grid gap-5">
        {projects.map((project) => (
          <article key={project.id} className="grid overflow-hidden border border-hairline bg-surface-paper-elevated lg:grid-cols-[1.15fr_0.85fr]">
            <div className="min-h-72 bg-surface-graphite p-2">
              {project.visual?.animationSrc ? (
                <iframe
                  src={project.visual.animationSrc}
                  title={project.visual.alt || `${project.name} interface`}
                  loading="lazy"
                  className="h-full min-h-72 w-full border-0"
                />
              ) : null}
            </div>
            <div className="p-6 sm:p-8">
              <h3 className="text-2xl font-semibold text-foreground">{project.name}</h3>
              {project.purpose ? <p className="mt-3 text-sm leading-7 text-muted-foreground">{project.purpose}</p> : null}
              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">证明的可迁移能力</p>
              <ul className="mt-3 space-y-2">
                {project.transferableCapabilities.slice(0, 4).map((item) => (
                  <li key={item} className="flex gap-2 text-sm leading-6 text-foreground/80">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-accent" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              {project.currentStatus ? <p className="mt-6 border-t border-hairline pt-5 text-sm leading-7 text-foreground">{project.currentStatus}</p> : null}
              <Link href={`/projects/${project.id}`} className="mt-6 inline-flex items-center gap-2 border border-foreground px-4 py-2 text-sm font-semibold text-foreground hover:border-accent hover:text-accent">
                查看公开证据 <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
