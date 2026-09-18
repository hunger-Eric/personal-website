import { EnterpriseHomepage } from "@/components/home/EnterpriseHomepage";
import { getArticles } from "@/lib/mdx/mdx";

export default async function EnglishHomePage() {
  const articles = await getArticles("en");
  const recentArticles = articles
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3)
    .map(({ title, summary, date, publicPath }) => ({ title, summary, date, publicPath }));

  return <EnterpriseHomepage recentArticles={recentArticles} />;
}
