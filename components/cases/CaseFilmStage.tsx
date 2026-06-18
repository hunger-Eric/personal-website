"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Pause,
  Play,
  RotateCcw,
  StepForward,
  Workflow,
} from "lucide-react";

import { useLocale } from "@/components/LocaleProvider";
import type { CaseItem } from "@/config/cases";
import { ArtifactPreviewPanel } from "./ArtifactPreviewPanel";
import { CaseChapterRail } from "./CaseChapterRail";
import { HyperFramePreview } from "./HyperFramePreview";

type CaseFilmStageProps = {
  cases: CaseItem[];
  initialCaseId?: string;
  singleCase?: boolean;
  className?: string;
};

const FILM_ORDER = ["hermes-notebook", "freight-lead-agent", "element-asset-sdk"];
const AUTO_STEP_MS = 4200;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!query) return;
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener?.("change", update);
    return () => query.removeEventListener?.("change", update);
  }, []);

  return reduced;
}

function sortFilmCases(cases: CaseItem[]) {
  return [...cases]
    .filter((caseItem) => caseItem.customerStory)
    .sort((a, b) => {
      const aIndex = FILM_ORDER.indexOf(a.id);
      const bIndex = FILM_ORDER.indexOf(b.id);
      const aRank = aIndex === -1 ? FILM_ORDER.length : aIndex;
      const bRank = bIndex === -1 ? FILM_ORDER.length : bIndex;
      return aRank - bRank;
    });
}

function formatArchetype(archetype?: string) {
  if (!archetype) return "system";
  return archetype.replace(/-/g, " ");
}

