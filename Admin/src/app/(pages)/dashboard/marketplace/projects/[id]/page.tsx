"use client";

import { useParams } from "next/navigation";
import ProjectDetailPage from "@/core/Marketplace/ProjectsManagementPage/ProjectDetailPage";

export default function ProjectDetailPageRoute() {
  const params = useParams();
  const projectId = parseInt(params.id as string, 10);

  return <ProjectDetailPage projectId={projectId} />;
}