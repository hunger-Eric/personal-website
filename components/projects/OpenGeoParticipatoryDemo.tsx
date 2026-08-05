"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, RotateCcw } from "lucide-react";

import {
  OPEN_GEO_ARTIFACT_ID,
  OPEN_GEO_PROJECT_ID,
  openGeoScenarios,
  type OpenGeoScenarioId,
} from "@/config/open-geo-demo";
import styles from "./OpenGeoParticipatoryDemo.module.css";

type Phase = "project" | "scenario" | "ready" | "running" | "artifact";
const journey = ["选择项目", "选择场景", "点击开始", "主动推进", "查看交付物"];

export default function OpenGeoParticipatoryDemo() {
  const [phase, setPhase] = useState<Phase>("project");
  const [scenarioId, setScenarioId] = useState<OpenGeoScenarioId | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const scenario = openGeoScenarios.find((item) => item.id === scenarioId);

  const contactHref = scenario
    ? `/contact?project=${OPEN_GEO_PROJECT_ID}&scenario=${scenario.id}&artifact=${OPEN_GEO_ARTIFACT_ID}`
    : "/contact";

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
          <p className={styles.eyebrow}>Open GEO Console · 参与式原型</p>
          <h2 id="open-geo-demo-heading">亲手走完一次 AI 可见性诊断</h2>
        </div>
        <p className={styles.notice} role="note">模拟体验 · 全部为模拟数据；未执行真实抓取、模型调用或正式诊断。</p>
      </div>

      <ol className={styles.journey} aria-label="体验流程">
        {journey.map((label, index) => (
          <li key={label} data-active={index === activeJourneyIndex} data-complete={index < activeJourneyIndex}>
            <span>{index < activeJourneyIndex ? <Check aria-hidden /> : `0${index + 1}`}</span>
            {label}
          </li>
        ))}
      </ol>

      <div className={styles.stage}>
        {phase === "project" ? (
          <div>
            <p className={styles.kicker}>01 / 选择项目</p>
            <button className={styles.projectCard} type="button" onClick={() => setPhase("scenario")}>
              <span><strong>Open GEO Console</strong><small>AI 搜索可见性诊断 · 高保真模拟原型</small></span>
              <ArrowRight aria-hidden />
            </button>
            <p className={styles.helper}>本轮只开放 Open GEO Console。其他项目待你确认这套体验后再扩展。</p>
          </div>
        ) : null}

        {phase === "scenario" || phase === "ready" ? (
          <div>
            <div className={styles.stageTitle}>
              <div><p className={styles.kicker}>02 / 选择示例场景</p><h3>你想先检查哪一种问题？</h3></div>
              <button className={styles.textButton} type="button" onClick={() => setPhase("project")}><ArrowLeft aria-hidden /> 返回项目</button>
            </div>
            <div className={styles.scenarios} role="group" aria-label="示例场景">
              {openGeoScenarios.map((item) => (
                <button key={item.id} type="button" aria-pressed={scenarioId === item.id} className={styles.scenarioCard} onClick={() => selectScenario(item.id)}>
                  <strong>{item.title}</strong><span>{item.summary}</span>
                </button>
              ))}
            </div>
            <button className={styles.primaryButton} type="button" disabled={!scenario} onClick={() => { setStepIndex(0); setPhase("running"); }}>
              点击开始 <ArrowRight aria-hidden />
            </button>
          </div>
        ) : null}

        {phase === "running" && scenario ? (
          <div>
            <div className={styles.stageTitle}>
              <div><p className={styles.kicker}>04 / 主动推进</p><h3>{scenario.steps[stepIndex].title}</h3></div>
              <p className={styles.counter} role="status">步骤 {stepIndex + 1} / {scenario.steps.length}</p>
            </div>
            <div className={styles.stepBody}>
              <p>{scenario.steps[stepIndex].detail}</p>
              <div aria-label="模拟处理记录">
                <span>输入</span><strong>虚构企业页面与示例问题</strong>
                <span>处理</span><strong>结构化检查与人工复核点标记</strong>
                <span>输出</span><strong>仅供体验的观察记录</strong>
              </div>
            </div>
            <div className={styles.actions}>
              <button className={styles.secondaryButton} type="button" disabled={stepIndex === 0} onClick={() => setStepIndex((current) => Math.max(0, current - 1))}>上一步</button>
              <button className={styles.primaryButton} type="button" onClick={advance}>{stepIndex === scenario.steps.length - 1 ? "查看模拟交付物" : "下一步"}<ArrowRight aria-hidden /></button>
              <button className={styles.textButton} type="button" onClick={reset}><RotateCcw aria-hidden /> 重新选择</button>
            </div>
          </div>
        ) : null}

        {phase === "artifact" && scenario ? (
          <div>
            <div className={styles.stageTitle}><div><p className={styles.kicker}>05 / 查看交付物</p><h3>{scenario.artifact.title}</h3></div><span className={styles.simulationBadge}>模拟数据</span></div>
            <article className={styles.artifact} aria-label="模拟交付物">
              <p>这是一份交互示意，不是对任何真实企业的判断，也不代表客户结果。</p>
              <ol>{scenario.artifact.findings.map((finding, index) => <li key={finding}><span>0{index + 1}</span>{finding}</li>)}</ol>
            </article>
            <div className={styles.actions}>
              <Link className={styles.primaryButton} href={contactHref}>携带此项目上下文联系 <ArrowRight aria-hidden /></Link>
              <button className={styles.secondaryButton} type="button" onClick={() => { setPhase("scenario"); setScenarioId(null); }}>更换场景</button>
              <button className={styles.textButton} type="button" onClick={reset}><RotateCcw aria-hidden /> 重新开始</button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}