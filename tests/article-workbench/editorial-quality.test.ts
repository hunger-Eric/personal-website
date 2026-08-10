import { describe, expect, it } from "vitest";

import {
  ResearchPlanProposalSchema,
  assignResearchPlanIds,
  type ArticleSourceBoundWriteInput,
} from "@/lib/article-workbench/contracts";
import { OpenAICompatibleModelProvider, createArticleModelConfig } from "@/lib/article-workbench/model";

const profile = {
  identity: { name: "示例企业", category: "咨询", positioning: "运营改进", description: "帮助团队建立可执行流程。" },
  services: ["流程咨询"], audience: "中小企业经营者与运营负责人", geographicScope: ["中国"],
  differentiators: ["重视落地"], approvedEvidence: [{ id: "B001", claim: "已审阅的项目交付流程可复盘。", reviewed: true as const }], disallowedClaims: ["行业第一"],
};

const brief = {
  readerQuestion: "运营负责人怎样把 AI 试用变成可审计的日常流程？",
  centralThesis: "先把责任、证据和复盘嵌入业务流程，才能让 AI 试用成为可持续的运营能力。",
  evidenceNeeds: ["责任分工的公开框架", "上线前检查的外部依据", "持续复盘的管理要求"],
};

const writingInput = {
  profile,
  topic: "中小企业 AI 运营流程",
  editorialBrief: brief,
  articleRules: ["使用已提供的来源。"],
  sources: [
    { id: "S001", title: "NIST AI RMF", url: "https://example.com/nist", excerpt: "风险管理框架。", content: "NIST 的 AI 风险管理框架提出治理、映射、衡量和管理风险的实践，可用于组织建立可复核的风险管理过程。" },
    { id: "S002", title: "ISO 42001", url: "https://example.com/iso", excerpt: "管理体系标准。", content: "ISO/IEC 42001 为组织建立、实施、维护和持续改进人工智能管理体系提供要求，强调责任与持续改进。" },
  ],
} as ArticleSourceBoundWriteInput;

function completion(content: unknown): Response {
  return new Response(JSON.stringify({ id: "chatcmpl-editorial", choices: [{ message: { content: JSON.stringify(content) } }] }), { status: 200 });
}

const coherentArticle = {
  title: "把 AI 试用变成运营流程，先补上三份责任证据",
  slugProposal: "ai-operations-evidence",
  summary: "中小企业不缺试用工具，缺的是能在负责人更替和业务变化后继续运转的流程证据。",
  tags: ["AI 运营", "流程管理"],
  body: `客户催进度时，团队往往能展示一个能回答问题的 AI 工具，却拿不出谁批准、谁复核、出了偏差怎样追溯的记录。这不是工具选择问题，而是运营流程没有留下可检查的责任链。[[S001]]

## 先把试用场景拆成可承担的决定

运营负责人应先列出 AI 在报价、客服和内部知识查询中分别替谁节省了什么动作，再指定每个场景的业务负责人、复核动作和停止条件。这样做的价值不在于多一张表，而在于出现异常时，团队能区分是数据、流程还是模型输出造成的问题。NIST 的风险管理框架把治理、映射、衡量和管理作为连续活动，为这种拆分提供了公开依据。[[S001]]

## 上线前检查要回答业务后果

把透明度、人工复核和例外处理写成一句口号，无法帮助一线员工做决定。更有用的检查是：这次输出会不会直接影响客户承诺，错了由谁拦截，复核后留下什么证据。每一项检查都对应一个可执行动作，既避免把风险讨论停在会议室，也避免业务为了合规而重复录入无关信息。[[S001]]

## 用复盘把一次性试用变成管理能力

管理体系的重点不是在启动时写完文件，而是让负责人定期检查实际使用是否仍符合原先边界。ISO/IEC 42001 将建立、实施、维护和持续改进放在同一套管理体系中，提醒团队把异常、修订和责任变更带回日常运营。[[S002]]

当业务规模扩大或负责人调整时，保留下来的不是一段漂亮的项目介绍，而是可被下一位负责人接手的决定依据。先从一个高频场景开始，连续复盘四周，再把有效的检查项复制到其他场景，通常比同时铺开多个工具更稳妥。[[S002]]`,
  sourceAssessments: [
    { sourceId: "S001", category: "official", rationale: "公开风险管理框架。", claimsSupported: ["责任链和风险管理步骤"] },
    { sourceId: "S002", category: "standard", rationale: "公开管理体系标准。", claimsSupported: ["持续改进要求"] },
  ],
};

