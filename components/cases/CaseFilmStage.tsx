"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  ArrowRight,
  Pause,
  Play,
  RotateCcw,
  StepForward,
  Workflow,
} from "lucide-react";

import { useLocale } from "@/components/LocaleProvider";
import { useInViewPlayback, usePrefersReducedMotion } from "@/components/motion";
import { ActionButton, IconButton, Surface } from "@/components/system";
import type { CaseItem } from "@/config/cases";
import { getSiteCopy } from "@/config/contentCopy";
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
  const copy = getSiteCopy(locale).cases;
  const reducedMotion = usePrefersReducedMotion();
  const stageRef = useRef<HTMLDivElement | null>(null);
  const filmCases = useMemo(() => sortFilmCases(cases), [cases]);
  const firstCaseId = initialCaseId || filmCases[0]?.id || "";
  const [activeCaseId, setActiveCaseId] = useState(firstCaseId);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const stageInView = useInViewPlayback(stageRef);

  const activeCase =
    filmCases.find((caseItem) => caseItem.id === activeCaseId) ?? filmCases[0];
  const story = activeCase?.customerStory;
  const steps = story?.steps ?? [];
  const activeStep = steps[activeStepIndex] ?? steps[0];
  const accent = story?.sceneAccent || "var(--accent)";
  const progress = steps.length ? ((activeStepIndex + 1) / steps.length) * 100 : 0;

  const goNext = useCallback(() => {
    if (!steps.length) return;
    setActiveStepIndex((index) => {
      if (index < steps.length - 1) return index + 1;
      if (singleCase || filmCases.length <= 1) return 0;

      const currentIndex = filmCases.findIndex((caseItem) => caseItem.id === activeCaseId);
      const nextCase = filmCases[(currentIndex + 1) % filmCases.length];
      setActiveCaseId(nextCase.id);
      return 0;
    });
  }, [activeCaseId, filmCases, singleCase, steps.length]);

  // Autoplay is local because looping can advance the active case, not only the step.
  useEffect(() => {
    if (!playing || reducedMotion || !stageInView || steps.length <= 1) return;
    const timer = window.setTimeout(goNext, AUTO_STEP_MS);
    return () => window.clearTimeout(timer);
  }, [goNext, playing, reducedMotion, stageInView, steps.length]);

  function selectCase(caseId: string) {
    setActiveCaseId(caseId);
    setActiveStepIndex(0);
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
        "scroll-mt-24 overflow-hidden rounded-card border border-inverse bg-surface-graphite text-surface-graphite-foreground shadow-overlay",
        className || "",
      ].join(" ")}
      style={{ "--film-accent": accent } as CSSProperties}
      data-playing={playing && !reducedMotion ? "true" : "false"}
    >
      <div className="border-b border-inverse bg-surface-graphite-muted px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <Workflow className="h-4 w-4" />
              <span>{singleCase ? copy.caseDemo : copy.projectFilm}</span>
            </div>
            <h2 className="mt-2 max-w-4xl text-2xl font-semibold tracking-tight text-surface-graphite-foreground sm:text-3xl">
              {singleCase ? activeCase.name : copy.filmTitle}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <IconButton
              onClick={() => setPlaying((value) => !value)}
              label={playing ? copy.pauseFilm : copy.playFilm}
              icon={playing && !reducedMotion ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              className="border-inverse bg-surface-graphite text-surface-graphite-foreground hover:bg-surface-graphite-muted"
            />
            <IconButton
              onClick={goNext}
              label={copy.nextStep}
              icon={<StepForward className="h-4 w-4" />}
              className="border-inverse bg-surface-graphite text-surface-graphite-foreground hover:bg-surface-graphite-muted"
            />
            <IconButton
              onClick={replay}
              label={copy.replayFilm}
              icon={<RotateCcw className="h-4 w-4" />}
              className="border-inverse bg-surface-graphite text-surface-graphite-foreground hover:bg-surface-graphite-muted"
            />
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
                    "flex min-w-[160px] items-center gap-2 rounded-control border px-3 py-2 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                    active
                      ? "border-accent/70 bg-accent/15"
                      : "border-inverse bg-surface-graphite",
                  ].join(" ")}
                >
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="truncate text-sm font-semibold text-surface-graphite-foreground">
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="grid bg-[radial-gradient(circle_at_16%_10%,color-mix(in_srgb,var(--film-accent)_14%,transparent),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.045),transparent_44%)] lg:grid-cols-[210px_minmax(0,1fr)_310px]">
        <div className="hidden border-r border-inverse bg-surface-graphite-muted p-4 lg:block">
          <CaseChapterRail
            cases={filmCases}
            activeCaseId={activeCase.id}
            onSelect={selectCase}
            singleCase={singleCase}
          />

          <Surface tone="graphite" className="mt-5 p-3">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {copy.inputLabel}
            </p>
            <p className="mt-2 text-sm leading-6 text-surface-graphite-foreground">{story.exampleInput}</p>
          </Surface>
        </div>

        <div className="min-w-0 border-b border-inverse bg-surface-graphite p-4 sm:p-5 lg:border-b-0 lg:border-r">
          <div className="mb-4 min-w-0">
            <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <span>{formatArchetype(story.archetype)}</span>
              <span className="text-muted-foreground/60">/</span>
              <span>{activeCase.name}</span>
            </div>
            <h3 className="mt-2 max-w-3xl text-2xl font-semibold tracking-tight text-surface-graphite-foreground sm:text-4xl">
              {story.headline}
            </h3>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-surface-graphite-foreground/75 sm:text-base">
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
                    "min-h-[64px] rounded-control border p-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                    active
                      ? "border-accent/80 bg-accent/12"
                      : "border-inverse bg-surface-graphite-muted hover:bg-surface-graphite-muted/80",
                  ].join(" ")}
                  aria-current={active ? "step" : undefined}
                >
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="mt-1 block text-sm font-semibold leading-5 text-surface-graphite-foreground">
                    {step.title}
                  </span>
                </button>
              );
            })}
          </div>

          <Surface tone="graphite" className="mt-4 grid gap-3 p-3 lg:grid-cols-[minmax(0,1fr)_28px_minmax(0,1fr)] lg:items-stretch">
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {copy.actionLabel}
              </p>
              <p className="mt-2 text-sm leading-6 text-surface-graphite-foreground">
                {activeStep.customerAction}
              </p>
            </div>
            <div className="hidden items-center justify-center text-accent lg:flex">
              <ArrowRight className="h-4 w-4" />
            </div>
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {copy.systemLabel}
              </p>
              <p className="mt-2 text-sm leading-6 text-surface-graphite-foreground">
                {activeStep.systemAction}
              </p>
            </div>
          </Surface>
        </div>

        <div className="grid gap-4 bg-surface-graphite-muted p-4 sm:p-5 lg:content-start">
          <Surface tone="graphite" className="p-3 lg:hidden">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {copy.inputLabel}
            </p>
            <p className="mt-2 text-sm leading-6 text-surface-graphite-foreground">{story.exampleInput}</p>
          </Surface>

          <ArtifactPreviewPanel
            story={story}
            step={activeStep}
            progress={progress}
            accent={accent}
          />

          <Surface tone="graphite" className="p-4">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {copy.transferableValue}
            </p>
            <p className="mt-2 text-sm leading-6 text-surface-graphite-foreground">
              {story.transferableValue}
            </p>
            <ActionButton
              href={`/projects/${encodeURIComponent(activeCase.id)}`}
              tone="primary"
              icon={<ArrowRight className="h-4 w-4" />}
              className="mt-4"
            >
              {copy.viewFullCase}
            </ActionButton>
          </Surface>
        </div>
      </div>
    </section>
  );
}
