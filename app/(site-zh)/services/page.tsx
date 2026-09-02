import { ServicesPageClient } from "@/components/services/ServicesPageClient";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";

export const metadata = buildPublicPageMetadata({
  title: "企业 AI 自动化服务与工作流系统交付",
  description:
    "面向有重复人工、跨系统流转或非结构化资料处理问题的中小企业，提供流程诊断、人机边界设计、定制系统开发与交付。",
  path: "/services",
});

export default function ServicesPage() {
  return <ServicesPageClient />;
}
