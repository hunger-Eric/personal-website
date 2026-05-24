// app/admin/pages/page.tsx
"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminEditor } from "@/components/admin/AdminEditor";
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from "lucide-react";

type PageBlock = {
  id: string;
  type: "hero" | "text" | "gallery" | "cards" | "contact";
  title: string;
  content: any;
};

type PageItem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  blocks: PageBlock[];
};

type PagesData = {
  pages: PageItem[];
};

export default function PagesAdminPage() {
  return (
    <div className="min-h-screen bg-background pl-64">
      <AdminSidebar />
      <AdminEditor
        title="自定义页面"
        description="创建和管理自定义页面，自由排版"
        configKey="pages"
      >
        {(data: PagesData, setData) => (
          <div className="space-y-6">
            {data.pages.map((page, pi) => (
              <div key={page.id} className="rounded-2xl border border-border bg-card p-5">
                {/* Page header */}
                <div className="mb-4 flex items-center gap-3">
                  <input
                    value={page.title}
                    onChange={(e) => {
                      const newPages = [...data.pages];
                      newPages[pi] = { ...page, title: e.target.value };
                      setData({ ...data, pages: newPages });
                    }}
                    placeholder="页面标题"
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold outline-none focus:border-amber-400"
                  />
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span>/page/</span>
                    <input
                      value={page.slug}
                      onChange={(e) => {
                        const newPages = [...data.pages];
                        newPages[pi] = { ...page, slug: e.target.value };
                        setData({ ...data, pages: newPages });
                      }}
                      placeholder="slug"
                      className="w-24 rounded border border-border bg-background px-2 py-1 text-xs outline-none focus:border-amber-400"
                    />
                  </div>
                  <a
                    href={`/page/${page.slug}`}
                    target="_blank"
                    className="rounded-lg bg-muted px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                  >
                    预览
                  </a>
                  <button
                    onClick={() => {
                      const newPages = data.pages.filter((_, j) => j !== pi);
                      setData({ ...data, pages: newPages });
                    }}
                    className="rounded-lg p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Description */}
                <textarea
                  value={page.description || ""}
                  onChange={(e) => {
                    const newPages = [...data.pages];
                    newPages[pi] = { ...page, description: e.target.value };
                    setData({ ...data, pages: newPages });
                  }}
                  placeholder="页面描述"
                  rows={2}
                  className="mb-4 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-amber-400"
                />

                {/* Blocks */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase text-muted-foreground">
                      页面区块 ({page.blocks.length})
                    </h3>
                    <button
                      onClick={() => {
                        const newPages = [...data.pages];
                        newPages[pi] = {
                          ...page,
                          blocks: [
                            ...page.blocks,
                            {
                              id: `block-${Date.now()}`,
                              type: "text",
                              title: "新区块",
                              content: { text: "在此输入内容..." },
                            },
                          ],
                        };
                        setData({ ...data, pages: newPages });
                      }}
                      className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-600 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300"
                    >
                      <Plus className="h-3 w-3" />
                      添加区块
                    </button>
                  </div>

                  {page.blocks.map((block, bi) => (
                    <div key={block.id} className="rounded-xl border border-border bg-muted/30 p-4">
                      <div className="mb-3 flex items-center gap-2">
                        {/* Block type selector */}
                        <select
                          value={block.type}
                          onChange={(e) => {
                            const newPages = [...data.pages];
                            const newBlocks = [...page.blocks];
                            newBlocks[bi] = { ...block, type: e.target.value as any };
                            newPages[pi] = { ...page, blocks: newBlocks };
                            setData({ ...data, pages: newPages });
                          }}
                          className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs outline-none focus:border-amber-400"
                        >
                          <option value="hero">Hero 标题区</option>
                          <option value="text">文本区</option>
                          <option value="gallery">图片画廊</option>
                          <option value="cards">卡片列表</option>
                          <option value="contact">联系方式</option>
                        </select>
                        <input
                          value={block.title}
                          onChange={(e) => {
                            const newPages = [...data.pages];
                            const newBlocks = [...page.blocks];
                            newBlocks[bi] = { ...block, title: e.target.value };
                            newPages[pi] = { ...page, blocks: newBlocks };
                            setData({ ...data, pages: newPages });
                          }}
                          placeholder="区块标题"
                          className="flex-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm outline-none focus:border-amber-400"
                        />
                        <button
                          onClick={() => {
                            const newPages = [...data.pages];
                            const newBlocks = page.blocks.filter((_, k) => k !== bi);
                            newPages[pi] = { ...page, blocks: newBlocks };
                            setData({ ...data, pages: newPages });
                          }}
                          className="rounded-lg p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Block content editor */}
                      {block.type === "hero" && (
                        <div className="space-y-2">
                          <input
                            value={block.content.headline || ""}
                            onChange={(e) => {
                              const newPages = [...data.pages];
                              const newBlocks = [...page.blocks];
                              newBlocks[bi] = { ...block, content: { ...block.content, headline: e.target.value } };
                              newPages[pi] = { ...page, blocks: newBlocks };
                              setData({ ...data, pages: newPages });
                            }}
                            placeholder="大标题"
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-amber-400"
                          />
                          <input
                            value={block.content.subheadline || ""}
                            onChange={(e) => {
                              const newPages = [...data.pages];
                              const newBlocks = [...page.blocks];
                              newBlocks[bi] = { ...block, content: { ...block.content, subheadline: e.target.value } };
                              newPages[pi] = { ...page, blocks: newBlocks };
                              setData({ ...data, pages: newPages });
                            }}
                            placeholder="副标题"
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-amber-400"
                          />
                          <input
                            value={block.content.ctaText || ""}
                            onChange={(e) => {
                              const newPages = [...data.pages];
                              const newBlocks = [...page.blocks];
                              newBlocks[bi] = { ...block, content: { ...block.content, ctaText: e.target.value } };
                              newPages[pi] = { ...page, blocks: newBlocks };
                              setData({ ...data, pages: newPages });
                            }}
                            placeholder="按钮文字"
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-amber-400"
                          />
                        </div>
                      )}

                      {block.type === "text" && (
                        <textarea
                          value={block.content.text || ""}
                          onChange={(e) => {
                            const newPages = [...data.pages];
                            const newBlocks = [...page.blocks];
                            newBlocks[bi] = { ...block, content: { ...block.content, text: e.target.value } };
                            newPages[pi] = { ...page, blocks: newBlocks };
                            setData({ ...data, pages: newPages });
                          }}
                          rows={4}
                          placeholder="输入文本内容..."
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-amber-400"
                        />
                      )}

                      {block.type === "gallery" && (
                        <p className="text-xs text-muted-foreground">
                          图片画廊：配置版面编辑器中调整
                        </p>
                      )}

                      {block.type === "cards" && (
                        <div className="space-y-2">
                          {Array.isArray(block.content.cards) &&
                            block.content.cards.map((card: any, ci: number) => (
                              <div key={ci} className="flex items-center gap-2">
                                <input
                                  value={card.title || ""}
                                  onChange={(e) => {
                                    const newCards = [...block.content.cards];
                                    newCards[ci] = { ...card, title: e.target.value };
                                    const newPages = [...data.pages];
                                    const newBlocks = [...page.blocks];
                                    newBlocks[bi] = { ...block, content: { ...block.content, cards: newCards } };
                                    newPages[pi] = { ...page, blocks: newBlocks };
                                    setData({ ...data, pages: newPages });
                                  }}
                                  placeholder="卡片标题"
                                  className="flex-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs outline-none focus:border-amber-400"
                                />
                                <input
                                  value={card.description || ""}
                                  onChange={(e) => {
                                    const newCards = [...block.content.cards];
                                    newCards[ci] = { ...card, description: e.target.value };
                                    const newPages = [...data.pages];
                                    const newBlocks = [...page.blocks];
                                    newBlocks[bi] = { ...block, content: { ...block.content, cards: newCards } };
                                    newPages[pi] = { ...page, blocks: newBlocks };
                                    setData({ ...data, pages: newPages });
                                  }}
                                  placeholder="描述"
                                  className="flex-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs outline-none focus:border-amber-400"
                                />
                              </div>
                            ))}
                          <button
                            onClick={() => {
                              const newCards = [...(block.content.cards || []), { title: "新卡片", description: "卡片描述" }];
                              const newPages = [...data.pages];
                              const newBlocks = [...page.blocks];
                              newBlocks[bi] = { ...block, content: { ...block.content, cards: newCards } };
                              newPages[pi] = { ...page, blocks: newBlocks };
                              setData({ ...data, pages: newPages });
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-dashed border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                          >
                            <Plus className="h-3 w-3" />
                            添加卡片
                          </button>
                        </div>
                      )}

                      {block.type === "contact" && (
                        <p className="text-xs text-muted-foreground">
                          联系方式区块：自动显示站点配置中的社交链接
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Add page */}
            <button
              onClick={() => {
                const newPage: PageItem = {
                  id: `page-${Date.now()}`,
                  slug: `page-${Date.now()}`,
                  title: "新页面",
                  description: "",
                  blocks: [
                    {
                      id: `block-${Date.now()}`,
                      type: "hero",
                      title: "欢迎",
                      content: { headline: "标题", subheadline: "副标题", ctaText: "" },
                    },
                  ],
                };
                setData({ ...data, pages: [...data.pages, newPage] });
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border px-6 py-8 text-sm text-muted-foreground transition-colors hover:border-amber-300 hover:text-foreground"
            >
              <Plus className="h-5 w-5" />
              添加新页面
            </button>
          </div>
        )}
      </AdminEditor>
    </div>
  );
}