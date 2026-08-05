import type { Metadata } from "next";
import { ArticlesPageClient } from "@/components/articles/ArticlesPageClient";
import type { ArticleListItem } from "@/components/articles/ArticlesBrowser";
import { getArticles } from "@/lib/mdx/mdx";
export const metadata:Metadata={title:"文章",description:"实解智能关于企业 AI 系统、自动化、知识工作流与交付边界的文章。",alternates:{canonical:"/articles"}};
export const revalidate=3600;
export default async function ArticlesPage(){const articles=await getArticles();const items:ArticleListItem[]=articles.map(a=>({slug:a.slug,title:a.title,summary:a.summary,date:a.date,category:a.category,tags:a.tags,featured:a.featured,imageSrc:a.imageSrc,imageAlt:a.imageAlt,readingTime:a.readingTime,author:a.author,chapter:a.chapter}));return <ArticlesPageClient articles={items}/>}