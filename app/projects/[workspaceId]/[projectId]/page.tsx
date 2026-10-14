import { ProjectDetail } from "@/components/workspace/project-detail";
export default async function Page({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <ProjectDetail key={projectId} />;
}
