"use client";

import { ArrowUpRight, Mail } from "lucide-react";
import Image from "next/image";

import { ActionButton, EmptyState, Surface } from "@/components/system";
import { getSiteCopy } from "@/config/contentCopy";
import { siteConfig } from "@/config/siteConfig";

type BlockType = "hero" | "text" | "gallery" | "cards" | "contact";

type HeroContent = {
  headline?: string;
  subheadline?: string;
  ctaText?: string;
  ctaHref?: string;
};

type TextContent = {
  text?: string;
};

type GalleryImage = {
  src?: string;
  alt?: string;
};

type GalleryContent = {
  images?: GalleryImage[];
};

type CardContent = {
  title?: string;
  description?: string;
};

type CardsContent = {
  cards?: CardContent[];
};

type Block = {
  id: string;
  type: BlockType;
  title: string;
  content: HeroContent | TextContent | GalleryContent | CardsContent | Record<string, unknown>;
};

const copy = getSiteCopy("zh").customPage;

function asHeroContent(content: Block["content"]): HeroContent {
  return content as HeroContent;
}

function asTextContent(content: Block["content"]): TextContent {
  return content as TextContent;
}

function asGalleryContent(content: Block["content"]): GalleryContent {
  return content as GalleryContent;
}

function asCardsContent(content: Block["content"]): CardsContent {
  return content as CardsContent;
}

export function PageBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-16">
      {blocks.map((block) => (
        <section
          key={block.id}
          id={`block-${block.id}`}
          aria-labelledby={block.title ? `block-${block.id}-title` : undefined}
        >
          {block.type === "hero" ? <HeroBlock block={block} /> : null}
          {block.type === "text" ? <TextBlock block={block} /> : null}
          {block.type === "gallery" ? <GalleryBlock block={block} /> : null}
          {block.type === "cards" ? <CardsBlock block={block} /> : null}
          {block.type === "contact" ? <ContactBlock blockId={block.id} /> : null}
        </section>
      ))}
    </div>
  );
}

function BlockTitle({ block }: { block: Block }) {
  if (!block.title) return null;

  return (
    <h2
      id={`block-${block.id}-title`}
      className="mb-6 text-2xl font-semibold tracking-tight text-foreground"
    >
      {block.title}
    </h2>
  );
}

function HeroBlock({ block }: { block: Block }) {
  const { headline, subheadline, ctaText, ctaHref } = asHeroContent(block.content);

  return (
    <div className="text-center">
      {block.title ? (
        <p
          id={`block-${block.id}-title`}
          className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"
        >
          {block.title}
        </p>
      ) : null}
      {headline ? (
        <h1 className="mx-auto max-w-4xl text-4xl font-semibold leading-[1.02] tracking-tight text-foreground sm:text-5xl">
          {headline}
        </h1>
      ) : null}
      {subheadline ? (
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
          {subheadline}
        </p>
      ) : null}
      {ctaText ? (
        <div className="mt-8">
          <ActionButton
            href={ctaHref || "#"}
            tone="primary"
            icon={<ArrowUpRight className="h-4 w-4" />}
          >
            {ctaText}
          </ActionButton>
        </div>
      ) : null}
    </div>
  );
}

function TextBlock({ block }: { block: Block }) {
  const { text } = asTextContent(block.content);

  return (
    <div>
      <BlockTitle block={block} />
      {text ? (
        <div className="max-w-3xl space-y-4">
          {text
            .split("\n")
            .filter((paragraph) => paragraph.trim().length > 0)
            .map((paragraph, index) => (
              <p key={index} className="text-base leading-7 text-muted-foreground">
                {paragraph}
              </p>
            ))}
        </div>
      ) : null}
    </div>
  );
}

function GalleryBlock({ block }: { block: Block }) {
  const images = asGalleryContent(block.content).images ?? [];

  return (
    <div>
      <BlockTitle block={block} />
      {images.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image, index) => (
            <figure
              key={`${image.src || "image"}-${index}`}
              className="relative aspect-[4/3] overflow-hidden rounded-card border border-border bg-muted"
            >
              {image.src ? (
                <Image
                  src={image.src}
                  alt={image.alt || ""}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="h-full w-full object-cover"
                />
              ) : null}
            </figure>
          ))}
        </div>
      ) : (
        <EmptyState title={copy.emptyGalleryTitle} />
      )}
    </div>
  );
}

function CardsBlock({ block }: { block: Block }) {
  const cards = asCardsContent(block.content).cards ?? [];

  return (
    <div>
      <BlockTitle block={block} />
      {cards.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card, index) => (
            <Surface
              key={`${card.title || "card"}-${index}`}
              tone="paper"
              className="p-6"
            >
              <article>
                {card.title ? (
                  <h3 className="text-base font-semibold text-foreground">
                    {card.title}
                  </h3>
                ) : null}
                {card.description ? (
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {card.description}
                  </p>
                ) : null}
              </article>
            </Surface>
          ))}
        </div>
      ) : (
        <EmptyState title={copy.emptyCardsTitle} />
      )}
    </div>
  );
}

function ContactBlock({ blockId }: { blockId: string }) {
  const emailEntry = siteConfig.socialsList?.find((social) => social.key === "email");

  return (
    <Surface tone="paper" className="p-8 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-control border border-border bg-background text-accent">
        <Mail className="h-6 w-6" />
      </div>
      <h2
        id={`block-${blockId}-title`}
        className="text-xl font-semibold tracking-tight text-foreground"
      >
        {copy.contactTitle}
      </h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
        {copy.contactDescription}
      </p>
      {emailEntry ? (
        <div className="mt-6">
          <ActionButton
            href={emailEntry.href}
            tone="primary"
            icon={<Mail className="h-4 w-4" />}
          >
            {copy.emailAction}
          </ActionButton>
        </div>
      ) : null}
    </Surface>
  );
}
