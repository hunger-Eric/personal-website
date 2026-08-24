"use client";

import Link from "next/link";
import {
  ArrowRight,
  BotMessageSquare,
  CirclePause,
  CirclePlay,
  ContactRound,
  ExternalLink,
  FileCheck2,
  Files,
  Globe2,
  MailCheck,
  MapPin,
  MonitorCog,
  ScanText,
  SearchCheck,
  ShieldCheck,
  Smartphone,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Player, type PlayerRef } from "@remotion/player";
import { localizePublicPath } from "@/config/locale";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";

import { useLocale } from "@/components/LocaleProvider";
import { usePrefersReducedMotion } from "@/components/motion/usePrefersReducedMotion";
import styles from "./ProjectJourneys.module.css";

const FPS = 30;
const STEP_FRAMES = 75;
const STEP_COUNT = 4;
const DURATION_IN_FRAMES = STEP_FRAMES * STEP_COUNT;

type ProjectId =
  | "open-geo-console"
  | "hermes-notebook"
  | "freight-lead-agent"
  | "codex-feishu-bridge";

type JourneyStep = {
  title: string;
  description: string;
  icon: LucideIcon;
};

type JourneyProject = {
  id: ProjectId;
  name: string;
  label: string;
  outcome: string;
  steps?: JourneyStep[];
};

type JourneyCompositionProps = {
  project: JourneyProject;
  compact: boolean;
};

const projectCopy = {
  zh: [
    {
      id: "open-geo-console",
      name: "Open GEO Console",
      label: "正式产品 · 模拟演示",
      outcome: "从真实官网输入开始，完成 AI 搜索可见性诊断与持续优化方案。",
    },
    {
      id: "hermes-notebook",
      name: "Hermes Notebook",
      label: "企业数据整理流程演示",
      outcome: "同一份整理好的企业数据，可以被客服机器人、内部知识问答和业务助手持续复用。",
      steps: [
        { title: "导入分散资料", description: "接收 PDF、Word、Excel、PPT、图片、文件夹与网页。", icon: Files },
        { title: "恢复结构与来源", description: "解析层级、正文、表格与出处，保留内容从哪里来。", icon: ScanText },
        { title: "建立检索与权限", description: "让答案可追溯到原文，并按成员和资料范围控制访问。", icon: ShieldCheck },
        { title: "复用到企业应用", description: "把同一数据底座接入客服机器人、内部知识问答和业务助手。", icon: BotMessageSquare },
      ],
    },
    {
      id: "freight-lead-agent",
      name: "Freight Lead Agent",
      label: "获客与定制营销流程演示",
      outcome: "小团队持续完成找客、研究和定制写信，不再逐家公司从零处理。",
      steps: [
        { title: "Google 地图发现企业", description: "按关键词与地区批量发现目标企业，不再靠手工搜索。", icon: MapPin },
        { title: "进入官网研究业务", description: "读取官网服务、市场与公开联系方式，形成公司画像。", icon: Globe2 },
        { title: "准备定制营销", description: "结合每家公司的官网内容生成有针对性的营销材料。", icon: ContactRound },
        { title: "销售审核与跟进", description: "由销售确认发送，记录回复并安排下一步跟进。", icon: MailCheck },
      ],
    },
    {
      id: "codex-feishu-bridge",
      name: "Codex Feishu Bridge",
      label: "移动协作与技能沉淀流程演示",
      outcome: "离开工位也能继续推进，团队有效的工作方法会逐步沉淀为可复用 Skill。",
      steps: [
        { title: "手机飞书提交任务", description: "员工在外也能从飞书发出清晰指令，不必守在电脑前。", icon: Smartphone },
        { title: "公司电脑持续执行", description: "任务由公司电脑上的 Codex 接手，继续使用本地项目与工具。", icon: MonitorCog },
        { title: "成员补充与协作", description: "同一话题内补充资料、确认选择，让多人围绕任务继续协作。", icon: UsersRound },
        { title: "结果回到原话题", description: "结果、文件与进度返回飞书；重复有效的做法继续沉淀为 Skill。", icon: FileCheck2 },
      ],
    },
  ],
  en: [
    {
      id: "open-geo-console",
      name: "Open GEO Console",
      label: "Live product · Simulation",
      outcome: "Start with a real website, diagnose AI-search visibility, and receive a continuous optimization plan.",
    },
    {
      id: "hermes-notebook",
      name: "Hermes Notebook",
      label: "Enterprise data workflow demo",
      outcome: "The same structured enterprise data can power support bots, internal Q&A, and business assistants.",
      steps: [
        { title: "Import scattered knowledge", description: "Bring in PDFs, Word, Excel, slides, images, folders, and web pages.", icon: Files },
        { title: "Recover structure and sources", description: "Preserve hierarchy, tables, context, and where every passage came from.", icon: ScanText },
        { title: "Add retrieval and permissions", description: "Trace answers to sources while respecting member and content boundaries.", icon: ShieldCheck },
        { title: "Reuse it in enterprise apps", description: "Power support bots, internal knowledge Q&A, and business assistants from one data layer.", icon: BotMessageSquare },
      ],
    },
    {
      id: "freight-lead-agent",
      name: "Freight Lead Agent",
      label: "Lead and outreach workflow demo",
      outcome: "A small team can keep researching prospects and preparing tailored outreach without restarting for every company.",
      steps: [
        { title: "Discover firms on Google Maps", description: "Find target companies in batches by market, keyword, and region.", icon: MapPin },
        { title: "Research each official site", description: "Read services, markets, and public contact points to build a useful company profile.", icon: Globe2 },
        { title: "Prepare tailored outreach", description: "Use each company's website context to draft relevant marketing material.", icon: ContactRound },
        { title: "Review and follow up", description: "Sales approves the message, records replies, and schedules the next action.", icon: MailCheck },
      ],
    },
    {
      id: "codex-feishu-bridge",
      name: "Codex Feishu Bridge",
      label: "Mobile collaboration workflow demo",
      outcome: "Work can continue away from the desk while proven team methods become reusable Skills.",
      steps: [
        { title: "Submit a task from Feishu mobile", description: "Employees can send a clear instruction from their phone without staying at a workstation.", icon: Smartphone },
        { title: "Keep executing on the office computer", description: "Codex continues on the company computer with the local project and tools available.", icon: MonitorCog },
        { title: "Collaborate in the same thread", description: "Colleagues add context and confirm choices without fragmenting the task.", icon: UsersRound },
        { title: "Return results to the thread", description: "Results, files, and progress return to Feishu; proven patterns are captured as reusable Skills.", icon: FileCheck2 },
      ],
    },
  ],
} satisfies Record<"zh" | "en", JourneyProject[]>;

