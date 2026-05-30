import { JsonActionButton } from "@/components/workspace/json-action-button";
import { templateCatalog } from "@/lib/templates";
import { getViewer } from "@/lib/auth";
import { getProjectWorkspace } from "@/server/projects";

export default async function TemplatesPage({
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
          <h2 className="text-3xl font-semibold text-[var(--foreground)]">Template direction</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">Choose a cinematic structure or let AI rank the best-fit templates from the current brief.</p>
        </div>
        <JsonActionButton endpoint="/api/templates/recommend" label="Let AI choose" payload={{ projectId }} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {templateCatalog.map((template) => (
          <article key={template.key} className="surface rounded-[28px] p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">{template.category}</p>
            <h3 className="mt-3 text-xl font-semibold text-[var(--foreground)]">{template.name}</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{template.description}</p>
            <p className="mt-4 rounded-2xl bg-black/20 p-3 font-mono text-xs leading-6 text-cyan-100">{template.style}</p>
            {workspace.project.activeTemplateKey === template.key ? (
              <span className="mt-4 inline-flex rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-medium text-[var(--accent)]">Active</span>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
