"use client";

import { useState } from "react";
import { CheckCircle2, CircleDot, FileOutput, ShieldCheck } from "lucide-react";

type TheatreProject = {
  name: string;
  originalWorkflow: string[];
  workflowBreakpoints: string[];
  inputs: string[];
  processing: string[];
  humanReview: string[];
  outputs: string[];
  failureRecovery: string[];
  currentStatus?: string;
};

const tabs = ["现在怎么做", "系统接管什么", "最终交付什么"];

export function WorkflowTheatre({ project }: { project: TheatreProject }) {
  const [active, setActive] = useState(0);

  const columns =
    active === 0
      ? [
          { title: "原流程", items: project.originalWorkflow },
          { title: "主要断点", items: project.workflowBreakpoints },
        ]
      : active === 1
        ? [
            { title: "业务输入", items: project.inputs },
            { title: "AI 处理层", items: project.processing },
            { title: "人工审核", items: project.humanReview },
          ]
        : [
            { title: "可使用的交付物", items: project.outputs },
            { title: "异常与恢复", items: project.failureRecovery },
          ];

  return (
    <section id="case-theatre" className="bg-surface-graphite px-4 py-14 text-surface-graphite-foreground sm:rounded-panel sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-5 border-b border-inverse pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Case theatre / 案例剧场</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{project.name}</h2>
          </div>
          <div role="tablist" aria-label="案例剧场章节" className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {tabs.map((tab, index) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={active === index}
                onClick={() => setActive(index)}
                className={`border px-4 py-2 text-left text-sm transition-colors ${
                  active === index
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-inverse text-surface-graphite-foreground hover:border-accent"
                }`}
              >
                <span className="mr-2 font-mono text-xs opacity-70">0{index + 1}</span>
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className={`mt-8 grid gap-4 ${columns.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2"}`}>
          {columns.map((column, columnIndex) => (
            <article key={column.title} className="border border-inverse bg-surface-graphite-muted p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-accent">
                {columnIndex === columns.length - 1 ? (
                  <ShieldCheck className="h-4 w-4" aria-hidden />
                ) : (
                  <CircleDot className="h-4 w-4" aria-hidden />
                )}
                <h3>{column.title}</h3>
              </div>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-surface-graphite-foreground/75">
                {column.items.map((item) => (
                  <li key={item} className="flex gap-3 border-t border-inverse pt-3 first:border-t-0 first:pt-0">
                    <FileOutput className="mt-1 h-4 w-4 shrink-0 text-accent" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        {active === 2 && project.currentStatus ? (
          <div className="mt-5 flex gap-3 border border-accent/60 p-4 text-sm leading-6">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden />
            <p>{project.currentStatus}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
