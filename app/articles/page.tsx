import { ArticlesPageClient } from "@/components/articles/ArticlesPageClient";
import type { ArticleListItem } from "@/components/articles/ArticlesBrowser";
import { getArticles } from "@/lib/mdx/mdx";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";
import { generateArticleCollectionSchema } from "@/lib/structured-data";
export const metadata=buildPublicPageMetadata({title:"文章与系统实践",description:"实解智能关于企业 AI 系统、自动化、知识工作流与交付边界的文章。",path:"/articles"});
export const revalidate=3600;
export default async function ArticlesPage({searchParams}:{searchParams?:Promise<{category?:string|string[]}>}={}){const articles=await getArticles();const items:ArticleListItem[]=articles.map(a=>({slug:a.slug,title:a.title,summary:a.summary,date:a.date,category:a.category,tags:a.tags,featured:a.featured,imageSrc:a.imageSrc,imageAlt:a.imageAlt,readingTime:a.readingTime,author:a.author,chapter:a.chapter,publicPath:a.publicPath}));const category=(await searchParams)?.category;return <ArticlesPageClient articles={items} initialCategory={typeof category==="string"?category:null} structuredData={generateArticleCollectionSchema(articles)}/>}
