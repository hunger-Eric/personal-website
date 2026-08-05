import type { Metadata } from "next";
import { PublicProjectsPage } from "@/components/projects/PublicProjectsPage";
export const metadata:Metadata={title:"项目库",description:"实解智能的企业 AI 系统项目、公开边界与 Open GEO Console 模拟体验。",alternates:{canonical:"/projects"}};
export default function ProjectsPage(){return <PublicProjectsPage/>}