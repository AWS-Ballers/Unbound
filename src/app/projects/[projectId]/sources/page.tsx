import { SourceForm } from "@/components/workspace/source-form";
import { getViewer } from "@/lib/auth";
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
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-[var(--foreground)]">Source ingestion</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">Add GitHub repos, websites, file metadata, or plain text and turn them into structured source summaries.</p>
      </div>
      <SourceForm projectId={projectId} />
      <div className="grid gap-4">
        {workspace.sources.map((source) => (
          <article key={source.id} className="surface rounded-[28px] p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">{source.type}</p>
                <h3 className="mt-2 text-lg font-semibold text-[var(--foreground)]">{source.rawLocation}</h3>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[var(--muted)]">{source.status}</span>
            </div>
            <pre className="mt-4 overflow-x-auto rounded-2xl bg-black/20 p-4 text-xs leading-6 text-cyan-100">{JSON.stringify(source.indexedData, null, 2)}</pre>
          </article>
        ))}
      </div>
    </div>
  );
}
