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
          <h2 className="text-3xl font-semibold text-[var(--foreground)]">Publish package</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">Bundle approved clips into a shareable preview package with a public review link.</p>
        </div>
        <JsonActionButton endpoint="/api/publish" label="Create share package" payload={{ projectId, clipIds: workspace.clips.map((clip) => clip.id), publicTitle: `${workspace.project.name} launch preview`, publicDescription: workspace.project.description }} />
      </div>
      <div className="surface rounded-[28px] p-5">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Current share link</p>
        {workspace.publishPackage ? (
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <code className="rounded-2xl bg-black/20 px-4 py-3 text-sm text-cyan-100">/share/{workspace.publishPackage.shareToken}</code>
            <Link href={`/share/${workspace.publishPackage.shareToken}`} className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white">Open preview</Link>
          </div>
        ) : (
          <p className="mt-4 text-sm text-[var(--muted)]">Create a package to generate a public preview link.</p>
        )}
      </div>
    </div>
  );
}
