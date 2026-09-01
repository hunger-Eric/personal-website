"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Bot, CheckCircle2, FileSearch, Network, RefreshCw, ShieldCheck, UserRoundCheck } from "lucide-react";

import { useLocale } from "@/components/LocaleProvider";
import { ProjectJourneys } from "@/components/home/ProjectJourneys";
import { getLocalizedPublicContent } from "@/config/public-content";
import { publicIdentity } from "@/config/public-identity";
import { localizePublicPath } from "@/config/locale";

export function EnterpriseHomepage() {
  const { locale } = useLocale();
  const zh = locale === "zh";
  const content = getLocalizedPublicContent(locale);
  const path = (value: string) => localizePublicPath(value, locale);
  const capabilities = zh
    ? ([
        ["多来源信息汇总", "把分散信息形成统一、可追踪的结构化底稿。", Network],
        ["重复判断与录入", "把稳定规则交给系统，把例外与高风险决策保留给人工。", Bot],
        ["系统之间的数据接力", "跨文件与业务系统传递状态，减少人工搬运和断点。", RefreshCw],
        ["异常恢复与人工审核", "记录异常、保留恢复点，让系统真正可持续运行。", ShieldCheck],
      ] as const)
    : ([
        ["Multi-source intake", "Turn scattered information into one traceable operating record.", Network],
        ["Repeated decisions and entry", "Give stable rules to the system while people retain exceptions and high-risk decisions.", Bot],
        ["Handoffs between systems", "Carry state across files and business systems with fewer manual transfers and gaps.", RefreshCw],
        ["Recovery and human review", "Record exceptions and recovery points so the system can keep operating.", ShieldCheck],
      ] as const);

  return (
    <div className="overflow-x-hidden bg-surface-paper text-surface-paper-foreground">
      <section className="mx-auto grid max-w-6xl gap-12 px-4 pb-20 pt-28 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:pt-36">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-accent">{content.identity.category}</p>
          <h1 className="mt-5 text-5xl font-semibold leading-[1.02] tracking-[-0.055em] text-foreground sm:text-6xl lg:text-7xl">{content.identity.slogan}</h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-muted-foreground">{content.identity.positioning}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href={path("/contact")} className="inline-flex min-h-11 items-center justify-center gap-2 bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground hover:bg-accent-hover">{zh ? "提交你的业务问题" : "Submit your business problem"}<ArrowRight className="h-4 w-4" aria-hidden /></Link>
            <Link href={path("/projects/open-geo-console")} className="inline-flex min-h-11 items-center justify-center border border-foreground px-5 py-3 text-sm font-semibold text-foreground hover:border-accent hover:text-accent">{zh ? "先体验 Open GEO" : "Try Open GEO first"}</Link>
          </div>
        </div>
        <div className="border border-hairline bg-surface-paper-elevated p-5 sm:p-7" aria-label={zh ? "企业 AI 系统交付结构" : "Enterprise AI delivery structure"}>
          <div className="grid grid-cols-2 gap-px bg-hairline sm:grid-cols-4">
            {[[FileSearch, zh ? "业务输入" : "Business input"], [Bot, zh ? "AI 处理" : "AI processing"], [UserRoundCheck, zh ? "人工审核" : "Human review"], [CheckCircle2, zh ? "稳定交付" : "Delivery"]].map(([Icon, label], index) => {
              const ItemIcon = Icon as typeof FileSearch;
              return <div key={String(label)} className="bg-surface-paper-elevated p-4"><span className="font-mono text-[10px] text-accent">0{index + 1}</span><ItemIcon className="mt-8 h-6 w-6 text-foreground" aria-hidden /><p className="mt-3 text-sm font-semibold">{String(label)}</p></div>;
            })}
          </div>
          <p className="mt-6 border-t border-hairline pt-5 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">{zh ? "状态 · 异常 · 恢复 · 审核 · 交付证据" : "State · exception · recovery · review · evidence"}</p>
        </div>
      </section>

      <section
        id="about-shijie-intelligence"
        className="mx-auto max-w-6xl border-y border-hairline px-4 py-14 lg:py-16"
        aria-labelledby="about-shijie-intelligence-title"
      >
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              {zh ? "Brand facts · 品牌直接答案" : "Brand facts · Direct answer"}
            </p>
            <h2
              id="about-shijie-intelligence-title"
              className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-foreground"
            >
              {zh ? "实解智能是谁？" : "What is SolveReal Systems?"}
            </h2>
            <p className="mt-5 text-base leading-8 text-muted-foreground">
              {zh
                ? `${publicIdentity.names.zh}（英文品牌名：${publicIdentity.names.en}）目前由 fengc 负责，提供企业 AI 系统设计与交付服务。我们不从固定行业模板或通用功能清单开始，而是从企业正在消耗人力、容易出错、难以持续运行的真实流程开始。`
                : `${publicIdentity.names.en}, also known in Chinese as ${publicIdentity.names.zh}, is led by fengc and provides enterprise AI system design and delivery. Work starts from a real workflow that consumes staff time, fails easily, or is difficult to sustain—not from a fixed industry template or a generic feature list.`}
            </p>
            <Link href={path("/about")} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent">
              {zh ? "了解实解智能" : "About SolveReal Systems"} <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <dl className="grid gap-px border border-hairline bg-hairline sm:grid-cols-3">
            {[
              [zh ? "服务谁" : "Who it serves", content.identity.audience],
              [zh ? "怎么开始" : "How work starts", content.identity.description],
              [
                zh ? "交付原则" : "Delivery principle",
                zh
                  ? "稳定步骤交给系统，关键决策和高风险动作保留人工审核，并保存状态、异常、恢复与交付证据。"
                  : "The system handles stable steps; people retain key decisions and high-risk actions, with state, exceptions, recovery, and delivery evidence preserved.",
              ],
            ].map(([term, description]) => (
              <div key={term} className="bg-surface-paper-elevated p-6">
                <dt className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-accent">{term}</dt>
                <dd className="mt-4 text-sm leading-7 text-muted-foreground">{description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="capabilities" className="mx-auto max-w-6xl px-4 py-16 lg:py-20">
        <div className="flex items-end justify-between gap-4 border-b border-hairline pb-5"><div><p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">01 / Capabilities</p><h2 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-foreground">{zh ? "\u56db\u4e2a\u7cfb\u7edf\u65b9\u5411\uff0c\u5bf9\u5e94\u56db\u7c7b\u4f01\u4e1a\u80fd\u529b" : "Four system directions, four enterprise capabilities"}</h2></div><Link href={path("/services")} className="hidden text-sm font-semibold text-accent sm:inline-flex">{zh ? "查看完整服务事实" : "See complete service facts"} →</Link></div>
        <div className="grid gap-px border-x border-b border-hairline bg-hairline sm:grid-cols-2">
          {capabilities.map(([title, description, Icon], index) => <article key={title} className="bg-surface-paper p-6 sm:p-8"><div className="flex items-center justify-between"><span className="font-mono text-xs text-accent">0{index + 1}</span><Icon className="h-5 w-5 text-foreground" aria-hidden /></div><h3 className="mt-10 text-xl font-semibold text-foreground">{title}</h3><p className="mt-3 max-w-md text-sm leading-7 text-muted-foreground">{description}</p></article>)}
        </div>
      </section>

      <ProjectJourneys />

      <section id="method" className="mx-auto max-w-6xl px-4 py-16 lg:py-20"><p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">03 / Delivery method</p><h2 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-foreground">{zh ? "我们如何把 AI 做成可运行的系统" : "How AI becomes a working system"}</h2><div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">{content.service.method.map((step, index) => <article key={step.id} className="border-t border-hairline pt-5"><span className="font-mono text-xs text-accent">0{index + 1}</span><h3 className="mt-5 text-lg font-semibold text-foreground">{step.title}</h3><p className="mt-2 text-sm leading-7 text-muted-foreground">{step.description}</p></article>)}</div></section>

      {zh ? (
        <section className="mx-auto grid max-w-6xl gap-8 border-t border-hairline px-4 py-16 md:grid-cols-[1fr_220px] md:items-center lg:py-20" id="wechat"><div><p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">04 / Independent System</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-foreground">公众号「独立系统」</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">记录企业 AI 系统、自动化与独立开发实践。扫码进入公众号，或从文章库先看方法与案例。</p><Link href={path("/articles")} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-accent">进入文章库<ArrowRight className="h-4 w-4" aria-hidden /></Link></div><Image src="/images/contact/wechat-official.jpg" alt="微信公众号「独立系统」二维码" width={220} height={220} className="border border-hairline bg-white p-2" /></section>
      ) : null}

      <section className="bg-surface-graphite px-4 py-12 text-surface-graphite-foreground"><div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between"><div><h2 className="text-3xl font-semibold tracking-[-0.035em]">{zh ? "有一个重复、易错、难以持续的流程？" : "Have a repetitive, fragile workflow?"}</h2><p className="mt-2 text-sm text-surface-graphite-foreground/60">{zh ? "从真实业务问题开始，不从功能清单开始。" : "Start from the real business problem, not a feature list."}</p></div><Link href={path("/contact")} className="inline-flex min-h-11 items-center justify-center gap-2 bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground hover:bg-accent-hover">{zh ? "提交你的业务问题" : "Submit your business problem"}<ArrowRight className="h-4 w-4" aria-hidden /></Link></div></section>
    </div>
  );
}
