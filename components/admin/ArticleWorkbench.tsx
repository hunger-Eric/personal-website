"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FileText, LoaderCircle, Send, ShieldCheck } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

type Profile = Record<string, unknown>;
type Source = { id: string; title: string; url: string; publisher?: string };
type Assessment = { sourceId: string; category: string; rationale?: string; claimsSupported?: string[] };
type Article = { title: string; slugProposal: string; summary: string; tags: string[]; body: string; sourceAssessments: Assessment[] };
type Publication = { id: string; slug: string; contentHash: string; status: "submitted" | "published" };
type Run = { id: string; status: string; failure?: { message: string }; article?: Article; sources?: Source[]; confirmations?: { sourceId: string; confirmed: true }[]; previewMdx?: string; publication?: Publication };

const inputClass = "w-full rounded-control border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/25 disabled:cursor-not-allowed disabled:opacity-60";
const AUTHORITATIVE_CATEGORIES = new Set(["official", "standard", "original_research", "peer_reviewed"]);

async function request<T>(path: string, options: RequestInit = {}, signal?: AbortSignal): Promise<T> {
  const response = await fetch(path, { ...options, headers: { "Content-Type": "application/json", ...options.headers }, signal });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof payload.error === "string" ? payload.error : "请求未完成");
  return payload as T;
}

