"use client";

import { ExternalLink, Plus, Trash2 } from "lucide-react";

import { AdminEditor } from "@/components/admin/AdminEditor";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ActionButton, AdminPanel, EmptyState, FormField, IconButton } from "@/components/system";
import { adminCopy } from "@/config/copy/admin";

type BlockType = "hero" | "text" | "gallery" | "cards" | "contact";

type HeroContent = {
  headline?: string;
  subheadline?: string;
  ctaText?: string;
};

type TextContent = {
  text?: string;
};

type CardContent = {
  title?: string;
  description?: string;
};

type CardsContent = {
  cards?: CardContent[];
};

type PageBlock = {
  id: string;
  type: BlockType;
  title: string;
  content: HeroContent | TextContent | CardsContent | Record<string, unknown>;
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

const blockTypes: BlockType[] = ["hero", "text", "gallery", "cards", "contact"];

function fieldClassName(extra = "") {
  return [
    "w-full rounded-control border border-border bg-background px-3 py-2 text-sm outline-none",
    "focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:opacity-50",
    extra,
  ]
    .filter(Boolean)
    .join(" ");
}

function getHeroContent(content: PageBlock["content"]): HeroContent {
  return content as HeroContent;
}

function getTextContent(content: PageBlock["content"]): TextContent {
  return content as TextContent;
}

function getCardsContent(content: PageBlock["content"]): CardsContent {
  return content as CardsContent;
}

function createTextBlock(): PageBlock {
  return {
    id: `block-${Date.now()}`,
    type: "text",
    title: adminCopy.pages.newBlockTitle,
    content: { text: adminCopy.pages.newTextContent },
  };
}

function createPage(): PageItem {
  const timestamp = Date.now();
  return {
    id: `page-${timestamp}`,
    slug: `${adminCopy.pages.newPageSlug}-${timestamp}`,
    title: adminCopy.pages.newPageTitle,
    description: "",
    blocks: [
      {
        id: `block-${timestamp}`,
        type: "hero",
        title: adminCopy.pages.newHeroTitle,
        content: {
          headline: adminCopy.pages.newHeroHeadline,
          subheadline: adminCopy.pages.newHeroSubheadline,
          ctaText: "",
        },
      },
    ],
  };
}

function updatePages(
  data: PagesData,
  updater: (pages: PageItem[]) => PageItem[]
): PagesData {
  return {
    ...data,
    pages: updater(data.pages ?? []),
  };
}

function updatePage(
  data: PagesData,
  pageIndex: number,
  updates: Partial<PageItem>
): PagesData {
  return updatePages(data, (pages) => {
    const next = [...pages];
    next[pageIndex] = { ...next[pageIndex], ...updates };
    return next;
  });
}

function updateBlocks(
  data: PagesData,
  pageIndex: number,
  updater: (blocks: PageBlock[]) => PageBlock[]
): PagesData {
  return updatePages(data, (pages) => {
    const next = [...pages];
    const page = next[pageIndex];
    next[pageIndex] = {
      ...page,
      blocks: updater(page.blocks ?? []),
    };
    return next;
  });
}

function updateBlock(
  data: PagesData,
  pageIndex: number,
  blockIndex: number,
  updates: Partial<PageBlock>
): PagesData {
  return updateBlocks(data, pageIndex, (blocks) => {
    const next = [...blocks];
    next[blockIndex] = { ...next[blockIndex], ...updates };
    return next;
  });
}

function updateBlockContent(
  data: PagesData,
  pageIndex: number,
  blockIndex: number,
  updates: Record<string, unknown>
): PagesData {
  return updateBlocks(data, pageIndex, (blocks) => {
    const next = [...blocks];
    const block = next[blockIndex];
    next[blockIndex] = {
      ...block,
      content: {
        ...(block.content ?? {}),
        ...updates,
      },
    };
    return next;
  });
}

function updateCard(
  data: PagesData,
  pageIndex: number,
  blockIndex: number,
  cardIndex: number,
  updates: Partial<CardContent>
): PagesData {
  return updateBlocks(data, pageIndex, (blocks) => {
    const next = [...blocks];
    const block = next[blockIndex];
    const content = getCardsContent(block.content);
    const cards = [...(content.cards ?? [])];
    cards[cardIndex] = { ...cards[cardIndex], ...updates };
    next[blockIndex] = {
      ...block,
      content: {
        ...content,
        cards,
      },
    };
    return next;
  });
}

function addCard(data: PagesData, pageIndex: number, blockIndex: number): PagesData {
  return updateBlocks(data, pageIndex, (blocks) => {
    const next = [...blocks];
    const block = next[blockIndex];
    const content = getCardsContent(block.content);
    next[blockIndex] = {
      ...block,
      content: {
        ...content,
        cards: [
          ...(content.cards ?? []),
          {
            title: adminCopy.pages.newCardTitle,
            description: adminCopy.pages.newCardDescription,
          },
        ],
      },
    };
    return next;
  });
}

function removeCard(
  data: PagesData,
  pageIndex: number,
  blockIndex: number,
  cardIndex: number
): PagesData {
  return updateBlocks(data, pageIndex, (blocks) => {
    const next = [...blocks];
    const block = next[blockIndex];
    const content = getCardsContent(block.content);
    next[blockIndex] = {
      ...block,
      content: {
        ...content,
        cards: (content.cards ?? []).filter((_, index) => index !== cardIndex),
      },
    };
    return next;
  });
}

function PageBlockEditor({
  block,
  blockIndex,
  pageIndex,
  data,
  setData,
}: {
  block: PageBlock;
  blockIndex: number;
  pageIndex: number;
  data: PagesData;
  setData: (data: PagesData) => void;
}) {
  const copy = adminCopy.pages;

  return (
    <div className="rounded-card border border-border bg-muted/30 p-4">
      <div className="mb-4 grid gap-3 lg:grid-cols-[11rem_1fr_auto]">
        <FormField label={copy.blockTypeLabel}>
          <select
            value={block.type}
            onChange={(event) =>
              setData(
                updateBlock(data, pageIndex, blockIndex, {
                  type: event.target.value as BlockType,
                })
              )
            }
            className={fieldClassName("py-1.5")}
          >
            {blockTypes.map((type) => (
              <option key={type} value={type}>
                {copy.blockTypes[type]}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label={copy.blockTitleLabel}>
          <input
            value={block.title}
            onChange={(event) =>
              setData(
                updateBlock(data, pageIndex, blockIndex, {
                  title: event.target.value,
                })
              )
            }
            className={fieldClassName("py-1.5")}
          />
        </FormField>
        <IconButton
          icon={<Trash2 className="h-4 w-4" />}
          label={copy.removeBlock}
          className="self-end"
          onClick={() =>
            setData(
              updateBlocks(data, pageIndex, (blocks) =>
                blocks.filter((_, index) => index !== blockIndex)
              )
            )
          }
        />
      </div>

      {block.type === "hero" ? (
        <div className="space-y-3">
          <input
            value={getHeroContent(block.content).headline || ""}
            onChange={(event) =>
              setData(
                updateBlockContent(data, pageIndex, blockIndex, {
                  headline: event.target.value,
                })
              )
            }
            placeholder={copy.heroHeadline}
            className={fieldClassName()}
          />
          <input
            value={getHeroContent(block.content).subheadline || ""}
            onChange={(event) =>
              setData(
                updateBlockContent(data, pageIndex, blockIndex, {
                  subheadline: event.target.value,
                })
              )
            }
            placeholder={copy.heroSubheadline}
            className={fieldClassName()}
          />
          <input
            value={getHeroContent(block.content).ctaText || ""}
            onChange={(event) =>
              setData(
                updateBlockContent(data, pageIndex, blockIndex, {
                  ctaText: event.target.value,
                })
              )
            }
            placeholder={copy.heroCtaText}
            className={fieldClassName()}
          />
        </div>
      ) : null}

      {block.type === "text" ? (
        <textarea
          value={getTextContent(block.content).text || ""}
          onChange={(event) =>
            setData(
              updateBlockContent(data, pageIndex, blockIndex, {
                text: event.target.value,
              })
            )
          }
          rows={4}
          placeholder={copy.textPlaceholder}
          className={fieldClassName("min-h-28")}
        />
      ) : null}

      {block.type === "gallery" ? (
        <p className="text-sm leading-6 text-muted-foreground">{copy.galleryNote}</p>
      ) : null}

      {block.type === "cards" ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-sm font-semibold text-foreground">{copy.cardsTitle}</h4>
            <ActionButton
              type="button"
              tone="ghost"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => setData(addCard(data, pageIndex, blockIndex))}
            >
              {copy.addCard}
            </ActionButton>
          </div>
          {(getCardsContent(block.content).cards ?? []).map((card, cardIndex) => (
            <div
              key={`${block.id}-card-${cardIndex}`}
              className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]"
            >
              <input
                value={card.title || ""}
                onChange={(event) =>
                  setData(
                    updateCard(data, pageIndex, blockIndex, cardIndex, {
                      title: event.target.value,
                    })
                  )
                }
                placeholder={copy.cardTitle}
                className={fieldClassName("py-1.5")}
              />
              <input
                value={card.description || ""}
                onChange={(event) =>
                  setData(
                    updateCard(data, pageIndex, blockIndex, cardIndex, {
                      description: event.target.value,
                    })
                  )
                }
                placeholder={copy.cardDescription}
                className={fieldClassName("py-1.5")}
              />
              <IconButton
                icon={<Trash2 className="h-4 w-4" />}
                label={copy.removeCard}
                className="h-9 w-9"
                onClick={() =>
                  setData(removeCard(data, pageIndex, blockIndex, cardIndex))
                }
              />
            </div>
          ))}
        </div>
      ) : null}

      {block.type === "contact" ? (
        <p className="text-sm leading-6 text-muted-foreground">{copy.contactNote}</p>
      ) : null}
    </div>
  );
}

export default function PagesAdminPage() {
  const copy = adminCopy.pages;

  return (
    <div className="min-h-screen bg-background pl-64">
      <AdminSidebar />
      <main className="px-6 py-8">
        <AdminEditor<PagesData>
          title={copy.title}
          description={copy.description}
          configKey="pages"
        >
          {(data, setData) => (
            <div className="space-y-6">
              {(data.pages ?? []).length > 0 ? (
                (data.pages ?? []).map((page, pageIndex) => (
                  <AdminPanel
                    key={page.id}
                    title={page.title || copy.newPageTitle}
                    description={`${copy.slugPrefix}${page.slug}`}
                    actions={
                      <div className="flex gap-2">
                        <ActionButton
                          href={`/page/${page.slug}`}
                          target="_blank"
                          tone="secondary"
                          icon={<ExternalLink className="h-4 w-4" />}
                        >
                          {copy.preview}
                        </ActionButton>
                        <IconButton
                          icon={<Trash2 className="h-4 w-4" />}
                          label={copy.removePage}
                          onClick={() =>
                            setData(
                              updatePages(data, (pages) =>
                                pages.filter((_, index) => index !== pageIndex)
                              )
                            )
                          }
                        />
                      </div>
                    }
                  >
                    <div className="space-y-5">
                      <div className="grid gap-4 lg:grid-cols-[1fr_12rem]">
                        <FormField label={copy.pageTitleLabel}>
                          <input
                            value={page.title}
                            onChange={(event) =>
                              setData(
                                updatePage(data, pageIndex, {
                                  title: event.target.value,
                                })
                              )
                            }
                            className={fieldClassName()}
                          />
                        </FormField>
                        <FormField label={copy.slugLabel}>
                          <div className="flex items-center rounded-control border border-border bg-background text-sm focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20">
                            <span className="px-3 text-xs text-muted-foreground">
                              {copy.slugPrefix}
                            </span>
                            <input
                              value={page.slug}
                              onChange={(event) =>
                                setData(
                                  updatePage(data, pageIndex, {
                                    slug: event.target.value,
                                  })
                                )
                              }
                              className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none"
                            />
                          </div>
                        </FormField>
                      </div>

                      <FormField label={copy.descriptionLabel}>
                        <textarea
                          value={page.description || ""}
                          onChange={(event) =>
                            setData(
                              updatePage(data, pageIndex, {
                                description: event.target.value,
                              })
                            )
                          }
                          rows={2}
                          className={fieldClassName("min-h-20")}
                        />
                      </FormField>

                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                            {copy.blocksTitle} ({page.blocks.length})
                          </h3>
                          <ActionButton
                            type="button"
                            tone="secondary"
                            icon={<Plus className="h-4 w-4" />}
                            onClick={() =>
                              setData(
                                updateBlocks(data, pageIndex, (blocks) => [
                                  ...blocks,
                                  createTextBlock(),
                                ])
                              )
                            }
                          >
                            {copy.addBlock}
                          </ActionButton>
                        </div>

                        {page.blocks.map((block, blockIndex) => (
                          <PageBlockEditor
                            key={block.id}
                            block={block}
                            blockIndex={blockIndex}
                            pageIndex={pageIndex}
                            data={data}
                            setData={setData}
                          />
                        ))}
                      </div>
                    </div>
                  </AdminPanel>
                ))
              ) : (
                <EmptyState
                  title={copy.emptyTitle}
                  description={copy.emptyDescription}
                />
              )}

              <ActionButton
                type="button"
                tone="secondary"
                icon={<Plus className="h-4 w-4" />}
                className="w-full border-dashed py-5"
                onClick={() =>
                  setData(updatePages(data, (pages) => [...pages, createPage()]))
                }
              >
                {copy.addPage}
              </ActionButton>
            </div>
          )}
        </AdminEditor>
      </main>
    </div>
  );
}
