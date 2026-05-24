// components/PageBlocks.tsx
"use client";

import { Mail, ArrowUpRight } from "lucide-react";
import { siteConfig } from "@/config/siteConfig";

type Block = {
  id: string;
  type: "hero" | "text" | "gallery" | "cards" | "contact";
  title: string;
  content: any;
};

export function PageBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-16">
      {blocks.map((block) => (
        <section key={block.id} id={`block-${block.id}`}>
          {block.type === "hero" && <HeroBlock block={block} />}
          {block.type === "text" && <TextBlock block={block} />}
          {block.type === "gallery" && <GalleryBlock block={block} />}
          {block.type === "cards" && <CardsBlock block={block} />}
          {block.type === "contact" && <ContactBlock />}
        </section>
      ))}
    </div>
  );
}

function HeroBlock({ block }: { block: Block }) {
  const { headline, subheadline, ctaText } = block.content;
  return (
    <div className="text-center">
      {block.title && (
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-amber-500">
          {block.title}
        </p>
      )}
      {headline && (
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {headline}
        </h2>
      )}
      {subheadline && (
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          {subheadline}
        </p>
      )}
      {ctaText && (
        <div className="mt-8">
          <a
            href={block.content.ctaHref || "#"}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-amber-600"
          >
            {ctaText}
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      )}
    </div>
  );
}

function TextBlock({ block }: { block: Block }) {
  const { text } = block.content;
  return (
    <div>
      {block.title && (
        <h2 className="mb-4 text-2xl font-bold tracking-tight">{block.title}</h2>
      )}
      {text && (
        <div className="prose prose-slate max-w-none dark:prose-invert">
          {text.split("\n").map((p: string, i: number) => (
            <p key={i} className="mb-4 text-base leading-relaxed text-muted-foreground">
              {p}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function GalleryBlock({ block }: { block: Block }) {
  const images = block.content.images || [];
  return (
    <div>
      {block.title && (
        <h2 className="mb-6 text-2xl font-bold tracking-tight">{block.title}</h2>
      )}
      {images.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((img: any, i: number) => (
            <div
              key={i}
              className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted"
            >
              {img.src && (
                <img
                  src={img.src}
                  alt={img.alt || ""}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">暂无图片</p>
      )}
    </div>
  );
}

function CardsBlock({ block }: { block: Block }) {
  const cards = block.content.cards || [];
  return (
    <div>
      {block.title && (
        <h2 className="mb-6 text-2xl font-bold tracking-tight">{block.title}</h2>
      )}
      {cards.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card: any, i: number) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-md"
            >
              <h3 className="font-semibold">{card.title}</h3>
              {card.description && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {card.description}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">暂无内容</p>
      )}
    </div>
  );
}

function ContactBlock() {
  const emailEntry = siteConfig.socialsList?.find(
    (s: any) => s.key === "email"
  );
  return (
    <div className="rounded-2xl border border-border bg-card p-8 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
        <Mail className="h-6 w-6 text-amber-600 dark:text-amber-400" />
      </div>
      <h2 className="text-xl font-bold">联系我</h2>
      <p className="mt-2 text-muted-foreground">
        有任何问题或合作意向，欢迎联系
      </p>
      {emailEntry && (
        <a
          href={emailEntry.href}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-amber-600"
        >
          <Mail className="h-4 w-4" />
          发送邮件
        </a>
      )}
    </div>
  );
}