describe("editorial quality contract", () => {
  it("accepts a model-owned editorial brief while code assigns the only query identifiers", () => {
    const plan = ResearchPlanProposalSchema.parse({
      editorialBrief: brief,
      queries: [{ query: "AI 风险管理 责任分工", type: "general" }, { query: "AI 管理体系 持续改进", type: "academic" }],
    });
    expect(assignResearchPlanIds(plan)).toMatchObject({
      editorialBrief: brief,
      queries: [{ id: "Q001" }, { id: "Q002" }],
    });
  });

  it("sends the exact plan-owned brief in versioned editorial request messages and persists identity without prompt bodies", async () => {
    const receipts: unknown[] = [];
    const requests: RequestInit[] = [];
    const fetch = async (_input: string | URL | Request, init?: RequestInit) => {
      requests.push(init ?? {});
      return completion(coherentArticle);
    };
    const provider = new OpenAICompatibleModelProvider({
      fetch,
      persistReceipt: (receipt) => { receipts.push(receipt); },
      config: createArticleModelConfig({ ARTICLE_MODEL_PROVIDER: "provider", ARTICLE_MODEL_PROTOCOL: "openai_compatible", ARTICLE_MODEL_BASE_URL: "https://models.example.test/v1", ARTICLE_MODEL_NAME: "model", ARTICLE_MODEL_API_KEY: "test-key", ARTICLE_MODEL_STRUCTURED_OUTPUT_MODE: "prompt_only" }),
    });

    await expect(provider.writeSourceBoundArticle(writingInput)).resolves.toMatchObject({ title: coherentArticle.title });
    const request = JSON.parse(String(requests[0].body));
    expect(request.messages).toEqual(expect.arrayContaining([
      expect.objectContaining({ role: "system", content: expect.stringContaining("editorial.v1") }),
      expect.objectContaining({ role: "user", content: expect.stringContaining(JSON.stringify(brief)) }),
    ]));
    expect(receipts[0]).toMatchObject({ promptContractVersion: "editorial.v1", promptContractHash: expect.stringMatching(/^[a-f0-9]{64}$/) });
    expect(JSON.stringify(receipts)).not.toContain(brief.centralThesis);
    expect(JSON.stringify(receipts)).not.toContain("test-key");
  });

  it("rejects report-card prose with four heading-sized paragraphs instead of accepting citation tokens alone", async () => {
    const thin = {
      ...coherentArticle,
      body: "## 责任\n\n明确负责人。[[S001]]\n\n## 检查\n\n上线前复核。[[S002]]\n\n## 记录\n\n保存结果。[[S001]]\n\n## 复盘\n\n每周复盘。[[S002]]",
    };
    const provider = new OpenAICompatibleModelProvider({
      fetch: async () => completion(thin),
      config: createArticleModelConfig({ ARTICLE_MODEL_PROVIDER: "provider", ARTICLE_MODEL_PROTOCOL: "openai_compatible", ARTICLE_MODEL_BASE_URL: "https://models.example.test/v1", ARTICLE_MODEL_NAME: "model", ARTICLE_MODEL_API_KEY: "test-key", ARTICLE_MODEL_STRUCTURED_OUTPUT_MODE: "prompt_only" }),
    });
    await expect(provider.writeSourceBoundArticle(writingInput)).rejects.toThrow("ARTICLE_MODEL_OUTPUT_INVALID");
  });

  it("rejects an uncited substantive claim that follows a heading", async () => {
    const uncitedHeadingBlock = {
      ...coherentArticle,
      body: coherentArticle.body.replace("## 用复盘把一次性试用变成管理能力", "## 用复盘把一次性试用变成管理能力\n这段未引用的外部主张足够长，描述管理体系会在负责人变动时自动减少所有客户风险，并且任何团队都能据此获得相同结果，因此不能因为标题行而绕过引用要求。"),
    };
    const provider = new OpenAICompatibleModelProvider({ fetch: async () => completion(uncitedHeadingBlock), config: createArticleModelConfig({ ARTICLE_MODEL_PROVIDER: "provider", ARTICLE_MODEL_PROTOCOL: "openai_compatible", ARTICLE_MODEL_BASE_URL: "https://models.example.test/v1", ARTICLE_MODEL_NAME: "model", ARTICLE_MODEL_API_KEY: "test-key", ARTICLE_MODEL_STRUCTURED_OUTPUT_MODE: "prompt_only" }) });
    await expect(provider.writeSourceBoundArticle(writingInput)).rejects.toThrow("ARTICLE_MODEL_OUTPUT_INVALID");
  });

  it("accepts coherent source-backed prose that clears the deterministic material floor", async () => {
    const provider = new OpenAICompatibleModelProvider({
      fetch: async () => completion(coherentArticle),
      config: createArticleModelConfig({ ARTICLE_MODEL_PROVIDER: "provider", ARTICLE_MODEL_PROTOCOL: "openai_compatible", ARTICLE_MODEL_BASE_URL: "https://models.example.test/v1", ARTICLE_MODEL_NAME: "model", ARTICLE_MODEL_API_KEY: "test-key", ARTICLE_MODEL_STRUCTURED_OUTPUT_MODE: "prompt_only" }),
    });
    await expect(provider.writeSourceBoundArticle(writingInput)).resolves.toMatchObject({ body: expect.stringContaining("可承担的决定") });
  });
});
