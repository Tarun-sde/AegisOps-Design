import { ProjectCollection } from "@/components/workspace/project-collection";
export default async function Page({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  return <ProjectCollection key={workspaceId} />;
}
