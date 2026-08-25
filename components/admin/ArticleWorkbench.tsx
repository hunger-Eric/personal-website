"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

type Assessment = { sourceId: string; category: string; rationale?: string };
type Article = { title: string; slugProposal: string; summary: string; tags: string[]; body: string; sourceAssessments: Assessment[] };
type Publication = { id: string; slug: string; contentHash: string; status: "submitted" | "published" };
type OpenGeoTask = { phase: "checking" | "queued" | "collecting_sources" | "planning" | "writing" | "saving" | "completed" | "needs_input" | "expired" | "failed"; progress: number; etaSeconds?: number; publicError?: string };
type Run = { id: string; status: string; origin?: "open_geo_markdown" | "open_geo_local"; openGeo?: OpenGeoTask; failure?: { message: string }; article?: Article; confirmations?: { sourceId: string; confirmed: true }[]; previewMdx?: string; publication?: Publication };

const DEFAULT_TARGET_READER = "正在搜索该主题、比较解决方案，并可能发起咨询、合作或采购的潜在客户与业务决策者。";
const DEFAULT_REQUIREMENTS = "写成一篇适合 AI 搜索与传统搜索理解和引用的中文 GEO 文章。先回答核心问题，再展开证据、方法、适用边界与行动建议；保留可靠来源链接，不编造事实、数据、案例或客户结果。";
const inputClass = "w-full rounded-control border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/25 disabled:cursor-not-allowed disabled:opacity-60";
const TERMINAL_PHASES = new Set(["completed", "needs_input", "expired", "failed"]);

async function request<T>(path: string, options: RequestInit = {}, signal?: AbortSignal): Promise<T> {
  const response = await fetch(path, { ...options, credentials: "same-origin", headers: { "Content-Type": "application/json", ...options.headers }, signal });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof payload.error === "string" ? payload.error : "请求未完成");
  return payload as T;
}