export function ArticleWorkbench({ initialRun }: { initialRun?: Run } = {}) {
  const router = useRouter();
  const abortRef = useRef<AbortController | null>(null);
  const actionAbortRef = useRef<AbortController | null>(null);
  const pollAbortRef = useRef<AbortController | null>(null);
  const attemptedRunIdsRef = useRef(new Set(initialRun?.publication ? [initialRun.id] : []));
  const [attemptedRunIds, setAttemptedRunIds] = useState(() => new Set(initialRun?.publication ? [initialRun.id] : []));
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileText, setProfileText] = useState("");
  const [topic, setTopic] = useState("");
  const [rules, setRules] = useState("基于公开事实写作\n正文必须保留来源链接");
  const [run, setRun] = useState<Run | null>(initialRun ?? null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;
    try {
      const payload = await request<{ profile: Profile }>("/api/admin/articles/profile", {}, controller.signal);
      setProfile(payload.profile);
      setProfileText(JSON.stringify(payload.profile, null, 2));
    } catch (error) { setMessage(error instanceof Error ? error.message : "无法加载业务背景"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void loadProfile(); return () => { abortRef.current?.abort(); actionAbortRef.current?.abort(); pollAbortRef.current?.abort(); }; }, [loadProfile]);

  const saveProfile = async () => {
    setSaving(true); setMessage(null);
    const controller = new AbortController(); actionAbortRef.current?.abort(); actionAbortRef.current = controller;
    try {
      const next = JSON.parse(profileText) as Profile;
      const payload = await request<{ profile: Profile }>("/api/admin/articles/profile", { method: "PUT", body: JSON.stringify(next) }, controller.signal);
      setProfile(payload.profile); setProfileText(JSON.stringify(payload.profile, null, 2)); setMessage("业务背景已保存。");
    } catch (error) { setMessage(error instanceof Error ? error.message : "业务背景格式无效"); }
    finally { setSaving(false); }
  };

  const generate = async () => {
    setSaving(true); setMessage(null);
    const controller = new AbortController(); actionAbortRef.current?.abort(); actionAbortRef.current = controller;
    try {
      const articleRules = rules.split("\n").map((rule) => rule.trim()).filter(Boolean);
      const payload = await request<{ run: Pick<Run, "id" | "status" | "failure"> }>("/api/admin/articles/generate", { method: "POST", body: JSON.stringify({ topic, articleRules }) }, controller.signal);
      const loaded = await request<{ run: Run }>(`/api/admin/articles/runs/${payload.run.id}`, {}, controller.signal);
      setRun(loaded.run); router.replace(`/admin/articles?run=${encodeURIComponent(loaded.run.id)}`); setMessage("文章已生成，请核对来源与正文。");
    } catch (error) { setMessage(error instanceof Error ? error.message : "生成未完成"); }
    finally { setSaving(false); }
  };

  const updateArticle = (key: keyof Article, value: string | string[]) => setRun((current) => current?.article ? { ...current, article: { ...current.article, [key]: value } } : current);
  const confirmedIds = useMemo(() => new Set(run?.confirmations?.map((item) => item.sourceId) ?? []), [run]);
  const authoritativeSourceIds = useMemo(() => new Set((run?.sources ?? []).flatMap((source) => {
    const assessment = run?.article?.sourceAssessments.find((item) => item.sourceId === source.id);
    return assessment && AUTHORITATIVE_CATEGORIES.has(assessment.category) ? [source.id] : [];
  })), [run]);
  const confirmedAuthoritativeIds = useMemo(() => new Set([...confirmedIds].filter((sourceId) => authoritativeSourceIds.has(sourceId))), [authoritativeSourceIds, confirmedIds]);
  const toggleConfirmation = (sourceId: string) => setRun((current) => {
    if (!current) return current;
    if (!authoritativeSourceIds.has(sourceId)) return current;
    const confirmations = current.confirmations ?? [];
    return { ...current, confirmations: confirmedIds.has(sourceId) ? confirmations.filter((item) => item.sourceId !== sourceId) : [...confirmations, { sourceId, confirmed: true }] };
  });

  const saveEdits = async () => {
    if (!run?.article) return;
    setSaving(true); setMessage(null);
    const controller = new AbortController(); actionAbortRef.current?.abort(); actionAbortRef.current = controller;
    try {
      const payload = await request<{ run: Run }>(`/api/admin/articles/runs/${run.id}`, { method: "PUT", body: JSON.stringify({ confirmations: run.confirmations ?? [], title: run.article.title, slugProposal: run.article.slugProposal, summary: run.article.summary, tags: run.article.tags, body: run.article.body }) }, controller.signal);
      setRun(payload.run); setMessage("编辑内容已验证，可以打开本地预览。");
    } catch (error) { setMessage(error instanceof Error ? error.message : "保存失败"); }
    finally { setSaving(false); }
  };

  const refreshPublication = useCallback(async (runId: string, signal?: AbortSignal) => {
    const payload = await request<{ publication: Publication }>(`/api/admin/articles/runs/${runId}/publication`, {}, signal);
    setRun((current) => current ? { ...current, publication: payload.publication, status: payload.publication.status === "published" ? "published" : current.status } : current);
    return payload.publication;
  }, []);

  const publicationStatus = run?.publication?.status;
  useEffect(() => {
    if (!run?.id || !publicationStatus || publicationStatus === "published") return;
    let active = true; let attempts = 0;
    const controller = new AbortController(); pollAbortRef.current?.abort(); pollAbortRef.current = controller;
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
    setPublishing(true); setMessage(null);
    const controller = new AbortController(); actionAbortRef.current?.abort(); actionAbortRef.current = controller;
    try {
      const payload = await request<{ publication: Publication }>(`/api/admin/articles/runs/${run.id}/publish`, { method: "POST" }, controller.signal);
      setRun((current) => current ? { ...current, publication: payload.publication } : current);
      setMessage(payload.publication.status === "published" ? "已发布。" : "已提交发布，正在确认网站可读状态。");
    } catch (error) { setMessage(error instanceof Error ? error.message : "上传并发布失败"); }
    finally { setPublishing(false); }
  };

  const enoughConfirmations = confirmedAuthoritativeIds.size >= 2;
  const canPublish = Boolean(run?.article && run.previewMdx && enoughConfirmations && !publishing && !run.publication && !attemptedRunIds.has(run.id));

  return (
    <div className="min-h-[100dvh] bg-background pb-16 md:pl-64">
      <div className="hidden md:block"><AdminSidebar /></div>
      <main className="mx-auto max-w-[1400px] px-5 py-8 sm:px-8 lg:py-10">
        <header className="border-b border-border pb-7">
          <Link href="/admin" className="mb-5 inline-flex text-sm font-semibold text-muted-foreground hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent md:hidden">返回管理台</Link>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Article workbench</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">业务文章工作台</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">从业务背景和公开来源出发，生成可人工编辑并明确发布的网页文章。</p>
          <p className="mt-4 border-l-2 border-accent pl-3 text-sm font-medium text-foreground">仅限本地管理台使用；生产环境不会提供此入口。</p>
        </header>

        {message ? <p role="status" className="mt-5 border border-border bg-muted px-4 py-3 text-sm text-foreground">{message}</p> : null}
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.85fr)]">
          <div className="space-y-8">
            <section className="border-t border-border pt-5" aria-labelledby="profile-heading">
              <div className="flex items-baseline justify-between gap-4"><h2 id="profile-heading" className="font-semibold">业务背景</h2><span className="text-xs text-muted-foreground">只保存已审核的公开事实</span></div>
              {loading ? <div className="mt-4 h-44 animate-pulse bg-muted motion-reduce:animate-none" /> : <><label className="mt-4 block text-sm font-semibold" htmlFor="business-profile">业务背景 JSON</label><textarea id="business-profile" value={profileText} onChange={(event) => setProfileText(event.target.value)} rows={12} className={`${inputClass} mt-2 font-mono text-xs leading-5`} aria-describedby="business-profile-help" /><p id="business-profile-help" className="mt-2 text-xs text-muted-foreground">包含服务、受众、已审核证据及禁止主张；不会提交模型密钥。</p><button type="button" onClick={() => void saveProfile()} disabled={saving || !profile} className="mt-4 inline-flex items-center gap-2 rounded-control border border-border bg-surface-paper px-3.5 py-2 text-sm font-semibold transition active:translate-y-px hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60">{saving ? <LoaderCircle className="h-4 w-4 animate-spin motion-reduce:animate-none" /> : <ShieldCheck className="h-4 w-4" />}保存业务背景</button></>}
            </section>
            <section className="border-t border-border pt-5" aria-labelledby="generate-heading">
              <h2 id="generate-heading" className="font-semibold">选题与写作规则</h2>
              <label className="mt-4 block text-sm font-semibold" htmlFor="article-topic">文章选题</label><input id="article-topic" value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="例如：企业如何用 AI 自动化整理客户线索" className={`${inputClass} mt-2`} />
              <label className="mt-4 block text-sm font-semibold" htmlFor="article-rules">写作规则</label><textarea id="article-rules" value={rules} onChange={(event) => setRules(event.target.value)} rows={4} className={`${inputClass} mt-2`} /><p className="mt-2 text-xs text-muted-foreground">每行一条规则。生成会研究公开材料并保留来源链接。</p>
              <button type="button" onClick={() => void generate()} disabled={saving || !topic.trim()} className="mt-4 inline-flex items-center gap-2 rounded-control bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition active:translate-y-px hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-60"><FileText className="h-4 w-4" />生成文章</button>
            </section>
            {run?.article ? <section className="border-t border-border pt-5" aria-labelledby="editor-heading"><div className="flex flex-wrap items-center justify-between gap-3"><h2 id="editor-heading" className="font-semibold">人工编辑</h2><span className="text-xs text-muted-foreground">运行 {run.id}</span></div><div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="标题"><input aria-label="标题" value={run.article.title} onChange={(event) => updateArticle("title", event.target.value)} className={inputClass} /></Field><Field label="Slug"><input aria-label="Slug" value={run.article.slugProposal} onChange={(event) => updateArticle("slugProposal", event.target.value)} className={inputClass} /></Field></div><Field label="摘要" className="mt-4"><textarea aria-label="摘要" value={run.article.summary} onChange={(event) => updateArticle("summary", event.target.value)} rows={3} className={inputClass} /></Field><Field label="标签（以逗号分隔）" className="mt-4"><input aria-label="标签（以逗号分隔）" value={run.article.tags.join(", ")} onChange={(event) => updateArticle("tags", event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean))} className={inputClass} /></Field><Field label="正文" className="mt-4"><textarea aria-label="正文" value={run.article.body} onChange={(event) => updateArticle("body", event.target.value)} rows={18} className={`${inputClass} font-mono text-xs leading-6`} /></Field><div className="mt-4 flex flex-wrap gap-3"><button type="button" onClick={() => void saveEdits()} disabled={saving} className="rounded-control border border-border bg-surface-paper px-3.5 py-2 text-sm font-semibold transition active:translate-y-px hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60">保存并校验</button>{run.previewMdx ? <Link href={`/admin/articles/preview/${run.id}`} className="rounded-control border border-border px-3.5 py-2 text-sm font-semibold text-foreground transition hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-accent">打开本地预览</Link> : null}</div></section> : null}
          </div>
          <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start" aria-label="文章证据与发布状态">
            <section className="border-t border-border pt-5"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">运行状态</p><p className="mt-2 font-semibold text-foreground">{run ? run.status : "尚未生成"}</p>{run?.failure ? <p className="mt-2 text-sm text-destructive">{run.failure.message}</p> : <p className="mt-2 text-sm leading-6 text-muted-foreground">生成后在这里核对来源、确认编辑，再执行一次最终发布。</p>}</section>
            {run?.sources?.length ? <section className="border-t border-border pt-5"><h2 className="font-semibold">来源确认</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">请确认至少两条权威来源。发布前会再次验证绑定关系。</p><div className="mt-4 divide-y divide-border border-y border-border">{run.sources.map((source) => { const assessment = run.article?.sourceAssessments.find((item) => item.sourceId === source.id); const authoritative = authoritativeSourceIds.has(source.id); return <label key={source.id} className={`block py-4 ${authoritative ? "" : "opacity-60"}`}><span className="flex items-start gap-3"><input aria-label={`确认来源 ${source.id}`} type="checkbox" disabled={!authoritative} checked={confirmedAuthoritativeIds.has(source.id)} onChange={() => toggleConfirmation(source.id)} className="mt-1 h-4 w-4 accent-[var(--accent)]" /><span className="min-w-0"><a href={source.url} target="_blank" rel="noreferrer" className="font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-accent">{source.title}</a><span className="mt-1 block text-xs text-muted-foreground">{source.id} · {assessment?.category ?? "未获权威分类"}{source.publisher ? ` · ${source.publisher}` : ""}</span>{assessment?.rationale ? <span className="mt-2 block text-sm leading-5 text-muted-foreground">{assessment.rationale}</span> : null}{!authoritative ? <span className="mt-2 block text-xs text-muted-foreground">此来源尚无可确认的权威分类，不能计入发布确认。</span> : null}</span></span></label>; })}</div><p className="mt-3 text-xs font-medium text-muted-foreground">已确认 {confirmedAuthoritativeIds.size} / 2 条权威来源</p></section> : null}
            <section className="border-t border-border pt-5"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">发布</p>{run?.publication?.status === "published" ? <p className="mt-2 font-semibold text-emerald-700">已发布</p> : <><p className="mt-2 text-sm leading-6 text-muted-foreground">本地预览，尚未发布</p><button type="button" onClick={() => void publish()} disabled={!canPublish} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-control bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground transition active:translate-y-px hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">{publishing ? <LoaderCircle className="h-4 w-4 animate-spin motion-reduce:animate-none" /> : <Send className="h-4 w-4" />}上传并发布</button><p className="mt-3 text-xs leading-5 text-muted-foreground">发布只提交一次；提交后仅轮询网站可读状态，最多 5 分钟。</p></>}</section>
          </aside>
        </div>
      </main>
    </div>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return <label className={`block space-y-2 ${className}`}><span className="block text-sm font-semibold text-foreground">{label}</span>{children}</label>;
}
