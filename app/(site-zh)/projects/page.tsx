import { JsonLd } from "@/components/JsonLd";
import { PublicProjectsPage } from "@/components/projects/PublicProjectsPage";
import { getPublicWebsiteProjects } from "@/config/website-projects";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";
import { generateProjectCollectionSchema } from "@/lib/structured-data";

export const metadata=buildPublicPageMetadata({title:"项目库",description:"实解智能的企业 AI 系统项目、公开边界与 Open GEO Console 模拟体验。",path:"/projects"});
export default function ProjectsPage(){const projects=getPublicWebsiteProjects("zh");return <><JsonLd data={generateProjectCollectionSchema(projects)}/><PublicProjectsPage/></>}
