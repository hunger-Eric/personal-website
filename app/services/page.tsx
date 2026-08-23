import { ServicesPageClient } from "@/components/services/ServicesPageClient";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";

export const metadata = buildPublicPageMetadata({
  title: "企业 AI 工作流系统设计与交付",
  description:
    "说明实解智能适合处理的流程、客户需要提供的输入、人机审核边界、交付结果与失败恢复原则。",
  path: "/services",
});

export default function ServicesPage() {
  return <ServicesPageClient />;
}
