import ServiceDetailPage from "@/core/ServicesManagementPage/components/ServiceDetailPage";

interface ServiceDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ServiceDetailPageRoute({ params }: ServiceDetailPageProps) {
  const { id } = await params;
  return <ServiceDetailPage serviceId={id} />;
}
