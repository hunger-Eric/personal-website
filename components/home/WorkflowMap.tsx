import {
  Bot,
  CheckCircle2,
  Database,
  FileSpreadsheet,
  FileText,
  Globe2,
  Mail,
  MessageSquare,
  UserRoundCheck,
} from "lucide-react";

const inputs = [
  { label: "文件 / PDF", icon: FileText },
  { label: "表格 / Excel", icon: FileSpreadsheet },
  { label: "网站 / 表单", icon: Globe2 },
  { label: "消息 / 邮件", icon: Mail },
  { label: "业务系统", icon: Database },
];

const outputs = ["结构化结果", "系统写入 / 执行", "通知 / 消息送达", "归档 / 知识沉淀"];

export function WorkflowMap({ selectedSignal }: { selectedSignal: string }) {
  return (
    <div className="rounded-panel border border-hairline bg-surface-paper-elevated p-4 shadow-card sm:p-5">
      <div className="grid gap-3 text-xs text-muted-foreground sm:grid-cols-[0.9fr_1fr_0.8fr_1fr]">
        <div>
          <p className="mb-3 font-semibold text-foreground">分散的输入</p>
          <div className="space-y-2">
            {inputs.map(({ label, icon: Icon }) => (
              <div key={label} className="flex items-center gap-2 border-b border-hairline py-2">
                <Icon className="h-4 w-4 text-accent" aria-hidden />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-y border-hairline py-3 sm:border-x sm:border-y-0 sm:px-4 sm:py-0">
          <p className="mb-3 font-semibold text-foreground">AI 处理与协同</p>
          <div className="space-y-2">
            {["数据抽取", "字段标准化", "规则校验", "去重与合并", "AI 理解与补全"].map(
              (item) => (
                <div key={item} className="flex items-center gap-2 py-1.5">
                  <Bot className="h-4 w-4 text-accent" aria-hidden />
                  <span>{item}</span>
                </div>
              )
            )}
          </div>
        </div>

        <div className="py-3 sm:py-0">
          <p className="mb-3 font-semibold text-foreground">人机审核</p>
          <div className="flex h-full min-h-40 flex-col items-center justify-center rounded-card border border-hairline bg-surface-paper p-4 text-center">
            <UserRoundCheck className="h-8 w-8 text-accent" aria-hidden />
            <p className="mt-3 font-semibold text-foreground">关键决策人工审核</p>
            <span className="mt-3 inline-flex items-center gap-1 text-success">
              <CheckCircle2 className="h-4 w-4" aria-hidden /> 通过
            </span>
          </div>
        </div>

        <div className="border-t border-hairline pt-3 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
          <p className="mb-3 font-semibold text-foreground">稳定的输出</p>
          <div className="space-y-2">
            {outputs.map((item) => (
              <div key={item} className="flex items-center gap-2 border-b border-hairline py-2">
                <MessageSquare className="h-4 w-4 text-accent" aria-hidden />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-hairline pt-4 text-xs text-muted-foreground">
        <CheckCircle2 className="h-4 w-4 text-accent" aria-hidden />
        <span>当前识别：{selectedSignal}。流程可记录、可恢复、可追溯。</span>
      </div>
    </div>
  );
}
