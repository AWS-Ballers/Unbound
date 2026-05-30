import { BriefEditor } from "@/components/workspace/brief-editor";
import { JsonActionButton } from "@/components/workspace/json-action-button";
import { getViewer } from "@/lib/auth";
import { briefDataSchema } from "@/lib/contracts";
import { getProjectWorkspace } from "@/server/projects";

export default async function BriefPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const viewer = await getViewer();
  const { projectId } = await params;
  const workspace = await getProjectWorkspace(projectId, viewer.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Narrative</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--foreground)]">Product brief</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Merge all indexed source summaries into a single structured product narrative.</p>
        </div>
        <JsonActionButton endpoint="/api/brief/generate" label="Generate brief from sources" payload={{ projectId }} />
      </div>

      <div className="surface fade-up rounded-[30px] p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Completeness</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{workspace.brief?.completenessScore ?? 0}%</p>
          </div>
        </div>
        {workspace.brief ? (
          <BriefEditor
            briefId={workspace.brief.id}
            initialData={briefDataSchema.parse(workspace.brief.data)}
          />
        ) : (
          <p className="text-sm text-[var(--muted)]">No brief exists yet. Generate one from the indexed sources.</p>
        )}
      </div>
    </div>
  );
}
