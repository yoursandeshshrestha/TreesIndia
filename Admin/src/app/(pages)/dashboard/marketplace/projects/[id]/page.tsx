import AuthGuard from "@/components/AuthGuard/AuthGuard";
import type { AdminRole } from "@/services/api/auth";
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
    <AuthGuard requiredRoles={["super_admin", "properties_manager" satisfies AdminRole]}>
      <ProjectDetailPage projectId={parseInt(id)} />
    </AuthGuard>
  );
}