function useCompactJourneyLayout() {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const query = window.matchMedia?.("(max-width: 720px)");
    if (!query) return;
    const update = () => setCompact(query.matches);
    update();
    query.addEventListener?.("change", update);
    return () => query.removeEventListener?.("change", update);
  }, []);

  return compact;
}

function JourneyComposition({ project, compact }: JourneyCompositionProps) {
  const frame = useCurrentFrame();
  const steps = project.steps ?? [];
  const activeStep = Math.min(STEP_COUNT - 1, Math.floor(frame / STEP_FRAMES));

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#171916",
        color: "#f3efe6",
        fontFamily: "Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif",
        padding: compact ? 32 : 24,
      }}
    >
      <div style={{ color: "#d8973f", fontFamily: "monospace", fontSize: compact ? 19 : 18, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}>
        {project.name} / PROJECT WORKFLOW
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: compact ? "repeat(2, minmax(0, 1fr))" : "repeat(4, minmax(0, 1fr))",
          gap: compact ? 14 : 28,
          marginTop: compact ? 24 : 14,
          flex: 1,
        }}
      >
        {steps.map((step, index) => {
          const Icon = step.icon;
          const start = index * STEP_FRAMES;
          const active = index === activeStep;
          const complete = index < activeStep;
          return (
            <div
              key={step.title}
              style={{
                border: active ? "2px solid #c47a18" : "1px solid rgba(255,255,255,0.12)",
                backgroundColor: active ? "#22251f" : complete ? "#1d201c" : "#181a17",
                minHeight: compact ? 350 : 260,
                padding: compact ? 22 : 20,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                position: "relative",
                opacity: index === 0 ? 1 : interpolate(frame, [start - 12, start], [0.4, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.bezier(0.16, 1, 0.3, 1),
                }),
                translate: index === 0 ? "0px 0px" : interpolate(frame, [start - 12, start], ["0px 18px", "0px 0px"], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.bezier(0.16, 1, 0.3, 1),
                }),
              }}
            >
              <div style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ color: active || complete ? "#d8973f" : "rgba(243,239,230,0.35)", fontFamily: "monospace", fontSize: 18 }}>
                  0{index + 1}
                </span>
                <span style={{ color: active ? "#d8973f" : "rgba(243,239,230,0.38)", fontFamily: "monospace", fontSize: 16 }}>
                  {active ? "ACTIVE" : complete ? "DONE" : "WAIT"}
                </span>
              </div>
              <Icon aria-hidden size={compact ? 58 : 48} strokeWidth={1.25} color={active ? "#d8973f" : "rgba(243,239,230,0.72)"} style={{ marginTop: compact ? 24 : 18 }} />
              <h3 style={{ margin: compact ? "22px 0 0" : "18px 0 0", fontSize: compact ? 32 : 23, lineHeight: 1.15, letterSpacing: "-0.025em" }}>
                {step.title}
              </h3>
              <p style={{ margin: compact ? "14px 0 0" : "10px 0 0", color: "rgba(243,239,230,0.58)", fontSize: compact ? 21 : 15, lineHeight: 1.55 }}>
                {step.description}
              </p>
              <div style={{ width: "100%", height: 3, marginTop: "auto", backgroundColor: "rgba(255,255,255,0.08)" }}>
                <div
                  style={{
                    width: active
                      ? interpolate(frame, [start, start + STEP_FRAMES - 1], ["0%", "100%"], {
                          extrapolateLeft: "clamp",
                          extrapolateRight: "clamp",
                        })
                      : complete
                        ? "100%"
                        : "0%",
                    height: "100%",
                    backgroundColor: "#c47a18",
                  }}
                />
              </div>
              {!compact && index < steps.length - 1 ? (
                <ArrowRight
                  aria-hidden
                  size={24}
                  strokeWidth={1.5}
                  color="#d8973f"
                  style={{ position: "absolute", top: "50%", right: -26, translate: "0 -50%", zIndex: 2 }}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}

export function ProjectJourneys() {
  const { locale } = useLocale();
  const path = (value: string) => localizePublicPath(value, locale);
  const reducedMotion = usePrefersReducedMotion();
  const compact = useCompactJourneyLayout();
  const zh = locale === "zh";
  const projects = projectCopy[locale];
  const [selectedId, setSelectedId] = useState<ProjectId>("codex-feishu-bridge");
  const [activeStep, setActiveStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const playerRef = useRef<PlayerRef>(null);

  const selected = useMemo(
    () => projects.find((project) => project.id === selectedId) ?? projects[3],
    [projects, selectedId]
  );
  const isOpenGeo = selected.id === "open-geo-console";

  useEffect(() => {
    if (reducedMotion) {
      playerRef.current?.pause();
    }
  }, [reducedMotion]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player || isOpenGeo) return;

    const onTimeUpdate = (event: { detail: { frame: number } }) => {
      setActiveStep(Math.min(STEP_COUNT - 1, Math.floor(event.detail.frame / STEP_FRAMES)));
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    player.addEventListener("timeupdate", onTimeUpdate);
    player.addEventListener("play", onPlay);
    player.addEventListener("pause", onPause);
    return () => {
      player.removeEventListener("timeupdate", onTimeUpdate);
      player.removeEventListener("play", onPlay);
      player.removeEventListener("pause", onPause);
    };
  }, [isOpenGeo, selectedId]);

  const chooseProject = useCallback((id: ProjectId) => {
    setSelectedId(id);
    setActiveStep(0);
    setPlaying(id !== "open-geo-console" && !reducedMotion);
  }, [reducedMotion]);

  function togglePlayback() {
    if (!playerRef.current) return;
    if (playerRef.current.isPlaying()) {
      playerRef.current.pause();
    } else {
      playerRef.current.play();
    }
  }

  function seekToStep(index: number) {
    playerRef.current?.seekTo(index * STEP_FRAMES);
    playerRef.current?.pause();
    setActiveStep(index);
    setPlaying(false);
  }

  return (
    <section id="project-journeys" className={styles.section} aria-labelledby="project-journeys-title">
      <div className={styles.shell}>
        <p className={styles.eyebrow}>03 / Project journeys</p>
        <div className={styles.intro}>
          <h2 id="project-journeys-title">
            {zh ? "不是看功能列表，而是看任务怎样被完成。" : "See how work gets completed, not a feature list."}
          </h2>
          <p>
            {zh
              ? "点击项目切换演示，看各自的输入怎样经过系统处理、人工协作与结果回传。"
              : "Switch between project demos and follow each input through system work, human collaboration, and delivery."}
          </p>
        </div>

        <div className={styles.tabs} role="tablist" aria-label={zh ? "项目任务旅程" : "Project journeys"}>
          {projects.map((project, index) => {
            const selectedTab = project.id === selectedId;
            return (
              <div key={project.id} className={styles.tabCell} data-selected={selectedTab}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={selectedTab}
                  aria-controls="project-journey-panel"
                  id={`project-journey-tab-${project.id}`}
                  onClick={() => chooseProject(project.id)}
                >
                  <span>0{index + 1}</span>
                  <strong>{project.name}</strong>
                  <small>{project.label}</small>
                </button>
                {project.id === "open-geo-console" ? (
                  <div className={styles.openGeoLinks}>
                    <a href="https://geo.itheheda.online" target="_blank" rel="noreferrer">
                      {zh ? "进入正式产品" : "Open live product"}<ExternalLink aria-hidden />
                    </a>
                    <Link href={`${path("/projects/open-geo-console")}#open-geo-demo`}>
                      {zh ? "模拟演示" : "Open simulation"}<ArrowRight aria-hidden />
                    </Link>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        <div
          id="project-journey-panel"
          className={styles.panel}
          role="tabpanel"
          aria-labelledby={`project-journey-tab-${selected.id}`}
        >
          {isOpenGeo ? (
            <div className={styles.openGeoGateway}>
              <div>
                <p>{zh ? "OPEN GEO CONSOLE · 正式产品" : "OPEN GEO CONSOLE · LIVE PRODUCT"}</p>
                <h3>{zh ? "用真实官网完成一次 AI 搜索可见性诊断" : "Run an AI-search visibility diagnosis on a real website"}</h3>
                <span>{selected.outcome}</span>
              </div>
              <SearchCheck aria-hidden />
            </div>
          ) : (
            <>
              <div className={styles.playerFrame} data-testid="remotion-project-journey">
                <Player
                  key={`${selected.id}-${compact ? "compact" : "wide"}`}
                  ref={playerRef}
                  component={JourneyComposition}
                  inputProps={{ project: selected, compact }}
                  durationInFrames={DURATION_IN_FRAMES}
                  compositionWidth={compact ? 720 : 1600}
                  compositionHeight={compact ? 920 : 360}
                  fps={FPS}
                  autoPlay={!reducedMotion}
                  loop
                  controls={false}
                  clickToPlay={false}
                  spaceKeyToPlayOrPause={false}
                  acknowledgeRemotionLicense
                  style={{ width: "100%" }}
                />
              </div>

              <div className={styles.controls}>
                <button type="button" onClick={togglePlayback} aria-label={playing ? (zh ? "暂停流程动画" : "Pause workflow animation") : (zh ? "播放流程动画" : "Play workflow animation")}>
                  {playing ? <CirclePause aria-hidden /> : <CirclePlay aria-hidden />}
                  <span>{playing ? (zh ? "暂停" : "Pause") : (zh ? "播放" : "Play")}</span>
                </button>
                <div className={styles.stepButtons} aria-label={zh ? "流程步骤" : "Workflow steps"}>
                  {selected.steps?.map((step, index) => (
                    <button
                      type="button"
                      key={step.title}
                      data-active={index === activeStep}
                      onClick={() => seekToStep(index)}
                      aria-label={zh ? `查看步骤 ${index + 1}：${step.title}` : `View step ${index + 1}: ${step.title}`}
                    >
                      0{index + 1}
                    </button>
                  ))}
                </div>
                <span className={styles.status} role="status">
                  {zh ? `当前步骤 ${activeStep + 1} / ${STEP_COUNT}` : `Current step ${activeStep + 1} / ${STEP_COUNT}`}
                </span>
                <Link href={path(`/projects/${selected.id}`)} className={styles.detailLink}>
                  {zh ? `查看 ${selected.name} 项目详情` : `View ${selected.name} project details`}<ArrowRight aria-hidden />
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
