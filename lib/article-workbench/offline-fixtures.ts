import type {
  ArticlePublicationRecord,
  ArticleResearchPlanInput,
  ArticleSourceBoundWriteInput,
  ModelPort,
  PublisherPort,
  PublicationReceipt,
  ResearchPlanProposal,
  SearchPort,
  SourceBoundArticleProposal,
  SourcePacketResult,
} from "./contracts";

const fixtureSources = [
  { id: "S001", title: "NIST AI Risk Management Framework", url: "https://www.nist.gov/itl/ai-risk-management-framework", publisher: "NIST", excerpt: "A voluntary framework for managing risks in the design and use of AI systems.", content: "NIST publishes a voluntary AI risk management framework that helps organizations govern, map, measure, and manage risks from AI systems." },
  { id: "S002", title: "OECD AI Principles", url: "https://oecd.ai/en/ai-principles", publisher: "OECD", excerpt: "International principles for trustworthy, human-centred artificial intelligence.", content: "The OECD AI Principles describe human-centred values, transparency, robustness, safety, accountability, and responsible stewardship for artificial intelligence." },
  { id: "S003", title: "ISO/IEC 42001 overview", url: "https://www.iso.org/standard/81230.html", publisher: "ISO", excerpt: "A management system standard for organizations developing or using AI systems.", content: "ISO/IEC 42001 specifies requirements for establishing and improving an artificial intelligence management system within an organization." },
  { id: "S004", title: "UK AI regulation policy paper", url: "https://www.gov.uk/government/publications/ai-regulation-a-pro-innovation-approach", publisher: "UK Government", excerpt: "A policy approach that places responsible innovation and risk management at the centre.", content: "The UK government policy paper explains a context-based approach to AI regulation focused on safety, transparency, fairness, accountability, and contestability." },
] as const;

export function createOfflineArticleWorkbenchFixtures(): { model: ModelPort; search: SearchPort; publisher: PublisherPort } {
  const model: ModelPort = {
    async proposeResearchPlan(input: ArticleResearchPlanInput): Promise<ResearchPlanProposal> {
      return { queries: [{ query: `${input.topic} AI governance framework`, type: "general" }, { query: "AI management system standard", type: "academic" }] };
    },
    async writeSourceBoundArticle(input: ArticleSourceBoundWriteInput): Promise<SourceBoundArticleProposal> {
      const topic = input.topic.slice(0, 100);
      return {
        title: `${topic}：建立可验证的 AI 治理流程`,
        slugProposal: "fixture-ai-governance-workflow",
        summary: "这是一篇仅用于本地浏览器验收的来源约束文章，展示如何把公开框架转化为可检查的业务流程。",
        tags: ["AI 治理", "业务流程"],
        body: "## 先明确可检查的责任\n\n将 AI 使用场景、负责人和风险记录在同一份流程中，能让团队从试用阶段开始保留核验依据。[[S001]]\n\n## 用公开原则校准决策\n\n把透明度、稳健性和问责要求转化为上线前检查项，有助于让业务目标与可信使用保持一致。[[S002]]\n\n## 让管理动作持续发生\n\n管理体系需要周期性复盘，而不是一次性的合规文件；团队可以把复盘结果纳入日常运营节奏。[[S003]]\n\n## 为变化保留更新入口\n\n外部规则与业务实践会变化，保留负责人与修订记录能让治理流程持续更新。[[S004]]",
        sourceAssessments: fixtureSources.map((source, index) => ({
          sourceId: source.id,
          category: index === 0 ? "official" : index === 1 ? "standard" : index === 2 ? "standard" : "official",
          rationale: "公开机构或标准组织发布的材料，适合用于本地验收中的来源绑定演示。",
          claimsSupported: ["可作为治理流程设计的公开参考。"],
        })),
      };
    },
  };

  const search: SearchPort = { async collect(): Promise<SourcePacketResult> { return { status: "ok", sources: [...fixtureSources] }; } };
  const publisher: PublisherPort = {
    async submit(article: ArticlePublicationRecord): Promise<PublicationReceipt> { return { id: `offline-${article.contentHash.slice(-12)}`, slug: article.slug, contentHash: article.contentHash, status: "submitted" }; },
    async recover(): Promise<PublicationReceipt | null> { return null; },
    async verify(receipt: PublicationReceipt): Promise<PublicationReceipt> { return { ...receipt, status: "submitted" }; },
  };
  return { model, search, publisher };
}
