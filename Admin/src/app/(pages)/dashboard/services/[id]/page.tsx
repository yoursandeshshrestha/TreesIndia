import ServiceDetailPage from "@/core/ServicesManagementPage/components/ServiceDetailPage";

interface ServiceDetailPageProps {
  params: {
    id: string;
  };
}

export default function ServiceDetailPageRoute({ params }: ServiceDetailPageProps) {
  return <ServiceDetailPage serviceId={params.id} />;
}
