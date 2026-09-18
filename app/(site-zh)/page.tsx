import { EnterpriseHomepage } from "@/components/home/EnterpriseHomepage";
import { getArticles } from "@/lib/mdx/mdx";

export default async function Page() {
  const articles = await getArticles("zh");
  const recentArticles = articles
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3)
    .map(({ title, summary, date, publicPath }) => ({ title, summary, date, publicPath }));

  return <EnterpriseHomepage recentArticles={recentArticles} />;
}
