import { PageHeader } from "@/components/ui/page-header";
import { TemplateSelector } from "@/components/workspace/template-selector";
import { generationDefaultsSchema } from "@/lib/contracts";
import { templateCatalog } from "@/lib/templates";
import { getViewer } from "@/lib/auth";
import { getProjectWorkspace } from "@/server/projects";

export default async function GeneratePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const viewer = await getViewer();
  const { projectId } = await params;
  const workspace = await getProjectWorkspace(projectId, viewer.id);
  const activeTemplate =
    templateCatalog.find((item) => item.key === workspace.project.activeTemplateKey) ??
    templateCatalog[0];
  const generationDefaults = generationDefaultsSchema.parse(workspace.project.generationDefaults ?? {});

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Video"
        title="Choose a template, then generate"
        description="Each template includes a preview poster. Use Back or Skip in the right panel when you are ready to render."
      />

      <TemplateSelector
        projectId={projectId}
        templates={templateCatalog}
        activeTemplateKey={workspace.project.activeTemplateKey}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="panel-card p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Prompt preview
          </p>
          <pre className="soft-code mt-3 overflow-x-auto rounded-xl p-4 font-mono text-xs leading-6">
            {workspace.jobs[0]?.prompt ??
              `Template: ${activeTemplate.name}\nStyle: ${activeTemplate.style}`}
          </pre>
        </article>
        <article className="panel-card p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Generation settings
          </p>
          <div className="mt-3 space-y-2 text-sm text-[var(--muted)]">
            <div className="rounded-xl bg-[var(--surface-soft)] px-4 py-3">
              Duration: 5s, 8s, 10s, 12s, or 15s (right panel)
            </div>
            <div className="rounded-xl bg-[var(--surface-soft)] px-4 py-3">
              Aspect ratio: {generationDefaults.aspectRatio}
            </div>
            <div className="rounded-xl bg-[var(--surface-soft)] px-4 py-3">Style: {generationDefaults.style}</div>
          </div>
        </article>
      </div>

      {workspace.jobs.length > 0 ? (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Recent video jobs</h3>
          {workspace.jobs.map((job) => (
            <article key={job.id} className="panel-card p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                    {job.mode}
                  </p>
                  <h4 className="mt-1 text-base font-semibold text-[var(--foreground)]">{job.status}</h4>
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{job.prompt}</p>
            </article>
          ))}
        </section>
      ) : null}
    </div>
  );
}
