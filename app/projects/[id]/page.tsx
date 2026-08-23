import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { PublicProjectDetail } from "@/components/projects/PublicProjectDetail";
import { getPublicWebsiteProject, publicWebsiteProjects } from "@/config/website-projects";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";
import { generateProjectSchema } from "@/lib/structured-data";
type Props={params:Promise<{id:string}>};
export function generateStaticParams(){return publicWebsiteProjects.map(project=>({id:project.id}))}
export async function generateMetadata({params}:Props):Promise<Metadata>{const{id}=await params;const project=getPublicWebsiteProject(id,"zh");if(!project)return{};return buildPublicPageMetadata({title:project.name,description:project.summary,path:`/projects/${project.id}`})}
export default async function ProjectPage({params}:Props){const{id}=await params;const project=getPublicWebsiteProject(id,"zh");if(!project)notFound();return <><JsonLd data={generateProjectSchema(project)}/><PublicProjectDetail id={id}/></>}
