"use client";

import Image from "next/image";

import { JsonLd } from "@/components/JsonLd";
import { useLocale } from "@/components/LocaleProvider";
import {
  ArticlesBrowser,
  type ArticleListItem,
} from "./ArticlesBrowser";

export function ArticlesPageClient({
  articles,
  initialCategory,
  structuredData,
}: {
  articles: ArticleListItem[];
  initialCategory?: string | null;
  structuredData: Record<string, unknown>;
}) {
  const { locale } = useLocale();
  const zh = locale === "zh";

  return (
    <div className="min-h-screen overflow-x-hidden bg-surface-paper pb-20 pt-28 text-surface-paper-foreground sm:pt-32">
      <JsonLd data={structuredData} />
      <header className="mx-auto max-w-6xl px-4">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
          Articles & field notes
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.045em] text-foreground sm:text-6xl">
          {zh ? "文章与系统实践" : "Articles and system practice"}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground">
          {zh
            ? "记录企业 AI 系统、自动化、知识工作流与交付边界。"
            : "Reviewed English articles will appear here after their full text has passed content review."}
        </p>
      </header>
      <section
        className="mx-auto mt-12 max-w-6xl px-4"
        aria-label="Article categories and list"
      >
        <ArticlesBrowser articles={articles} initialCategory={initialCategory} />
      </section>
      {zh ? (
        <section
          id="wechat"
          className="mx-auto mt-16 grid max-w-6xl gap-8 border-t border-hairline px-4 pt-16 md:grid-cols-[1fr_220px] md:items-center"
        >
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
              WeChat · Independent System
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-foreground">
              公众号「独立系统」
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
              扫码关注，持续获取企业 AI 系统、自动化与独立开发实践。
            </p>
          </div>
          <Image
            src="/images/contact/wechat-official.jpg"
            alt="微信公众号「独立系统」二维码"
            width={220}
            height={220}
            className="border border-hairline bg-white p-2"
          />
        </section>
      ) : null}
    </div>
  );
}
