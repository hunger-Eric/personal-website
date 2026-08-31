import { JsonLd } from "@/components/JsonLd";
import { PublicProjectsPage } from "@/components/projects/PublicProjectsPage";
import { getPublicWebsiteProjects } from "@/config/website-projects";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";
import { generateProjectCollectionSchema } from "@/lib/structured-data";

export const metadata=buildPublicPageMetadata({
  title: "企业 AI 系统项目与自动化落地案例",
  description:
    "查看实解智能公开的企业 AI 系统、工作流自动化与 AI Agent 落地项目，了解真实交付状态、人机边界、异常恢复、部署方式与验收证据。",
  path: "/projects",
});
export default function ProjectsPage(){const projects=getPublicWebsiteProjects("zh");return <><JsonLd data={generateProjectCollectionSchema(projects)}/><PublicProjectsPage/></>}
