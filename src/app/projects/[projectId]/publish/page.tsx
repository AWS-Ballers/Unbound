import Link from "next/link";

import { JsonActionButton } from "@/components/workspace/json-action-button";
import { getViewer } from "@/lib/auth";
import { getProjectWorkspace } from "@/server/projects";

export default async function PublishPage({
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
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Review handoff</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--foreground)]">Publish package</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Bundle approved clips into a shareable preview package with a public review link.</p>
        </div>
        <JsonActionButton endpoint="/api/publish" label="Create share package" payload={{ projectId, clipIds: workspace.clips.map((clip) => clip.id), publicTitle: `${workspace.project.name} launch preview`, publicDescription: workspace.project.description }} />
      </div>
      <div className="surface fade-up rounded-[30px] p-5">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Current share link</p>
        {workspace.publishPackage ? (
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <code className="soft-code rounded-2xl px-4 py-3 text-sm">/share/{workspace.publishPackage.shareToken}</code>
            <Link href={`/share/${workspace.publishPackage.shareToken}`} className="inline-flex items-center rounded-full bg-[var(--foreground)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(15,23,42,0.14)] transition duration-200 hover:-translate-y-0.5 hover:bg-[var(--accent-strong)]">Open preview</Link>
          </div>
        ) : (
          <p className="mt-4 text-sm text-[var(--muted)]">Create a package to generate a public preview link.</p>
        )}
      </div>
    </div>
  );
}
