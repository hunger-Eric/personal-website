"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, RotateCcw } from "lucide-react";

import {
  OPEN_GEO_ARTIFACT_ID,
  OPEN_GEO_PROJECT_ID,
  getOpenGeoScenarios,
  openGeoDemoCopy,
  type OpenGeoScenarioId,
} from "@/config/open-geo-demo";
import { localizePublicPath, type Locale } from "@/config/locale";
import styles from "./OpenGeoParticipatoryDemo.module.css";

type Phase = "project" | "scenario" | "ready" | "running" | "artifact";

export default function OpenGeoParticipatoryDemo({
  locale = "zh",
}: {
  locale?: Locale;
}) {
  const [phase, setPhase] = useState<Phase>("project");
  const [scenarioId, setScenarioId] = useState<OpenGeoScenarioId | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const copy = openGeoDemoCopy[locale];
  const openGeoScenarios = getOpenGeoScenarios(locale);
  const scenario = openGeoScenarios.find((item) => item.id === scenarioId);

  const contactHref = scenario
    ? `${localizePublicPath("/contact", locale)}?project=${OPEN_GEO_PROJECT_ID}&scenario=${scenario.id}&artifact=${OPEN_GEO_ARTIFACT_ID}`
    : localizePublicPath("/contact", locale);

  const reset = () => {
    setPhase("project");
    setScenarioId(null);
    setStepIndex(0);
  };

  const selectScenario = (id: OpenGeoScenarioId) => {
    setScenarioId(id);
    setPhase("ready");
    setStepIndex(0);
  };

  const advance = () => {
    if (!scenario) return;
    if (stepIndex >= scenario.steps.length - 1) {
      setPhase("artifact");
      return;
    }
    setStepIndex((current) => current + 1);
  };

  const activeJourneyIndex = phase === "project" ? 0 : phase === "scenario" || phase === "ready" ? 1 : phase === "running" ? 3 : 4;

  return (
    <section className={styles.experience} aria-labelledby="open-geo-demo-heading" data-testid="open-geo-demo">
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>{copy.eyebrow}</p>
          <h2 id="open-geo-demo-heading">{copy.heading}</h2>
        </div>
        <p className={styles.notice} role="note">{copy.notice}</p>
      </div>

      <ol className={styles.journey} aria-label={copy.journeyLabel}>
        {copy.journey.map((label, index) => (
          <li key={label} data-active={index === activeJourneyIndex} data-complete={index < activeJourneyIndex}>
            <span>{index < activeJourneyIndex ? <Check aria-hidden /> : `0${index + 1}`}</span>
            {label}
          </li>
        ))}
      </ol>

      <div className={styles.stage}>
        {phase === "project" ? (
          <div>
            <p className={styles.kicker}>01 / {copy.selectProject}</p>
            <button className={styles.projectCard} type="button" onClick={() => setPhase("scenario")}>
              <span><strong>Open GEO Console</strong><small>{copy.projectSummary}</small></span>
              <ArrowRight aria-hidden />
            </button>
            <p className={styles.helper}>{copy.projectHelper}</p>
          </div>
        ) : null}

        {phase === "scenario" || phase === "ready" ? (
          <div>
            <div className={styles.stageTitle}>
              <div><p className={styles.kicker}>02 / {copy.selectScenario}</p><h3>{copy.scenarioQuestion}</h3></div>
              <button className={styles.textButton} type="button" onClick={() => setPhase("project")}><ArrowLeft aria-hidden /> {copy.backToProject}</button>
            </div>
            <div className={styles.scenarios} role="group" aria-label={copy.scenariosLabel}>
              {openGeoScenarios.map((item) => (
                <button key={item.id} type="button" aria-pressed={scenarioId === item.id} className={styles.scenarioCard} onClick={() => selectScenario(item.id)}>
                  <strong>{item.title}</strong><span>{item.summary}</span>
                </button>
              ))}
            </div>
            <button className={styles.primaryButton} type="button" disabled={!scenario} onClick={() => { setStepIndex(0); setPhase("running"); }}>
              {copy.start} <ArrowRight aria-hidden />
            </button>
          </div>
        ) : null}

        {phase === "running" && scenario ? (
          <div>
            <div className={styles.stageTitle}>
              <div><p className={styles.kicker}>04 / {copy.advance}</p><h3>{scenario.steps[stepIndex].title}</h3></div>
              <p className={styles.counter} role="status">{copy.step} {stepIndex + 1} / {scenario.steps.length}</p>
            </div>
            <div className={styles.stepBody}>
              <p>{scenario.steps[stepIndex].detail}</p>
              <div aria-label={copy.recordLabel}>
                <span>{copy.input}</span><strong>{copy.inputValue}</strong>
                <span>{copy.processing}</span><strong>{copy.processingValue}</strong>
                <span>{copy.output}</span><strong>{copy.outputValue}</strong>
              </div>
            </div>
            <div className={styles.actions}>
              <button className={styles.secondaryButton} type="button" disabled={stepIndex === 0} onClick={() => setStepIndex((current) => Math.max(0, current - 1))}>{copy.previous}</button>
              <button className={styles.primaryButton} type="button" onClick={advance}>{stepIndex === scenario.steps.length - 1 ? copy.viewDeliverable : copy.next}<ArrowRight aria-hidden /></button>
              <button className={styles.textButton} type="button" onClick={reset}><RotateCcw aria-hidden /> {copy.resetSelection}</button>
            </div>
          </div>
        ) : null}

        {phase === "artifact" && scenario ? (
          <div>
            <div className={styles.stageTitle}><div><p className={styles.kicker}>05 / {copy.deliverable}</p><h3>{scenario.artifact.title}</h3></div><span className={styles.simulationBadge}>{copy.simulatedData}</span></div>
            <article className={styles.artifact} aria-label={copy.artifactLabel}>
              <p>{copy.artifactDisclaimer}</p>
              <ol>{scenario.artifact.findings.map((finding, index) => <li key={finding}><span>0{index + 1}</span>{finding}</li>)}</ol>
            </article>
            <div className={styles.actions}>
              <Link className={styles.primaryButton} href={contactHref}>{copy.contact} <ArrowRight aria-hidden /></Link>
              <button className={styles.secondaryButton} type="button" onClick={() => { setPhase("scenario"); setScenarioId(null); }}>{copy.changeScenario}</button>
              <button className={styles.textButton} type="button" onClick={reset}><RotateCcw aria-hidden /> {copy.restart}</button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
