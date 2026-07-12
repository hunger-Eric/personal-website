"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Cable,
  Network,
  RefreshCw,
  Repeat2,
  SearchCheck,
  ShieldCheck,
  TestTube2,
  Wrench,
} from "lucide-react";

import { useLocale } from "@/components/LocaleProvider";
import { getLocalizedPublicContent } from "@/config/public-content";
import { WorkflowMap } from "./WorkflowMap";
import { WorkflowTheatre } from "./WorkflowTheatre";
import { ProjectEvidenceGallery } from "./ProjectEvidenceGallery";

const capabilityIcons = [Network, Repeat2, Cable, RefreshCw];
const methodIcons = [SearchCheck, ShieldCheck, TestTube2, Wrench];

export function EnterpriseHomepage() {
  const { locale } = useLocale();
  const content = getLocalizedPublicContent(locale);
  const [signalId, setSignalId] = useState(content.service.problemSignals[0]?.id ?? "");
  const selectedSignal =
    content.service.problemSignals.find((signal) => signal.id === signalId) ??
    content.service.problemSignals[0];
  const project = content.projects[0];

  return (
    <div className="bg-surface-paper text-surface-paper-foreground">
      <section className="mx-auto grid max-w-6xl gap-10 px-4 pb-16 pt-28 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:pb-20 lg:pt-36">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-accent">AI workflow systems</p>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-[-0.04em] text-foreground sm:text-5xl lg:text-6xl">
            把重复、易错的人工流程，变成能持续运行的系统
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-muted-foreground">{content.identity.description}</p>

          <fieldset className="mt-8">
            <legend className="text-sm font-semibold text-foreground">你的流程现在卡在哪里？</legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {content.service.problemSignals.slice(0, 3).map((signal) => (
                <button
                  key={signal.id}
                  type="button"
                  aria-pressed={signalId === signal.id}
                  onClick={() => setSignalId(signal.id)}
                  className={`min-h-20 border p-3 text-left text-sm font-semibold leading-5 transition-colors ${
                    signalId === signal.id
                      ? "border-accent bg-surface-paper-elevated text-foreground"
                      : "border-hairline text-muted-foreground hover:border-accent hover:text-foreground"
                  }`}
                >
                  {signal.title}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href={content.cta.primary.href} className="inline-flex items-center justify-center gap-2 bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground hover:bg-accent-hover">
              {content.cta.primary.label} <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <a href="#case-theatre" className="inline-flex items-center justify-center gap-2 border border-foreground px-5 py-3 text-sm font-semibold text-foreground hover:border-accent hover:text-accent">
              {content.cta.secondary.label}
            </a>
          </div>
        </div>

        <WorkflowMap selectedSignal={selectedSignal?.title ?? "业务流程"} />
      </section>

      {project ? <WorkflowTheatre project={project} /> : null}

      <section className="mx-auto max-w-6xl px-4 py-16 lg:py-24">
        <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">Transferable structure</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">不同行业，相同的流程结构</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">客户业务不同，但真正值得系统化的问题通常落在信息汇总、重复判断、系统接力和异常恢复上。</p>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["多来源信息汇总", "把分散信息形成统一、可追踪的结构化底稿。"],
            ["重复判断与录入", "把稳定规则自动化，把例外保留给人工。"],
            ["系统之间的数据接力", "跨系统读写状态，避免人工搬运和断点。"],
            ["异常恢复与人工审核", "记录异常、保留恢复点，让交付可控。"],
          ].map(([title, description], index) => {
            const Icon = capabilityIcons[index];
            return (
              <article key={title} className="border border-hairline bg-surface-paper-elevated p-5">
                <Icon className="h-6 w-6 text-accent" aria-hidden />
                <h3 className="mt-6 text-lg font-semibold text-foreground">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <ProjectEvidenceGallery projects={content.projects} />

      <section id="method" className="border-y border-hairline bg-surface-paper-elevated">
        <div className="mx-auto max-w-6xl px-4 py-16 lg:py-24">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">我们的交付方法</h2>
          <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {content.service.method.map((step, index) => {
              const Icon = methodIcons[index];
              return (
                <article key={step.id}>
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full border border-accent text-accent">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">0{index + 1}</span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 lg:py-24">
        <div className="grid gap-8 bg-surface-graphite px-6 py-10 text-surface-graphite-foreground sm:px-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">把你的流程问题交给我们</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-surface-graphite-foreground/70">描述当前流程、重复频率和最容易出错的步骤。提交后先进行人工筛选，再确认是否安排 30 分钟初步诊断。</p>
          </div>
          <Link href="/contact" className="inline-flex items-center justify-center gap-2 bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground hover:bg-accent-hover">
            提交你的流程问题 <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </section>
    </div>
  );
}
