"use client";

import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  Bot,
  ExternalLink,
  PackageCheck,
  RefreshCw,
  ShieldCheck,
  UserRoundCheck,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

import { useLocale } from "@/components/LocaleProvider";
import { localizePublicPath } from "@/config/locale";
import { openGeoProductCopy } from "@/config/open-geo-product";
import { getLocalizedPublicContent } from "@/config/public-content";
import { getPublicWebsiteProjects } from "@/config/website-projects";
import styles from "./ProjectJourneys.module.css";

type ProjectId =
  | "open-geo-console"
  | "hermes-notebook"
  | "freight-lead-agent"
  | "codex-feishu-bridge";

type EvidenceProject = {
  id: ProjectId;
  name: string;
  category: string;
  status: string;
  before: string;
  system: string;
  human: string;
  recovery?: string;
  limitation?: string;
  deliverables: string[];
  liveUrl?: string;
};

function shortStatus(value: string) {
  return value.split(/[｜|]/)[0]?.trim() ?? value;
}

export function ProjectJourneys() {
  const { locale } = useLocale();
  const zh = locale === "zh";
  const path = (value: string) => localizePublicPath(value, locale);
  const [selectedId, setSelectedId] = useState<ProjectId>("freight-lead-agent");

  const projects = useMemo<EvidenceProject[]>(() => {
    const publicProjects = getPublicWebsiteProjects(locale);
    const reviewedProjects = getLocalizedPublicContent(locale).projects;
    const reviewedById = new Map(reviewedProjects.map((project) => [project.id, project]));
    const openGeoCopy = openGeoProductCopy[locale];

    return publicProjects.map((project) => {
      const reviewed = reviewedById.get(project.id);
      const facts = new Map(project.facts.map((fact) => [fact.kind, fact.text]));
      const buyerValue = facts.get("buyerValue") ?? project.summary;

      return {
        id: project.id as ProjectId,
        name: project.name,
        category: project.category,
        status: shortStatus(project.status),
        before: facts.get("problem") ?? project.summary,
        system: facts.get("solution") ?? project.summary,
        human:
          reviewed?.humanReview[0] ??
          (project.id === "open-geo-console" ? openGeoCopy.humanBoundary : undefined) ??
          buyerValue,
        recovery: reviewed?.failureRecovery[0],
        limitation: reviewed?.limitations[0],
        deliverables: reviewed?.outputs.slice(0, 4) ?? [buyerValue],
        liveUrl: project.liveUrl,
      };
    });
  }, [locale]);

  const selected =
    projects.find((project) => project.id === selectedId) ?? projects[2];

  return (
    <section
      id="project-journeys"
      className={styles.section}
      aria-labelledby="project-journeys-title"
    >
      <div className={styles.shell}>
        <p className={styles.eyebrow}>02 / Project evidence</p>
        <div className={styles.intro}>
          <h2 id="project-journeys-title">
            {zh
              ? "一眼看懂：原来哪里耗人，系统接走了什么。"
              : "See where work was draining time—and what the system took over."}
          </h2>
          <p>
            {zh
              ? "先看业务问题、人工边界与可验收交付，再进入完整项目证据。"
              : "Start with the business problem, human boundary, and verifiable deliverables—then open the full evidence."}
          </p>
        </div>

        <div className={styles.tabs} role="tablist" aria-label={zh ? "项目证据" : "Project evidence"}>
          {projects.map((project, index) => {
            const isSelected = project.id === selected.id;
            return (
              <button
                key={project.id}
                type="button"
                role="tab"
                id={`project-evidence-tab-${project.id}`}
                aria-controls="project-evidence-panel"
                aria-selected={isSelected}
                data-selected={isSelected}
                onClick={() => setSelectedId(project.id)}
              >
                <span>0{index + 1}</span>
                <strong>{project.name}</strong>
                <small>{project.status}</small>
              </button>
            );
          })}
        </div>

        <article
          id="project-evidence-panel"
          className={styles.panel}
          role="tabpanel"
          aria-labelledby={`project-evidence-tab-${selected.id}`}
        >
          <header className={styles.projectHeader}>
            <div>
              <span>{zh ? "当前项目" : "SELECTED PROJECT"}</span>
              <h3>{selected.name}</h3>
              <p>{selected.category}</p>
            </div>
            <strong>{selected.status}</strong>
          </header>

          <div className={styles.transformation}>
            <section className={styles.phase}>
              <div className={styles.phaseLabel}>
                <XCircle aria-hidden />
                <span>{zh ? "改造前" : "Before"}</span>
              </div>
              <p>{selected.before}</p>
            </section>

            <ArrowRight className={styles.flowArrow} aria-hidden />
            <ArrowDown className={styles.flowArrowMobile} aria-hidden />

            <section className={`${styles.phase} ${styles.systemPhase}`}>
              <div className={styles.phaseLabel}>
                <Bot aria-hidden />
                <span>{zh ? "系统接管" : "System takeover"}</span>
              </div>
              <p>{selected.system}</p>
            </section>

            <ArrowRight className={styles.flowArrow} aria-hidden />
            <ArrowDown className={styles.flowArrowMobile} aria-hidden />

            <section className={styles.phase}>
              <div className={styles.phaseLabel}>
                <UserRoundCheck aria-hidden />
                <span>{zh ? "人工保留" : "Human control"}</span>
              </div>
              <p>{selected.human}</p>
            </section>
          </div>

          {selected.recovery || selected.limitation ? (
            <div className={styles.boundaries}>
              {selected.recovery ? (
                <div>
                  <RefreshCw aria-hidden />
                  <span>{zh ? "恢复与边界" : "Recovery and boundary"}</span>
                  <p>{selected.recovery}</p>
                </div>
              ) : null}
              {selected.limitation ? (
                <div>
                  <ShieldCheck aria-hidden />
                  <span>{zh ? "主要限制" : "Key limitation"}</span>
                  <p>{selected.limitation}</p>
                </div>
              ) : null}
            </div>
          ) : null}

          <footer className={styles.deliverableBar}>
            <div className={styles.deliverables}>
              <div className={styles.deliverableTitle}>
                <PackageCheck aria-hidden />
                <span>{zh ? "可验收交付" : "Verifiable deliverables"}</span>
              </div>
              <ul>
                {selected.deliverables.map((deliverable) => (
                  <li key={deliverable}>{deliverable}</li>
                ))}
              </ul>
            </div>

            <div className={styles.actions}>
              {selected.liveUrl ? (
                <a href={selected.liveUrl} target="_blank" rel="noreferrer">
                  {zh ? "进入正式产品" : "Open live product"}
                  <ExternalLink aria-hidden />
                </a>
              ) : null}
              <Link href={path(`/projects/${selected.id}`)}>
                {zh ? `查看 ${selected.name} 项目证据` : `View ${selected.name} evidence`}
                <ArrowRight aria-hidden />
              </Link>
            </div>
          </footer>
        </article>
      </div>
    </section>
  );
}