export function ArticleWorkbench({ initialRun, defaultSourceUrl = "" }: { initialRun?: Run; defaultSourceUrl?: string } = {}) {
  const router = useRouter();
  const actionAbortRef = useRef<AbortController | null>(null);
  const generationAbortRef = useRef<AbortController | null>(null);
  const publicationAbortRef = useRef<AbortController | null>(null);
  const attemptedRunIdsRef = useRef(new Set(initialRun?.publication ? [initialRun.id] : []));
  const [attemptedRunIds, setAttemptedRunIds] = useState(() => new Set(initialRun?.publication ? [initialRun.id] : []));
  const [topic, setTopic] = useState("");
  const [sourceUrl, setSourceUrl] = useState(defaultSourceUrl);
  const [sourceText, setSourceText] = useState("");
  const [targetReader, setTargetReader] = useState(DEFAULT_TARGET_READER);
  const [requirements, setRequirements] = useState(DEFAULT_REQUIREMENTS);
  const [run, setRun] = useState<Run | null>(initialRun ?? null);
  const [starting, setStarting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => () => {
    actionAbortRef.current?.abort();
    generationAbortRef.current?.abort();
    publicationAbortRef.current?.abort();
  }, []);

  const startGeneration = async () => {
    setStarting(true);
    setMessage(null);
    const controller = new AbortController();
    actionAbortRef.current?.abort();
    actionAbortRef.current = controller;
    try {
      const payload = await request<{ run: Run }>("/api/admin/articles/open-geo", {
        method: "POST",
        body: JSON.stringify({ topic, sourceUrl, sourceText, targetReader, requirements }),
      }, controller.signal);
      setRun(payload.run);
      router.replace(`/admin/articles?run=${encodeURIComponent(payload.run.id)}`);
      setMessage("本地 Open GEO 已接收任务，完成后会自动导入官网草稿。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "本地 Open GEO 任务创建失败");
    } finally {
      setStarting(false);
    }
  };

  const generationPhase = run?.openGeo?.phase;
  useEffect(() => {
    if (!run?.id || run.origin !== "open_geo_local" || run.status !== "created" || !generationPhase || TERMINAL_PHASES.has(generationPhase)) return;
    let active = true;
    let timer: number | undefined;
    const controller = new AbortController();
    generationAbortRef.current?.abort();
    generationAbortRef.current = controller;
    const poll = async () => {
      try {
        const payload = await request<{ run: Run }>(`/api/admin/articles/runs/${run.id}/open-geo`, {}, controller.signal);
        if (!active) return;
        setRun(payload.run);
        if (payload.run.status === "validated") {
          setMessage("文章已自动导入官网草稿，请预览并确认。");
        } else if (payload.run.status === "failed" || payload.run.openGeo?.publicError) {
          setMessage(payload.run.openGeo?.publicError ?? payload.run.failure?.message ?? "本地 Open GEO 任务未完成");
        } else {
          timer = window.setTimeout(() => void poll(), 1_500);
        }
      } catch (error) {
        if (active && !controller.signal.aborted) setMessage(error instanceof Error ? error.message : "本地 Open GEO 状态暂时无法刷新");
      }
    };
    void poll();
    return () => {
      active = false;
      if (timer !== undefined) window.clearTimeout(timer);
      controller.abort();
    };
  }, [generationPhase, run?.id, run?.origin, run?.status]);

  const updateArticle = (key: keyof Article, value: string | string[]) => setRun((current) => current?.article ? { ...current, article: { ...current.article, [key]: value } } : current);
  const saveEdits = async () => {
    if (!run?.article) return;
    setSaving(true);
    setMessage(null);
    const controller = new AbortController();
    actionAbortRef.current?.abort();
    actionAbortRef.current = controller;
    try {
      const payload = await request<{ run: Run }>(`/api/admin/articles/runs/${run.id}`, { method: "PUT", body: JSON.stringify({ confirmations: run.confirmations ?? [], title: run.article.title, slugProposal: run.article.slugProposal, summary: run.article.summary, tags: run.article.tags, body: run.article.body }) }, controller.signal);
      setRun(payload.run);
      setMessage("编辑内容已验证，可以打开本地预览。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const refreshPublication = useCallback(async (runId: string, signal?: AbortSignal) => {
    const payload = await request<{ publication: Publication }>(`/api/admin/articles/runs/${runId}/publication`, {}, signal);
    setRun((current) => current ? { ...current, publication: payload.publication, status: payload.publication.status === "published" ? "published" : current.status } : current);
    return payload.publication;
  }, []);

  const publicationStatus = run?.publication?.status;
  useEffect(() => {
    if (!run?.id || !publicationStatus || publicationStatus === "published") return;
    let active = true;
    let attempts = 0;
    const controller = new AbortController();
    publicationAbortRef.current?.abort();
    publicationAbortRef.current = controller;
    const timer = window.setInterval(() => {
      attempts += 1;
      if (attempts === 60) window.clearInterval(timer);
      void refreshPublication(run.id, controller.signal).catch(() => active && !controller.signal.aborted && setMessage("发布状态暂时无法刷新。"));
    }, 5_000);
    return () => { active = false; window.clearInterval(timer); controller.abort(); };
  }, [refreshPublication, run?.id, publicationStatus]);

  const publish = async () => {
    if (!run || publishing || run.publication || attemptedRunIdsRef.current.has(run.id)) return;
    attemptedRunIdsRef.current.add(run.id);
    setAttemptedRunIds((current) => new Set(current).add(run.id));
    setPublishing(true);
    setMessage(null);
    const controller = new AbortController();
    actionAbortRef.current?.abort();
    actionAbortRef.current = controller;
    try {
      const payload = await request<{ publication: Publication }>(`/api/admin/articles/runs/${run.id}/publish`, { method: "POST" }, controller.signal);
      setRun((current) => current ? { ...current, publication: payload.publication } : current);
      setMessage(payload.publication.status === "published" ? "已发布。" : "已提交发布，正在确认网站可读状态。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "上传并发布失败");
    } finally {
      setPublishing(false);
    }
  };

  const canPublish = Boolean(run?.article && run.previewMdx && !publishing && !run.publication && !attemptedRunIds.has(run.id));
  const isGenerating = run?.origin === "open_geo_local" && run.status === "created" && Boolean(generationPhase) && !TERMINAL_PHASES.has(generationPhase!);

  return (
    <div className="min-h-[100dvh] bg-background pb-16 md:pl-64">
      <div className="hidden md:block"><AdminSidebar /></div>
      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:py-10">
        <header className="border-b border-border pb-7">
          <Link href="/admin" className="mb-5 inline-flex text-sm font-semibold text-muted-foreground hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent md:hidden">返回管理台</Link>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Local Open GEO · Website Draft</p>
          <h1 className="mt-2 max-w-3xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl">从选题到官网草稿，全程自动</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">填写一次，本地 Open GEO 完成研究与写作，官网随后自动取回并导入草稿。发布仍由你最后确认。</p>
        </header>
        {message ? <p role="status" className="mt-5 border border-border bg-muted px-4 py-3 text-sm text-foreground">{message}</p> : null}

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-6">
            <section className="rounded-control border border-border bg-surface-paper p-5 sm:p-7" aria-labelledby="generation-heading">
              <div className="flex items-start justify-between gap-5">
                <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">01 · 生成输入</p><h2 id="generation-heading" className="mt-2 text-xl font-semibold text-foreground">告诉 Open GEO 要写什么</h2></div>
                <span className="border-l-2 border-accent pl-3 text-xs font-medium leading-5 text-muted-foreground">本机直连<br />自动入稿</span>
              </div>
              <Field label="文章主题" className="mt-6"><input aria-label="文章主题" value={topic} onChange={(event) => setTopic(event.target.value)} maxLength={500} placeholder="例如：企业如何准备可被 AI 引用的 GEO 证据" className={inputClass} /></Field>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="参考网站"><input aria-label="参考网站" type="url" value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} placeholder="https://example.com" className={inputClass} /></Field>
                <Field label="目标读者"><textarea aria-label="目标读者" value={targetReader} onChange={(event) => setTargetReader(event.target.value)} maxLength={500} rows={3} className={inputClass} /></Field>
              </div>
              <Field label="补充关键信息" className="mt-4"><textarea aria-label="补充关键信息" value={sourceText} onChange={(event) => setSourceText(event.target.value)} maxLength={8000} rows={5} placeholder="粘贴已审核事实、服务范围、约束或必须提及的信息（可选）" className={inputClass} /></Field>
              <Field label="写作要求" className="mt-4"><textarea aria-label="写作要求" value={requirements} onChange={(event) => setRequirements(event.target.value)} maxLength={10000} rows={5} className={inputClass} /></Field>
              <button type="button" onClick={() => void startGeneration()} disabled={starting || isGenerating || !topic.trim()} className="mt-6 w-full rounded-control bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">{starting ? "正在连接本地服务…" : isGenerating ? "正在自动生成…" : "开始自动生成"}</button>
            </section>
            {run?.article ? <ArticleEditor run={run} saving={saving} updateArticle={updateArticle} saveEdits={saveEdits} /> : null}
          </div>

          <aside className="space-y-6 lg:sticky lg:top-8">
            <AutomationStatus run={run} starting={starting} />
            <section className="rounded-control border border-border bg-surface-paper p-5" aria-label="发布状态">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">最终确认</p>
              {run?.publication?.status === "published" ? <p className="mt-3 font-semibold text-emerald-700">已发布</p> : <>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">自动流程只停在官网草稿。请先检查内容与本地预览，再决定是否发布。</p>
                <button type="button" onClick={() => void publish()} disabled={!canPublish} className="mt-4 w-full rounded-control bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground transition hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">{publishing ? "正在提交…" : "上传并发布"}</button>
                {run?.publication ? <p className="mt-3 text-xs leading-5 text-muted-foreground">已提交，正在确认网站可读状态。</p> : null}
              </>}
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}

function AutomationStatus({ run, starting }: { run: Run | null; starting: boolean }) {
  const progress = starting ? 3 : run?.openGeo?.progress ?? (run?.article ? 100 : 0);
  const phase = run?.openGeo?.phase;
  const activeIndex = run?.article ? 3 : phase === "saving" || phase === "completed" ? 2 : phase ? 1 : 0;
  const stages = ["资料检查", "Open GEO 生成", "自动导入", "等待发布"];
  return <section className="rounded-control border border-border bg-surface-paper p-5" aria-label="自动流程状态">
    <div className="flex items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">自动流程</p><p className="mt-2 font-semibold text-foreground">{run?.article ? "草稿已就绪" : phase ? phaseLabel(phase) : "等待开始"}</p></div><span className="font-mono text-sm font-semibold text-accent">{progress}%</span></div>
    <div className="mt-4 h-1.5 overflow-hidden bg-muted" aria-label={`生成进度 ${progress}%`}><div className="h-full bg-accent transition-[width] duration-500" style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} /></div>
    <ol className="mt-5 space-y-3">{stages.map((stage, index) => <li key={stage} className={`flex items-center gap-3 text-sm ${index <= activeIndex ? "text-foreground" : "text-muted-foreground"}`}><span className={`flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-semibold ${index < activeIndex ? "border-accent bg-accent text-accent-foreground" : index === activeIndex ? "border-accent text-accent" : "border-border"}`}>{index < activeIndex ? "✓" : index + 1}</span>{stage}</li>)}</ol>
    {run?.openGeo?.etaSeconds ? <p className="mt-4 border-t border-border pt-4 text-xs text-muted-foreground">预计还需约 {run.openGeo.etaSeconds} 秒</p> : null}
    {!run ? <p className="mt-4 border-t border-border pt-4 text-xs leading-5 text-muted-foreground">请先启动本地 Open GEO Web 与文章 Worker。服务不可用时流程会在这里明确停止。</p> : null}
  </section>;
}

function phaseLabel(phase: OpenGeoTask["phase"]) {
  return ({ checking: "正在检查资料", queued: "任务已排队", collecting_sources: "正在收集来源", planning: "正在规划文章", writing: "正在撰写文章", saving: "正在自动导入", completed: "草稿已就绪", needs_input: "需要补充信息", expired: "任务已过期", failed: "任务未完成" })[phase];
}

function ArticleEditor({ run, saving, updateArticle, saveEdits }: { run: Run; saving: boolean; updateArticle: (key: keyof Article, value: string | string[]) => void; saveEdits: () => Promise<void> }) {
  const [mode, setMode] = useState<"preview" | "edit">("preview");
  if (!run.article) return null;
  return <section className="rounded-control border border-border bg-surface-paper p-5 sm:p-7" aria-labelledby="editor-heading">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">02 · 官网草稿</p><h2 id="editor-heading" className="mt-2 text-xl font-semibold">预览与编辑</h2><p className="mt-2 text-sm text-muted-foreground">生成、预览和编辑都在当前页面完成。</p></div><div className="flex border border-border bg-background p-1" role="group" aria-label="文章查看模式"><button type="button" aria-pressed={mode === "preview"} onClick={() => setMode("preview")} className={`rounded-control px-3 py-1.5 text-sm font-semibold transition active:scale-[0.98] ${mode === "preview" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`}>预览文章</button><button type="button" aria-pressed={mode === "edit"} onClick={() => setMode("edit")} className={`rounded-control px-3 py-1.5 text-sm font-semibold transition active:scale-[0.98] ${mode === "edit" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`}>编辑文章</button></div></div>
    <p className="mt-4 font-mono text-[11px] text-muted-foreground">运行 {run.id}</p>
    {mode === "preview" && run.previewMdx ? <div className="mt-6 overflow-hidden border border-border bg-background"><iframe key={run.previewMdx} title="文章同页预览" src={`/admin/articles/preview/${run.id}?embed=1`} className="block min-h-[720px] w-full bg-background" /></div> : null}
    {mode === "edit" ? <>
      <div className="mt-6 grid gap-4 sm:grid-cols-2"><Field label="标题"><input aria-label="标题" value={run.article.title} onChange={(event) => updateArticle("title", event.target.value)} className={inputClass} /></Field><Field label="Slug"><input aria-label="Slug" value={run.article.slugProposal} onChange={(event) => updateArticle("slugProposal", event.target.value)} className={inputClass} /></Field></div>
      <Field label="摘要" className="mt-4"><textarea aria-label="摘要" value={run.article.summary} onChange={(event) => updateArticle("summary", event.target.value)} rows={3} className={inputClass} /></Field>
      <Field label="文章标签（以逗号分隔）" className="mt-4"><input aria-label="文章标签（以逗号分隔）" value={run.article.tags.join(", ")} onChange={(event) => updateArticle("tags", event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean))} className={inputClass} /></Field>
      <Field label="正文" className="mt-4"><textarea aria-label="正文" value={run.article.body} onChange={(event) => updateArticle("body", event.target.value)} rows={18} className={`${inputClass} font-mono text-xs leading-6`} /></Field>
      <button type="button" onClick={() => void saveEdits()} disabled={saving} className="mt-5 rounded-control border border-border bg-background px-3.5 py-2 text-sm font-semibold transition hover:bg-muted active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60">{saving ? "正在校验…" : "保存并校验"}</button>
    </> : null}
  </section>;
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return <label className={`block space-y-2 ${className}`}><span className="block text-sm font-semibold text-foreground">{label}</span>{children}</label>;
}
