import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicProjectDetail } from "@/components/projects/PublicProjectDetail";
import { getWebsiteProject, websiteProjects } from "@/config/website-projects";
type Props={params:Promise<{id:string}>};
export function generateStaticParams(){return websiteProjects.map(project=>({id:project.id}))}
export async function generateMetadata({params}:Props):Promise<Metadata>{const{id}=await params;const project=getWebsiteProject(id,"zh");if(!project)return{};return{title:project.name,description:project.summary,alternates:{canonical:`/projects/${project.id}`}}}
export default async function ProjectPage({params}:Props){const{id}=await params;if(!getWebsiteProject(id,"zh"))notFound();return <PublicProjectDetail id={id}/>}