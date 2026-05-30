import { JsonActionButton } from "@/components/workspace/json-action-button";
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
  const activeTemplate = templateCatalog.find((item) => item.key === workspace.project.activeTemplateKey) ?? templateCatalog[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold text-[var(--foreground)]">Video generation</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">Preview the active template and submit a PixVerse-ready launch generation job.</p>
        </div>
        <JsonActionButton endpoint="/api/generate/video" label="Generate video" payload={{ projectId, templateKey: activeTemplate.key, settings: { durationSeconds: 12, aspectRatio: "16:9", style: "Cinematic" } }} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="surface rounded-[28px] p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Prompt preview</p>
          <pre className="mt-4 overflow-x-auto rounded-2xl bg-black/20 p-4 font-mono text-xs leading-6 text-cyan-100">{workspace.jobs[0]?.prompt ?? `Template: ${activeTemplate.name}
Style: ${activeTemplate.style}`}</pre>
        </article>
        <article className="surface rounded-[28px] p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Settings</p>
          <div className="mt-4 space-y-3 text-sm text-[var(--muted)]">
            <div className="surface-strong rounded-2xl px-4 py-3">Duration: 12 seconds</div>
            <div className="surface-strong rounded-2xl px-4 py-3">Aspect ratio: 16:9</div>
            <div className="surface-strong rounded-2xl px-4 py-3">Style: Cinematic</div>
          </div>
        </article>
      </div>

      <div className="grid gap-4">
        {workspace.jobs.map((job) => (
          <article key={job.id} className="surface rounded-[28px] p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">{job.mode}</p>
                <h3 className="mt-2 text-lg font-semibold text-[var(--foreground)]">{job.status}</h3>
              </div>
              <JsonActionButton endpoint="/api/jobs/poll" label="Refresh jobs" payload={{ projectId }} />
            </div>
            <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{job.prompt}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
