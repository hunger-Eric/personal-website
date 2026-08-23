import { ServicesPageClient } from "@/components/services/ServicesPageClient";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";

export const metadata = buildPublicPageMetadata({
  title: "企业 AI 工作流系统设计与交付",
  description:
    "说明实解智能适合处理的流程、标准交付物、验收依据、数据与权限边界、人机审核和异常恢复原则。",
  path: "/services",
});

export default function ServicesPage() {
  return <ServicesPageClient />;
}
