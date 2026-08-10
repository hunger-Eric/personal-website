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
      return { editorialBrief: { readerQuestion: "中小企业运营负责人怎样让 AI 使用可复核？", centralThesis: "把责任、证据与复盘放进日常流程，AI 试用才能成为可持续的运营能力。", evidenceNeeds: ["责任分工框架", "上线检查依据", "持续改进要求"] }, queries: [{ query: `${input.topic} AI governance framework`, type: "general" }, { query: "AI management system standard", type: "academic" }] };
    },
    async writeSourceBoundArticle(input: ArticleSourceBoundWriteInput): Promise<SourceBoundArticleProposal> {
      const topic = input.topic.slice(0, 100);
      return {
        title: `${topic}：客户线索处理上 AI 前，先把复核和责任放进流程`,
        slugProposal: "fixture-ai-governance-workflow",
        summary: "面向中小企业运营负责人：用责任分工、人工复核和复盘记录，让 AI 辅助客户线索处理既提速也能追溯。",
        tags: ["AI 治理", "业务流程"],
        body: "销售高峰时，客户线索常常先进入表单、客服对话和业务员的个人判断。若 AI 帮忙归类、补全或建议跟进顺序，运营负责人真正需要回答的不是工具能否演示，而是错误建议会不会改变客户承诺、谁能暂停自动流转、记录留在哪里。NIST 的风险管理框架把治理、识别、衡量和管理视为连续活动，为这种业务拆分提供了公开依据。[[S001]]\n\n## 先划出 AI 可以建议、不能决定的边界\n\n第一步是把线索处理拆成可观察动作：收集信息、判断优先级、分配销售、发送触达和关闭记录。AI 可以给出标签或提醒，但涉及报价、资格淘汰和客户权益的决定应保留给明确的业务负责人；每个例外都要有人工复核入口。OECD 原则强调以人为本、透明和问责，这些原则可以转化为日常的分工规则。[[S002]]\n\n## 把复核放在客户承诺之前\n\n上线检查不必是一份抽象的合规清单，而应围绕线索流转中的具体后果：推荐是否会让销售跳过必要核实，自动信息是否可能造成错误承诺，客服发现异常后能否及时撤回。运营团队可以在发送前设置抽样复核，在分配后保留修改原因，并让负责人每周查看被撤回的建议。英国政策文件把安全、透明、公平、问责和可申诉性列为关键考量，为这些检查提供了外部事实依据。[[S004]]\n\n## 用记录判断提速是否真的带来收益\n\n只看 AI 处理了多少条线索，容易把速度当成结果。更有价值的运营记录包括：被人工改写的标签比例、错误分配导致的重新跟进、从首次咨询到有效联系的时间，以及客户投诉是否集中在某类建议上。这样，团队能够区分数据质量问题、流程设计问题和模型输出问题，再决定是调整规则、补充资料还是停止某个场景。NIST 的治理与衡量活动支持用可复核证据持续评估风险。[[S001]]\n\n## 让复盘成为每周的管理动作\n\nISO/IEC 42001 关注建立、实施、维护和持续改进 AI 管理体系，提醒中小企业不要把控制停留在试用开始时。运营负责人可以每周选择一个高频线索场景，复盘异常、责任变更和客户反馈；连续四周仍能稳定执行的检查项，再推广到其他渠道。这样的节奏既不给一线增加无关手续，也让负责人更替后仍能接手同一套判断依据。[[S003]]\n\n当 AI 辅助线索处理进入日常工作，最小的可靠起点不是同时接入更多功能，而是选一个影响客户承诺的场景，把边界、复核、记录和复盘做成同一条路径。确认这条路径能被团队稳定执行后，再扩展到更多来源和更多销售环节，效率提升才不会以不可追溯的风险为代价。[[S003]]",
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
