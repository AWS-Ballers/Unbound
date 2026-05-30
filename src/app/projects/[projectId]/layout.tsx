import { AuthenticatedShell } from "@/components/shell/authenticated-shell";
import { WorkspaceRightPanel } from "@/components/shell/workspace-right-panel";
import type { WorkspaceTabIconKey } from "@/components/shell/workspace-sidebar-nav";
import { generationDefaultsSchema } from "@/lib/contracts";
import { templateCatalog } from "@/lib/templates";
import { getViewer } from "@/lib/auth";
import { getProjectWorkspace, listProjectsForViewer } from "@/server/projects";

const tabs: Array<{ href: WorkspaceTabIconKey; label: string }> = [
  { href: "sources", label: "Workspace" },
  { href: "images", label: "Images" },
  { href: "generate", label: "Video" },
  { href: "studio", label: "Edit" },
  { href: "library", label: "Library" },
];

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const viewer = await getViewer();
  const [projects, workspace] = await Promise.all([
    listProjectsForViewer(viewer.id),
    getProjectWorkspace(projectId, viewer.id),
  ]);
  const generationDefaults = generationDefaultsSchema.parse(workspace.project.generationDefaults ?? {});

  return (
    <AuthenticatedShell
      viewer={viewer}
      workspaces={projects.map((project) => ({
        id: project.id,
        name: project.name,
        category: project.category,
        sources:
          project.id === projectId
            ? workspace.sources.map((source) => ({
                id: source.id,
                type: source.type,
                title: source.title ?? source.rawLocation,
                status: source.status,
              }))
            : project.sources,
      }))}
      currentWorkspace={{
        id: workspace.project.id,
        name: workspace.project.name,
        description: workspace.project.description,
      }}
      workspaceTabs={tabs.map((tab) => ({
        href: `/projects/${projectId}/${tab.href}`,
        label: tab.label,
        iconKey: tab.href,
      }))}
      rightPanel={
        <WorkspaceRightPanel
          projectId={projectId}
          initialThreadId={workspace.chatThread?.id}
          initialMessages={workspace.chatThread?.messages ?? []}
          activeTemplateKey={workspace.project.activeTemplateKey}
          defaultTemplateKey={templateCatalog[0]?.key ?? "launch-cinematic"}
          generationDefaults={generationDefaults}
        />
      }
    >
      {children}
    </AuthenticatedShell>
  );
}
