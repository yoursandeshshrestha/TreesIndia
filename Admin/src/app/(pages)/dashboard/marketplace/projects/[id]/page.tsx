import AuthGuard from "@/components/AuthGuard/AuthGuard";
import ProjectDetailPage from "@/core/Marketplace/ProjectsManagementPage/ProjectDetailPage";

interface ProjectDetailRouteProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProjectDetailRoute({
  params,
}: ProjectDetailRouteProps) {
  const { id } = await params;

  return (
    <AuthGuard requireAdmin={true}>
      <ProjectDetailPage projectId={parseInt(id)} />
    </AuthGuard>
  );
}
