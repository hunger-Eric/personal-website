import type { Metadata } from "next";
import { Check, Clock3, ShieldCheck } from "lucide-react";

import { WorkflowInquiryForm } from "@/components/contact/WorkflowInquiryForm";

export const metadata: Metadata = {
  title: "提交流程问题",
  description: "描述你的人工流程、重复频率与异常位置，申请一次人工筛选后的 30 分钟初步诊断。",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-surface-paper pb-20 pt-28 text-surface-paper-foreground sm:pt-32">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 lg:grid-cols-[0.82fr_1.18fr] lg:gap-20">
        <section>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent">Workflow diagnosis</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.04em] text-foreground sm:text-5xl">先把真实流程讲清楚，再判断 AI 应该介入哪里</h1>
          <p className="mt-6 text-base leading-8 text-muted-foreground">这里不是自动报价器。你提供的信息会先由我人工查看，判断问题是否适合通过 AI 或自动化改造。</p>
          <div className="mt-9 space-y-5 border-t border-hairline pt-7">
            {[[Clock3, "约 5 分钟填写", "写清流程比选择行业模板更重要。"], [ShieldCheck, "人工筛选", "不会因为提交表单就自动进入销售流程。"], [Check, "适合再约 30 分钟", "初步诊断用于确认边界、样本和下一步。"]].map(([Icon, title, description]) => {
              const ItemIcon = Icon as typeof Clock3;
              return <div key={String(title)} className="flex gap-4"><ItemIcon className="mt-1 h-5 w-5 flex-none text-accent" aria-hidden /><div><h2 className="font-semibold text-foreground">{String(title)}</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">{String(description)}</p></div></div>;
            })}
          </div>
        </section>
        <section className="border border-hairline bg-surface-paper-elevated p-5 shadow-card sm:p-8">
          <WorkflowInquiryForm />
        </section>
      </div>
    </div>
  );
}
