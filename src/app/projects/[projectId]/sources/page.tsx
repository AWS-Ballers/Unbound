import { PageHeader } from "@/components/ui/page-header";
import { GitHubConnector } from "@/components/workspace/github-connector";
import { SourceForm } from "@/components/workspace/source-form";
import { SourceList } from "@/components/workspace/source-list";
import { getViewer } from "@/lib/auth";
import { flags } from "@/lib/env";
import { getProjectWorkspace } from "@/server/projects";

export default async function SourcesPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const viewer = await getViewer();
  const { projectId } = await params;
  const workspace = await getProjectWorkspace(projectId, viewer.id);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Workspace"
        title="Bring every source into one place"
        description="Connect GitHub for codebase inspection, upload files, or capture websites. The assistant on the right helps you find missing context before generation."
      />

      <GitHubConnector
        projectId={projectId}
        hasGitHubAuth={flags.hasGitHubAuth}
        callbackUrl={`/projects/${projectId}/sources`}
      />

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-[var(--foreground)]">Other sources</h3>
        <SourceForm projectId={projectId} />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Indexed sources</h3>
          <span className="text-xs text-[var(--muted)]">{workspace.sources.length} items</span>
        </div>
        <SourceList sources={workspace.sources} />
      </section>
    </div>
  );
}