export function CaseFilmStage({
  cases,
  initialCaseId,
  singleCase = false,
  className,
}: CaseFilmStageProps) {
  const { locale } = useLocale();
  const reducedMotion = usePrefersReducedMotion();
  const stageRef = useRef<HTMLDivElement | null>(null);
  const filmCases = useMemo(() => sortFilmCases(cases), [cases]);
  const firstCaseId = initialCaseId || filmCases[0]?.id || "";
  const [activeCaseId, setActiveCaseId] = useState(firstCaseId);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [stageInView, setStageInView] = useState(
    () => typeof IntersectionObserver === "undefined"
  );

  const activeCase =
    filmCases.find((caseItem) => caseItem.id === activeCaseId) ?? filmCases[0];
  const story = activeCase?.customerStory;
  const steps = story?.steps ?? [];
  const activeStep = steps[activeStepIndex] ?? steps[0];
  const accent = story?.sceneAccent || "#c48a2c";
  const progress = steps.length ? ((activeStepIndex + 1) / steps.length) * 100 : 0;

  useEffect(() => {
    const node = stageRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setStageInView(entry.isIntersecting),
      { threshold: 0.35 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!playing || reducedMotion || !stageInView || steps.length <= 1) return;
    const timer = window.setTimeout(() => {
      setActiveStepIndex((index) => {
        if (index < steps.length - 1) return index + 1;

        if (singleCase || filmCases.length <= 1) return 0;

        const currentIndex = filmCases.findIndex((caseItem) => caseItem.id === activeCaseId);
        const nextCase = filmCases[(currentIndex + 1) % filmCases.length];
        setActiveCaseId(nextCase.id);
        return 0;
      });
    }, AUTO_STEP_MS);
    return () => window.clearTimeout(timer);
  }, [
    activeCaseId,
    filmCases,
    playing,
    reducedMotion,
    singleCase,
    stageInView,
    steps.length,
  ]);

  function selectCase(caseId: string) {
    setActiveCaseId(caseId);
    setActiveStepIndex(0);
  }

  function goNext() {
    if (!steps.length) return;
    setActiveStepIndex((index) => {
      if (index < steps.length - 1) return index + 1;
      if (singleCase || filmCases.length <= 1) return 0;

      const currentIndex = filmCases.findIndex((caseItem) => caseItem.id === activeCaseId);
      const nextCase = filmCases[(currentIndex + 1) % filmCases.length];
      setActiveCaseId(nextCase.id);
      return 0;
    });
  }

  function replay() {
    setActiveStepIndex(0);
    if (!reducedMotion) setPlaying(true);
  }

  if (!activeCase || !story || !activeStep) return null;

  return (
    <section
      ref={stageRef}
      id={singleCase ? "case-film-stage" : "case-story-demo"}
      className={[
        "scroll-mt-24 overflow-hidden rounded-lg border border-[#ded4c1] bg-[#10110e] text-[#f3eadb] shadow-[0_30px_90px_rgba(54,42,24,0.18)]",
        className || "",
      ].join(" ")}
      style={{ "--film-accent": accent } as CSSProperties}
      data-playing={playing && !reducedMotion ? "true" : "false"}
    >
      <div className="border-b border-white/10 bg-[#171813] px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[#a69b8a]">
              <Workflow className="h-4 w-4" />
              <span>{singleCase ? "Case demo" : "Project film"}</span>
            </div>
            <h2 className="mt-2 max-w-4xl text-2xl font-semibold tracking-tight text-[#f7efdf] sm:text-3xl">
              {singleCase ? activeCase.name : "三条系统流程"}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPlaying((value) => !value)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-white/[0.045] text-[#f3eadb] transition-colors hover:bg-white/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label={playing ? "Pause film demo" : "Play film demo"}
            >
              {playing && !reducedMotion ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={goNext}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-white/[0.045] text-[#f3eadb] transition-colors hover:bg-white/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Next film step"
            >
              <StepForward className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={replay}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-white/[0.045] text-[#f3eadb] transition-colors hover:bg-white/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Replay film demo"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {!singleCase ? (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden">
            {filmCases.map((caseItem, index) => {
              const label = caseItem.customerStory?.chapterTitle || caseItem.name;
              const active = caseItem.id === activeCase.id;
              return (
                <button
                  key={caseItem.id}
                  type="button"
                  onClick={() => selectCase(caseItem.id)}
                  aria-current={active ? "true" : undefined}
                  className={[
                    "flex min-w-[160px] items-center gap-2 rounded-md border px-3 py-2 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                    active
                      ? "border-[#c48a2c]/70 bg-[#c48a2c]/15"
                      : "border-white/10 bg-white/[0.035]",
                  ].join(" ")}
                >
                  <span className="font-mono text-[11px] text-[#a69b8a]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="truncate text-sm font-semibold text-[#f7efdf]">
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="grid bg-[radial-gradient(circle_at_16%_10%,rgba(196,138,44,0.14),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.045),transparent_44%)] lg:grid-cols-[210px_minmax(0,1fr)_310px]">
        <div className="hidden border-r border-white/10 bg-[#171813]/92 p-4 lg:block">
          <CaseChapterRail
            cases={filmCases}
            activeCaseId={activeCase.id}
            onSelect={selectCase}
            singleCase={singleCase}
          />

          <div className="mt-5 rounded-md border border-white/10 bg-white/[0.04] p-3">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a69b8a]">
              Input
            </p>
            <p className="mt-2 text-sm leading-6 text-[#f3eadb]">{story.exampleInput}</p>
          </div>
        </div>

        <div className="min-w-0 border-b border-white/10 bg-[#11120f]/82 p-4 sm:p-5 lg:border-b-0 lg:border-r">
          <div className="mb-4 min-w-0">
            <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a69b8a]">
              <span>{formatArchetype(story.archetype)}</span>
              <span className="text-white/20">/</span>
              <span>{activeCase.name}</span>
            </div>
            <h3 className="mt-2 max-w-3xl text-2xl font-semibold tracking-tight text-[#f7efdf] sm:text-4xl">
              {story.headline}
            </h3>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#cfc4b2] sm:text-base">
              {story.shortPromise || story.publicScenario}
            </p>
          </div>

          <HyperFramePreview
            projectName={activeCase.name}
            animationSrc={story.animationSrc}
            posterSrc={story.posterSrc}
            accent={accent}
            activeStepTitle={activeStep.title}
            reducedMotion={reducedMotion}
          />

          <div className="mt-4 grid gap-2 sm:grid-cols-4">
            {steps.map((step, index) => {
              const active = index === activeStepIndex;
              return (
                <button
                  key={step.title}
                  type="button"
                  onClick={() => setActiveStepIndex(index)}
                  className={[
                    "min-h-[64px] rounded-md border p-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                    active
                      ? "border-[#c48a2c]/80 bg-[#c48a2c]/12"
                      : "border-white/10 bg-white/[0.035] hover:bg-white/[0.07]",
                  ].join(" ")}
                  aria-current={active ? "step" : undefined}
                >
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a69b8a]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="mt-1 block text-sm font-semibold leading-5 text-[#f7efdf]">
                    {step.title}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 grid gap-3 rounded-md border border-white/10 bg-white/[0.04] p-3 lg:grid-cols-[minmax(0,1fr)_28px_minmax(0,1fr)] lg:items-stretch">
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a69b8a]">
                Action
              </p>
              <p className="mt-2 text-sm leading-6 text-[#f3eadb]">
                {activeStep.customerAction}
              </p>
            </div>
            <div className="hidden items-center justify-center text-[#c48a2c] lg:flex">
              <ArrowRight className="h-4 w-4" />
            </div>
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a69b8a]">
                System
              </p>
              <p className="mt-2 text-sm leading-6 text-[#f3eadb]">
                {activeStep.systemAction}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 bg-[#141510]/92 p-4 sm:p-5 lg:content-start">
          <div className="lg:hidden rounded-md border border-white/10 bg-white/[0.04] p-3">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a69b8a]">
              Input
            </p>
            <p className="mt-2 text-sm leading-6 text-[#f3eadb]">{story.exampleInput}</p>
          </div>

          <ArtifactPreviewPanel
            story={story}
            step={activeStep}
            progress={progress}
            accent={accent}
          />

          <div className="rounded-md border border-white/10 bg-[#171813]/92 p-4">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a69b8a]">
              Transferable value
            </p>
            <p className="mt-2 text-sm leading-6 text-[#f3eadb]">
              {story.transferableValue}
            </p>
            <Link
              href={`/projects/${encodeURIComponent(activeCase.id)}`}
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-[#f2eadb] px-3 py-2 text-sm font-semibold text-[#17130d] transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {locale === "zh" ? "打开完整案例" : "Open full case"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
